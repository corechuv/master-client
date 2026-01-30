import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";

function AppShell({ children }: { children: JSX.Element }) {
  return (
    <div className="shell">
      <aside className="shell__nav">
        <div className="shell__brand">
          <span>MIRA</span>
          <small>Master Panel</small>
        </div>
        <nav className="shell__links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Buchungen
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Profil
          </NavLink>
        </nav>
      </aside>
      <main className="shell__main">{children}</main>
    </div>
  );
}
function Protected({ children }: { children: JSX.Element }) {
  const token = typeof window === "undefined" ? null : localStorage.getItem("master_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
 
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <AppShell>
              <Dashboard />
            </AppShell>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <AppShell>
              <Profile />
            </AppShell>
          </Protected>
        }
      />
    </Routes>
  );
}
