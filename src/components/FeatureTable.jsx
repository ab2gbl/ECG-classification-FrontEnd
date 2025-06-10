import React, { useState } from "react";
import "./FeatureTable.css";
import BeatFeatureViewer from "./BeatFeatureViewer";

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

function FeatureTable({ features, signal, mask, fs }) {
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState(new Set(featureOrder));
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const beatsPerPage = 10;

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

  // Sorting function
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort the features
  const getSortedAndFilteredFeatures = () => {
    let filteredFeatures = [...features];

    // Apply type filter
    if (typeFilter !== "all") {
      filteredFeatures = filteredFeatures.filter(
        (feature) => feature.Type === typeFilter
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredFeatures.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values
        if (
          msFields.includes(sortConfig.key) ||
          timeFields.includes(sortConfig.key)
        ) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredFeatures;
  };

  const sortedAndFilteredFeatures = getSortedAndFilteredFeatures();

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndFilteredFeatures.length / beatsPerPage);
  const startIndex = (currentPage - 1) * beatsPerPage;
  const endIndex = startIndex + beatsPerPage;
  const currentBeats = sortedAndFilteredFeatures.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedBeat(null); // Clear selected beat when changing pages
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  const toggleColumn = (column) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const toggleAllColumns = () => {
    if (visibleColumns.size === featureOrder.length) {
      setVisibleColumns(new Set(["beat_number", "Type"])); // Keep only essential columns
    } else {
      setVisibleColumns(new Set(featureOrder));
    }
  };

  const getColumnDisplayName = (key) => {
    const displayNames = {
      beat_number: "Beat Number",
      Type: "Beat Type",
      start: "Start Time",
      end: "End Time",
      qrs_start: "QRS Start",
      qrs_end: "QRS End",
      p_start: "P Start",
      p_end: "P End",
      t_start: "T Start",
      t_end: "T End",
      Duree_P_ms: "P Duration",
      Duree_QRS_ms: "QRS Duration",
      Duree_T_ms: "T Duration",
      Intervalle_PR_ms: "PR Interval",
      Intervalle_QT_ms: "QT Interval",
      Intervalle_ST_ms: "ST Interval",
      P_index: "P Index",
      Amplitude_P: "P Amplitude",
      R_index: "R Index",
      Amplitude_R: "R Amplitude",
      Intervalle_RR_ms: "RR Interval",
      Q_index: "Q Index",
      Amplitude_Q: "Q Amplitude",
      S_index: "S Index",
      Amplitude_S: "S Amplitude",
      T_index: "T Index",
      Amplitude_T: "T Amplitude",
      "T/R_ratio": "T/R Ratio",
      "P/R_ratio": "P/R Ratio",
      QRS_area: "QRS Area",
      Slope_QR: "QR Slope",
      Slope_RS: "RS Slope",
      P_symmetry: "P Symmetry",
      T_inversion: "T Inversion",
      QRS_axis_estimate: "QRS Axis",
      Heart_rate_bpm: "Heart Rate",
      Premature_beat: "Premature Beat",
      Local_RR_variability: "RR Variability",
      Local_RMSSD: "RMSSD",
      Bigeminy: "Bigeminy",
      Trigeminy: "Trigeminy",
    };
    return displayNames[key] || key;
  };

  return (
    <div className="signal-viewer-wrapper">
      <div className="signal-chart-header">
        <h2 className="signal-chart-title">📊 Extracted Beats Features</h2>
        <div className="header-controls">
          <div className="beat-type-filter">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="type-filter"
            >
              <option value="all">All Types</option>
              <option value="N">Normal (N)</option>
              <option value="L">Left Bundle Branch Block (L)</option>
              <option value="R">Right Bundle Branch Block (R)</option>
              <option value="V">Premature Ventricular Contractions (V)</option>
              <option value="/">Paced (/)</option>
              <option value="else">Others (else)</option>
            </select>
          </div>

          <div className="column-selector">
            <button
              className="column-selector-btn"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              📋 Select Columns
            </button>
            {showColumnSelector && (
              <div className="column-selector-dropdown">
                <div className="column-selector-header">
                  <button className="select-all-btn" onClick={toggleAllColumns}>
                    {visibleColumns.size === featureOrder.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="column-selector-content">
                  {featureOrder.map((column) => (
                    <label key={column} className="column-option">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(column)}
                        onChange={() => toggleColumn(column)}
                      />
                      {getColumnDisplayName(column)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="ecg-action-button download-btn"
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                [
                  Array.from(visibleColumns).join(","),
                  ...sortedAndFilteredFeatures.map((row) =>
                    Array.from(visibleColumns)
                      .map((key) => row[key])
                      .join(",")
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

      <div className="feature-table-container">
        <div className="feature-table-scroll">
          <table className="feature-table">
            <thead>
              <tr>
                {featureOrder
                  .filter((column) => visibleColumns.has(column))
                  .map((key) => (
                    <th
                      key={key}
                      onClick={() => requestSort(key)}
                      className="sortable"
                    >
                      {getColumnDisplayName(key)} {getSortIcon(key)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {currentBeats.map((row, index) => (
                <tr
                  key={index}
                  className={`type-${row.Type || "default"} ${
                    selectedBeat === row ? "selected" : ""
                  }`}
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: "pointer" }}
                >
                  {featureOrder
                    .filter((column) => visibleColumns.has(column))
                    .map((key) => (
                      <td key={key}>{formatValue(key, row[key])}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
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
    </div>
  );
}

export default FeatureTable;
