import React from "react";
import { Sparkles, Check, X, AlertTriangle, ArrowRight } from "lucide-react";
import { AdaptiveAlert } from "@/app/lib/client/coursePlanner/types";

interface Props {
  alerts: AdaptiveAlert[];
  onApplyAlert: (id: string) => void;
}

export const AdaptivePlanningTab: React.FC<Props> = ({ alerts, onApplyAlert }) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Adaptive Workload Planning</h2>
          <p className="text-sm text-gray-500">Automated workload rebalancing proposals triggered by syllabus deadline shifts</p>
        </div>

        <div className="text-xs font-semibold text-gray-400">
          {alerts.filter((a) => a.status === "pending").length} Actionable Proposals
        </div>
      </div>

      {/* Alert Proposals Queue */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center text-gray-400 text-xs">
            No adaptive planning alerts currently active. Workload is balanced across your schedule!
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{alert.title}</h3>
                    <p className="text-xs text-gray-500">{alert.description}</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    alert.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : alert.status === "applied"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {alert.status}
                </span>
              </div>

              {/* Proposed Changes Table */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Proposed Coursework Mutations</h4>
                {alert.proposedChanges.map((change: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{change.courseworkTitle}</span>
                      <p className="text-[11px] text-gray-500">{change.reason}</p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="line-through text-gray-400">{change.oldDueDate}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary-400" />
                      <span className="font-bold text-primary-500">{change.newDueDate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {alert.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => onApplyAlert(alert.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Apply Adaptive Mutation
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
