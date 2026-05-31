import { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

export function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [supportStaff, setSupportStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingStaff, setCreatingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'user'|'staff', id, name }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        // Fetch both bookings and users for dashboard
        const [bookingsRes, usersRes] = await Promise.all([
          fetch(`${API}/all-bookings/`, { credentials: "include" }),
          fetch(`${API}/all-users/`, { credentials: "include" })
        ]);
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        }
      } else if (activeTab === "bookings") {
        const res = await fetch(`${API}/all-bookings/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } else if (activeTab === "users") {
        const res = await fetch(`${API}/all-users/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } else if (activeTab === "support_staff") {
        const res = await fetch(`${API}/all-users/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const staff = data.filter(u => u.role === 'support_staff');
          setSupportStaff(staff);
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

  const handleUserUpdate = async (userId, updatedData) => {
    try {
      const res = await fetch(`${API}/update-user/${userId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        fetchData();
        setEditingUser(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update user");
    }
  };

  const handleCreateStaff = async (staffData) => {
    console.log("Sending staff data:", staffData);
    try {
      const res = await fetch(`${API}/create-support-staff/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(staffData),
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Success data:", data);
        alert(`Staff created!\nUsername: ${data.username}\nPassword: ${data.password}\nState: ${data.state}`);
        fetchData();
        setCreatingStaff(null);
      } else {
        const data = await res.json();
        console.log("Error data:", data);
        alert("Error: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Network error: " + err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API}/delete-user/${userId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert(`User "${userName}" deleted successfully`);
        fetchData();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "Failed to delete user"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error: " + err.message);
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete support staff "${staffName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API}/delete-support-staff/${staffId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert(`Support staff "${staffName}" deleted successfully`);
        fetchData();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "Failed to delete support staff"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error: " + err.message);
    }
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
          Maruthi Travels Admin
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
            onClick={() => { setActiveTab("dashboard"); setEditingUser(null); }}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 24px",
              background: activeTab === "dashboard" ? "rgba(201, 168, 76, 0.15)" : "transparent",
              border: "none",
              color: activeTab === "dashboard" ? "#c9a84c" : "rgba(255,255,255,0.7)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: activeTab === "dashboard" ? "600" : "400"
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab("bookings"); setEditingUser(null); }}
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
          <button
            onClick={() => { setActiveTab("users"); setEditingUser(null); }}
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
            onClick={() => { setActiveTab("support_staff"); setEditingUser(null); }}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 24px",
              background: activeTab === "support_staff" ? "rgba(201, 168, 76, 0.15)" : "transparent",
              border: "none",
              color: activeTab === "support_staff" ? "#c9a84c" : "rgba(255,255,255,0.7)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: activeTab === "support_staff" ? "600" : "400"
            }}
          >
            Support Staff
          </button>
        </aside>

        <main style={{ flex: 1, padding: "32px 40px" }}>
          {activeTab === "dashboard" && <DashboardContent bookings={bookings} users={users} />}
          {activeTab === "bookings" && <BookingsContent bookings={bookings} loading={loading} />}
          {activeTab === "users" && <UsersContent users={users} loading={loading} editingUser={editingUser} setEditingUser={setEditingUser} onSave={handleUserUpdate} onDelete={handleDeleteUser} />}
          {activeTab === "support_staff" && <SupportStaffContent staff={supportStaff} loading={loading} creatingStaff={creatingStaff} setCreatingStaff={setCreatingStaff} onCreate={handleCreateStaff} onDelete={handleDeleteStaff} />}
        </main>
      </div>
    </div>
  );
}

function DashboardContent({ bookings, users }) {
  const today = new Date().toDateString();
  const todayBookings = bookings.filter(b => new Date(b.created_at).toDateString() === today).length;

  return (
    <div>
      <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "24px" }}>
        Dashboard
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
        <div style={{
          background: "linear-gradient(145deg, #132920 0%, #0d1f16 100%)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
            Total Bookings
          </h3>
          <p style={{ color: "#c9a84c", fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>{bookings.length}</p>
        </div>
        <div style={{
          background: "linear-gradient(145deg, #132920 0%, #0d1f16 100%)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
            Today's Bookings
          </h3>
          <p style={{ color: "#c9a84c", fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>{todayBookings}</p>
        </div>
        <div style={{
          background: "linear-gradient(145deg, #132920 0%, #0d1f16 100%)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
            Total Users
          </h3>
          <p style={{ color: "#c9a84c", fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>{users.length}</p>
        </div>
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

function UsersContent({ users, loading, editingUser, setEditingUser, onSave, onDelete }) {
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
               <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  No users found
                </td>
                   </tr>
                 ) : (
                   users.map((u) => (
                     <tr key={u.id} style={{ borderTop: "1px solid rgba(201, 168, 76, 0.05)" }}>
                       {editingUser?.id === u.id ? (
                         <EditUserRow user={editingUser} onSave={onSave} onCancel={() => setEditingUser(null)} />
                       ) : (
                         <>
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
                           <td style={{ padding: "16px" }}>
                             <button
                               onClick={() => setEditingUser(u)}
                               style={{
                                 background: "rgba(201, 168, 76, 0.15)",
                                 border: "1px solid rgba(201, 168, 76, 0.3)",
                                 color: "#c9a84c",
                                 padding: "6px 12px",
                                 borderRadius: "4px",
                                 cursor: "pointer",
                                 fontSize: "0.8rem",
                                 marginRight: "8px"
                               }}
                             >
                               Edit
                             </button>
                             <button
                               onClick={() => onDelete(u.id, u.name)}
                               style={{
                                 background: "rgba(255, 80, 80, 0.15)",
                                 border: "1px solid rgba(255, 80, 80, 0.3)",
                                 color: "#ff7b7b",
                                 padding: "6px 12px",
                                 borderRadius: "4px",
                                 cursor: "pointer",
                                 fontSize: "0.8rem"
                               }}
                             >
                               Delete
                             </button>
                           </td>
                         </>
)}
                      </tr>
                    ))
                  )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportStaffContent({ staff, loading, creatingStaff, setCreatingStaff, onCreate, onDelete }) {
  if (loading) {
    return <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "24px" }}>
        Support Staff
      </h2>
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => setCreatingStaff({ name: "", email: "", username: "", password: "", contact_number: "" })}
          style={{
            background: "rgba(76, 201, 130, 0.2)",
            border: "1px solid rgba(76, 201, 130, 0.4)",
            color: "#6ee7a0",
            padding: "12px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Create New Support Staff
        </button>
      </div>
      {creatingStaff && (
        <CreateStaffForm staff={creatingStaff} onSave={onCreate} onCancel={() => setCreatingStaff(null)} />
      )}
      <div style={{
        background: "#0f2819",
        border: "1px solid rgba(201, 168, 76, 0.15)",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(201, 168, 76, 0.1)" }}>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Access</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>State</th>
                <th style={{ padding: "16px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                    No support staff found
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} style={{ borderTop: "1px solid rgba(201, 168, 76, 0.05)" }}>
                    <td style={{ padding: "16px", color: "#fff", fontSize: "0.9rem" }}>{s.name}</td>
                    <td style={{ padding: "16px", color: "#c9a84c", fontSize: "0.9rem" }}>{s.username}</td>
                    <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{s.email}</td>
                    <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{s.contact_number}</td>
                    <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Support Staff</td>
                    <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{s.state || "—"}</td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => onDelete(s.id, s.name)}
                        style={{
                          background: "rgba(255, 80, 80, 0.15)",
                          border: "1px solid rgba(255, 80, 80, 0.3)",
                          color: "#ff7b7b",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                        }}
                      >
                        Delete
                      </button>
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

function CreateStaffForm({ staff, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: staff.name || "",
    email: staff.email || "",
    username: staff.username || "",
    password: staff.password || "",
    contact_number: staff.contact_number || "",
    state: staff.state || "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.username || !form.password || !form.contact_number || !form.state) {
      alert("All fields including state are required");
      return;
    }
    onSave(form);
  };

  return (
    <div style={{
      background: "rgba(201, 168, 76, 0.05)",
      border: "1px solid rgba(201, 168, 76, 0.2)",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "24px"
    }}>
      <h3 style={{ color: "#c9a84c", fontSize: "1.2rem", marginBottom: "16px" }}>Create New Support Staff</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>Contact Number</label>
          <input
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginBottom: "4px" }}>State</label>
          <input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g., Karnataka"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              padding: "8px",
              color: "#fff",
              fontSize: "0.85rem",
              width: "100%"
            }}
          />
        </div>
      </div>
      <div>
        <button
          onClick={handleSubmit}
          style={{
            background: "rgba(76, 201, 130, 0.2)",
            border: "1px solid rgba(76, 201, 130, 0.4)",
            color: "#6ee7a0",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem",
            marginRight: "8px"
          }}
        >
          Create Staff
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "rgba(255, 80, 80, 0.2)",
            border: "1px solid rgba(255, 80, 80, 0.4)",
            color: "#ff7b7b",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function EditUserRow({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    contact_number: user.contact_number,
    state: user.state || "",
    role: user.role,
    is_staff: user.is_staff,
    is_active: user.is_active,
  });

  const handleSubmit = () => {
    onSave(user.id, form);
  };

  return (
    <>
      <td style={{ padding: "16px", color: "#c9a84c" }}>#{user.id}</td>
      <td style={{ padding: "8px" }}>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "4px",
            padding: "8px",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%"
          }}
        />
      </td>
      <td style={{ padding: "16px", color: "rgba(255,255,255,0.7)" }}>{user.username}</td>
      <td style={{ padding: "8px" }}>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "4px",
            padding: "8px",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%"
          }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <input
          value={form.contact_number}
          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "4px",
            padding: "8px",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%"
          }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <input
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="State"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "4px",
            padding: "8px",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%"
          }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "4px",
            padding: "8px",
            color: "#fff",
            fontSize: "0.85rem",
            width: "100%"
          }}
        >
          <option value="user">User</option>
          <option value="support_staff">Support Staff</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td style={{ padding: "8px" }}>
        <input
          type="checkbox"
          checked={form.is_staff}
          onChange={(e) => setForm({ ...form, is_staff: e.target.checked })}
          style={{ width: "20px", height: "20px", accentColor: "#c9a84c" }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          style={{ width: "20px", height: "20px", accentColor: "#c9a84c" }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <button
          onClick={handleSubmit}
          style={{
            background: "rgba(76, 201, 130, 0.2)",
            border: "1px solid rgba(76, 201, 130, 0.4)",
            color: "#6ee7a0",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8rem",
            marginRight: "8px"
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "rgba(255, 80, 80, 0.2)",
            border: "1px solid rgba(255, 80, 80, 0.4)",
            color: "#ff7b7b",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8rem"
          }}
        >
          Cancel
        </button>
      </td>
    </>
  );
}
