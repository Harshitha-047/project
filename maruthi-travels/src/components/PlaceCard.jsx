const cardAccentColors = ["#c9a84c", "#5a9e8f", "#c97b4c", "#7b8fc9", "#9e5a5a", "#6a9e5a"];

export function PlaceCard({ place, index, onBookTrip }) {
  const accent = cardAccentColors[index % cardAccentColors.length];
  
  const handleBookClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookTrip) {
      console.log("Booking:", place.name);
      onBookTrip(place);
    }
  };
  
  return (
    <div className="place-card" style={{ "--accent": accent }}>
      <div className="place-card-img-wrap">
        <img src={place.img} alt={place.name} loading="lazy" />
        <div className="place-card-duration">{place.duration}</div>
      </div>
      <div className="place-card-body">
        <h3 className="place-card-name">{place.name}</h3>
        {place.bestFor && <p className="place-card-bestfor">{place.bestFor}</p>}
        {place.description && <p className="place-card-desc">{place.description}</p>}
        <ul className="place-card-highlights">
          {place.highlights.map((h, i) => (
            <li key={i}><span className="highlight-dot" style={{ background: accent }} />{h}</li>
          ))}
        </ul>
        <button onClick={handleBookClick} className="place-card-btn">Book This Trip</button>
      </div>
    </div>
  );
}
