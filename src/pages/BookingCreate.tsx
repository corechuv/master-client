import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest, createBooking } from "../api";

type Service = {
  id: string;
  title: string;
};

export function BookingCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    date: params.get("date") ?? "",
    time: params.get("time") ?? "",
    service_id: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
    status: "confirmed",
  });

  useEffect(() => {
    apiRequest<Service[]>("/services")
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : "Services konnten nicht geladen werden."));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createBooking({
        date: formState.date,
        time: formState.time,
        service_id: formState.service_id,
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        notes: formState.notes || undefined,
        status: formState.status,
      });
      navigate("/calendar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Buchung konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel booking-create">
      <header className="panel__header">
        <div>
          <h2>Neue Buchung</h2>
          <p>Termin fuer deinen Kunden anlegen.</p>
        </div>
      </header>
      {error ? <p className="form__error">{error}</p> : null}
      <form className="edit" onSubmit={handleSubmit}>
        <div className="edit__grid">
          <label>
            Datum
            <input
              type="date"
              value={formState.date}
              onChange={(event) => setFormState({ ...formState, date: event.target.value })}
              required
            />
          </label>
          <label>
            Uhrzeit
            <input
              type="time"
              value={formState.time}
              onChange={(event) => setFormState({ ...formState, time: event.target.value })}
              required
            />
          </label>
          <label>
            Service
            <select
              value={formState.service_id}
              onChange={(event) => setFormState({ ...formState, service_id: event.target.value })}
              required
            >
              <option value="">Bitte waehlen</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={formState.status}
              onChange={(event) => setFormState({ ...formState, status: event.target.value })}
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Kunde
            <input
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              required
            />
          </label>
          <label>
            E-Mail
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
              required
            />
          </label>
          <label>
            Telefon
            <input
              value={formState.phone}
              onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Notiz
          <textarea
            value={formState.notes}
            onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
          />
        </label>
        <div className="edit__actions">
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Speichern..." : "Buchung speichern"}
          </button>
          <Link className="button button--ghost" to="/calendar">
            Zurueck
          </Link>
        </div>
      </form>
    </div>
  );
}
