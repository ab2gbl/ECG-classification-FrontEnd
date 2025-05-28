import React, { useState } from "react";
import "./FeatureTable.css";
import BeatFeatureViewer from "./BeatFeatureViewer";

function FeatureTable({ features, signal, mask, fs }) {
  const [selectedBeat, setSelectedBeat] = useState(null);
  console.log("Features:", features);
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
  const timeFields = [
    "start",
    "end",
    "p_start",
    "p_end",
    "qrs_start",
    "qrs_end",
    "t_start",
    "t_end",
    "P_index",
    "Q_index",
    "R_index",
    "S_index",
    "T_index",
  ];

  // Define the order of features as they come from the backend
  const featureOrder = [
    "beat_number",
    "Type",
    "start",
    "end",
    "qrs_start",
    "qrs_end",
    "p_start",
    "p_end",
    "t_start",
    "t_end",
    "Duree_P_ms",
    "Duree_QRS_ms",
    "Duree_T_ms",
    "Intervalle_PR_ms",
    "Intervalle_QT_ms",
    "Intervalle_ST_ms",
    "P_index",
    "Amplitude_P",
    "R_index",
    "Amplitude_R",
    "Intervalle_RR_ms",
    "Q_index",
    "Amplitude_Q",
    "S_index",
    "Amplitude_S",
    "T_index",
    "Amplitude_T",
    "T/R_ratio",
    "P/R_ratio",
    "QRS_area",
    "Slope_QR",
    "Slope_RS",
    "P_symmetry",
    "T_inversion",
    "QRS_axis_estimate",
    "Heart_rate_bpm",
    "Premature_beat",
    "Local_RR_variability",
    "Local_RMSSD",
    "Bigeminy",
    "Trigeminy",
  ];

  const formatValue = (key, value) => {
    if (timeFields.includes(key)) {
      // Convert to time format h:m:s:ms
      const totalMs = (parseFloat(value) * 1000) / 250; // Convert to milliseconds
      const hours = Math.floor(totalMs / 3600000);
      const minutes = Math.floor((totalMs % 3600000) / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const milliseconds = Math.floor(totalMs % 1000);
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
    }
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
                  featureOrder.join(","),
                  ...features.map((row) =>
                    featureOrder.map((key) => row[key]).join(",")
                  ),
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

      <div className="feature-table-scroll">
        <table className="feature-table">
          <thead>
            <tr>
              {featureOrder.map((key) => (
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
                {featureOrder.map((key) => (
                  <td key={key}>{formatValue(key, row[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}

export default FeatureTable;
