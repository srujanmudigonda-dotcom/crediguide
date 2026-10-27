import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";

import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import Loans from "./pages/Loans";
import CreditImpactSimulator from "./pages/CreditImpactSimulator";
import EmiRiskPrediction from "./pages/EmiRiskPrediction";
import CreditReportExplainer from "./pages/CreditReportExplainer";
import ScoreHistory from "./pages/ScoreHistory";
import ImprovementPlan from "./pages/ImprovementPlan";
import RepaymentAdvisor from "./pages/RepaymentAdvisor";
import PaymentPrevention from "./pages/PaymentPrevention";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import FinancialChatbot from "./pages/FinancialChatbot";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main Application */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />

        {/* AI / Credit Features */}
        <Route
          path="/credit-impact"
          element={
            <ProtectedRoute>
              <CreditImpactSimulator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emi-risk"
          element={
            <ProtectedRoute>
              <EmiRiskPrediction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credit-report-explainer"
          element={
            <ProtectedRoute>
              <CreditReportExplainer />
            </ProtectedRoute>
          }
        />

        {/* Credit Management */}
        <Route
          path="/score-history"
          element={
            <ProtectedRoute>
              <ScoreHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/improvement-plan"
          element={
            <ProtectedRoute>
              <ImprovementPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repayment-advisor"
          element={
            <ProtectedRoute>
              <RepaymentAdvisor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-prevention"
          element={
            <ProtectedRoute>
              <PaymentPrevention />
            </ProtectedRoute>
          }
        />

        {/* Other Features */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financial-assistant"
          element={
            <ProtectedRoute>
              <FinancialChatbot />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;