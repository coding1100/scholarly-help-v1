"use client";

import { fetchWithAuthRetry } from "@/app/lib/authSession";

/** Shapes returned by the Nest billing/auth/user endpoints this page uses. */
export interface BillingStatus {
  plan: "starter" | "starter_annual" | null;
  subscription_status: string | null;
  available_credits: number;
  reserved_credits: number;
  next_billing_date: number | null;
  scheduled_change: { plan: string | null; effective_at: number } | null;
}

export interface TokenUsage {
  tokens_remaining: number;
  total_tokens: number;
  usedTokens: number;
  plan: string;
  package_type: string;
  subscription_period_end?: string | null;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  number: string | null;
  created: number;
  description: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string | null;
  invoice_url: string | null;
  pdf_url: string | null;
}

export interface CreditUsageRow {
  service: string;
  credits: number;
}

export interface AccountProfile {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  help_class?: string;
}

function apiUrl(path: string): string {
  const base = String(process.env.NEXT_PUBLIC_NGROX_URL || "").replace(/\/$/, "");
  if (!base) throw new Error("Missing NEXT_PUBLIC_NGROX_URL");
  return `${base}${path}`;
}

/**
 * Unwrap the backend's `{ success, message, data }` envelope and turn a
 * non-2xx into an Error carrying the server's own message, so each screen can
 * show what actually went wrong instead of a generic failure.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuthRetry(apiUrl(path), {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    const message = raw?.message ?? raw?.error;
    const error = new Error(
      Array.isArray(message)
        ? message.join(", ")
        : typeof message === "string" && message
          ? message
          : `Request failed (${response.status})`,
    );
    (error as { status?: number }).status = response.status;
    throw error;
  }
  return (raw?.data ?? raw) as T;
}

export const getBillingStatus = () => request<BillingStatus>("/billing/status");
export const getTokenUsage = () => request<TokenUsage>("/users/token-usage");

export const getPaymentMethods = () =>
  request<{ payment_methods: PaymentMethod[] }>("/billing/payment-methods").then(
    (data) => data.payment_methods ?? [],
  );

export const getInvoices = () =>
  request<{ invoices: Invoice[] }>("/billing/invoices").then(
    (data) => data.invoices ?? [],
  );

export const getCreditUsage = () =>
  request<{ since: string | null; usage: CreditUsageRow[] }>(
    "/billing/credit-usage",
  ).then((data) => data.usage ?? []);

/** Stripe-hosted portal: card management and cancellation both live there. */
export const openBillingPortal = () =>
  request<{ url?: string } | string>("/billing/portal", { method: "POST" });

export const startCheckout = (plan: "starter" | "starter_annual") =>
  request<{ url: string }>("/billing/create-checkout", {
    method: "POST",
    body: JSON.stringify({
      plan,
      returnUrl: `${window.location.origin}/tools/account`,
    }),
  });

/** The signed-in user's own profile; the server resolves identity from the token. */
export const getProfile = () => request<AccountProfile>("/users/me");

export const updateProfile = (
  userId: string,
  patch: { name?: string; phone?: string; help_class?: string },
) =>
  request<AccountProfile>(`/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });

export const updatePassword = (currentPassword: string, newPassword: string) =>
  request<{ message: string }>("/auth/update-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const logoutAllDevices = () =>
  request<{ message: string }>("/auth/logout-all-devices", { method: "POST" });

export const deleteAccount = (currentPassword?: string) =>
  request<{ message: string }>("/auth/delete-account", {
    method: "POST",
    body: JSON.stringify(currentPassword ? { currentPassword } : {}),
  });

/** Money from Stripe arrives in minor units (cents). */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Stripe timestamps are seconds since epoch, not milliseconds. */
export function formatUnixDate(seconds: number | null): string {
  if (!seconds) return "";
  return new Date(seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const PLAN_LABELS: Record<string, string> = {
  starter: "Pro · Monthly",
  starter_annual: "Pro · Yearly",
};
