import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./config/supabaseClient";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./components/Signup/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./components/Upload/Upload";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmEmail from "./components/ConfirmEmail/ConfirmEmail";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Api from "./components/Api_component/Api";
import Billing from "./components/Billing/Billing";
import Setting from "./components/Setting/Setting";
import OTPVerification from "./components/OTPVerification/OTPVerification";
import AllDocuments from "./components/AllDocuments/AllDocuments";
import Onboarding from "./components/Onboarding/Onboarding";
import Layout from "./components/Layout/Layout";
import Docs from "./components/docs/docs";

function App() {
  const isOnboarded = localStorage.getItem("isOnboarded");
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/docs" element={<Docs />} />

        <Route
          path="/onboarding"
          element={
            isOnboarded ? (
              <Navigate to="/dashboard/upload" replace />
            ) : (
              <Onboarding />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/api"
          element={
            <ProtectedRoute>
              <Api />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/documents"
          element={
            <ProtectedRoute>
              <AllDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billings"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billings/plan"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
