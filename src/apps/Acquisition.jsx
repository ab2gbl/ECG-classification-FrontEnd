import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler);
function ECGChart({ signal, masks, fs = 250 }) {
  // Create a fixed range for Y-axis, from -10 to 10
  const yRange = [-10, 10];

  // Create a dataset for each mask value with adjustable yRange index
  const createMaskDataset = (maskValue, color, yIndex = 0) => {
    const data = signal.map((_, i) =>
      masks[i] === maskValue ? [0, yRange[yIndex]] : [null, null]
    );
    return {
      label: `${maskValue} Mask`,
      data: data,
      backgroundColor: color,
      borderColor: color,
      fill: true,
      pointRadius: 0,
      tension: 0.1,
    };
  };

  const data = {
    labels: signal.map((_, i) => (i / fs).toFixed(2)), // x-axis in seconds
    datasets: [
      {
        label: "Normalized ECG Signal",
        data: signal,
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        pointRadius: 0,
        tension: 0.1,
      },
      // Using createMaskDataset for each mask with appropriate yRange index
      createMaskDataset(1, "rgba(0, 0, 255, 0.3)", 0), // Blue window (yRange[0])
      createMaskDataset(1, "rgba(0, 0, 255, 0.3)", 1), // Blue window (yRange[1])
      createMaskDataset(2, "rgba(255, 0, 0, 0.3)", 0), // Red window (yRange[0])
      createMaskDataset(2, "rgba(255, 0, 0, 0.3)", 1), // Red window (yRange[1])
      createMaskDataset(3, "rgba(0, 255, 0, 0.3)", 0), // Green window (yRange[0])
      createMaskDataset(3, "rgba(0, 255, 0, 0.3)", 1), // Green window (yRange[1])
    ],
  };

  return (
    <Line
      data={data}
      options={{
        scales: {
          y: {
            min: -10, // Set minimum Y-axis value to -10
            max: 10, // Set maximum Y-axis value to 10
          },
        },
      }}
    />
  );
}

function Acquisition() {
  const [dat, setDat] = useState(null);
  const [hea, setHea] = useState(null);
  const [signal, setSignal] = useState(null);
  const [masks, setMasks] = useState(null); // State for the prediction masks
  const [startIndex, setStartIndex] = useState(0);
  const [model, setModel] = useState("UNet"); // State to track selected model type
  const [startStep, setStartStep] = useState(0); // State to track selected start step
  const [endStep, setEndStep] = useState(2); // State to track selected end step

  const [signalStart, setSignalStart] = useState(0); // State to track selected start step
  const [signalEnd, setSignalEnd] = useState(10); // State to track selected end step

  const windowSize = 1000;
  let visibleSignal = null;
  let visibleMasks = null;

  if (signal && signal.length > 0) {
    visibleSignal = signal.slice(startIndex, startIndex + windowSize);
    visibleMasks = masks
      ? masks.slice(startIndex, startIndex + windowSize)
      : []; // Slice masks to match visible signal
  }

  const handleHeaChange = (e) => {
    setHea(e.target.files[0]);
  };

  const handleDatChange = (e) => {
    setDat(e.target.files[0]);
  };
  const handleModelChange = (e) => {
    setModel(e.target.value); // Update selected model
  };
  const handleStartStepChange = (e) => {
    setStartStep(e.target.value); // Update selected model
  };
  const handleEndStepChange = (e) => {
    setEndStep(e.target.value); // Update selected model
  };
  const handleSignalStartChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSignalStart(value);

    // Optional: auto-check if signal_end is now invalid
    if (signalEnd - value > 120) {
      setSignalEnd(value + 120);
    }
  };

  const handleSignalEndChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value - signalStart > 120) {
      // Too big, clamp it
      setSignalEnd(signalStart + 120);
    } else {
      setSignalEnd(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hea || !dat) {
      alert("Please select both files.");
      return;
    }

    const formData = new FormData();
    formData.append("ecg_dat", dat);
    formData.append("ecg_hea", hea);
    formData.append("model", model); // Include the selected model in the request
    formData.append("start_step", startStep); // Include the selected start step in the request
    formData.append("end_step", endStep); // Include the selected end step in the request
    formData.append("signal_start", signalStart); // Include the selected start step in the request
    formData.append("signal_end", signalEnd); // Include the selected end step in the request

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/acquisition/FullDetectionView/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data.result);
        //let parsed = JSON.parse(data.result);
        //console.log("Parsed data:", parsed);
        setSignal(data.result.normalized_signal); // Update signal state
        setMasks(data.result.full_prediction); // Set prediction masks

        setStartIndex(0); // Reset to the beginning when new data arrives
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    }
  };

  return (
    <div>
      <h1>Upload ECG Files</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="hea">header file ".hea"</label>
        <input type="file" name="hea" onChange={handleHeaChange} />
        <br />
        <label htmlFor="dat">data file ".dat"</label>
        <input type="file" name="dat" onChange={handleDatChange} />
        <br />
        <label htmlFor="signal_start">Select signal start</label>
        <input
          type="number"
          name="signal_start"
          value={signalStart}
          onChange={handleSignalStartChange}
          min={0}
        />
        <label htmlFor="signal_end">Select signal end</label>
        <input
          type="number"
          name="signal_end"
          value={signalEnd}
          onChange={handleSignalEndChange}
          min={signalStart + 1}
          max={signalStart + 120}
        />
        <br />

        <label htmlFor="model">Select Model</label>
        <select name="model" value={model} onChange={handleModelChange}>
          <option value="UNet">UNet</option>
          <option value="TCN">TCN</option>
        </select>
        <label htmlFor="start_step">Select start step</label>
        <select
          name="start_step"
          value={startStep}
          onChange={handleStartStepChange}
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <label htmlFor="end_step">Select end step</label>
        <select name="end_step" value={endStep} onChange={handleEndStepChange}>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <br />

        <br />
        <button type="submit">Submit</button>
      </form>

      {visibleSignal && (
        <div>
          <h2>ECG Normalized Signal with Prediction Windows</h2>
          <p>
            Showing time: {(startIndex / 250).toFixed(2)}s to{" "}
            {((startIndex + windowSize) / 250).toFixed(2)}s
          </p>

          {/* Slider to scroll through the signal */}
          <input
            type="range"
            min={0}
            max={signal.length - windowSize}
            value={startIndex}
            step={50} // smoother scrolling
            onChange={(e) => setStartIndex(Number(e.target.value))}
          />

          {/* Scrollable Chart Container */}
          <div style={{ width: "100%", overflowX: "scroll" }}>
            <div style={{ width: `${visibleSignal.length}px` }}>
              {/* Stretch width */}
              <ECGChart signal={visibleSignal} masks={visibleMasks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Acquisition;
