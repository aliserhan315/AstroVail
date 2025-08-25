import "dotenv/config.js";

export async function fetchDonkiSolarFlares({ from, to, apiKey = process.env.NASA_API_KEY } = {}) {
  if (!apiKey) throw new Error("Missing NASA_API_KEY");
  const start = from.toISOString().slice(0,10);
  const end   = to.toISOString().slice(0,10);
  const url   = `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const items = await res.json();

  return items.map(x => ({
    source:     "nasa:donki",
    externalId: x.flrID,
    title:      `Solar flare (${x.classType ?? "unknown"})`,
    description:`Active region: ${x.activeRegionNum ?? "n/a"}. Class: ${x.classType ?? "?"}.`,
    startTime:  new Date(x.beginTime ?? x.peakTime ?? x.endTime ?? Date.now()),
    endTime:    x.endTime ? new Date(x.endTime) : null,
    meta:       x,
  }));
}
