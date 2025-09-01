export const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const minLen = (v: string, n: number) => v.trim().length >= n;
