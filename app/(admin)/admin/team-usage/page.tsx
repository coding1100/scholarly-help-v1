import Link from "next/link";
import {
  actionLabel,
  getTeamUsageReport,
  parseTeamUsageFilters,
  TEAM_USAGE_TOOLS,
  toolLabel,
} from "@/app/lib/server/teamUsageReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParams(searchParams: Record<string, string | string[] | undefined> | undefined) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    const item = Array.isArray(value) ? value[0] : value;
    if (item) params.set(key, item);
  }
  return params;
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

const dateInputValue = (value: Date) => value.toISOString().slice(0, 10);
const TOOL_KEYS = Object.keys(TEAM_USAGE_TOOLS);

export default async function TeamUsagePage({ searchParams }: PageProps) {
  const params = toSearchParams(await searchParams);
  const filters = parseTeamUsageFilters(params);
  const report = await getTeamUsageReport(filters);
  const visibleTools = filters.tool ? [filters.tool] : TOOL_KEYS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[#1a2456]">Team Usage</h2>
        <p className="mt-1 text-sm text-[#4b5563]">
          Runs by the internal team account. These are unlimited and never charged, so they are tracked here instead of
          against credits. Times and days are UTC.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-[#e2e8f4] bg-white p-3 shadow-sm md:grid-cols-4">
        <label className="text-sm font-medium text-[#353535]">
          From
          <input
            name="from"
            type="date"
            defaultValue={dateInputValue(filters.from)}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-[#353535]">
          To
          <input
            name="to"
            type="date"
            defaultValue={dateInputValue(filters.to)}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-[#353535]">
          Tool
          <select
            name="tool"
            defaultValue={filters.tool || ""}
            className="mt-1 block w-full rounded-lg border border-[#d1d8e8] bg-white px-3 py-2 text-sm text-[#353535]"
          >
            <option value="">All tools</option>
            {TOOL_KEYS.map((tool) => (
              <option key={tool} value={tool}>
                {toolLabel(tool)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-[#565add] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#474bc6]"
          >
            Apply
          </button>
          <Link
            href="/admin/team-usage"
            className="rounded-lg border border-[#d1d8e8] px-4 py-2.5 text-sm font-semibold text-[#283c88] transition hover:bg-[#eef0f8]"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Runs", report.totals.runs],
          ["Successful", report.totals.runs - report.totals.errors],
          ["Failed", report.totals.errors],
          ["Words processed", report.totals.words.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#e2e8f4] bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#727780]">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#1a2456]">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
        <h3 className="border-b border-[#eef0f8] px-4 py-3 text-base font-semibold text-[#1a2456]">By tool and action</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full divide-y divide-[#eef0f8] text-sm">
            <thead className="bg-[#f8f9fd]">
              <tr>
                {["Tool", "Action", "Runs", "Failed", "Words", "Last used"].map((heading, index) => (
                  <th
                    key={heading}
                    className={`px-4 py-2 font-semibold text-[#353535] ${index >= 2 && index <= 4 ? "text-right" : "text-left"}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f8]">
              {report.byAction.length ? (
                report.byAction.map((row) => (
                  <tr key={`${row.tool}-${row.action}`}>
                    <td className="px-4 py-2 text-[#353535]">{toolLabel(row.tool)}</td>
                    <td className="px-4 py-2 text-[#353535]">{actionLabel(row.action)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-[#283c88]">{row.runs}</td>
                    <td className="px-4 py-2 text-right text-[#727780]">{row.errors}</td>
                    <td className="px-4 py-2 text-right text-[#727780]">{row.words.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[#727780]">{displayDate(row.lastUsedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#727780]">
                    No team usage in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
        <section className="overflow-hidden rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
          <h3 className="border-b border-[#eef0f8] px-4 py-3 text-base font-semibold text-[#1a2456]">Daily runs</h3>
          <div className="max-h-96 overflow-auto">
            <table className="w-full divide-y divide-[#eef0f8] whitespace-nowrap text-sm">
              <thead className="sticky top-0 bg-[#f8f9fd]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#353535]">Day</th>
                  {visibleTools.map((tool) => (
                    <th key={tool} className="px-4 py-2 text-right font-semibold text-[#353535]">
                      {toolLabel(tool)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f8]">
                {report.byDay.map(({ day, counts }) => (
                  <tr key={day}>
                    <td className="whitespace-nowrap px-4 py-2 text-[#353535]">{day}</td>
                    {visibleTools.map((tool) => (
                      <td key={tool} className="px-4 py-2 text-right text-[#283c88]">
                        {counts[tool] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
          <h3 className="border-b border-[#eef0f8] px-4 py-3 text-base font-semibold text-[#1a2456]">Latest 100 runs</h3>
          <div className="max-h-96 overflow-auto">
            <table className="min-w-[720px] w-full divide-y divide-[#eef0f8] text-sm">
              <thead className="sticky top-0 bg-[#f8f9fd]">
                <tr>
                  {["When", "Tool", "Action", "Words", "Result", "Time"].map((heading) => (
                    <th key={heading} className="px-4 py-2 text-left font-semibold text-[#353535]">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f8]">
                {report.recent.map((event, index) => (
                  <tr key={`${event.createdAt.toISOString()}-${index}`}>
                    <td className="whitespace-nowrap px-4 py-2 text-[#727780]">{displayDate(event.createdAt)}</td>
                    <td className="px-4 py-2 text-[#353535]">{toolLabel(event.tool)}</td>
                    <td className="px-4 py-2 text-[#353535]">{actionLabel(event.action)}</td>
                    <td className="px-4 py-2 text-[#727780]">{event.words.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {event.status === "success" ? (
                        <span className="inline-flex rounded-full bg-[#ecfdf3] px-2.5 py-1 text-xs font-semibold text-[#027a48]">
                          Success
                        </span>
                      ) : (
                        <span
                          title={event.error_message}
                          className="inline-flex rounded-full bg-[#fef3f2] px-2.5 py-1 text-xs font-semibold text-[#b42318]"
                        >
                          Failed{event.status_code ? ` (${event.status_code})` : ""}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-[#727780]">{(event.duration_ms / 1000).toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
