import React from "react";
import SignalViewer from "../../components/SignalViewer";
import FeatureTable from "../../components/FeatureTable";
import SignalFeaturesViewer from "../../components/SignalFeaturesViewer";
import DecisionCard from "../../components/DecisionCard";

const BeatCountsSummary = ({ signalFeatures }) => {
  if (!signalFeatures) return null;

  const counts = [
    { label: "N", value: signalFeatures.count_n || 0 },
    { label: "V", value: signalFeatures.count_v || 0 },
    { label: "L", value: signalFeatures.count_l || 0 },
    { label: "R", value: signalFeatures.count_r || 0 },
    { label: "/", value: signalFeatures["count_/"] || 0 },
    { label: "else", value: signalFeatures.count_else || 0 },
  ];

  return (
    <div className="beat-counts-summary">
      {counts.map(({ label, value }) => (
        <span key={label} className="beat-count">
          {label} : {value}
        </span>
      ))}
    </div>
  );
};

const ChunkSection = ({
  chunk,
  isExpanded,
  onToggle,
  startIndex,
  onStartIndexChange,
}) => {
  return (
    <div className="chunk-section">
      <div className="chunk-header" onClick={onToggle}>
        <div className="chunk-header-left">
          <h3>
            Chunk {chunk.chunkName} (
            {new Date(chunk.timestamp).toLocaleTimeString()})
          </h3>
          <div className="chunk-header-info">
            {chunk.decision && (
              <div
                className={`status-badge ${
                  chunk.decision.toLowerCase().includes("abnormal")
                    ? "abnormal"
                    : "normal"
                }`}
              >
                {chunk.decision.toLowerCase().includes("abnormal")
                  ? "Abnormal"
                  : "Normal"}
              </div>
            )}
            {chunk.signalFeatures && (
              <BeatCountsSummary signalFeatures={chunk.signalFeatures} />
            )}
          </div>
        </div>
        <span className="chunk-toggle">{isExpanded ? "▼" : "▶"}</span>
      </div>

      {isExpanded && (
        <div className="chunk-content">
          {chunk.signal && chunk.signal.length > 0 && (
            <div className="signal-section">
              <SignalViewer
                signal={chunk.signal}
                masks={chunk.masks}
                startIndex={startIndex}
                setStartIndex={onStartIndexChange}
              />
            </div>
          )}

          {chunk.features && Object.keys(chunk.features).length > 0 && (
            <div className="features-section">
              <FeatureTable
                features={chunk.features}
                signal={chunk.signal}
                mask={chunk.masks}
                fs={250}
              />
            </div>
          )}

          {chunk.signalFeatures &&
            Object.keys(chunk.signalFeatures).length > 0 && (
              <div className="signal-features-section">
                <SignalFeaturesViewer signalFeatures={chunk.signalFeatures} />
              </div>
            )}

          {chunk.decision && (
            <div className="diagnosis-section">
              <DecisionCard decision={chunk.decision} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChunkSection;
