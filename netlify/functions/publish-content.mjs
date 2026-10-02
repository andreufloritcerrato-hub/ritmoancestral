import { getStore } from "@netlify/blobs";

function validContent(value) {
  return value &&
    typeof value === "object" &&
    value.app && typeof value.app === "object" &&
    Array.isArray(value.guide) &&
    Array.isArray(value.habits) &&
    Array.isArray(value.supplements);
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return new Response(JSON.stringify({ error: "ADMIN_PASSWORD is not configured" }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const password = req.headers.get("x-admin-password") || "";
  if (password !== configuredPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  let content;
  try {
    content = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (!validContent(content)) {
    return new Response(JSON.stringify({ error: "Invalid content structure" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    const store = getStore("ritmo-content");
    const publishedAt = new Date().toISOString();
    const payload = {
      ...content,
      meta: {
        ...(content.meta || {}),
        publishedAt,
      },
    };

    await store.setJSON("active", payload);

    return new Response(JSON.stringify({ ok: true, publishedAt }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unable to publish content" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
