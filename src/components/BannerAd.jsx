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
