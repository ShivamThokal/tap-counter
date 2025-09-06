import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TapCounter from "./components/TapCounter";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TapCounter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;