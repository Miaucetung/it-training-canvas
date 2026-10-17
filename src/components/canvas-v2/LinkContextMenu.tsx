import React, { useEffect, useRef } from "react";
import type { NetworkTopology, TopologyLink } from "@/types/topology";
import type { FailoverAction } from "@/lib/topology/failover";
import { LinkBreak, Link as LinkIcon, Power, Trash, X } from "@phosphor-icons/react";

interface LinkContextMenuProps {
  link: TopologyLink;
  topology: NetworkTopology;
  x: number;
  y: number;
  onAction: (action: FailoverAction) => void;
  onDelete: () => void;
  onClose: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  run: () => void;
  destructive?: boolean;
}

/** Kontextmenü einer Verbindung: trennen/wiederherstellen, shutdown/no shutdown je Ende, löschen. */
export const LinkContextMenu: React.FC<LinkContextMenuProps> = ({ link, topology, x, y, onAction, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const ends = [
    { deviceId: link.sourceDeviceId, ifaceId: link.sourceInterfaceId },
    { deviceId: link.targetDeviceId, ifaceId: link.targetInterfaceId },
  ].map((e) => {
    const device = topology.devices.find((d) => d.id === e.deviceId);
    const iface = device?.interfaces.find((i) => i.id === e.ifaceId);
    return { ...e, name: device?.config?.hostname ?? device?.name ?? "?", iface: iface?.name ?? "?", shut: !!iface?.isShutdown };
  });
  const title = ends.map((e) => `${e.name} ${e.iface}`).join(" – ");
  const cut = link.status === "down";

  const items: MenuItem[] = [
    {
      key: "link",
      label: cut ? "Verbindung wiederherstellen" : "Verbindung trennen",
      icon: cut ? <LinkIcon size={15} aria-hidden /> : <LinkBreak size={15} aria-hidden />,
      run: () => onAction({ kind: cut ? "link-up" : "link-down", linkId: link.id }),
    },
    ...ends.map((e) => ({
      key: `if-${e.deviceId}`,
      label: `${e.name} ${e.iface}: ${e.shut ? "no shutdown" : "shutdown"}`,
      icon: <Power size={15} aria-hidden />,
      run: () => onAction({ kind: e.shut ? "no-shutdown" : "shutdown", deviceId: e.deviceId, ifaceId: e.ifaceId } as FailoverAction),
    })),
    { key: "delete", label: "Verbindung löschen (Entf)", icon: <Trash size={15} aria-hidden />, run: onDelete, destructive: true },
  ];

  useEffect(() => {
    menuRef.current?.querySelector<HTMLButtonElement>("[role='menuitem']")?.focus();
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("touchstart", handleOutside);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("touchstart", handleOutside);
    };
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const buttons = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']") ?? [])];
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (idx + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      buttons[e.key === "Home" ? 0 : buttons.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={menuRef}
      onKeyDown={handleKeyDown}
      style={{ left: `${Math.min(window.innerWidth - 270, Math.max(10, x))}px`, top: `${Math.min(window.innerHeight - 240, Math.max(10, y))}px` }}
      className="fixed z-50 w-64 rounded-2xl border border-border bg-popover p-1.5 text-xs text-popover-foreground shadow-2xl"
    >
      <div className="mb-1 flex items-center justify-between gap-2 border-b border-border px-2.5 py-1.5 pb-2">
        <div className="truncate text-[11px] font-bold text-foreground">{title}</div>
        <button type="button" aria-label="Schließen" onClick={onClose} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <X size={13} aria-hidden />
        </button>
      </div>
      <div role="menu" aria-label={`Verbindung ${title}`} className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={() => {
              item.run();
              onClose();
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              item.destructive ? "text-status-error-fg hover:bg-status-error-bg" : "text-foreground hover:bg-accent"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
