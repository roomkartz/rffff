import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Properties from "./pages/Properties";
import Home from "./pages/Home";
import PropertyList from "./pages/PropertyList";
import PropertyDetails from "./pages/PropertyDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProperties from "./pages/OwnerProperties";
import AddProperty from "./pages/AddProperty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";

import './index.css';

// ✅ ProtectedRoute component
const ProtectedRoute = ({ allowedRole, children }) => {
  const userRole = localStorage.getItem("role");
  return userRole === allowedRole ? children : <Login />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/properties" element={<Properties />} />
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        
        {/* ✅ Protected Broker-only routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRole="Broker">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/userdashboard"
          element={
            <ProtectedRoute allowedRole="User">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/properties"
          element={
            <ProtectedRoute allowedRole="Broker">
              <OwnerProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/add-property"
          element={
            <ProtectedRoute allowedRole="Broker">
              <AddProperty />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
