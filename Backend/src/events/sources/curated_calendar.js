function isoUTC(y, m, d, hh = 0, mm = 0) {
  return new Date(Date.UTC(y, m - 1, d, hh, mm)).toISOString();
}


export async function fetchCuratedCalendar({ year }) {
  const E = [];

  E.push({
    source: "curated",
    externalId: `meteor:quadrantids:${year}`,
    title: "Quadrantid Meteor Shower (peak)",
    description: "Short, sharp peak. Best after midnight with dark skies.",
    startTime: isoUTC(year, 1, 3, 0, 0),
    endTime:   isoUTC(year, 1, 4, 6, 0),
    category: "meteor_shower",
  });

  E.push({
    source: "curated",
    externalId: `meteor:perseids:${year}`,
    title: "Perseid Meteor Shower (peak)",
    description: "One of the year’s best. Look after midnight; dark skies recommended.",
    startTime: isoUTC(year, 8, 12, 0, 0),
    endTime:   isoUTC(year, 8, 13, 23, 59),
    category: "meteor_shower",
  });

  E.push({
    source: "curated",
    externalId: `meteor:geminids:${year}`,
    title: "Geminid Meteor Shower (peak)",
    description: "Bright meteors and frequent fireballs. Peak mid-December.",
    startTime: isoUTC(year, 12, 13, 0, 0),
    endTime:   isoUTC(year, 12, 14, 23, 59),
    category: "meteor_shower",
  });

  E.push({
    source: "curated",
    externalId: `lunar-eclipse-total-1:${year}`,
    title: "Red Moon (Total Lunar Eclipse)",
    description: "The Moon turns a deep red as it passes through Earth’s shadow.",
    startTime: isoUTC(year, 3, 14, 0, 0),
    endTime:   isoUTC(year, 3, 14, 6, 0),
    category: "lunar_eclipse",
  });

  E.push({
    source: "curated",
    externalId: `lunar-eclipse-total-2:${year}`,
    title: "Red Moon (Total Lunar Eclipse)",
    description: "A dramatic total lunar eclipse—visibility depends on your location.",
    startTime: isoUTC(year, 9, 7, 0, 0),
    endTime:   isoUTC(year, 9, 8, 6, 0),
    category: "lunar_eclipse",
  });

  E.push({
    source: "curated",
    externalId: `solar-eclipse-1:${year}`,
    title: "Solar Eclipse",
    description: "A partial/annular/total solar eclipse. Use proper eye protection!",
    startTime: isoUTC(year, 3, 29, 8, 0),
    endTime:   isoUTC(year, 3, 29, 14, 0),
    category: "solar_eclipse",
  });

  E.push({
    source: "curated",
    externalId: `solar-eclipse-2:${year}`,
    title: "Solar Eclipse",
    description: "A solar eclipse visible in some regions. Never look without protection.",
    startTime: isoUTC(year, 9, 21, 8, 0),
    endTime:   isoUTC(year, 9, 21, 14, 0),
    category: "solar_eclipse",
  });
  
  E.push({
    source: "curated",
    externalId: `saturn-opposition:${year}`,
    title: "Saturn at Opposition (Best View)",
    description: "Saturn is opposite the Sun—brightest, largest, and visible all night.",
    startTime: isoUTC(year, 9, 21, 0, 0),
    endTime:   isoUTC(year, 9, 22, 6, 0),
    category: "planet_highlight",
    planet: "Saturn",
  });

  E.push({
    source: "curated",
    externalId: `jupiter-opposition:${year}`,
    title: "Jupiter at Opposition (Best View)",
    description: "Jupiter shines all night—great time to see cloud bands and Galilean moons.",
    startTime: isoUTC(year, 2, 10, 0, 0),
    endTime:   isoUTC(year, 2, 11, 6, 0),
    category: "planet_highlight",
    planet: "Jupiter",
  });

  return E;
}
