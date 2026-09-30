"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "@/app/utils/accountClient";

export default function ProfileTab() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [helpClass, setHelpClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Shown immediately so the form is never blank while the fetch runs.
        setName(localStorage.getItem("user_name") || "");
        setEmail(localStorage.getItem("user_email") || "");
      } catch {
        // Blocked storage: the fetch below is the source of truth anyway.
      }

      try {
        // Identity comes from the token, not from client storage, so a cleared
        // or stale localStorage can never point the save at the wrong account.
        const profile = await getProfile();
        if (!active) return;
        setUserId(profile.user_id);
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setHelpClass(profile.help_class || "");
      } catch {
        // Keep whatever came from storage; saving stays blocked until we know
        // which account this is.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      toast.error("Could not identify your account. Please sign in again.");
      return;
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile(userId, {
        name: trimmedName,
        phone: phone.trim(),
        help_class: helpClass.trim(),
      });
      // Keep the cached name in step: the sidebar and the dashboard greeting
      // both read it from storage.
      try {
        localStorage.setItem("user_name", updated.name || trimmedName);
      } catch {
        // Non-fatal: the server already has the change.
      }
      toast.success("Profile updated.");
    } catch (err: any) {
      toast.error(err?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400 disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Profile
      </h2>

      <form onSubmit={handleSave} className="mt-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="account-name"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Full name
            </label>
            <input
              id="account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              autoComplete="name"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="account-email"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Email
            </label>
            {/* Read-only: the address is the account identity in Supabase, so
                changing it needs a verification flow that does not exist yet. */}
            <input
              id="account-email"
              value={email}
              readOnly
              disabled
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="account-phone"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              WhatsApp / phone{" "}
              <span className="font-normal text-gray-500">(for expert help)</span>
            </label>
            <input
              id="account-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={loading}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="account-class"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Class you need most help with
            </label>
            <input
              id="account-class"
              value={helpClass}
              onChange={(event) => setHelpClass(event.target.value)}
              disabled={loading}
              placeholder="e.g. NUR 301 Nursing Research"
              className={fieldClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="mt-6 rounded-xl bg-primary-400 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
