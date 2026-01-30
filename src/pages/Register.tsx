import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, register } from "../api";

type Master = { id: string; name: string };

export function Register() {
  const navigate = useNavigate();
  const [masters, setMasters] = useState<Master[]>([]);
  const [masterId, setMasterId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<Master[]>("/masters")
      .then((data) => {
        setMasters(data);
        if (data[0]) setMasterId(data[0].id);
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await register(masterId, email, password);
      localStorage.setItem("master_token", result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <h1>Registrierung</h1>
        <p>Erstelle deinen Zugang und verwalte deine Termine.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Master Profil
            <select value={masterId} onChange={(event) => setMasterId(event.target.value)}>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </label>
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
            {loading ? "Bitte warten..." : "Registrieren"}
          </button>
        </form>
        <p className="auth__switch">
          Schon registriert? <Link to="/login">Zum Login</Link>
        </p>
      </div>
    </div>
  );
}
