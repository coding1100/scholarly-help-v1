import Link from "next/link";
import {
  getToolUsageReport,
  parseToolUsageFilters,
  TOOL_USAGE_TOOL_OPTIONS,
} from "@/app/lib/server/toolUsageReport";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toSearchParams(searchParams: PageProps["searchParams"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    const item = first(value);
    if (item) params.set(key, item);
  }
  return params;
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function dateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function userLabel(row: {
  userType?: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
  anonymousId?: string;
  userKey: string;
}) {
  if (row.userEmail || row.userName || row.userId) {
    return row.userEmail || row.userName || row.userId || row.userKey;
  }
  if (row.anonymousId) return `Guest ${row.anonymousId.slice(0, 8)}`;
  return row.userType === "guest" ? "Guest" : row.userKey;
}

function locationLabel(row: {
  country?: string;
  region?: string;
  city?: string;
}) {
  return [row.city, row.region, row.country].filter(Boolean).join(", ") || "-";
}

export default async function ToolUsagePage({ searchParams }: PageProps) {
  const params = toSearchParams(searchParams);
  const filters = parseToolUsageFilters(params);
  const report = await getToolUsageReport(filters);
  const exportParams = new URLSearchParams(params);
  if (!exportParams.get("from") && filters.from) exportParams.set("from", dateInputValue(filters.from));
  if (!exportParams.get("to") && filters.to) exportParams.set("to", dateInputValue(filters.to));
  const exportHref = `/api/admin/tool-usage/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;
  const maxToolUsage = Math.max(...report.toolTotals.map((tool) => tool.usageCount), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a2456]">Tool Usage</h2>
          <p className="mt-1 text-sm text-[#4b5563]">
            Per-user tool activity, usage counts, and first/last usage windows.
          </p>
        </div>
        <Link
          href={exportHref}
          className="inline-flex items-center justify-center rounded-lg bg-[#283c88] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2f6a]"
        >
          Export Excel
        </Link>
      </div>

      <form className="grid gap-3 rounded-xl border border-[#e2e8f4] bg-white p-4 shadow-sm md:grid-cols-5">
        <label className="text-sm font-medium text-[#353535]">
          From
          <input
            name="from"
            type="date"
            defaultValue={filters.from ? dateInputValue(filters.from) : ""}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-[#353535]">
          To
          <input
            name="to"
            type="date"
            defaultValue={filters.to ? dateInputValue(filters.to) : ""}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-[#353535]">
          Tool
          <select
            name="tool"
            defaultValue={params.get("tool") || ""}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] bg-white px-3 py-2 text-sm text-[#353535]"
          >
            <option value="">All tools</option>
            {TOOL_USAGE_TOOL_OPTIONS.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-[#353535]">
          User
          <input
            name="user"
            defaultValue={params.get("user") || ""}
            placeholder="Email, name, or ID"
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-[#565add] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#474bc6]"
          >
            Apply
          </button>
          <Link
            href="/admin/tool-usage"
            className="rounded-lg border border-[#d1d8e8] px-4 py-2.5 text-sm font-semibold text-[#283c88] transition hover:bg-[#eef0f8]"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          ["Total Usage", report.summary.totalUsage],
          ["All Users", report.summary.totalUsers],
          ["Registered", report.summary.registeredUsers],
          ["Guests", report.summary.guestUsers],
          ["Tools Used", report.summary.totalTools],
          ["Top Tool", report.summary.mostUsedTool || "-"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#727780]">{label}</p>
            <p className="mt-2 truncate text-2xl font-bold text-[#1a2456]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)]">
        <section className="rounded-xl border border-[#e2e8f4] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a2456]">Usage By Tool</h3>
          <div className="mt-4 space-y-3">
            {report.toolTotals.length ? (
              report.toolTotals.slice(0, 12).map((tool) => (
                <div key={tool.toolName}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-[#353535]">{tool.toolName}</span>
                    <span className="font-semibold text-[#283c88]">{tool.usageCount}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[#eef0f8]">
                    <div
                      className="h-2 rounded-full bg-[#565add]"
                      style={{ width: `${Math.max(4, (tool.usageCount / maxToolUsage) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#727780]">No usage events found.</p>
            )}
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
          <div className="border-b border-[#eef0f8] px-5 py-4">
            <h3 className="text-lg font-semibold text-[#1a2456]">User Tool Matrix</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[1120px] divide-y divide-[#eef0f8] text-sm">
              <thead className="bg-[#f8f9fd]">
                <tr>
                  <th className="w-[23%] px-4 py-3 text-left font-semibold text-[#353535]">User</th>
                  <th className="w-[10%] px-4 py-3 text-left font-semibold text-[#353535]">Type</th>
                  <th className="w-[20%] px-4 py-3 text-left font-semibold text-[#353535]">Tool</th>
                  <th className="w-[9%] px-4 py-3 text-right font-semibold text-[#353535]">Uses</th>
                  <th className="w-[16%] px-4 py-3 text-left font-semibold text-[#353535]">Location</th>
                  <th className="w-[11%] px-4 py-3 text-left font-semibold text-[#353535]">First Used</th>
                  <th className="w-[11%] px-4 py-3 text-left font-semibold text-[#353535]">Last Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f8]">
                {report.rows.length ? (
                  report.rows.map((row) => (
                    <tr key={`${row.toolName}-${row.userKey}`}>
                      <td className="max-w-[260px] truncate px-4 py-3 text-[#353535]" title={row.userEmail || row.userId || row.anonymousId || row.userKey}>{userLabel(row)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.userType === "guest"
                            ? "bg-[#fff7ed] text-[#c2410c]"
                            : "bg-[#eef0f8] text-[#283c88]"
                        }`}>
                          {row.userType === "guest" ? "Guest" : "Registered"}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-[#353535]">{row.toolName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#283c88]">{row.usageCount}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-[#727780]" title={locationLabel(row)}>{locationLabel(row)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#727780]">{displayDate(row.firstUsedAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#727780]">{displayDate(row.lastUsedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-[#727780]" colSpan={7}>
                      No usage events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
