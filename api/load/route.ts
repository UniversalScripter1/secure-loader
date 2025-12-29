export const runtime = "edge";

// Vercel Edge automatically injects env vars by name
const SECRET_KEY = SECRET_KEY;
const WEBHOOK_URL = WEBHOOK_URL;

async function sendWebhook(msg: string) {
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: msg })
  });
}

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
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");

  const ua = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!isExecutor(req)) {
    await sendWebhook(
      `🚨 **Blocked Access**
IP: \`${ip}\`
UA: \`${ua}\``
    );
    return new Response("ACCESS DENIED", { status: 403 });
  }

  if (!token || !expires || !sig || Date.now() > Number(expires)) {
    return new Response("INVALID TOKEN", { status: 401 });
  }

  const payload = `${token}|${expires}|${SECRET_KEY}`;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload)
  );

  const expectedSig = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (sig !== expectedSig) {
    return new Response("TAMPERED", { status: 401 });
  }

  // ✅ SEND YOUR LUA SCRIPT HERE
  return new Response(
    `
-- OBFUSCATED LUA SCRIPT GOES HERE
print("Secure loader executed")
    `,
    { headers: { "Content-Type": "text/plain" } }
  );
}
