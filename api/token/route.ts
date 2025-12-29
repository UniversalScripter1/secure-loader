export const runtime = "edge";

function isExecutor(req: Request) {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();

  return (
    ua.includes("synapse") ||
    ua.includes("scriptware") ||
    ua.includes("fluxus") ||
    ua.includes("electron") ||
    ua.includes("delta") ||
    ua.includes("arceus") ||
    ua.includes("wave")
  );
}

export async function GET(req: Request) {
  if (!isExecutor(req)) {
    return new Response("ACCESS DENIED", { status: 403 });
  }

  const token = crypto.randomUUID();
  const expires = Date.now() + 60_000; // 60 seconds

  const payload = `${token}|${expires}|${process.env.SECRET_KEY}`;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload)
  );

  const sig = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return new Response(
    JSON.stringify({ token, expires, sig }),
    { headers: { "Content-Type": "application/json" } }
  );
}
