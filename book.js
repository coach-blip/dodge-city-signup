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
    const store = getStore("dodgecity-signup");
    const key = `booking:${slotId}`;

    // Fast pre-check so we can give a friendly message without wasting the write.
    const existing = await store.get(key);
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "That time was just taken. Please pick another." }),
      };
    }

    // onlyIfNew makes this the real first-come-first-served guarantee:
    // if two people click the same slot at once, only the first write sticks.
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
