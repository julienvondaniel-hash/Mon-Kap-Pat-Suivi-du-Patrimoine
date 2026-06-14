import React from "react";
import logoUrl from "../assets/logo-hexa.jpeg";

// Logo HEXA dans un cartouche blanc arrondi (le logo a un fond clair, il
// ressort mal sur le bleu nuit sans ce fond). `size` = hauteur du cartouche.
export default function Logo({ size = 30, radius = 8 }) {
  return (
    <div style={{
      height: size, borderRadius: radius, background: "#FFFFFF",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "3px 7px", boxSizing: "border-box",
    }}>
      <img src={logoUrl} alt="Hexa Patrimoine" style={{ height: size - 8, width: "auto", display: "block" }} />
    </div>
  );
}
