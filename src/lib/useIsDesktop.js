import { useState, useEffect } from "react";

// Renvoie true au-delà du point de rupture (par défaut 900px = ordinateur).
// En dessous (mobile/tablette portrait), renvoie false.
export function useIsDesktop(breakpoint = 900) {
  const get = () => (typeof window !== "undefined" ? window.innerWidth >= breakpoint : false);
  const [isDesktop, setIsDesktop] = useState(get);
  useEffect(() => {
    const onResize = () => setIsDesktop(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isDesktop;
}
