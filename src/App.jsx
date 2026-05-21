import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

// This component guards any page that requires login.
// If the user is not logged in, it redirects them to /auth.
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // While we're checking if a user is logged in, show a loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#3dd68c] font-mono text-sm tracking-widest animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  // If no user found, send them to the login page
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    // AuthProvider wraps everything so any component can access the logged-in user
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route — anyone can visit /auth */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected route — only logged-in users can visit / */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Catch-all: any unknown URL redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
