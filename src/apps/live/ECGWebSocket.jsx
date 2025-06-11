import React, { useState, useEffect, useRef } from "react";
import ECGUploader from "./ECGUploader";
import SignalViewer from "../../components/SignalViewer";
import FeatureTable from "../../components/FeatureTable";
import DecisionCard from "../../components/DecisionCard";
import SignalFeaturesViewer from "../../components/SignalFeaturesViewer";
import "./ECGWebSocket.css";

const ECGWebSocket = () => {
  const [signal, setSignal] = useState([]);
  const [chunkSize, setChunkSize] = useState(6);
  const [intervalData, setIntervalData] = useState(null);
  const [startChunk, setStartChunk] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [chunksData, setChunksData] = useState([]);
  const [expandedChunks, setExpandedChunks] = useState(new Set());
  const [chunkStartIndices, setChunkStartIndices] = useState({});
  const indexRef = useRef(0);
  const requestIdRef = useRef(0);
  const chunkCounterRef = useRef(0);
  const ws = useRef(null);

  const generateRequestId = () => {
    return `req_${Date.now()}_${requestIdRef.current++}`;
  };

  const generateChunkName = () => {
    return `chunk_${chunkCounterRef.current++}`;
  };

  const setupWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket("ws://localhost:8000/ws/ecg/");

    ws.current.onopen = () => {
      console.log("WebSocket connected ✅");
      setError(null);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data from backend:", data);

      if (data.status === "error") {
        setError(data.message);
        setIsProcessing(false);
        if (data.message.includes("busy")) {
          setStartChunk(false);
        }
      } else if (data.status === "success") {
        // Add the new chunk data to our chunks array
        setChunksData((prevChunks) => [
          ...prevChunks,
          {
            chunkName: data.chunk_name,
            requestId: data.request_id,
            signal: data.result.normalized_signal || [],
            masks: data.result.full_prediction || [],
            features: data.result.features || {},
            decision: data.result.signal_type || "No diagnosis found",
            signalFeatures: data.result.signal_features || {},
            timestamp: new Date().toISOString(),
          },
        ]);
        setError(null);
        setIsProcessing(false);
      }
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error", e);
      setError("WebSocket connection error");
      setIsProcessing(false);
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed ❌");
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    setupWebSocket();
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    indexRef.current = 0;
    chunkCounterRef.current = 0;
  }, [signal]);

  const sendChunk = () => {
    if (isProcessing) {
      console.log("Still processing previous chunk, skipping...");
      return;
    }

    const currentIndex = indexRef.current;
    const nextChunk = signal.slice(
      currentIndex,
      currentIndex + chunkSize * 250
    );
    if (nextChunk.length === 0) {
      setStartChunk(false);
      return;
    }

    setIntervalData({
      data: nextChunk,
      chunkName: generateChunkName(),
    });
    indexRef.current += nextChunk.length;
  };

  useEffect(() => {
    if (!startChunk || signal.length === 0) return;

    sendChunk(); // First chunk immediately

    const timer = setInterval(() => {
      sendChunk();
    }, chunkSize * 1000);

    return () => clearInterval(timer);
  }, [startChunk, signal, chunkSize]);

  useEffect(() => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      intervalData &&
      !isProcessing
    ) {
      setIsProcessing(true);
      setError(null);
      const requestId = generateRequestId();
      console.log(`Sending chunk to backend (${requestId}):`, intervalData);
      ws.current.send(
        JSON.stringify({
          request_id: requestId,
          chunk_name: intervalData.chunkName,
          signal: intervalData.data,
        })
      );
    }
  }, [intervalData]);

  const toggleChunk = (chunkId) => {
    setExpandedChunks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chunkId)) {
        newSet.delete(chunkId);
      } else {
        newSet.add(chunkId);
      }
      return newSet;
    });
  };

  const expandAllChunks = () => {
    setExpandedChunks(new Set(chunksData.map((chunk) => chunk.requestId)));
  };

  const collapseAllChunks = () => {
    setExpandedChunks(new Set());
  };

  const handleChunkStartIndexChange = (chunkId, newIndex) => {
    setChunkStartIndices((prev) => ({
      ...prev,
      [chunkId]: newIndex,
    }));
  };

  return (
    <div className="ecg-websocket-page">
      <div className="ecg-websocket-header">
        <h1>ECG Signal Upload and Streaming</h1>
        <p>
          Upload and stream ECG data for real-time analysis and visualization.
        </p>
      </div>

      {/* Control Section */}
      <div className="control-section">
        <div className="upload-section">
          <div className="signal-status">
            <span
              className={`status-indicator ${
                signal.length > 0 ? "ready" : "not-ready"
              }`}
            >
              {signal.length > 0 ? "●" : "○"}
            </span>
            <span className="status-text">
              Signal Status: {signal.length > 0 ? "Ready" : "Not Ready"}
            </span>
            {signal.length > 0 && (
              <span className="signal-length">
                ({signal.length} samples, {signal.length / 250} seconds )
              </span>
            )}
          </div>

          <ECGUploader
            onSignalReceived={(sig) => {
              setSignal(sig);
              indexRef.current = 0;
              chunkCounterRef.current = 0;
              setChunksData([]);
              setExpandedChunks(new Set());
            }}
          />

          <div className="controls">
            <div className="chunk-size-control">
              <label>Chunk Size (seconds): </label>
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                min="2"
                max="30"
              />
            </div>

            <div className="button-group">
              <button
                onClick={() => {
                  setStartChunk(!startChunk);
                  setupWebSocket();
                }}
                className="control-button"
                disabled={signal.length === 0}
              >
                {startChunk ? "Stop" : "Start"} Streaming
              </button>

              <button
                onClick={() => {
                  indexRef.current = 0;
                  chunkCounterRef.current = 0;
                  setIntervalData(null);
                  setStartChunk(false);
                  setChunksData([]);
                  setExpandedChunks(new Set());
                  setError(null);
                  setIsProcessing(false);
                }}
                className="control-button"
              >
                Reset
              </button>

              <button
                onClick={setupWebSocket}
                className="control-button"
                disabled={signal.length === 0}
              >
                🔄 Reconnect WebSocket
              </button>
            </div>
          </div>

          {error && <div className="error-message">Error: {error}</div>}

          <div className="status-section">
            <h3>Current Status:</h3>
            <p>{isProcessing ? "⏳ Processing..." : "✅ Ready"}</p>
            {intervalData && (
              <p className="chunk-info">
                Current Chunk: {intervalData.chunkName} (
                {indexRef.current / 250 - chunkSize} - {indexRef.current / 250}
                s)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chunks Display Section */}
      <div className="chunks-display-section">
        <div className="chunks-header">
          <h2>Processed Chunks</h2>
          {chunksData.length > 0 && (
            <div className="chunks-controls">
              <button onClick={expandAllChunks} className="control-button">
                Expand All
              </button>
              <button onClick={collapseAllChunks} className="control-button">
                Collapse All
              </button>
            </div>
          )}
        </div>

        {chunksData.length === 0 ? (
          <div className="no-chunks-message">
            No chunks processed yet. Upload a file and start streaming to see
            results.
          </div>
        ) : (
          chunksData.map((chunk, index) => (
            <div key={chunk.requestId} className="chunk-section">
              <div
                className="chunk-header"
                onClick={() => toggleChunk(chunk.requestId)}
              >
                <div className="chunk-header-left">
                  <h3>
                    Chunk {chunk.chunkName} (
                    {new Date(chunk.timestamp).toLocaleTimeString()})
                  </h3>
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
                </div>
                <span className="chunk-toggle">
                  {expandedChunks.has(chunk.requestId) ? "▼" : "▶"}
                </span>
              </div>

              {expandedChunks.has(chunk.requestId) && (
                <div className="chunk-content">
                  {chunk.signal && chunk.signal.length > 0 && (
                    <div className="signal-section">
                      <SignalViewer
                        signal={chunk.signal}
                        masks={chunk.masks}
                        startIndex={chunkStartIndices[chunk.requestId] || 0}
                        setStartIndex={(newIndex) =>
                          handleChunkStartIndexChange(chunk.requestId, newIndex)
                        }
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
                        <SignalFeaturesViewer
                          signalFeatures={chunk.signalFeatures}
                        />
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
          ))
        )}
      </div>
    </div>
  );
};

export default ECGWebSocket;
