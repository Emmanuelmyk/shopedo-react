// src/router.jsx
import { createBrowserRouter } from "react-router-dom";

// Your existing pages
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
// ... any other pages

// Correct path to your Login component
import Login from "./pages/LoginPage/Login"; // ← this matches your real structure

// Optional future admin page
// import AdminDashboard from './pages/AdminDashboard';

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/product/:id", element: <ProductDetail /> },
  { path: "/wishlist", element: <Wishlist /> },

  // Admin Login – correct import
  {
    path: "/admin/login",
    element: <Login />,
  },

  // Optional: admin dashboard (create later)
  // {
  //   path: '/admin/dashboard',
  //   element: <AdminDashboard />,
  // },

  { path: "*", element: <div>404 - Not Found</div> },
]);

export default router;
