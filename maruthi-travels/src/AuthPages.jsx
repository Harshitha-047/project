import { useState } from "react";

const API = "http://localhost:8000/api";

/* ─── small helpers ─────────────────────────────────────────────────── */

function FieldError({ msg }) {
  return msg ? <span className="auth-field-error">{msg}</span> : null;
}

function AuthLayout({ title, subtitle, children }) {
  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    borderRadius: '6px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none'
  };
  
  return (
    <div className="auth-overlay" style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      background: 'linear-gradient(160deg, #0b1a12 0%, #0f2819 50%, #0a150e 100%)',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '380px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#fff', margin: '0 0 4px' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>{subtitle}</p>}
          <div style={{ width: '50px', height: '2px', background: '#c9a84c', margin: '0 auto' }} />
        </div>
        <div className="auth-card" style={{ 
          background: 'linear-gradient(145deg, #132920 0%, #0d1f16 100%)',
          border: '1px solid rgba(201, 168, 76, 0.15)',
          borderRadius: '12px',
          padding: '28px 24px',
          position: 'relative',
          zIndex: 3
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

/* ─── REGISTER ──────────────────────────────────────────────────────── */

export function RegisterPage({ onGoLogin }) {
  const [form, setForm]     = useState({ name:"", email:"", state:"", contact_number:"", username:"", password:"", confirm_password:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login…");
        setTimeout(() => onGoLogin(), 1500);
      } else {
        setErrors(data);
      }
    } catch {
      setErrors({ non_field_errors: ["Network error. Please try again."] });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",             label: "Full Name",       type: "text",     placeholder: "Your full name" },
    { key: "email",            label: "Email",           type: "email",    placeholder: "you@example.com" },
    { key: "state",            label: "State",           type: "select",   options: [{value:"",label:"Select your state"}, ...INDIAN_STATES.map(s=>({value:s,label:s}))] },
    { key: "contact_number",   label: "Contact Number",  type: "tel",      placeholder: "+91 98765 43210" },
    { key: "username",         label: "Username",        type: "text",     placeholder: "Choose a username" },
    { key: "password",         label: "Password",        type: "password", placeholder: "Min. 8 characters" },
    { key: "confirm_password", label: "Confirm Password",type: "password", placeholder: "Repeat password" },
  ];

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    borderRadius: '6px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none'
  };
  
  const fieldStyle = { marginBottom: '12px' };
const labelStyle = { 
    display: 'block', 
    fontSize: '0.7rem', 
    fontWeight: '600', 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase',
    color: 'rgba(201, 168, 76, 0.7)',
    marginBottom: '4px'
  };
  
  const btnStyle = {
    background: 'linear-gradient(135deg, #c9a84c 0%, #b8963f 100%)',
    color: '#0a150e',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    cursor: 'pointer',
    marginTop: '6px'
  };
  
  return (
    <AuthLayout title="Create Account" subtitle="Join Maruthi Travels today">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {errors.non_field_errors && (
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px', padding: '10px', fontSize: '0.85rem', color: '#ff7b7b' }}>{errors.non_field_errors.join(" ")}</div>
        )}
        {success && <div style={{ background: 'rgba(76,201,130,0.08)', border: '1px solid rgba(76,201,130,0.2)', borderRadius: '6px', padding: '10px', fontSize: '0.85rem', color: '#6ee7a0' }}>{success}</div>}

        {fields.map(({ key, label, type, placeholder, options }) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>{label}</label>
            {type === 'select' ? (
              <select
                style={inputStyle}
                value={form[key]}
                onChange={set(key)}
                required
              >
                {options?.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === "" && form[key] === ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                required
              />
            )}
            <FieldError msg={errors[key]?.[0] || errors[key]} />
          </div>
        ))}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Saving…" : "Save & Submit"}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          Already have an account?{" "}
          <button type="button" onClick={onGoLogin} style={{ background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', fontSize: 'inherit' }}>
            Log In
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

/* ─── LOGIN ─────────────────────────────────────────────────────────── */

export function LoginPage({ onGoRegister, onGoForgot, onLoginSuccess }) {
  const [form, setForm]       = useState({ username: "", password: "", role: "user" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    borderRadius: '6px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none'
  };
  
  const fieldStyle = { marginBottom: '12px' };
  const labelStyle = { 
    display: 'block', 
    fontSize: '0.7rem', 
    fontWeight: '600', 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase',
    color: 'rgba(201, 168, 76, 0.7)',
    marginBottom: '4px'
  };
  
  const btnStyle = {
    background: 'linear-gradient(135deg, #c9a84c 0%, #b8963f 100%)',
    color: '#0a150e',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    cursor: 'pointer',
    marginTop: '6px'
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     setErrors({});
     setLoading(true);
     try {
       const res = await fetch(`${API}/login/`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(form),
       });

       let data;
       const text = await res.text();
       try {
         data = text ? JSON.parse(text) : {};
       } catch {
         data = { detail: 'Invalid server response' };
       }

       if (res.ok) {
         onLoginSuccess(data.user);
       } else {
         setErrors(data);
       }
     } catch (err) {
       setErrors({ non_field_errors: [`Network error: ${err.message}. Please try again.`] });
     } finally {
       setLoading(false);
     }
   };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your Maruthi Travels account">
      <form className="auth-form" onSubmit={handleSubmit}>
        {errors.non_field_errors && (
          <div className="auth-error-banner">{errors.non_field_errors.join(" ")}</div>
        )}

        <div className="auth-field">
          <label className="auth-label">Role</label>
          <select className="auth-input" value={form.role} onChange={set("role")} required>
            <option value="user">User</option>
            <option value="support_staff">Support Staff</option>
            <option value="admin">Admin</option>
          </select>
          <FieldError msg={errors.role?.[0]} />
        </div>

        <div className="auth-field">
          <label className="auth-label">Username</label>
          <input className="auth-input" type="text" placeholder="Your username"
            value={form.username} onChange={set("username")} required />
          <FieldError msg={errors.username?.[0]} />
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" placeholder="Your password"
            value={form.password} onChange={set("password")} required />
          <FieldError msg={errors.password?.[0]} />
        </div>

        <button type="button" className="auth-forgot-link" onClick={onGoForgot}>
          Forgot Password?
        </button>

        <button type="submit" className="auth-btn-submit" disabled={loading}>
          {loading ? "Logging in…" : "Submit"}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" className="auth-link" onClick={onGoRegister}>
            Register
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

/* ─── FORGOT PASSWORD ───────────────────────────────────────────────── */

export function ForgotPasswordPage({ onGoLogin }) {
  const [step, setStep]       = useState(1); // 1=email, 2=otp+new pass
  const [email, setEmail]     = useState("");
  const [form, setForm]       = useState({ otp: "", new_password: "", confirm_password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    borderRadius: '6px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none'
  };
  
  const fieldStyle = { marginBottom: '12px' };
  const labelStyle = { 
    display: 'block', 
    fontSize: '0.7rem', 
    fontWeight: '600', 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase',
    color: 'rgba(201, 168, 76, 0.7)',
    marginBottom: '4px'
  };
  
  const btnStyle = {
    background: 'linear-gradient(135deg, #c9a84c 0%, #b8963f 100%)',
    color: '#0a150e',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    cursor: 'pointer',
    marginTop: '6px'
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch(`${API}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setStep(2);
      } else {
        setErrors(data);
      }
    } catch {
      setErrors({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch(`${API}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password reset successful! Redirecting to login…");
        setTimeout(() => onGoLogin(), 1800);
      } else {
        setErrors(data);
      }
    } catch {
      setErrors({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={step === 1 ? "Enter your registered email" : "Enter the OTP sent to your email"}
    >
      {step === 1 ? (
        <form className="auth-form" onSubmit={handleSendOTP}>
          {errors.error && <div className="auth-error-banner">{errors.error}</div>}
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="auth-btn-submit" type="submit" disabled={loading}>
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
          <p className="auth-switch">
            <button type="button" className="auth-link" onClick={onGoLogin}>← Back to Login</button>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleResetPassword}>
          {errors.error && <div className="auth-error-banner">{errors.error}</div>}
          {success && step === 2 && !errors.error && (
            <div className="auth-success-banner">{success}</div>
          )}
          <div className="auth-field">
            <label className="auth-label">OTP</label>
            <input className="auth-input" type="text" placeholder="6-digit OTP"
              maxLength={6} value={form.otp} onChange={set("otp")} required />
            <FieldError msg={errors.otp?.[0]} />
          </div>
          <div className="auth-field">
            <label className="auth-label">New Password</label>
            <input className="auth-input" type="password" placeholder="Min. 8 characters"
              value={form.new_password} onChange={set("new_password")} required />
            <FieldError msg={errors.new_password?.[0]} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm New Password</label>
            <input className="auth-input" type="password" placeholder="Repeat new password"
              value={form.confirm_password} onChange={set("confirm_password")} required />
            <FieldError msg={errors.confirm_password?.[0]} />
          </div>
          <button className="auth-btn-submit" type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

/* ─── ADMIN LOGIN ─────────────────────────────────────────────────────── */

export function AdminLoginPage({ onGoLogin, onLoginSuccess }) {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    borderRadius: '6px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none'
  };
  
  const fieldStyle = { marginBottom: '12px' };
  const labelStyle = { 
    display: 'block', 
    fontSize: '0.7rem', 
    fontWeight: '600', 
    letterSpacing: '0.1em', 
    textTransform: 'uppercase',
    color: 'rgba(201, 168, 76, 0.7)',
    marginBottom: '4px'
  };
  
  const btnStyle = {
    background: 'linear-gradient(135deg, #c9a84c 0%, #b8963f 100%)',
    color: '#0a150e',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    cursor: 'pointer',
    marginTop: '6px'
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     setErrors({});
     setLoading(true);
     try {
       const res = await fetch(`${API}/admin-login/`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(form),
       });

       let data;
       const text = await res.text();
       try {
         data = text ? JSON.parse(text) : {};
       } catch {
         data = { detail: 'Invalid server response' };
       }

       if (res.ok) {
         onLoginSuccess(data.user);
       } else {
         console.error('Admin login failed:', res.status, data);
         setErrors(data);
       }
     } catch (err) {
       console.error('Admin login network error:', err);
       setErrors({ non_field_errors: [`Network error: ${err.message}. Please try again.`] });
     } finally {
       setLoading(false);
     }
   };

  return (
    <AuthLayout title="Admin Login" subtitle="Access the admin dashboard">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {errors.non_field_errors && (
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px', padding: '10px', fontSize: '0.85rem', color: '#ff7b7b' }}>{errors.non_field_errors.join(" ")}</div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} type="text" placeholder="Admin username"
            value={form.username} onChange={set("username")} required />
          <FieldError msg={errors.username?.[0]} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" placeholder="Admin password"
            value={form.password} onChange={set("password")} required />
          <FieldError msg={errors.password?.[0]} />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Logging in…" : "Admin Login"}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          Not an admin?{" "}
          <button type="button" onClick={onGoLogin} style={{ background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', fontSize: 'inherit' }}>
            User Login
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ProfileDropdown({ user, onLogout, onViewProfile, onMyBookings }) {
  const [open, setOpen] = useState(false);
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "MT";

  const handleLogout = async () => {
    await fetch(`${API}/logout/`, { method: "POST", credentials: "include" });
    onLogout();
    setOpen(false);
  };

  return (
    <div className="profile-dropdown-wrap">
      <button className="profile-avatar-btn" onClick={() => setOpen(o => !o)} title={user.name}>
        <div className="profile-avatar">{initials}</div>
        <span className="profile-name-short">{user.name?.split(" ")[0]}</span>
        <span className="profile-chevron">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">{initials}</div>
            <div>
              <div className="profile-dropdown-name">{user.name}</div>
              <div className="profile-dropdown-email">{user.email}</div>
            </div>
          </div>
          <div className="profile-dropdown-divider" />
          <button className="profile-dropdown-item" onClick={() => { onViewProfile(); setOpen(false); }}>
            👤 View Profile
          </button>
          <button className="profile-dropdown-item" onClick={() => { onViewProfile(); setOpen(false); }}>
            ✏️ Edit Profile
          </button>
          <button className="profile-dropdown-item" onClick={() => { onMyBookings(); setOpen(false); }}>
            🗺️ My Bookings
          </button>
          <div className="profile-dropdown-divider" />
          <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
