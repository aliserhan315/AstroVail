import "dotenv/config.js";

export async function fetchNeoCloseApproaches({ from, to, apiKey = process.env.NASA_API_KEY } = {}) {
  if (!apiKey) throw new Error("Missing NASA_API_KEY");
  const start = from.toISOString().slice(0,10);
  const end   = to.toISOString().slice(0,10);
  const url   = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const dates = Object.keys(data.near_earth_objects || {}).sort();

  const events = [];
  for (const d of dates) {
    for (const neo of data.near_earth_objects[d]) {
      const ca = (neo.close_approach_data || [])[0];
      if (!ca) continue;
      const when = ca.close_approach_date_full || ca.close_approach_date; 
      const t = when ? new Date(when) : null;
      if (!t) continue;
      events.push({
        source:     "nasa:neows",
        externalId: neo.id,
        title:      `NEO close approach: ${neo.name || neo.id}`,
        description:`Miss distance: ${ca.miss_distance?.kilometers ?? "?"} km; velocity: ${ca.relative_velocity?.kilometers_per_hour ?? "?"} km/h`,
        startTime:  t,
        endTime:    null,
        meta:       neo,
      });
    }
  }
  return events;
}
