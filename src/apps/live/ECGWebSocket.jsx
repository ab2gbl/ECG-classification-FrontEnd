import React, { useState, useEffect, useRef } from "react";
import ECGUploader from "./ECGUploader";

const ECGWebSocket = () => {
  const [signal, setSignal] = useState([]);
  const [chunkSize, setChunkSize] = useState(6);
  const [intervalData, setIntervalData] = useState(null);
  const [startChunk, setStartChunk] = useState(false);
  const [response, setResponse] = useState(null);
  const indexRef = useRef(0);
  const ws = useRef(null);

  const setupWebSocket = () => {
    if (ws.current) {
      ws.current.close(); // Close previous socket if any
    }

    ws.current = new WebSocket("ws://localhost:8000/ws/ecg/");

    ws.current.onopen = () => {
      console.log("WebSocket connected ✅");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data from backend:", data);
      setResponse(data); // Save the full response, we'll filter features below
    };

    ws.current.onerror = (e) => console.error("WebSocket error", e);
    ws.current.onclose = () => console.log("WebSocket closed ❌");
  };

  // Setup on initial mount
  useEffect(() => {
    setupWebSocket();
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    indexRef.current = 0;
  }, [signal]);

  useEffect(() => {
    if (!startChunk || signal.length === 0) return;

    const chunkLength = chunkSize * 250;

    const sendChunk = () => {
      const currentIndex = indexRef.current;
      const nextChunk = signal.slice(currentIndex, currentIndex + chunkLength);

      if (nextChunk.length === 0) {
        setStartChunk(false);
        return;
      }

      setIntervalData(nextChunk);
      indexRef.current += chunkLength;
    };

    sendChunk(); // ⏱️ First chunk immediately

    const timer = setInterval(() => {
      sendChunk();
    }, chunkSize * 1000);

    return () => clearInterval(timer);
  }, [startChunk, signal, chunkSize]);

  useEffect(() => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      intervalData
    ) {
      console.log("Sending chunk to backend:", intervalData);
      ws.current.send(JSON.stringify({ signal: intervalData }));
    }
  }, [intervalData]);

  return (
    <div style={{ marginLeft: 60 }}>
      <h1>ECG Signal Upload and Streaming</h1>

      <ECGUploader
        onSignalReceived={(sig) => {
          setSignal(sig);
          indexRef.current = 0;
        }}
      />

      <h2>Signal Length: {signal.length}</h2>

      <input
        type="number"
        value={chunkSize}
        onChange={(e) => setChunkSize(Number(e.target.value))}
        placeholder="Chunk Size (seconds)"
      />

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => {
            setStartChunk(!startChunk);
            console.log("Streaming:", !startChunk);
            setupWebSocket();
          }}
        >
          {startChunk ? "Stop" : "Start"} Streaming
        </button>

        <button
          onClick={() => {
            indexRef.current = 0;
            setIntervalData(null);
            setStartChunk(false);
            setResponse(null);
            console.log("Reset done");
          }}
        >
          Reset
        </button>

        <button onClick={setupWebSocket}>🔄 Reconnect WebSocket</button>
      </div>

      <p>
        {intervalData === null
          ? "No interval data available"
          : `Interval ${indexRef.current / 250} - ${
              indexRef.current / 250 + chunkSize
            }: ${intervalData.slice(0, 4).join(" ")} 
              \n ... \n 
            ${intervalData.slice(-4).join(" ")}`}
      </p>

      <div>
        <strong>Backend Features:</strong>
        <pre>
          {response?.result?.features
            ? JSON.stringify(response.result.features, null, 2)
            : "No features received yet."}
        </pre>
      </div>
    </div>
  );
};

export default ECGWebSocket;
