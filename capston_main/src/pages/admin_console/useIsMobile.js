import { useEffect, useState } from "react";

export default function useIsMobile(bp = 860) {
  const [m, setM] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= bp : false
  );

  useEffect(() => {
    const onResize = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [bp]);

  return m;
}
