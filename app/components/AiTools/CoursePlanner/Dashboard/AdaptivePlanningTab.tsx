import React, { useState } from "react";
import { FiZap, FiCheck, FiX, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { AdaptiveAlert } from "@/app/lib/client/coursePlanner/types";

interface Props {
  alerts: AdaptiveAlert[];
  onApplyAlert: (id: string) => void;
  onIgnoreAlert: (id: string) => void;
}

export const AdaptivePlanningTab: React.FC<Props> = ({ alerts, onApplyAlert, onIgnoreAlert }) => {
  // Applying rewrites coursework due dates in bulk — every other
  // consequential action in this tool (Drop Course, Delete Semester) asks
  // for confirmation first, so this should too.
  const [confirmApplyAlert, setConfirmApplyAlert] = useState<AdaptiveAlert | null>(null);
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Adaptive Workload Planning</h2>
          <p className="text-xs text-gray-500">Automated workload rebalancing proposals triggered by syllabus deadline shifts</p>
        </div>

        <div className="text-xs font-semibold text-gray-500">
          {alerts.filter((a) => a.status === "pending").length} actionable proposals
        </div>
      </div>

      {/* Alert Proposals Queue */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400 text-xs shadow-sm">
            No adaptive planning alerts currently active. Workload is balanced across your schedule.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-400 flex items-center justify-center">
                    <FiZap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{alert.title}</h3>
                    <p className="text-xs text-gray-500">{alert.description}</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ring-1 ${
                    alert.status === "pending"
                      ? "bg-secondary-200/40 text-secondary-500 ring-secondary-200"
                      : alert.status === "applied"
                      ? "bg-primary-100 text-primary-400 ring-primary-300"
                      : "bg-gray-100 text-gray-500 ring-gray-200"
                  }`}
                >
                  {alert.status}
                </span>
              </div>

              {/* Proposed Changes Table */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 tracking-wide">Proposed Coursework Mutations</h4>
                {alert.proposedChanges.map((change: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">{change.courseworkTitle}</span>
                      <p className="text-xs text-gray-500">{change.reason}</p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="line-through text-gray-400">{change.oldDueDate}</span>
                      <FiArrowRight className="w-3.5 h-3.5 text-primary-400" />
                      <span className="font-semibold text-primary-400">{change.newDueDate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {alert.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => onIgnoreAlert(alert.id)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <FiX className="w-3.5 h-3.5" /> Ignore
                  </button>
                  <button
                    onClick={() => setConfirmApplyAlert(alert)}
                    className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <FiCheck className="w-3.5 h-3.5" /> Apply Adaptive Mutation
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Apply Confirmation Modal */}
      {confirmApplyAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-primary-400">
              <FiAlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Apply This Mutation?</h3>
            </div>
            <p className="text-xs text-gray-600">
              This will rewrite the due date{confirmApplyAlert.proposedChanges.length > 1 ? "s" : ""} for{" "}
              <span className="font-semibold">
                {confirmApplyAlert.proposedChanges.length} coursework item
                {confirmApplyAlert.proposedChanges.length > 1 ? "s" : ""}
              </span>{" "}
              as shown above. This cannot be undone automatically.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmApplyAlert(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyAlert(confirmApplyAlert.id);
                  setConfirmApplyAlert(null);
                }}
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Confirm Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
