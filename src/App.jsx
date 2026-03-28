import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home/Home";
import Houses from "./pages/Houses/Houses";
import Jobs from "./pages/Jobs/Jobs";
import Events from "./pages/Events/Events";
import Services from "./pages/Services/Services";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Login from "./pages/LoginPage/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Dashboard from "./pages/AdminDashboard/Dashboard";
import ProductsList from "./pages/AdminDashboard/ProductsList";
import AddProduct from "./pages/AdminDashboard/AddProduct";
import EditProduct from "./pages/AdminDashboard/EditProduct";
import Billing from "./pages/AdminDashboard/Billing";
import NotFound from "./pages/NotFound/NotFound";
import "./App.css";
import "./styles/Shared.css";

function App() {
  return (
    <WishlistProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/houses" element={<Houses />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/services" element={<Services />} />
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
            path="/admin/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </WishlistProvider>
  );
}

export default App;
