import { Routes, Route } from 'react-router-dom';
import OTPVerification from '../components/OTPVerification/OTPVerification';

// Inside your Routes component:
<Routes>
  <Route path="/signup" element={<SignUp />} />
  <Route path="/verify-otp" element={<OTPVerification />} />
  {/* Your other routes */}
</Routes>
