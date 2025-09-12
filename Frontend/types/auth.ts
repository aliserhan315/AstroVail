export type User = {
  _id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  tz?: string | null;
  location?: { lat: number; lon: number; accuracy?: number; updatedAt?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};
