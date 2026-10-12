import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalPortalProps {
  children: ReactNode;
}

/**
 * Mountet modale Dialoge, Drawer, Popovers und Overlays direkt an document.body.
 * Verhindert, dass CSS-Transforms (z. B. 3D-Flip-Karte, Canvas-Zoom) oder
 * fremde Stacking-Kontexte den z-index oder die feste Positionierung überlagern.
 */
export function ModalPortal({ children }: ModalPortalProps) {
  if (typeof document === "undefined" || !document.body) {
    return <>{children}</>;
  }
  return createPortal(children, document.body);
}
