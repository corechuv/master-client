import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
 
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      localStorage.setItem("master_token", result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <img src="/logo.png" className="auth__logo" />
        <h1>Login</h1>
        <p>Verwalte deine Termine und Kundenanfragen.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Passwort
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form__error">{error}</p> : null}
          <button type="submit" disabled={loading} className="button">
            {loading ? "Bitte warten..." : "Anmelden"}
          </button>
        </form>
        <p className="auth__switch">
          Noch kein Konto? <Link to="/register">Registrieren</Link>
        </p>
      </div>
    </div>
  );
}
