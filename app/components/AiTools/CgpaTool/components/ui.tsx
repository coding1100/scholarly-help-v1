"use client";

import React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={[
        "rounded-2xl border border-slate-200 bg-white shadow-md",
        "dark:border-slate-800 dark:bg-slate-950",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div
      className={[
        "border-b border-slate-200 px-3 py-3 sm:px-4 dark:border-slate-800",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function CardBody(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return (
    <div className={["px-3 py-4 sm:px-4", className].join(" ")} {...rest} />
  );
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className = "", ...rest } = props;
  return (
    <label
      className={[
        "text-sm font-medium text-slate-700 dark:text-slate-200",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={[
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={[
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  },
) {
  const { className = "", variant = "secondary", ...rest } = props;
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-[#565add] text-white",
    secondary:
      "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40",
    ghost: "text-[#ff641a]",
    danger:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200",
  };
  return (
    <button
      className={[base, variants[variant], className].join(" ")}
      {...rest}
    />
  );
}

export function Toggle(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  const { checked, onChange, label, description } = props;
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "w-full rounded-2xl border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50",
        "dark:border-slate-800 dark:hover:bg-slate-900/40",
      ].join(" ")}
      aria-pressed={checked}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {label}
          </div>
          {description ? (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </div>
          ) : null}
        </div>
        <span
          className={[
            "mt-0.5 inline-flex h-6 w-11 items-center rounded-full p-1 transition",
            checked ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-800",
          ].join(" ")}
          aria-hidden="true"
        >
          <span
            className={[
              "h-4 w-4 rounded-full bg-white shadow-sm transition",
              checked ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </span>
      </div>
    </button>
  );
}

export function Stat(props: {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {props.label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {props.value}
      </div>
      {props.subValue ? (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {props.subValue}
        </div>
      ) : null}
    </div>
  );
}
