import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Landing from './components/Landing/Landing'
import Signup from './components/SignUp/SignUp'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './components/ForgotPassword/ForgotPassword'
import Login from './pages/Login'
import ConfirmEmail from './components/ConfirmEmail/ConfirmEmail'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
