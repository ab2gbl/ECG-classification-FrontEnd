import React, { useState } from "react";
import "./FeatureTable.css";
import BeatFeatureViewer from "./BeatFeatureViewer";

function FeatureTable({ features, signal, mask, fs }) {
  const [selectedBeat, setSelectedBeat] = useState(null);

  const msFields = [
    "Duree_P_ms",
    "Duree_QRS_ms",
    "Duree_T_ms",
    "Intervalle_PR_ms",
    "Intervalle_QT_ms",
    "Intervalle_RR_ms",
    "Intervalle_ST_ms",
    "P_index",
    "Q_index",
    "R_index",
    "S_index",
    "T_index",
    "end",
    "p_end",
    "p_start",
    "qrs_end",
    "qrs_start",
    "start",
    "t_end",
    "t_start",
  ];

  const formatValue = (key, value) => {
    if (msFields.includes(key)) {
      const divided = (parseFloat(value) * 1000) / 250;
      return isNaN(divided) ? value : divided.toFixed(2); // 2 decimal places
    }
    return value;
  };

  const handleRowClick = (beat) => {
    console.log("Selected beat:", beat);
    console.log("Signal length:", signal?.length);
    console.log("Mask length:", mask?.length);
    setSelectedBeat(beat);
  };

  return (
    <div className="signal-viewer-wrapper">
      <div className="signal-chart-header">
        <h2 className="signal-chart-title">📊 Extracted ECG Features</h2>
        <div className="wave-legend">
          <button
            className="ecg-action-button download-btn"
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                [
                  Object.keys(features[0]).join(","),
                  ...features.map((row) => Object.values(row).join(",")),
                ].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "ecg_features.csv");
              document.body.appendChild(link);
              link.click();
            }}
          >
            ⬇️ Download CSV
          </button>
        </div>
      </div>

      {selectedBeat && (
        <BeatFeatureViewer
          signal={signal}
          mask={mask}
          beatFeatures={selectedBeat}
          fs={fs}
          windowStart={parseInt(selectedBeat.start)}
        />
      )}

      <div className="feature-table-scroll">
        <table className="feature-table">
          <thead>
            <tr>
              {Object.keys(features[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((row, index) => (
              <tr
                key={index}
                className={`type-${row.Type || "default"} ${
                  selectedBeat === row ? "selected" : ""
                }`}
                onClick={() => handleRowClick(row)}
                style={{ cursor: "pointer" }}
              >
                {Object.entries(row).map(([key, val], i) => (
                  <td key={i}>{formatValue(key, val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeatureTable;
