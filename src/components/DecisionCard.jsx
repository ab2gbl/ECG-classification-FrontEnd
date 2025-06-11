// DecisionCard.jsx
import React from "react";
import "./DecisionCard.css";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function DecisionCard({ decision }) {
  const cleanDecision = decision?.trim().toLowerCase() || "";

  let icon = <AlertTriangle size={32} color="#FF8F00" />;
  let status = "Unknown";
  let colorClass = "unknown";
  let statusColor = "#FF8F00";
  let formattedDecision = decision;

  if (cleanDecision.startsWith("normal")) {
    icon = <CheckCircle size={32} color="#2E7D32" />;
    status = "Normal";
    colorClass = "normal";
    statusColor = "#2E7D32";
  } else if (cleanDecision.startsWith("abnormal")) {
    icon = <XCircle size={32} color="#C62828" />;
    status = "Abnormal";
    colorClass = "abnormal";
    statusColor = "#C62828";

    // Format abnormal response with emojis
    if (cleanDecision.startsWith("abnormal:")) {
      const conditions = cleanDecision
        .replace("abnormal:", "")
        .split(",")
        .map((condition) => {
          const trimmedCondition = condition.trim();
          if (trimmedCondition.startsWith("no ")) {
            return `${trimmedCondition.replace("no ", "")} ❌`;
          } else {
            return `${trimmedCondition} ✅`;
          }
        });
      formattedDecision = (
        <>
          <span>Abnormal:</span>
          <div className="conditions-list">
            {conditions.map((condition, index) => (
              <div key={index} className="condition-item">
                {condition}
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  return (
    <div className="decision-card-container">
      <div className="signal-viewer-wrapper decision-card">
        <div className="signal-chart-header">
          <h2 className="signal-chart-title">🩺 Diagnosis</h2>
        </div>

        <div className={`decision-body ${colorClass}`}>
          <div className="decision-icon">{icon}</div>
          <div className="decision-content">
            <p className="decision-text">{formattedDecision}</p>
            <p className="decision-status">
              Status: <span style={{ color: statusColor }}>{status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionCard;
