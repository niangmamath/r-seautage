import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOg({
  surtitre,
  titre,
  pied,
}: {
  surtitre: string;
  titre: string;
  pied: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #e11d48 0%, #db2777 55%, #a21caf 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "4px",
            opacity: 0.85,
          }}
        >
          {surtitre}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1040,
            display: "flex",
          }}
        >
          {titre}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            opacity: 0.9,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>{pied}</div>
          <div style={{ fontSize: 22, opacity: 0.8 }}>Networking Maroc</div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
