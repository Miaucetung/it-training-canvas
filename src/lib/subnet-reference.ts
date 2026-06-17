// ============================================================
// IPv4 Subnetting-Referenz — deterministisch generierte Tabellen.
// Pure Funktionen (keine React-Abhängigkeit), damit testbar.
// ============================================================

export interface CidrRow {
  cidr: number; // 0..32
  mask: string; // 255.255.255.0
  maskBinary: string; // 11111111.11111111.11111111.00000000
  wildcard: string; // 0.0.0.255
  /** Gesamtzahl Adressen im Block = 2^(32-cidr) (= "Blockgröße"). */
  blockSize: number;
  /** Nutzbare Hosts: /31 = 2 (P2P, RFC 3021), /32 = 1, sonst block-2. */
  usableHosts: number;
  /** Anzahl Subnetze dieser Größe innerhalb eines /24 (nur sinnvoll für cidr>=24). */
  subnetsPerClassC: number | null;
}

/** Wandelt eine CIDR-Präfixlänge in die 32-Bit-Maske (als 4 Oktette). */
export function cidrToOctets(cidr: number): [number, number, number, number] {
  // Linksshift statt Rechtsshift, um den JS-Fallstrick bei /32 zu vermeiden
  // (>>> 32 entspricht >>> 0). /0 wird explizit als 0 behandelt.
  const m = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return [
    (m >>> 24) & 0xff,
    (m >>> 16) & 0xff,
    (m >>> 8) & 0xff,
    m & 0xff,
  ];
}

export function octetsToString(o: number[]): string {
  return o.join(".");
}

function octetToBin(n: number): string {
  return n.toString(2).padStart(8, "0");
}

/** Eine vollständige Zeile für eine CIDR-Länge. */
export function cidrRow(cidr: number): CidrRow {
  const octs = cidrToOctets(cidr);
  const wild = octs.map((o) => 255 - o);
  const hostBits = 32 - cidr;
  const blockSize = Math.pow(2, hostBits); // bis 2^32
  const usableHosts =
    cidr === 32 ? 1 : cidr === 31 ? 2 : blockSize - 2;
  const subnetsPerClassC = cidr >= 24 ? Math.pow(2, cidr - 24) : null;
  return {
    cidr,
    mask: octetsToString(octs),
    maskBinary: octs.map(octetToBin).join("."),
    wildcard: octetsToString(wild),
    blockSize,
    usableHosts,
    subnetsPerClassC,
  };
}

/** Vollständige CIDR-Tabelle /0 … /32. */
export function cidrTable(): CidrRow[] {
  return Array.from({ length: 33 }, (_, i) => cidrRow(i));
}

// ── Magic-Number / Block-Größen-Tabelle (letztes Oktett) ──────
export interface BlockRow {
  blockSize: number; // 256,128,…,1
  cidr: number; // /24…/32
  maskOctet: number; // 0,128,192,…,255
  maskOctetBinary: string; // 8-Bit
  mask: string; // 255.255.255.x
  usableHosts: number;
}

/**
 * Block-Größen von 256 bis 1 (entspricht /24 bis /32) — die klassische
 * "Magic Number"-Tabelle fürs Subnetting im letzten Oktett.
 */
export function blockSizeTable(): BlockRow[] {
  const rows: BlockRow[] = [];
  for (let cidr = 24; cidr <= 32; cidr++) {
    const hostBits = 32 - cidr;
    const blockSize = Math.pow(2, hostBits);
    const maskOctet = 256 - blockSize;
    const usableHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : blockSize - 2;
    rows.push({
      blockSize,
      cidr,
      maskOctet,
      maskOctetBinary: octetToBin(maskOctet),
      mask: `255.255.255.${maskOctet}`,
      usableHosts,
    });
  }
  return rows;
}

// ── Dezimal ↔ Binär Referenz für ein Oktett (0..255) ──────────
export interface OctetRow {
  dec: number;
  bin: string; // 8-Bit
  /** true, wenn dieser Wert eine gültige zusammenhängende Subnetzmaske ist. */
  isMaskOctet: boolean;
}

const MASK_OCTETS = new Set([0, 128, 192, 224, 240, 248, 252, 254, 255]);

export function octetTable(): OctetRow[] {
  return Array.from({ length: 256 }, (_, d) => ({
    dec: d,
    bin: octetToBin(d),
    isMaskOctet: MASK_OCTETS.has(d),
  }));
}
