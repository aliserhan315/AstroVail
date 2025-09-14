import { Star } from "@/components/Home/StarItem/StarItem";

export function formatRA(ra: number): string {
  const totalHours = ra / 15;
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  return `${hours}h${minutes}m`;
}


export function formatDEC(dec: number): string {
  const sign = dec >= 0 ? "+" : "−";
  const absDec = Math.abs(dec);
  const degrees = Math.floor(absDec);
  const minutes = Math.floor((absDec - degrees) * 60);
  return `${sign}${degrees}°${minutes}′`;
}


export function transformStars(rawStars: any[]): Star[] {
  return rawStars.map((s) => ({
    id: s._id,
    name: s.displayName,
    mag: s.magnitude.toFixed(2),
    ra: formatRA(s.ra),
    dec: formatDEC(s.dec),
    constellation: s.constellation ?? "—",
  }));
}
