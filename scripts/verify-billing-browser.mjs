import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { chromium } from "playwright";

const paths = {
  "@/app/utils/billingClient": "app/utils/billingClient.ts",
  "@/app/utils/tokenUsageClient": "app/utils/tokenUsageClient.ts",
  "../PricingPopup": "app/components/AiTools/PricingPopup.tsx",
  banner: "app/components/AiTools/Dashboard/LowCreditBanner.tsx",
  confirmation: "app/components/AiTools/CheckoutConfirmationOverlay.tsx",
};
const compiled = {};
for (const [id, path] of Object.entries(paths))
  compiled[id] = ts.transpileModule(await readFile(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }).outputText;
const react = await readFile(
  "node_modules/react/umd/react.development.js",
  "utf8",
);
const dom = await readFile(
  "node_modules/react-dom/umd/react-dom.development.js",
  "utf8",
);
const axios = await readFile("node_modules/axios/dist/axios.min.js", "utf8");
const cssPath = join(tmpdir(), "billing-verification.css");
execFileSync(
  process.execPath,
  [
    "node_modules/tailwindcss/lib/cli.js",
    "-i",
    "app/globals.css",
    "-o",
    cssPath,
    "--minify",
  ],
  { stdio: "pipe" },
);
const css = await readFile(cssPath, "utf8");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif}${css}</style></head><body><main><h1>Billing verification</h1><div id="root"></div></main>
<script>${react}</script><script>${dom}</script><script>${axios}</script><script>
window.process={env:{NEXT_PUBLIC_NGROX_URL:'https://billing.test/api'}};
const modules=${JSON.stringify(compiled)};const cache={};
const mocks={'react':React,'axios':axios,'react-icons/fi':{FiX:()=>React.createElement('span',null,'×')},
'react-hot-toast':{success:message=>{window.notices=(window.notices||[]).concat(message);}},
'@/app/lib/authSession':{getOrRefreshAccessToken:async()=> window.isSignedOut?null:'test-token',fetchWithAuthRetry:fetch}};
function require(id){if(mocks[id])return mocks[id];if(cache[id])return cache[id].exports;const mod={exports:{}};cache[id]=mod;new Function('exports','require',modules[id])(mod.exports,require);return mod.exports;}
const Banner=require('banner').default;const Confirmation=require('confirmation').default;const Pricing=require('../PricingPopup').default;
function App(){const [open,setOpen]=React.useState(false);return React.createElement(React.Fragment,null,
location.pathname.includes('/dashboard')?React.createElement(Banner):null,
React.createElement('button',{onClick:()=>setOpen(true)},'Manage plan'),open?React.createElement(Pricing,{onClose:()=>setOpen(false)}):null,React.createElement(Confirmation));}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode,null,React.createElement(App)));
</script></body></html>`;
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let available = 10001,
    paid = true,
    failBalance = false,
    op = null,
    confirmed = false,
    currentPlan = "starter";
  const baseOp = {
    operation_id: "op_test",
    status: "quoted",
    action: "renew",
    plan: "starter",
    amount: 500,
    currency: "usd",
    allocation: 6440000,
    effective_at: null,
    resets_billing_date: true,
    expires_at: new Date(Date.now() + 600000).toISOString(),
    return_url:
      "https://billing.test/tools/dashboard/?billing_operation=op_test",
  };
  await page.route("https://billing.test/**", async (route) => {
    const url = new URL(route.request().url());
    let body;
    if (url.pathname === "/api/users/token-usage") {
      if (failBalance)
        return route.fulfill({ status: 503, body: "Unavailable" });
      body = {
        tokens_remaining: available,
        total_tokens: 6440000,
        usedTokens: 6440000 - available,
        plan: paid ? "Premium" : "Free",
      };
    } else if (url.pathname === "/api/billing/status")
      body = {
        plan: currentPlan,
        subscription_status: "active",
        available_credits: available,
        reserved_credits: 0,
        next_billing_date: 1900000000,
        scheduled_change: null,
        review_required: false,
        pending_operation: null,
        actions: {
          starter:
            currentPlan !== "starter" ? { action: "schedule_change" } : available === 0
              ? { action: "renew" }
              : { action: null, message: "This is your current plan." },
          starter_annual: {
            action: available === 0 ? "change_now" : "schedule_change",
          },
        },
      };
    else if (url.pathname === "/api/billing/quote") {
      const input = route.request().postDataJSON();
      op = {
        ...baseOp,
        plan: input.plan,
        action: input.plan !== currentPlan ? "schedule_change" : "renew",
        effective_at: input.plan !== currentPlan ? 1900000000 : null,
      };
      body = op;
    } else if (url.pathname.endsWith("/confirm")) {
      confirmed = true;
      body = {
        ...op,
        status: "completed",
        provisioned: op.action !== "schedule_change",
        transaction_id: "in_test",
        amount_total: 500,
        currency: "usd",
      };
    } else if (url.pathname === "/api/billing/operations/op_test")
      body = {
        ...op,
        status: confirmed ? "completed" : "payment_pending",
        provisioned: confirmed && op.action !== "schedule_change",
        transaction_id: "in_test",
        amount_total: 500,
        currency: "usd",
      };
    else return route.fulfill({ contentType: "text/html", body: html });
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ data: body }),
    });
  });
  const navigate = async (path) => {
    await page.goto("https://billing.test" + path);
    await page
      .getByRole("button", { name: "Manage plan", exact: true })
      .waitFor();
  };
  await navigate("/tools/dashboard/");
  assert.equal(await page.getByText(/credits are running low/).count(), 0);
  available = 10000;
  await navigate("/tools/dashboard/");
  await page
    .getByText("Your credits are running low. You have 10,000 remaining.")
    .waitFor();
  await page.screenshot({ path: join(tmpdir(), "billing-low-credits.png") });
  await page.evaluate(() => {
    window.isSignedOut = true;
    window.dispatchEvent(new Event("sh:auth-cleared"));
  });
  assert.equal(await page.getByText(/credits are running low/).count(), 0);
  await navigate("/tools/citation-tool/");
  assert.equal(await page.getByText(/credits are running low/).count(), 0);
  paid = false;
  await navigate("/tools/dashboard/");
  assert.equal(await page.getByText(/credits are running low/).count(), 0);
  paid = true;
  failBalance = true;
  await navigate("/tools/dashboard/");
  assert.equal(await page.getByText(/credits are exhausted/).count(), 0);
  failBalance = false;
  available = 0;
  await navigate("/tools/dashboard/");
  await page.getByRole("button", { name: "Renew now", exact: true }).click();
  await page
    .getByRole("button", { name: "Review early renewal", exact: true })
    .click();
  await page.getByText("Payment: $5.00").waitFor();
  await page.screenshot({ path: join(tmpdir(), "billing-renewal-review.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await page.getByRole("dialog").boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
  await page.screenshot({ path: join(tmpdir(), "billing-renewal-mobile.png") });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page
    .getByRole("button", {
      name: "Confirm and continue to payment",
      exact: true,
    })
    .click();
  await page.waitForFunction(() =>
    window.notices?.some((x) => x.includes("You're all set")),
  );
  assert.equal(
    await page.evaluate(
      () => window.dataLayer.filter((x) => x.event === "tool_purchase").length,
    ),
    1,
  );
  assert.equal(
    await page.evaluate(
      () => window.dataLayer.find((x) => x.event === "tool_purchase").value,
    ),
    5,
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.dataLayer.find((x) => x.event === "tool_purchase")
          .transaction_id,
    ),
    "in_test",
  );
  assert.equal(new URL(page.url()).search, "");
  available = 100000;
  confirmed = false;
  await navigate("/tools/dashboard/");
  await page.getByRole("button", { name: "Manage plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Current plan", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Current plan", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(await page.getByRole("button", { name: /Starter Annual/ }).count(), 0);
  await page.getByRole("button", { name: "Close billing", exact: true }).click();
  currentPlan = "starter_annual";
  await navigate("/tools/dashboard/");
  await page.getByRole("button", { name: "Manage plan", exact: true }).click();
  await page.getByRole("button", { name: /6,440,000 credits/ }).click();
  await page
    .getByRole("button", { name: "Review scheduled change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm scheduled change", exact: true })
    .click();
  await page.waitForFunction(() =>
    window.notices?.some((x) => x.includes("scheduled")),
  );
  assert.equal(
    await page.evaluate(
      () =>
        (window.dataLayer || []).filter((x) => x.event === "tool_purchase")
          .length,
    ),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: dashboard boundaries, free/error exclusion, current plan guard, quoted early renewal, invoice conversion once, and scheduled change without purchase conversion.",
  );
} finally {
  await browser.close();
}
