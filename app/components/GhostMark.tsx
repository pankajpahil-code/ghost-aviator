// Flat vector brand mark — the guardian ghost captain reduced to its simplest
// readable silhouette. Crisp at any size (navbar, favicon, buttons).
// Same drawing as app/icon.svg — keep the two in sync.
export default function GhostMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ display: "block" }}>
      {/* ghost body with tail scallops */}
      <path d="M14 32 C14 18 22 12 32 12 C42 12 50 18 50 32 L50 46 Q47 52 43 47 Q39 53 32 48 Q25 53 21 47 Q17 52 14 46 Z"
            fill="#bdefff" />
      {/* face */}
      <ellipse cx="26" cy="33" rx="2.6" ry="4.2" fill="#0d2c46" />
      <ellipse cx="38" cy="33" rx="2.6" ry="4.2" fill="#0d2c46" />
      <path d="M28 41 Q32 44.5 36 41" fill="none" stroke="#0d2c46" strokeWidth="2" strokeLinecap="round" />
      {/* captain's cap */}
      <path d="M18 20 C20 8 44 8 46 20 Q32 26 18 20 Z" fill="#16294a" />
      <path d="M16 20 Q32 28 48 20 L51 25 Q32 33 13 25 Z" fill="#0a1830" />
      <circle cx="32" cy="15" r="2.5" fill="#ffd97a" />
    </svg>
  );
}
