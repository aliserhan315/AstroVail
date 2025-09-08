export enum CertificateStyle {
  Classic = "classic",
  Cosmic = "cosmic",
}

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
