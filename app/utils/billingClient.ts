import axios from "axios";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

export type PaidPlan = "starter" | "starter_annual";
export type BillingOperation = {
  operation_id: string;
  status:
    | "quoted"
    | "processing"
    | "payment_pending"
    | "completed"
    | "expired"
    | "review";
  action: "subscribe" | "renew" | "change_now" | "schedule_change";
  plan: PaidPlan;
  amount: number;
  currency: string;
  allocation: number;
  effective_at: number | null;
  resets_billing_date: boolean;
  url?: string;
  return_url: string;
  expires_at: string;
};
export type BillingStatus = {
  plan: PaidPlan | null;
  subscription_status: string | null;
  available_credits: number;
  reserved_credits: number;
  next_billing_date: number | null;
  scheduled_change: { plan: PaidPlan | null; effective_at: number } | null;
  review_required: boolean;
  actions: Record<PaidPlan, { action: string | null; message?: string }>;
  pending_operation: BillingOperation | null;
};

export async function billingRequest<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = await getOrRefreshAccessToken();
  if (!token) throw new Error("Please sign in to manage your plan.");
  const base = process.env.NEXT_PUBLIC_NGROX_URL;
  if (!base) throw new Error("Billing is temporarily unavailable.");
  const response = await axios.request({
    url: `${base}/billing/${path}`,
    method: body === undefined ? "GET" : "POST",
    data: body,
    signal,
    timeout: 25000,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data?.data ?? response.data;
}

export function billingError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (
      typeof message === "string" &&
      error.response &&
      error.response.status < 500
    )
      return message;
    return "We could not complete this billing request. Retry to check its status before paying again.";
  }
  return error instanceof Error
    ? error.message
    : "Billing is temporarily unavailable.";
}

export function planName(plan: PaidPlan | null) {
  return plan === "starter_annual"
    ? "Starter Annual"
    : plan === "starter"
      ? "Starter"
      : "Free";
}
