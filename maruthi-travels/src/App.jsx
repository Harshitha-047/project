import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./auth-styles.css";
import { videoData, packages, reviews, blogs } from "./data";
import { BusLogo, PlaceCard, PackageDetailPage } from "./components";
import { RegisterPage, LoginPage, AdminLoginPage, ForgotPasswordPage, ProfileDropdown } from "./AuthPages";
import { AdminDashboard } from "./components/AdminDashboard";
import { SupportStaffDashboard } from "./components/SupportStaffDashboard";

const API = "http://localhost:8000/api";

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

function getHash() {
  return window.location.hash.slice(1) || "/";
}

/* ─── MAIN APP ───────────────────────────────────────────────────────── */

export default function MaruthiTravels() {
  const [vidIndex, setVidIndex] = useState(0);
  const [activePkg, setActivePkg] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [route, setRoute] = useState(getHash());

  // Booking form refs
  const nameRef = useRef();
  const emailRef = useRef();
  const packageRef = useRef();
  const messageRef = useRef();
  const stateRef = useRef();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  const total = videoData.length;

  /* ── restore session on page load ── */
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = getHash();
      setRoute(hash);
      
      if (hash === "/logout") {
        try {
          await fetch(`${API}/logout/`, { method: "POST", credentials: "include" });
        } catch (err) {
          console.error('Logout error:', err);
        }
        setCurrentUser(null);
        setShowAdminPanel(false);
        window.location.hash = "/";
        return;
      }
      
      if (hash === "/admin" && data?.role === 'admin') {
        setShowAdminPanel(true);
      } else {
        setShowAdminPanel(false);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    (async () => {
      try {
        const res = await fetch(`${API}/me/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
          if (getHash() === "/admin" && data.is_staff) {
            setShowAdminPanel(true);
          }
        }
      } catch {}
      setAuthLoading(false);
    })();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /* ── video carousel ── */
  const goToVideo = (i) => setVidIndex((i + total) % total);
  useEffect(() => {
    const id = setInterval(() => setVidIndex(p => (p + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total]);

  /* ── nav helpers ── */
  const goHome = () => { setActivePkg(null); window.location.hash = "/"; };

  const handlePackageClick = (pkg) => {
    setActivePkg(pkg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    setActivePkg(null);
    setTimeout(() => document.getElementById("package")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleBookTrip = (place) => {
    setBookingData(place);
    setActivePkg(null);
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  /* ── auth callbacks ── */
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      window.location.hash = "/admin";
    } else if (user.role === 'support_staff') {
      window.location.hash = "/support";
    } else {
      window.location.hash = "/";
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout/`, { method: "POST", credentials: "include" });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setShowAdminPanel(false);
    window.location.hash = "/";
  };

  /* ── contact form submit ── */
   const handleContactSubmit = async (e) => {
     e.preventDefault();
     setBookingLoading(true);
     try {
       const res  = await fetch(`${API}/book/`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify({
           name: nameRef.current.value,
           email: emailRef.current.value,
           package: packageRef.current.value,
           message: messageRef.current.value,
           state: stateRef.current?.value || '',
         }),
       });
      if (res.ok) {
        alert('Booking submitted successfully!');
        nameRef.current.value = '';
        emailRef.current.value = '';
        packageRef.current.value = '';
        messageRef.current.value = '';
        setBookingData(null);
      } else {
        alert('Failed to submit booking.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── my bookings ── */
  const handleMyBookings = async () => {
    try {
      const res = await fetch(`${API}/my-bookings/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMyBookings(data);
        setShowMyBookings(true);
      } else {
        alert('Failed to load bookings.');
      }
    } catch {
      alert('Network error.');
    }
  };

  /* ── NAV ACTIONS (right side) ── */
  const NavActions = () => {
    if (authLoading) return <div style={{ width: 120 }} />;
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return (
          <div className="nav-actions">
            <button className="btn-cta btn-admin" onClick={() => setShowAdminPanel(true)}>Admin Panel</button>
            <ProfileDropdown
              user={currentUser}
              onLogout={handleLogout}
              onViewProfile={() => { /* future profile modal */ }}
              onMyBookings={handleMyBookings}
            />
          </div>
        );
      }
      return (
          <ProfileDropdown
            user={currentUser}
            onLogout={handleLogout}
            onViewProfile={() => { /* future profile modal */ }}
            onMyBookings={handleMyBookings}
          />
      );
    }
     return (
       <div className="nav-actions">
         <button className="btn-cta btn-login"    onClick={() => window.location.hash = "#/login"}>Login</button>
         <button className="btn-cta btn-register" onClick={() => window.location.hash = "#/register"}>Register</button>
       </div>
     );
  };

  /* ── AUTH PAGES overlay ── */
  if (route === "/register") {
    return (
      <>
        <nav>
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:0 }} onClick={goHome}>
            <BusLogo width={180} />
          </button>
          <ul className="nav-links" />
          <NavActions />
        </nav>
        <RegisterPage onGoLogin={() => window.location.hash = "#/login"} />
      </>
    );
  }

  if (route === "/login") {
    return (
      <>
        <nav>
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:0 }} onClick={goHome}>
            <BusLogo width={180} />
          </button>
          <ul className="nav-links" />
          <NavActions />
        </nav>
        <LoginPage
          onGoRegister={() => window.location.hash = "#/register"}
          onGoForgot={() => window.location.hash = "#/forgot"}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (route === "/forgot") {
    return (
      <>
        <nav>
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:0 }} onClick={goHome}>
            <BusLogo width={180} />
          </button>
          <ul className="nav-links" />
          <NavActions />
        </nav>
        <ForgotPasswordPage onGoLogin={() => window.location.hash = "#/login"} />
      </>
    );
  }

  if (route === "/admin-login") {
    return (
      <>
        <nav>
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:0 }} onClick={goHome}>
            <BusLogo width={180} />
          </button>
          <ul className="nav-links" />
          <NavActions />
        </nav>
        <AdminLoginPage
          onGoLogin={() => window.location.hash = "#/login"}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  /* ── ADMIN PANEL ── */
  if (showAdminPanel && currentUser?.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        onLogout={() => {
          setShowAdminPanel(false);
          handleLogout();
        }}
      />
    );
  }

  /* ── SUPPORT STAFF PANEL ── */
  if (route === "/support" && currentUser?.role === 'support_staff') {
    return (
      <SupportStaffDashboard
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  /* ── MAIN SITE ── */
  return (
    <>
      {/* NAV */}
      <nav>
        <button
          style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}
          onClick={goHome}
        >
          <BusLogo width={180} />
        </button>
        <ul className="nav-links">
          {["Home","Package","Booking","Contact","Reviews","Blog"].map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} onClick={() => { if (activePkg) setActivePkg(null); }}>{l}</a>
            </li>
          ))}
        </ul>
        <NavActions />
      </nav>

      {/* ── PACKAGE DETAIL PAGE ── */}
      {activePkg ? (
        <PackageDetailPage pkg={activePkg} onBack={handleBackToHome} onBookTrip={handleBookTrip} />
      ) : (
        <>
          {/* HERO */}
          <section className="hero" id="home">
            <div className="logo-svg-wrap"><BusLogo width={560} /></div>
            <div className="hero-divider" />
          </section>

          {/* VIDEOS */}
          <section className="videos-section" id="package">
            <h2 className="section-title">Explore Our Journeys</h2>
            <p className="section-sub">Watch the magic of every trip we've curated</p>
            <div className="gold-line" />
            <div className="video-carousel-wrapper">
              <div className="video-track">
                <div className="video-slides" style={{ transform: `translateX(-${vidIndex * 100}%)` }}>
                  {videoData.map((v, i) => (
                    <div key={i} className={`video-card ${v.cls}`}>
                      <video src={v.url} controls autoPlay loop muted />
                      <div className="vc-label">{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="video-dots">
                {videoData.map((_, i) => (
                  <div key={i} className={`video-dot${i === vidIndex ? " active" : ""}`} onClick={() => goToVideo(i)} />
                ))}
              </div>
            </div>
          </section>

          {/* SAFETY */}
          <section className="safety-section">
            <h2>From pickup to drop, your <em>safety</em> is always our responsibility.</h2>
            <p style={{ color:"rgba(255,255,255,0.55)", maxWidth:520, margin:"0 auto", fontSize:"0.95rem" }}>
              Every journey with Maruthi Travels is planned with your comfort and security at every step.
            </p>
            <div className="cta-row">
              <button className="btn-cta btn-gold"         onClick={() => window.location.hash = "#/register"}>Register to Explore</button>
              <button className="btn-cta btn-outline-gold" onClick={() => window.location.hash = "#/login"}>Login to Your Account</button>
            </div>
          </section>

          {/* PACKAGES */}
          <section className="packages-section" id="booking">
            <h2 className="section-title">Popular Packages</h2>
            <p className="section-sub">Handpicked experiences for every kind of traveller</p>
            <div className="gold-line" />
            <div className="package-grid">
              {packages.map((p, i) => (
                <div
                  key={i} className="pkg-card pkg-card-clickable"
                  onClick={() => handlePackageClick(p)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && handlePackageClick(p)}
                >
                  <div className="pkg-icon">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="pkg-accent" />
                  <span className="pkg-explore-hint">Explore destinations →</span>
                </div>
              ))}
            </div>
            <div className="pkg-cta">
              <a href="#contact" className="btn-cta btn-gold" style={{ display:"inline-block", marginTop:10 }}>
                View All Packages &amp; Start Booking
              </a>
            </div>
          </section>

          {/* CONTACT */}
          <section className="contact-section" id="contact">
            <div className="contact-left">
              <h2>Get In Touch</h2>
              <div className="gold-line" style={{ margin:"14px 0 24px" }} />
              <p>Have a query or want to book a trip? Drop us a message and we'll get back to you shortly.</p>
              {[
                { icon:"📞", label:"Phone",  value:"+91 98765 43210" },
                { icon:"✉️", label:"Email",  value:"hello@maruthitravels.in" },
                { icon:"📍", label:"Office", value:"Bengaluru, Karnataka" },
              ].map((c, i) => (
                <div key={i} className="contact-item">
                  <div className="contact-icon">{c.icon}</div>
                  <div><span>{c.label}</span><strong>{c.value}</strong></div>
                </div>
              ))}
            </div>
            <div className="contact-right">
               <form className="contact-form" key={bookingData ? `booking-${bookingData.name}` : "default"} onSubmit={handleContactSubmit}>
                 <input type="text"  placeholder="Your Name"  defaultValue={currentUser?.name  || ""} ref={nameRef} />
                 <input type="email" placeholder="Your Email" defaultValue={currentUser?.email || ""} ref={emailRef} />
                 <select ref={stateRef} defaultValue="" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '6px', padding: '10px 12px', width: '100%', boxSizing: 'border-box', fontSize: '0.85rem', color: '#fff', outline: 'none', marginBottom: '12px' }}>
                   <option value="" disabled>Select your state</option>
                   {INDIAN_STATES.map(state => (
                     <option key={state} value={state}>{state}</option>
                   ))}
                 </select>
                 <input type="text"  placeholder="Package of Interest"
                   defaultValue={bookingData ? `${bookingData.name} - ${bookingData.duration}` : ""} ref={packageRef} />
                 <textarea placeholder="Your message or enquiry…"
                  defaultValue={bookingData
                    ? `Hi, I'm interested in booking ${bookingData.name}. Please provide more details.\n\nHighlights: ${bookingData.highlights?.join(", ")}`
                    : ""} ref={messageRef} />
                <button type="submit" disabled={bookingLoading}>
                  {bookingLoading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </section>

          {/* REVIEWS */}
          <section className="reviews-section" id="reviews">
            <h2 className="section-title">What Our Travellers Say</h2>
            <p className="section-sub">Real experiences from real journeys</p>
            <div className="gold-line" />
            <div className="reviews-grid">
              {reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="stars">{r.stars}</div>
                  <p>{r.text}</p>
                  <div className="reviewer">
                    <div className="rev-avatar">{r.initials}</div>
                    <div><div className="rev-name">{r.name}</div><div className="rev-trip">{r.trip}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOG */}
          <section className="blog-section" id="blog">
            <h2 className="section-title">From Our Blog</h2>
            <p className="section-sub">Tips, stories, and guides from the road</p>
            <div className="gold-line" />
            <div className="blog-grid">
              {blogs.map((b, i) => (
                <div key={i} className="blog-card">
                  <div className="blog-thumb" style={{ background:b.bg }}>{b.thumb}</div>
                  <div className="blog-body">
                    <span className="blog-tag">{b.tag}</span>
                    <h4>{b.title}</h4>
                    <p>{b.desc}</p>
                    <div className="blog-date">{b.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Maruthi <span>Travels</span></h3>
            <p>From pickup to drop, your safety is always our responsibility. Serving travellers across India with care and dedication.</p>
          </div>
          <div className="footer-col">
            <h4>Packages</h4>
            {packages.map(p => (
              <a key={p.title} href="#" onClick={e => { e.preventDefault(); handlePackageClick(p); }}>{p.title}</a>
            ))}
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            {["About Us","Blog","Reviews","Contact"].map(l => <a key={l} href="#" onClick={l === "Contact" ? e => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); } : undefined}>{l}</a>)}
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            {currentUser
              ? ["My Bookings", "Edit Profile", "Logout"].map(l => <a key={l} href={l === "Logout" ? "#/logout" : "#"} onClick={l === "Logout" ? undefined : e => e.preventDefault()}>{l}</a>)
              : ["Login","Register"].map(l => <a key={l} href={`#/${l.toLowerCase()}`} onClick={e => { e.preventDefault(); window.location.hash = `/${l.toLowerCase()}`; }}>{l}</a>)
            }
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Maruthi Travels. All rights reserved. | Bengaluru, Karnataka</p>
        </div>
      </footer>

      {/* MY BOOKINGS MODAL */}
      {showMyBookings && (
        <div className="modal-overlay" onClick={() => setShowMyBookings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>My Bookings</h3>
            {myBookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              <div className="bookings-list">
                {myBookings.map(b => (
                  <div key={b.id} className="booking-item">
                    <h4>{b.package}</h4>
                    <p><strong>Name:</strong> {b.name}</p>
                    <p><strong>Email:</strong> {b.email}</p>
                    <p><strong>Message:</strong> {b.message}</p>
                    <p><strong>Date:</strong> {new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowMyBookings(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
