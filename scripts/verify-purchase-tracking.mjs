import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(
  new URL("../app/components/AiTools/CheckoutConfirmationOverlay.tsx", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;

async function checkout(response, { token = "test-token", fail = false, cancel = false, hang = false, search = "?gtm_debug=123&upgraded=1&session_id=cs_test_tracking" } = {}) {
  const result = { url: search, successes: 0, states: [], requests: 0, reloads: 0 };
  const window = {
    location: { search, pathname: "/tools/citation-tool/", hash: "#draft", reload() { result.reloads++; } },
    history: { replaceState(state, unused, url) { result.url = url; } },
  };
  let effect;
  let cursor = 0;
  let timer;
  const mocks = {
    react: {
      useEffect(fn) { effect = fn; },
      useState(initial) {
        const index = cursor++;
        if (!(index in result.states)) result.states[index] = initial;
        return [result.states[index], value => { result.states[index] = value; }];
      },
    },
    "react/jsx-runtime": { jsx(type, props) { return { type, props }; }, jsxs(type, props) { return { type, props }; } },
    axios: { isAxiosError(error) { return error.isAxiosError; }, async get() {
      result.requests++;
      if (hang) return new Promise(() => {});
      if (fail) throw Object.assign(new Error("Private API error"), { isAxiosError: true });
      return { data: response };
    } },
    "react-hot-toast": { success() { result.successes++; } },
    "@/app/lib/authSession": { async getOrRefreshAccessToken() { return token; } },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, window, URLSearchParams, Intl, AbortController, Error,
    setTimeout(fn) { timer = fn; return 1; }, clearTimeout() { timer = undefined; },
    process: { env: { NEXT_PUBLIC_NGROX_URL: "https://test.invalid" } },
    require(name) { assert.ok(name in mocks, `Unexpected dependency: ${name}`); return mocks[name]; },
  });
  exports.default();
  const cleanup = effect();
  if (cancel) cleanup();
  await new Promise(resolve => setImmediate(resolve));
  if (hang) {
    timer();
    await new Promise(resolve => setImmediate(resolve));
  }
  cursor = 0;
  result.view = exports.default();
  const events = window.dataLayer || [];
  events.details = result;
  return events;
}

const confirmed = { provisioned: true, amount_total: 1999, currency: "usd", plan: "starter" };
const [purchase] = await checkout(confirmed);
assert.equal(purchase.event, "tool_purchase");
assert.equal(purchase.transaction_id, "cs_test_tracking");
assert.equal(purchase.value, 19.99);
assert.equal(purchase.currency, "USD");
assert.equal(purchase.plan, "starter");
assert.equal((await checkout({ data: confirmed }))[0].value, 19.99);

for (const provisioned of [false, undefined, null, "true", 1]) {
  assert.equal((await checkout({ ...confirmed, provisioned })).length, 0);
}
assert.equal((await checkout(confirmed, { token: null })).length, 0);
assert.equal((await checkout(confirmed, { fail: true })).length, 0);

for (const [currency, amount_total, expected] of [
  ["usd", 0, 0], ["jpy", 1999, 1999], ["kwd", 1999, 1.999],
  ["isk", 500, 5], ["ugx", 500, 5], ["huf", 1045, 10.45], ["twd", 1045, 10.45],
]) {
  assert.equal((await checkout({ ...confirmed, currency, amount_total }))[0].value, expected, currency);
}
for (const amount_total of [undefined, null, -1, NaN, Infinity, "1999"]) {
  assert.equal((await checkout({ ...confirmed, amount_total }))[0].value, undefined);
}
assert.equal((await checkout({ ...confirmed, currency: null }))[0].value, undefined);
assert.equal((await checkout({ ...confirmed, currency: "invalid" }))[0].value, undefined);
console.log("Purchase tracking checks passed: confirmed responses, failure paths, currency units, and missing amounts.");

const success = (await checkout(confirmed)).details;
assert.equal(success.url, "/tools/citation-tool/?gtm_debug=123#draft");
assert.equal(success.successes, 1);
assert.equal(success.view, null);
for (const options of [{ fail: true }, { token: null }, { hang: true }]) {
  const events = await checkout(confirmed, options);
  assert.equal(events.length, 0);
  assert.equal(events.details.successes, 0);
  assert.match(events.details.url, /session_id=cs_test_tracking/);
  assert.equal(events.details.view.props.role, "alert");
  assert.equal(events.details.states[0], false);
  assert.doesNotMatch(events.details.states[1], /Private API/);
  const buttons = events.details.view.props.children[2].props.children;
  buttons[0].props.onClick();
  assert.equal(events.details.reloads, 1);
  buttons[1].props.onClick();
  assert.equal(events.details.states[1], null);
}
const pending = await checkout({ provisioned: false });
assert.equal(pending.details.successes, 0);
assert.match(pending.details.url, /upgraded=1/);
assert.match(pending.details.states[1], /not confirmed/);
const retry = await checkout(confirmed, { search: pending.details.url });
assert.equal(retry.length, 1);
assert.equal(retry.details.successes, 1);
const missing = await checkout(confirmed, { search: "?upgraded=1" });
assert.equal(missing.length, 0);
assert.equal(missing.details.requests, 0);
assert.equal(missing.details.successes, 0);
assert.match(missing.details.states[1], /reference is missing/);
const cancelled = await checkout(confirmed, { cancel: true });
assert.equal(cancelled.length, 0);
assert.equal(cancelled.details.successes, 0);
assert.match(cancelled.details.url, /session_id=/);
console.log("Confirmation recovery checks passed: errors, timeouts, retry, URL preservation, cancellation, and success cleanup.");

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
assert.match(layout, /id="gtm-script"\s+strategy="afterInteractive"/);
const gtmSource = layout.match(/__html: `([\s\S]*?)`/)?.[1];
assert.ok(gtmSource);
const queuedPurchase = { event: "tool_purchase", transaction_id: "cs_test_tracking" };
const trackingWindow = { dataLayer: [queuedPurchase] };
const insertedScripts = [];
vm.runInNewContext(gtmSource, {
  window: trackingWindow,
  document: {
    readyState: "loading",
    createElement() { return {}; },
    getElementsByTagName() { return [{ parentNode: { insertBefore(script) { insertedScripts.push(script); } } }]; },
  },
});
assert.equal(insertedScripts.length, 1);
assert.equal(insertedScripts[0].src, "https://www.googletagmanager.com/gtm.js?id=GTM-5ZHV46X");
assert.equal(insertedScripts[0].async, true);
assert.equal(trackingWindow.dataLayer[0], queuedPurchase);
assert.equal(trackingWindow.dataLayer[1].event, "gtm.js");
console.log("GTM checks passed: async script inserted immediately, existing purchase queue preserved.");
