import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("ritmo-content");
    const content = await store.get("active", { type: "json" });

    if (!content) {
      return new Response(JSON.stringify({ error: "No published content" }), {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unable to read content" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
