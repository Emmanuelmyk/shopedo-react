import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home/Home";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Login from "./pages/LoginPage/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Dashboard from "./pages/AdminDashboard/Dashboard";
import ProductsList from "./pages/AdminDashboard/ProductsList";
import AddProduct from "./pages/AdminDashboard/AddProduct";
import EditProduct from "./pages/AdminDashboard/EditProduct";
import TestAuth from "./pages/AdminDashboard/TestAuth";
import "./App.css";
import "./styles/Shared.css";

function App() {
  return (
    <WishlistProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product-detail" element={<ProductDetail />} />

          {/* Admin Login (Public) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/test-auth"
            element={
              <ProtectedRoute>
                <TestAuth />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </WishlistProvider>
  );
}

export default App;
