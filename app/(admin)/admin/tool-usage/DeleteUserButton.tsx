"use client";

import { useState, useTransition } from "react";

export default function DeleteUserButton({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingActiveSubscription, setConfirmingActiveSubscription] = useState(false);

  function deleteUser(confirmActiveSubscription: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const params = confirmActiveSubscription ? "?confirmActiveSubscription=true" : "";
        const response = await fetch(
          `/api/admin/users/${encodeURIComponent(userId)}${params}`,
          { method: "DELETE" },
        );
        const payload = await response.json().catch(() => ({}) as any);

        if (response.status === 409 && payload?.error === "ACTIVE_SUBSCRIPTION") {
          setConfirmingActiveSubscription(true);
          return;
        }

        if (!response.ok) {
          setError(payload?.error || "Failed to delete user.");
          return;
        }

        window.location.reload();
      } catch {
        setError("Failed to delete user.");
      }
    });
  }

  if (confirmingActiveSubscription) {
    return (
      <div className="flex flex-col items-end gap-1">
        <p className="max-w-[200px] text-right text-xs font-medium text-[#c2410c]">
          {userLabel} has an active subscription. Delete anyway?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => deleteUser(true)}
            className="rounded-md bg-[#dc2626] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmingActiveSubscription(false)}
            className="rounded-md border border-[#d1d8e8] px-2.5 py-1 text-xs font-semibold text-[#353535] hover:bg-[#eef0f8]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm(`Permanently delete ${userLabel}? This cannot be undone.`)) {
            deleteUser(false);
          }
        }}
        className="rounded-md border border-[#fca5a5] px-2.5 py-1 text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="max-w-[200px] text-right text-xs text-[#dc2626]">{error}</p> : null}
    </div>
  );
}
