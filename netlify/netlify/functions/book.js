const { getStore } = require("@netlify/blobs");

const VALID_IDS = new Set(Array.from({ length: 28 }, (_, i) => `s${i + 1}`));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad request body" }) };
  }

  const slotId = String(data.slotId || "");
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();

  if (!VALID_IDS.has(slotId) || !name || !email || !email.includes("@")) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
  }

  try {
    const store = getStore({
      name: "dodgecity-signup",
      siteID: "70b9fc7f-df97-43cd-a43b-e7ce8dfea2a4",
      token: process.env.BLOBS_TOKEN,
    });
    const key = `booking:${slotId}`;

    const existing = await store.get(key);
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "That time was just taken. Please pick another." }),
      };
    }

    const wrote = await store.setJSON(
      key,
      { name, email, bookedAt: new Date().toISOString() },
      { onlyIfNew: true }
    );

    if (wrote === false) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "That time was just taken. Please pick another." }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not save booking", detail: String(err) }),
    };
  }
};
