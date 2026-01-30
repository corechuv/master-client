import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getToken } from "../api";
 
type Booking = {
  id: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  name: string;
  email: string;
  phone: string;
  service_id: string;
  service_title: string;
  duration_min: number;
  price_from: number;
};

type Service = {
  id: string;
  title: string;
  duration_min: number;
  price_from: number;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [formState, setFormState] = useState({
    date: "",
    time: "",
    service_id: "",
    notes: "",
    status: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiRequest<Booking[]>(`/bookings${statusFilter !== "all" ? `?status_filter=${statusFilter}` : ""}`),
      apiRequest<Service[]>("/services"),
    ])
      .then(([bookingData, serviceData]) => {
        setBookings(bookingData);
        setServices(serviceData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Fehler"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [statusFilter]);

  const serviceOptions = useMemo(() => services, [services]);

  const handleEdit = (booking: Booking) => {
    setEditing(booking);
    setFormState({
      date: booking.date,
      time: booking.time?.slice(0, 5) ?? "",
      service_id: booking.service_id,
      notes: booking.notes ?? "",
      status: booking.status,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      await apiRequest(`/bookings/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(formState),
      });
      setEditing(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update fehlgeschlagen");
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Buchung wirklich stornieren?") ) return;
    setError(null);
    try {
      await apiRequest(`/bookings/${bookingId}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loeschen fehlgeschlagen");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("master_token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Mira Master Panel</h1>
          <p>Deine Buchungen im Überblick.</p>
        </div>
        <button className="button button--ghost" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard__controls">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Alle</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button className="button" onClick={loadData}>
          Aktualisieren
        </button>
      </section>

      {error ? <p className="form__error">{error}</p> : null}

      {editing ? (
        <section className="edit">
          <h2>Termin bearbeiten</h2>
          <div className="edit__grid">
            <label>
              Datum
              <input
                type="date"
                value={formState.date}
                onChange={(event) => setFormState({ ...formState, date: event.target.value })}
              />
            </label>
            <label>
              Uhrzeit
              <input
                type="time"
                value={formState.time}
                onChange={(event) => setFormState({ ...formState, time: event.target.value })}
              />
            </label>
            <label>
              Service
              <select
                value={formState.service_id}
                onChange={(event) => setFormState({ ...formState, service_id: event.target.value })}
              >
                {serviceOptions.map((service) => (
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
            <button className="button" onClick={handleSave}>
              Speichern
            </button>
            <button className="button button--ghost" onClick={() => setEditing(null)}>
              Abbrechen
            </button>
          </div>
        </section>
      ) : null}

      <section className="table">
        {loading ? (
          <p>Lade Buchungen...</p>
        ) : (
          <div className="table__wrap">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Uhrzeit</th>
                  <th>Service</th>
                  <th>Kunde</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>{booking.service_title}</td>
                    <td>
                      <div>{booking.name}</div>
                      <small>{booking.phone}</small>
                    </td>
                    <td>{booking.status}</td>
                    <td className="table__actions">
                      <button className="button button--ghost" onClick={() => handleEdit(booking)}>
                        Edit
                      </button>
                      <button className="button button--danger" onClick={() => handleDelete(booking.id)}>
                        Storno
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
