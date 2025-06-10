// UploadForm.jsx
import React from "react";
import "./UploadForm.css";

function UploadForm({
  dat,
  hea,
  model,
  signalStart,
  signalEnd,
  handleDatChange,
  handleHeaChange,
  handleModelChange,
  handleSignalStartChange,
  handleSignalEndChange,
  handleSubmit,
  isLoading,
}) {
  return (
    <div className="signal-viewer-wrapper">
      {" "}
      {/* Same wrapper class */}
      <div className="signal-chart-header">
        {" "}
        {/* Matching header */}
        <h2 className="signal-chart-title">📤 Upload ECG Data</h2>
        <div className="wave-legend">
          <span className="hoverable-legend">
            <span className="dot blue" /> Required
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="upload-form-content">
        <div className="file-drop-zone">
          <p className="signal-chart-desc">
            Upload paired <strong>.hea</strong> and <strong>.dat</strong> ECG
            files
          </p>
          <div className="file-input-group">
            <label>
              <span>.HEA File</span>
              <input
                type="file"
                onChange={handleHeaChange}
                disabled={isLoading}
              />
            </label>
            <label>
              <span>.DAT File</span>
              <input
                type="file"
                onChange={handleDatChange}
                disabled={isLoading}
              />
            </label>
          </div>
          <p className="drag-hint">
            or <span>drag and drop</span> files here
          </p>
        </div>

        <div className="form-control-group">
          <div className="form-control">
            <label>Model</label>
            <select
              value={model}
              onChange={handleModelChange}
              className="styled-select"
              disabled={isLoading}
            >
              <option value="UNet">UNet</option>
              <option value="TCN">TCN</option>
            </select>
          </div>

          <div className="form-control">
            <label>Time Window (s)</label>
            <div className="time-inputs">
              <input
                type="number"
                value={signalStart}
                onChange={handleSignalStartChange}
                min="0"
                disabled={isLoading}
              />
              <span>to</span>
              <input
                type="number"
                value={signalEnd}
                onChange={handleSignalEndChange}
                min={signalStart + 1}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`ecg-action-button ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Process ECG Data"}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
