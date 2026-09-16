const { getStore } = require("@netlify/blobs");

const SLOTS = [
  { id: "s1",  day: "Thursday, Sept 17", time: "12:00 PM" },
  { id: "s2",  day: "Thursday, Sept 17", time: "12:30 PM" },
  { id: "s3",  day: "Thursday, Sept 17", time: "1:00 PM" },
  { id: "s4",  day: "Thursday, Sept 17", time: "1:30 PM" },
  { id: "s5",  day: "Thursday, Sept 17", time: "2:00 PM" },
  { id: "s6",  day: "Thursday, Sept 17", time: "2:30 PM" },
  { id: "s7",  day: "Thursday, Sept 17", time: "3:00 PM" },
  { id: "s8",  day: "Thursday, Sept 17", time: "3:30 PM" },
  { id: "s9",  day: "Monday, Sept 21",   time: "6:00 PM" },
  { id: "s10", day: "Monday, Sept 21",   time: "6:30 PM" },
  { id: "s11", day: "Monday, Sept 21",   time: "7:00 PM" },
  { id: "s12", day: "Monday, Sept 21",   time: "7:30 PM" },
  { id: "s13", day: "Tuesday, Sept 22",  time: "11:30 AM" },
  { id: "s14", day: "Tuesday, Sept 22",  time: "12:00 PM" },
  { id: "s15", day: "Tuesday, Sept 22",  time: "12:30 PM" },
  { id: "s16", day: "Tuesday, Sept 22",  time: "1:00 PM" },
  { id: "s17", day: "Tuesday, Sept 22",  time: "1:30 PM" },
  { id: "s18", day: "Tuesday, Sept 22",  time: "2:00 PM" },
  { id: "s19", day: "Tuesday, Sept 22",  time: "2:30 PM" },
  { id: "s20", day: "Tuesday, Sept 22",  time: "3:00 PM" },
  { id: "s21", day: "Tuesday, Sept 22",  time: "3:30 PM" },
  { id: "s22", day: "Tuesday, Sept 22",  time: "4:00 PM" },
  { id: "s23", day: "Wednesday, Sept 23", time: "12:00 PM" },
  { id: "s24", day: "Wednesday, Sept 23", time: "12:30 PM" },
  { id: "s25", day: "Wednesday, Sept 23", time: "1:00 PM" },
  { id: "s26", day: "Wednesday, Sept 23", time: "1:30 PM" },
  { id: "s27", day: "Wednesday, Sept 23", time: "2:00 PM" },
  { id: "s28", day: "Wednesday, Sept 23", time: "2:30 PM" },
];

exports.handler = async () => {
  try {
    const store = getStore("dodgecity-signup");
    const listing = await store.list({ prefix: "booking:" });
    const bookedIds = new Set(
      listing.blobs.map((b) => b.key.replace("booking:", ""))
    );

    const result = SLOTS.map((s) => ({ ...s, booked: bookedIds.has(s.id) }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not load slots", detail: String(err) }),
    };
  }
};
