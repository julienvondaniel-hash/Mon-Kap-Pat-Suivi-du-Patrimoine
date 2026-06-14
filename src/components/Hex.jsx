import React from "react";

// Signature de marque : petit hexagone repris du logo HEXA, utilisé comme
// puce devant les titres de section. `color` et `size` sont paramétrables.
export default function Hex({ size = 12, color = "#22535A", style }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size * 1.08,
      background: color,
      clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
      flexShrink: 0,
      ...style,
    }} />
  );
}
