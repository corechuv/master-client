import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerMaster } from "../api";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("0");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwoerter stimmen nicht ueberein.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await registerMaster({
        name,
        role,
        experience_years: Number.isNaN(Number(experience)) ? 0 : Number(experience),
        photo: photo || undefined,
        email,
        password,
        phone: phone || undefined,
      });
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
        <p>Erstelle dein Meisterkonto mit Profilinformationen.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Vollstaendiger Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Rolle / Spezialisierung
            <input value={role} onChange={(event) => setRole(event.target.value)} required />
          </label>
          <label>
            Berufserfahrung (Jahre)
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              required
            />
          </label>
          <label>
            Telefon (optional)
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label>
            Foto-URL (optional)
            <input value={photo} onChange={(event) => setPhoto(event.target.value)} />
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
          <label>
            Passwort bestaetigen
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
