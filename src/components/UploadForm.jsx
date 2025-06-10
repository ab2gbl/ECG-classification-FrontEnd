// UploadForm.jsx
import React from "react";
import "./UploadForm.css";

function UploadForm({
  dat,
  hea,
  model,
  signalStart,
  signalEnd,
  startStep,
  endStep,
  handleDatChange,
  handleHeaChange,
  handleModelChange,
  handleSignalStartChange,
  handleSignalEndChange,
  handleStartStepChange,
  handleEndStepChange,
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
                accept=".hea"
              />
            </label>
            <label>
              <span>.DAT File</span>
              <input
                type="file"
                onChange={handleDatChange}
                disabled={isLoading}
                accept=".dat"
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
              <option value="CNN_LSTM">CNN_LSTM</option>
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
                max={signalStart + 120}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-control">
            <label>End Step</label>
            <select
              value={endStep}
              onChange={handleEndStepChange}
              className="styled-select"
              disabled={isLoading}
            >
              <option value="0">Acquisition</option>
              <option value="1">Mask detection</option>
              <option value="2">Mask fixing</option>
              <option value="3">Beats features extraction</option>
              <option value="4">Beats classification</option>
              <option value="5">Full signal classification</option>
              <option value="6">Save to database</option>
            </select>
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
