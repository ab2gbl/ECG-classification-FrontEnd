import React from "react";
import "./FeatureTable.css";

function FeatureTable({ features }) {
  return (
    <div className="feature-table-container">
      <div className="feature-table-header">
        <h2>Extracted ECG Features</h2>
        <button
          className="download-btn"
          onClick={() => {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              [
                Object.keys(features[0]).join(","),
                ...features.map((row) =>
                  Object.values(row).join(",")
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

      <div className="table-wrapper">
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
              <tr key={index} className={`type-${row.Type || "default"}`}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
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
