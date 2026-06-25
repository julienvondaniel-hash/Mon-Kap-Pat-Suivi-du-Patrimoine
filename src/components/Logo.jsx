import React from "react";

// Logo Mon Kap Pat — monogramme typographique « MKP » dans un cartouche
// arrondi. Rendu en code (aucune image) : net à toute taille et lisible
// aussi bien sur fond clair que sur fond bleu nuit. `size` = côté du cartouche.
export default function Logo({ size = 30, radius = 8 }) {
  return (
    <div
      aria-label="Mon Kap Pat"
      style={{
        width: size, height: size, borderRadius: radius,
        background: "linear-gradient(135deg, #2B6B74 0%, #1B2B4B 100%)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        boxSizing: "border-box", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
      }}
    >
      <span style={{
        color: "#F4F6F9",
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontWeight: 600,
        fontSize: Math.round(size * 0.36),
        letterSpacing: "0.01em",
        lineHeight: 1,
      }}>MKP</span>
    </div>
  );
}
