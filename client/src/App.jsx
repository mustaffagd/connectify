import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <LoginPage />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Navbar />
                <RegisterPage />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
