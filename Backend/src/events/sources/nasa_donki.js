import axios from "axios";

function flareClassScore(cls) {
  if (!cls || typeof cls !== "string") return 0;
  const m = cls.trim().toUpperCase().match(/^([CMX])\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (!m) return 0;
  const band = m[1];
  const mag = parseFloat(m[2]);
  const base = band === "X" ? 100 : band === "M" ? 10 : 1;
  return base * (Number.isFinite(mag) ? mag : 0);
}

function parseMinClass(minClass) {
  const m = String(minClass || "").toUpperCase().match(/^([CMX])\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (!m) return 0; 
  const band = m[1];
  const mag = parseFloat(m[2]);
  const base = band === "X" ? 100 : band === "M" ? 10 : 1;
  return base * mag;
}

export async function fetchDonkiSolarFlares({ from, to, apiKey, minClass = "M5" }) {
  const startDate = (from instanceof Date ? from : new Date(from)).toISOString().slice(0, 10);
  const endDate   = (to   instanceof Date ? to   : new Date(to)).toISOString().slice(0, 10);

  const url = "https://api.nasa.gov/DONKI/FLR";
  const params = { startDate, endDate, api_key: apiKey };

  const { data } = await axios.get(url, { params });
  const minScore = parseMinClass(minClass);

  const flares = Array.isArray(data) ? data : [];

  return flares
    .filter(f => flareClassScore(f.classType) >= minScore)
    .map(f => {
      const beginISO = f.beginTime ? new Date(f.beginTime).toISOString() : undefined;
      const peakISO  = f.peakTime  ? new Date(f.peakTime).toISOString()  : beginISO;
      const endISO   = f.endTime   ? new Date(f.endTime).toISOString()   : peakISO;

      const title = f.classType
        ? `${f.classType}-class solar flare`
        : "Significant solar flare";

      const descParts = [];
      if (f.activeRegionNum) descParts.push(`Active Region ${f.activeRegionNum}`);
      if (f.sourceLocation) descParts.push(`Location: ${f.sourceLocation}`);
      const description = descParts.length ? descParts.join(". ") : undefined;

      return {
        source: "nasa:donki",
        externalId: f.flrID || `${beginISO || ""}-FLR-UNK`,
        title,
        description,
        startTime: beginISO || peakISO || endISO,
        endTime: endISO || peakISO || beginISO,
        link: f.link || undefined,
        category: "solar_flare",
        classType: f.classType || undefined,
        activeRegionNum: f.activeRegionNum || undefined,
      };
    });
}
