"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  deleteAccount,
  logoutAllDevices,
  updatePassword,
} from "@/app/utils/accountClient";
import { clearAuthSession } from "@/app/utils/auth";

const MIN_PASSWORD_LENGTH = 8;

export default function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!current) {
      toast.error("Please enter your current password.");
      return;
    }
    if (next.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      // The backend revokes every session on a password change, so this device
      // is signed out too. Send the user to sign in rather than leaving them
      // clicking a dead UI with a token that no longer works.
      toast.success("Password updated. Please sign in again.");
      clearAuthSession();
      setTimeout(() => window.location.assign("/sign-in"), 1200);
    } catch (err: any) {
      toast.error(err?.message || "Could not update your password.");
      setSaving(false);
    }
  };

  const handleLogoutEverywhere = async () => {
    setSigningOut(true);
    try {
      await logoutAllDevices();
      toast.success("Signed out of all devices.");
      clearAuthSession();
      setTimeout(() => window.location.assign("/sign-in"), 1000);
    } catch (err: any) {
      toast.error(err?.message || "Could not sign out everywhere.");
      setSigningOut(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deletePassword || undefined);
      clearAuthSession();
      toast.success("Your account has been deleted.");
      setTimeout(() => window.location.assign("/"), 1200);
    } catch (err: any) {
      toast.error(err?.message || "Could not delete your account.");
      setDeleting(false);
    }
  };

  const fieldClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Password &amp; security
      </h2>

      <form onSubmit={handleUpdatePassword} className="mt-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <label
              htmlFor="current-password"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary-400 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update password"}
          </button>
          <Link
            href="/forgot-password"
            className="text-sm font-bold text-primary-400 underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
          <button
            type="button"
            onClick={handleLogoutEverywhere}
            disabled={signingOut}
            className="ml-auto text-sm text-gray-600 underline-offset-4 transition hover:text-gray-900 hover:underline disabled:opacity-60 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {signingOut ? "Signing out..." : "Log out of all devices"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Delete account
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Permanently removes your work and account.
            </p>
          </div>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-xl border border-[#F73032] px-5 py-2.5 text-sm font-bold text-[#F73032] transition hover:bg-[#F73032]/10"
            >
              Delete account
            </button>
          ) : null}
        </div>

        {/* Irreversible, so it is never one click: the user re-enters their
            password and confirms explicitly. */}
        {confirmingDelete ? (
          <div className="mt-4 rounded-xl border border-[#F73032]/40 bg-[#F73032]/5 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              This cannot be undone. Your documents, history and credits are
              removed permanently.
            </p>
            <label
              htmlFor="delete-password"
              className="mt-3 block text-sm text-gray-700 dark:text-gray-200"
            >
              Confirm your password
            </label>
            <input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F73032] focus-visible:ring-2 focus-visible:ring-[#F73032] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-[#F73032] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d62628] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Permanently delete my account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                }}
                disabled={deleting}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
