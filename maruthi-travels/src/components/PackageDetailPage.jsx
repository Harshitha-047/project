import { useEffect } from "react";
import { PlaceCard } from "./PlaceCard";
import { packageDetailData } from "../data";

export function PackageDetailPage({ pkg, onBack, onBookTrip }) {
  const detail = packageDetailData[pkg.title] || packageDetailData["School Trip"];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="pkg-detail-page">
      <div className="pkg-detail-hero">
        <div className="pkg-detail-hero-icon">{pkg.icon}</div>
        <h1 className="pkg-detail-title">{pkg.title}</h1>
        <p className="pkg-detail-tagline">{detail.tagline}</p>
        <div className="gold-line" style={{ margin: "18px auto" }} />
        <button className="pkg-back-btn" onClick={onBack}>← Back to Packages</button>
      </div>

      <section className="pkg-places-section">
        <div className="pkg-region-header">
          <span className="pkg-region-badge">Karnataka</span>
          <h2 className="pkg-region-title">Karnataka Destinations</h2>
          <p className="pkg-region-sub">Explore the best of Karnataka with Maruthi Travels</p>
        </div>
        <div className="places-masonry-grid">
          {detail.karnataka.map((place, i) => (
            <PlaceCard key={i} place={place} index={i} onBookTrip={onBookTrip} />
          ))}
        </div>
      </section>

      <section className="pkg-places-section pkg-places-india">
        <div className="pkg-region-header">
          <span className="pkg-region-badge" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.4)" }}>Pan India</span>
          <h2 className="pkg-region-title">All India Destinations</h2>
          <p className="pkg-region-sub">Journeys beyond Karnataka, curated with the same care</p>
        </div>
        <div className="places-masonry-grid">
          {detail.india.map((place, i) => (
            <PlaceCard key={i} place={place} index={i + 3} onBookTrip={onBookTrip} />
          ))}
        </div>
      </section>

      <div className="pkg-detail-cta">
        <h2>Ready to start planning?</h2>
        <p>Fill out the enquiry form and our team will reach you within 24 hours.</p>
        <a href="#contact" className="btn-cta btn-gold">Get a Custom Quote</a>
      </div>
    </div>
  );
}
