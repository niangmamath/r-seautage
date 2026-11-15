import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Networking au Maroc — meetups, conférences, forums";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #be123c 0%, #db2777 55%, #a21caf 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 630,
            height: 630,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.6}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H3v-2a4 4 0 0 1 4-4h2m2-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm6 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
            />
          </svg>
          <div
            style={{
              marginTop: 32,
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Networking
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            au Maroc
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 26,
              color: "#fce7f3",
              textAlign: "center",
            }}
          >
            Meetups · Conférences · Forums
          </div>
        </div>
      </div>
    ),
    size
  );
}
