import React, { createContext, useContext, useState, useEffect } from "react";

/* ==========================================================================
   THÈME HEXA — deux palettes (clair / sombre), un contexte unique.
   Toutes les couleurs de l'app proviennent d'ici via useTheme().
   ========================================================================== */

// Palette claire — fidèle au tableau de bord HEXA (fond clair institutionnel).
const LIGHT = {
  mode: "light",
  bg: "#E9EBF0",          // fond extérieur
  ink: "#F4F6F9",         // fond de l'app
  inkSoft: "#FFFFFF",     // cartes
  ivory: "#1B2B4B",       // texte principal (bleu nuit)
  ivorySoft: "#5B6577",   // texte secondaire
  brass: "#22535A",       // accent (bleu-pétrole HEXA)
  brassSoft: "#84B7BE",   // accent clair
  line: "#E4E8EF",        // bordures
  alert: "#C2553F",
  warn: "#B8860B",
  positive: "#1F8A6D",
  navy: "#1B2B4B",        // bleu nuit (bandeaux, menu)
  onNavy: "#EAEEF5",      // texte sur bleu nuit
  navySoft: "#13223D",
  navyLine: "#2A3A5C",
};

// Palette sombre — premium, bleu nuit profond.
const DARK = {
  mode: "dark",
  bg: "#0A1226",
  ink: "#0E1A30",
  inkSoft: "#15243F",
  ivory: "#EAEEF5",
  ivorySoft: "#8593AD",
  brass: "#84B7BE",       // accent clair (lisible sur fond sombre)
  brassSoft: "#3E8C9C",
  line: "#233452",
  alert: "#D2603F",
  warn: "#C9A24B",
  positive: "#5FB39A",
  navy: "#13223D",
  onNavy: "#EAEEF5",
  navySoft: "#0E1A30",
  navyLine: "#233452",
};

export const PIE = {
  light: ["#22535A", "#3E8C9C", "#84B7BE", "#1B2B4B", "#6F8CA8", "#A7C4CB"],
  dark: ["#84B7BE", "#3E8C9C", "#4a6a86", "#5FB39A", "#6F8CA8", "#C9A24B"],
};

const THEMES = { light: LIGHT, dark: DARK };

const ThemeContext = createContext(LIGHT);
export const useTheme = () => useContext(ThemeContext);

// Fournit le thème à toute l'app. Le mode choisi est passé en prop (piloté
// par App, qui le lit/écrit dans le profil Supabase).
export function ThemeProvider({ mode = "dark", children }) {
  const theme = THEMES[mode] || DARK;
  const pie = PIE[theme.mode];
  return (
    <ThemeContext.Provider value={{ ...theme, pie }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Police serif pour les grands montants (caractère "gestion privée").
export const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
export const SANS = "'Inter', system-ui, -apple-system, sans-serif";
