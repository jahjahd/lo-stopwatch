// Core deps.
import React from "react";

// Local deps.
import StopWatch from './stopwatch/StopWatch'
import logo from "./logo.svg";
import "./App.css";

// App.
function App () {
  return (
    <div className="App flex flex-wrap items-start justify-center p-6 md:py-12">
      <StopWatch />
      <StopWatch />
      <StopWatch />
    </div>
  );
}

export default App;
