import { useEffect } from "react";

export default function AdBannerBottom() {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.log("Erro AdSense:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9882108162539838"
      data-ad-slot="5465021888"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
