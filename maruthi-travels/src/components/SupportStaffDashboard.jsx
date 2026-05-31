import { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

export function SupportStaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await fetch(`${API}/all-users-readonly/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } else if (activeTab === "bookings") {
        const res = await fetch(`${API}/all-bookings-readonly/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/logout/`, { method: "POST", credentials: "include" });
    onLogout();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1a12" }}>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 40px",
        background: "rgba(11, 26, 18, 0.98)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.15)"
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#c9a84c", fontSize: "1.5rem", margin: 0 }}>
          Maruthi Travels Support
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Welcome, {user.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,80,80,0.1)",
              border: "1px solid rgba(255,80,80,0.3)",
              color: "#ff7b7b",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        <aside style={{
          width: "240px",
          background: "#0f2819",
          borderRight: "1px solid rgba(201, 168, 76, 0.1)",
          padding: "24px 0"
        }}>
          <button
            onClick={() => setActiveTab("users")}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 24px",
              background: activeTab === "users" ? "rgba(201, 168, 76, 0.15)" : "transparent",
              border: "none",
              color: activeTab === "users" ? "#c9a84c" : "rgba(255,255,255,0.7)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: activeTab === "users" ? "600" : "400"
            }}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 24px",
              background: activeTab === "bookings" ? "rgba(201, 168, 76, 0.15)" : "transparent",
              border: "none",
              color: activeTab === "bookings" ? "#c9a84c" : "rgba(255,255,255,0.7)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: activeTab === "bookings" ? "600" : "400"
            }}
          >
            Bookings
          </button>
        </aside>

        <main style={{ flex: 1, padding: "32px 40px" }}>
          {activeTab === "users" && <UsersContent users={users} loading={loading} />}
          {activeTab === "bookings" && <BookingsContent bookings={bookings} loading={loading} />}
        </main>
      </div>
    </div>
  );
}

function UsersContent({ users, loading }) {
  if (loading) {
    return <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "24px" }}>
        All Users
      </h2>
      <div style={{
        background: "#0f2819",
        border: "1px solid rgba(201, 168, 76, 0.15)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(201, 168, 76, 0.1)" }}>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>State</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid rgba(201, 168, 76, 0.05)" }}>
                  <td style={{ padding: "16px", color: "#c9a84c", fontSize: "0.9rem" }}>#{u.id}</td>
                  <td style={{ padding: "16px", color: "#fff", fontSize: "0.9rem" }}>{u.name}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{u.username}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{u.email}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{u.contact_number}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{u.state || "—"}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)"
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      background: u.is_active ? "rgba(76, 201, 130, 0.2)" : "rgba(255,80,80,0.2)",
                      color: u.is_active ? "#6ee7a0" : "#ff7b7b"
                    }}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsContent({ bookings, loading }) {
  if (loading) {
    return <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "24px" }}>
        All Bookings
      </h2>
      <div style={{
        background: "#0f2819",
        border: "1px solid rgba(201, 168, 76, 0.15)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(201, 168, 76, 0.1)" }}>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>State</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Package</th>
              <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} style={{ borderTop: "1px solid rgba(201, 168, 76, 0.05)" }}>
                  <td style={{ padding: "16px", color: "#c9a84c", fontSize: "0.9rem" }}>#{booking.id}</td>
                  <td style={{ padding: "16px", color: "#fff", fontSize: "0.9rem" }}>{booking.name}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{booking.email}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{booking.state || "—"}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{booking.package || "N/A"}</td>
                  <td style={{ padding: "16px", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}