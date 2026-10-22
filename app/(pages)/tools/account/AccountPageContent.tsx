"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import PlanCreditsTab from "@/app/components/AiTools/Account/PlanCreditsTab";
import PaymentInvoicesTab from "@/app/components/AiTools/Account/PaymentInvoicesTab";
import ProfileTab from "@/app/components/AiTools/Account/ProfileTab";
import SecurityTab from "@/app/components/AiTools/Account/SecurityTab";
import { initializeAuthSession } from "@/app/lib/authSession";
import { appendQueryString } from "@/app/utils/url";

const TABS = [
  { key: "plan", label: "Plan & credits" },
  { key: "payment", label: "Payment & invoices" },
  { key: "profile", label: "Profile" },
  { key: "security", label: "Password & security" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

export default function AccountPageContent() {
  const [flag, setFlag] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const [active, setActive] = useState<TabKey>(
    isTabKey(tabParam) ? tabParam : "plan",
  );
  const [authChecked, setAuthChecked] = useState(false);

  // The whole page is account data, so a signed-out visitor is sent to sign in
  // rather than shown empty panels.
  useEffect(() => {
    let alive = true;
    void initializeAuthSession().then((token) => {
      if (!alive) return;
      if (!token) {
        const returnTo = "/tools/account";
        router.replace(
          appendQueryString(
            "/sign-in",
            `returnUrl=${encodeURIComponent(returnTo)}`,
          ),
        );
        return;
      }
      setAuthChecked(true);
    });
    return () => {
      alive = false;
    };
  }, [router]);

  // Keep the tab in the URL so a reload, a back button press, or a link shared
  // between devices lands on the same panel.
  useEffect(() => {
    if (isTabKey(tabParam) && tabParam !== active) setActive(tabParam);
  }, [tabParam, active]);

  const selectTab = (key: TabKey) => {
    setActive(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`/tools/account?${params.toString()}`, { scroll: false });
  };

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      <main className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Account sections"
            className="inline-flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {TABS.map((tab) => {
              const selected = active === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  onClick={() => selectTab(tab.key)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                    selected
                      ? "bg-primary-400 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className="mt-6"
          >
            {!authChecked ? (
              <div
                aria-busy="true"
                className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              />
            ) : active === "plan" ? (
              <PlanCreditsTab />
            ) : active === "payment" ? (
              <PaymentInvoicesTab />
            ) : active === "profile" ? (
              <ProfileTab />
            ) : (
              <SecurityTab />
            )}
          </div>
        </div>
      </main>
    </ToolsLayout>
  );
}
