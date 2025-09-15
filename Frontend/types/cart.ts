export enum CertificateStyle {
    Classic = "classic",
    Modern = "modern",
    Cosmic = "cosmic",
}

export type UpdateCartItemPayload = {
  recipientEmail?: string;
  message?: string; 
  certificateStyle?: "classic" | "modern" | "cosmic" | undefined;
};

export type CartItem = {
  starId: string;
  starName: string;
  qty: number;
  certificateStyle: CertificateStyle;
  recipientEmail?: string;
  message?: string;
  newName?: string;
  story?: string;
  price?: number;
};
