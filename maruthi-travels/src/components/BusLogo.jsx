export const BusLogo = ({ width = 340, textColor = "#ffffff", subColor = "rgba(255,255,255,0.65)" }) => (
  <svg width={width} viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="134" height="140" rx="16" fill="#c9a84c"/>
    <rect x="52" y="68" width="110" height="60" rx="6" fill="#ffffff"/>
    <rect x="58" y="56" width="98" height="18" rx="5" fill="#f0d080"/>
    <rect x="62" y="74" width="22" height="16" rx="3" fill="#1a3c2e"/>
    <rect x="90" y="74" width="22" height="16" rx="3" fill="#1a3c2e"/>
    <rect x="118" y="74" width="22" height="16" rx="3" fill="#1a3c2e"/>
    <rect x="130" y="90" width="20" height="30" rx="2" fill="#1a3c2e"/>
    <rect x="52" y="126" width="110" height="8" rx="3" fill="#f0d080"/>
    <circle cx="76" cy="138" r="11" fill="#1a3c2e" stroke="#f0d080" strokeWidth="2.5"/>
    <circle cx="76" cy="138" r="4" fill="#f0d080"/>
    <circle cx="138" cy="138" r="11" fill="#1a3c2e" stroke="#f0d080" strokeWidth="2.5"/>
    <circle cx="138" cy="138" r="4" fill="#f0d080"/>
    <rect x="52" y="92" width="10" height="7" rx="2" fill="#f0d080"/>
    <line x1="52" y1="153" x2="162" y2="153" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="8,5"/>
    <line x1="192" y1="50" x2="192" y2="155" stroke="#c9a84c" strokeWidth="1.5"/>
    <text x="210" y="108" fontFamily="Playfair Display, serif" fontSize="38" fontWeight="700" fill={textColor}>
      Maruthi <tspan fill="#f0d080">Travels</tspan>
    </text>
    <text x="212" y="133" fontFamily="Lato, sans-serif" fontSize="13" fontWeight="300" fill={subColor} letterSpacing="6">
      YOUR JOURNEY, OUR COMMITMENT
    </text>
    <rect x="210" y="141" width="430" height="2" rx="1" fill="#c9a84c"/>
  </svg>
);
