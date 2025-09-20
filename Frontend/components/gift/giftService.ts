import { Alert } from "react-native";
import { CartAPI, CheckoutAPI, StarsAPI } from "@/lib/endpoint";
import { CertificateStyle, CartItem } from "@/types/cart";

function styleToWire(s?: CertificateStyle): "classic" | "modern" | "cosmic" {
  switch (s) {
    case CertificateStyle.Modern:
      return "modern";
    case CertificateStyle.Cosmic:
      return "cosmic";
    default:
      return "classic";
  }
}

interface ProcessOrderParams {
  items: CartItem[];
  mode: "gift" | "self";
  email: string;
  message: string;
  onItemUpdate: (starId: string, patch: any) => void;
  onItemRemove: (starId: string) => void;
  onClearCart: () => void;
}

export class GiftService {
  static async processOrder({
    items,
    mode,
    email,
    message,
    onItemUpdate,
    onItemRemove,
    onClearCart,
  }: ProcessOrderParams) {
    if (items.length === 0) {
      Alert.alert("Your cart is empty", "Pick a star first.");
      return { success: false };
    }

    if (mode === "gift" && !email.trim()) {
      Alert.alert("Recipient email required", "Add who should receive the certificate.");
      return { success: false };
    }

    const basePatch = mode === "gift"
      ? { recipientEmail: email.trim() || undefined }
      : { recipientEmail: undefined };

    const failed: { id: string; reason: string }[] = [];

    for (const item of items) {
      try {
        const styleWire = styleToWire(item.certificateStyle as CertificateStyle);
        
        await CartAPI.add(item.starId, item.qty ?? 1);
        
        await CartAPI.update(item.starId, {
          ...basePatch,
          message: mode === "gift" ? message : undefined,
          certificateStyle: styleWire,
        });

        onItemUpdate(item.starId, {
          ...basePatch,
          message: mode === "gift" ? message : undefined,
        });

      } catch (error: any) {
        const reason = error?.response?.data?.message || error?.message || "Unavailable";
        failed.push({ id: item.starId, reason });
      }
    }

    // Handle failed items
    if (failed.length > 0) {
      for (const failedItem of failed) {
        onItemRemove(failedItem.id);
        try {
          await CartAPI.remove(failedItem.id);
        } catch {
        }
      }
      Alert.alert(
        "Some stars became unavailable", 
        `Removed ${failed.length} item(s) from your cart. Review and try again.`
      );
      return { success: false };
    }

    try {
      const order = await CheckoutAPI.create();
      
      if (order?.status === "paid") {
        onClearCart();
        Alert.alert("Success", "Your order is complete. Certificates are being generated.");
        return { success: true, redirect: "/(tabs)" };
      } else if (order?.status === "failed_sold_out") {
        await this.handleSoldOutStars(items, onItemRemove);
        return { success: false };
      } else {
        return { success: true, redirect: "/(tabs)" };
      }
    } catch (error) {
      console.error("Checkout error:", error);
      return { success: false };
    }
  }

  private static async handleSoldOutStars(
    items: CartItem[], 
    onItemRemove: (starId: string) => void
  ) {
    const soldOut: string[] = [];
    
    for (const item of items) {
      try {
        const star = await StarsAPI.get(item.starId);
        const doc: any = star?.data ?? star;
        if (doc?.owner) {
          soldOut.push(item.starId);
        }
      } catch {
      }
    }

    if (soldOut.length > 0) {
      for (const starId of soldOut) {
        onItemRemove(starId);
        try {
          await CartAPI.remove(starId);
        } catch {
        }
      }
      Alert.alert(
        "Stars Sold Out", 
        `${soldOut.length} star(s) were sold to other customers and removed from your cart.`
      );
    }
  }
}