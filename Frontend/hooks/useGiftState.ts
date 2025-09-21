import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { updateItem, removeItem, clear } from "@/state/slices/cartSlice";
import { CertificateStyle } from "@/types/cart";

export function useGiftState() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const [mode, setMode] = useState<"gift" | "self">("gift");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedStyle = useMemo<CertificateStyle>(() => {
    const s = items?.[0]?.certificateStyle as CertificateStyle | undefined;
    return s || CertificateStyle.Classic;
  }, [items]);

  const setStyle = (style: CertificateStyle) => {
    items.forEach((it) =>
      dispatch(updateItem({ starId: it.starId, patch: { certificateStyle: style } }))
    );
  };

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
    items.forEach((it) =>
      dispatch(updateItem({ starId: it.starId, patch: { message: newMessage } }))
    );
  };

  const updateEmail = (newEmail: string) => {
    setEmail(newEmail);
    items.forEach((it) =>
      dispatch(updateItem({ starId: it.starId, patch: { recipientEmail: newEmail } }))
    );
  };

  return {
    items,
    mode,
    email,
    message,
    submitting,
    selectedStyle,
    
    setMode,
    setEmail: updateEmail,
    setMessage: updateMessage,
    setSubmitting,
    setStyle,
    
    removeItem: (starId: string) => dispatch(removeItem(starId)),
    clearCart: () => dispatch(clear()),
    updateItem: (starId: string, patch: any) => dispatch(updateItem({ starId, patch })),
  };
}