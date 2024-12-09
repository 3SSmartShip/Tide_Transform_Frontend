import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./components/SignUp/SignUp";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmEmail from "./components/ConfirmEmail/ConfirmEmail";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-lg text-gray-600">Page not found</p>
                <a
                  href="/"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                >
                  Go back home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
