import { useEffect, useRef } from "react";

/**
 * Slot AdSense para React (SPA).
 * - Evita push duplicado (StrictMode)
 * - Delay curto pra aguardar script carregar
 */
export default function AdSenseSlot({
  client = "ca-pub-9882108162539838",
  slot,
  format = "auto",
  responsive = true,
  className,
  style,
  minHeight = 120,
}) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    const t = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (e) {
        console.log("Erro AdSense:", e);
      }
    }, 50);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className={className} style={{ minHeight, ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
