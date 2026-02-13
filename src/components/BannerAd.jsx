/*import { useEffect } from "react";

export default function AdBanner() {
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
      data-ad-client="ca-pub-XXXXXXXXXXXX"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
*/

export default function BannerAd({ position }) {
  return (
    <div className="text-center my-2">
      <img
        src="/banner-anuncie-aqui.png"
        alt="Anuncie aqui"
        className="img-fluid rounded shadow-sm"
        style={{
          width: "100%",
          maxHeight: "90px",
          objectFit: "cover"
        }}
      />
    </div>
  );
}
