import { useState } from "react";
import { ArrowClockwise, Calculator } from "@phosphor-icons/react";
import { calculateSubnet, getRandomSampleSubnet } from "@/lib/subnet-calc";

export function SubnetQuickCalc() {
  const [inputVal, setInputVal] = useState("192.168.10.77/27");

  const result = calculateSubnet(inputVal);

  const handleRandom = () => {
    const next = getRandomSampleSubnet(inputVal);
    setInputVal(next);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" weight="bold" />
            <h3 className="font-bold text-sm text-foreground font-sans">
              Inline-Subnetzrechner
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            IPv4 & CIDR
          </span>
        </div>

        {/* Input & Random Button */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="z. B. 192.168.10.77/27"
              aria-label="IPv4-Adresse mit CIDR-Präfix"
              className="w-full px-3 py-1.5 rounded border border-border bg-surface-elevated text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={handleRandom}
            title="Zufälliges CCNA-Subnetz generieren"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground text-xs font-mono transition-colors shrink-0"
          >
            <ArrowClockwise className="h-3.5 w-3.5" />
            <span>Zufall</span>
          </button>
        </div>

        {/* Calculation Output Table */}
        {result.isValid ? (
          <div className="space-y-1.5 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-surface-elevated/60 border border-border/50">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Netz-Adresse
                </span>
                <span className="font-bold text-primary tabular-nums">
                  {result.networkAddress}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Broadcast-Adresse
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {result.broadcastAddress}
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-surface-elevated/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase block">
                Nutzbare Host-Adressen ({result.usableHosts.toLocaleString()} Hosts)
              </span>
              <span className="font-medium text-foreground tabular-nums block truncate">
                {result.firstUsableHost} — {result.lastUsableHost}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-surface-elevated/60 border border-border/50">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Subnetzmaske
                </span>
                <span className="text-foreground tabular-nums">
                  {result.subnetMask}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Wildcard-Maske
                </span>
                <span className="text-foreground tabular-nums">
                  {result.wildcardMask}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground px-1">
              <span>
                Blockgröße: <strong className="text-foreground">{result.magicNumber}</strong> (Oktett {result.interestingOctet})
              </span>
              <span>
                {result.ipClass} • {result.isPrivate ? "Privat" : "Öffentlich"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {result.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
