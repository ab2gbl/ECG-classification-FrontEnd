import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UploadForm from "../components/UploadForm";
import SignalViewer from "../components/SignalViewer";
import FeatureTable from "../components/FeatureTable";
import DecisionCard from "../components/DecisionCard";
import SignalFeaturesViewer from "../components/SignalFeaturesViewer";
import "./Acquisition.css";

function Acquisition() {
  const location = useLocation();
  const [dat, setDat] = useState(null);
  const [hea, setHea] = useState(null);
  const [signal, setSignal] = useState(null);
  const [masks, setMasks] = useState(null);
  const [features, setFeatures] = useState(null);
  const [signalFeatures, setSignalFeatures] = useState(null);
  const [decision, setDecision] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [startStep, setStartStep] = useState(0);
  const [endStep, setEndStep] = useState(2);

  const [model, setModel] = useState("UNet");
  const [signalStart, setSignalStart] = useState(0);
  const [signalEnd, setSignalEnd] = useState(10);

  // Handle signal data passed from the table
  useEffect(() => {
    if (location.state?.signalData) {
      const data = location.state.signalData;
      setSignal(data.normalized_signal || []);
      setMasks(data.full_prediction || []);
      setFeatures(data.features || {});
      setDecision(data.signal_type || "No diagnosis found");
      setSignalFeatures(data.signal_features || {});
      setStartIndex(0);
    }
  }, [location.state]);

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

  const handleStartStepChange = (e) => {
    setStartStep(parseInt(e.target.value, 10));
  };

  const handleEndStepChange = (e) => {
    setEndStep(parseInt(e.target.value, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hea || !dat) {
      alert("Please select both .hea and .dat files.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("ecg_dat", dat);
    formData.append("ecg_hea", hea);
    formData.append("model", model);
    formData.append("signal_start", signalStart);
    formData.append("signal_end", signalEnd);
    formData.append("start_step", 0);
    formData.append("end_step", endStep);

    const API_URL = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(
        `${API_URL}/FullDetectionView/`,
        //,
        {
          method: "POST",
          body: formData,
        }
      );

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
        setSignalFeatures(result.signal_features || []);
        setStartIndex(0);
        console.log("main features", features);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    } finally {
      setIsLoading(false);
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
          startStep={startStep}
          endStep={endStep}
          handleDatChange={handleDatChange}
          handleHeaChange={handleHeaChange}
          handleModelChange={handleModelChange}
          handleSignalStartChange={handleSignalStartChange}
          handleSignalEndChange={handleSignalEndChange}
          handleStartStepChange={handleStartStepChange}
          handleEndStepChange={handleEndStepChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing ECG data...</p>
          </div>
        )}

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

        {features && Object.keys(features).length > 0 && (
          <div className="features-section">
            <FeatureTable
              features={features}
              signal={signal}
              mask={masks}
              fs={250}
            />
          </div>
        )}

        {signalFeatures && Object.keys(signalFeatures).length > 0 && (
          <div className="signal-features-section">
            <SignalFeaturesViewer signalFeatures={signalFeatures} />
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
