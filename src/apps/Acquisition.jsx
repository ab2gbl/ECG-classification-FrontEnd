import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import SignalViewer from "../components/SignalViewer";
import FeatureTable from "../components/FeatureTable";
import DecisionCard from "../components/DecisionCard";
import "./Acquisition.css";

function Acquisition() {
  const [dat, setDat] = useState(null);
  const [hea, setHea] = useState(null);
  const [signal, setSignal] = useState(null);
  const [masks, setMasks] = useState(null);
  const [features, setFeatures] = useState(null);
  const [decision, setDecision] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const [model, setModel] = useState("UNet");
  const [signalStart, setSignalStart] = useState(0);
  const [signalEnd, setSignalEnd] = useState(10);

  const handleDatChange = (e) => setDat(e.target.files[0]);
  const handleHeaChange = (e) => setHea(e.target.files[0]);
  const handleModelChange = (e) => setModel(e.target.value);

  const handleSignalStartChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSignalStart(value);
    if (signalEnd - value > 120) setSignalEnd(value + 120);
  };

  const handleSignalEndChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value - signalStart > 120) {
      setSignalEnd(signalStart + 120);
    } else {
      setSignalEnd(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hea || !dat) {
      alert("Please select both .hea and .dat files.");
      return;
    }

    const formData = new FormData();
    formData.append("ecg_dat", dat);
    formData.append("ecg_hea", hea);
    formData.append("model", model);
    formData.append("start_step", 0); // hardcoded
    formData.append("end_step", 4); // hardcoded
    formData.append("signal_start", signalStart);
    formData.append("signal_end", signalEnd);

    try {
      //const response = await fetch("http://127.0.0.1:8000/acquisition/FullDetectionView/", {
      const response = await fetch("http://127.0.0.1:5000/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.result;
        console.log("main result", result);

        setSignal(result.normalized_signal || []);
        setMasks(result.full_prediction || []);
        setFeatures(result.features || []);
        setDecision(
          result.signal_type || result.decision || "No diagnosis found"
        );
        setStartIndex(0);
        console.log("main features", features);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    }
  };

  return (
    <div className="acquisition-page">
      <div className="acquisition-header">
        <h1 className="acquisition-title">📈 ECG Signal Analysis</h1>
        <p className="acquisition-description">
          Upload ECG data to perform segmentation (P, QRS, T waves), feature
          extraction, and diagnosis.
        </p>
      </div>

      <div className="acquisition-container">
        <UploadForm
          dat={dat}
          hea={hea}
          model={model}
          signalStart={signalStart}
          signalEnd={signalEnd}
          handleDatChange={handleDatChange}
          handleHeaChange={handleHeaChange}
          handleModelChange={handleModelChange}
          handleSignalStartChange={handleSignalStartChange}
          handleSignalEndChange={handleSignalEndChange}
          handleSubmit={handleSubmit}
        />

        {signal && signal.length > 0 && (
          <div className="signal-section">
            <SignalViewer
              signal={signal}
              masks={masks}
              startIndex={startIndex}
              setStartIndex={setStartIndex}
            />
          </div>
        )}

        {features && features.length > 0 && (
          <div className="features-section">
            <FeatureTable
              features={features}
              signal={signal}
              mask={masks}
              fs={250}
            />
          </div>
        )}

        {decision && (
          <div className="diagnosis-section">
            <DecisionCard decision={decision} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Acquisition;
