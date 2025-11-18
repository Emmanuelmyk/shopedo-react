import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import "./App.css";
import Login from "./pages/LoginPage/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
