import { useEffect, useState } from "react";
import { getProfile, updateProfile, type Profile as ProfileType } from "../api";

export function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    role: "",
    experience_years: "0",
    phone: "",
    photo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setFormState({
          name: data.name ?? "",
          role: data.role ?? "",
          experience_years: data.experience_years?.toString() ?? "0",
          phone: data.phone ?? "",
          photo: data.photo ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Profil konnte nicht geladen werden."));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: formState.name,
        role: formState.role,
        experience_years: Number(formState.experience_years),
        phone: formState.phone,
        photo: formState.photo || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <header className="panel__header">
        <div>
          <h1>Profil</h1>
          <p>Deine oeffentlichen Informationen fuer Kunden.</p>
        </div>
      </header>

      {error ? <p className="form__error">{error}</p> : null}

      <div className="panel__content">
        <div className="profile__card">
          <div className="profile__avatar">
            {profile?.photo ? <img src={profile.photo} alt={profile.name ?? "Profil"} /> : <span>MI</span>}
          </div>
          <div>
            <h2>{profile?.name ?? "Master"}</h2>
            <p>{profile?.email}</p>
          </div>
        </div>

        <div className="edit">
          <div className="edit__grid">
            <label>
              Vollstaendiger Name
              <input
                value={formState.name}
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              />
            </label>
            <label>
              Rolle / Spezialisierung
              <input
                value={formState.role}
                onChange={(event) => setFormState({ ...formState, role: event.target.value })}
              />
            </label>
            <label>
              Berufserfahrung (Jahre)
              <input
                type="number"
                min="0"
                value={formState.experience_years}
                onChange={(event) => setFormState({ ...formState, experience_years: event.target.value })}
              />
            </label>
            <label>
              Telefon
              <input
                value={formState.phone}
                onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
              />
            </label>
            <label>
              Foto-URL
              <input
                value={formState.photo}
                onChange={(event) => setFormState({ ...formState, photo: event.target.value })}
              />
            </label>
          </div>
          <div className="edit__actions">
            <button className="button" onClick={handleSave} disabled={saving}>
              {saving ? "Speichern..." : "Profil speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
