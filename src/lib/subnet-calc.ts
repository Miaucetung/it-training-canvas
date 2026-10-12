// ============================================================
// Subnet Quick Calculator Logic (CCNA 200-301)
// Pure, deterministic subnet math with full CCNA-compliant details:
// Network IP, Broadcast, Host Range, Usable Host Count, Mask,
// Wildcard Mask, Magic Number (Block Size), and Binary strings.
// ============================================================

export interface SubnetCalculationResult {
  input: string;
  ip: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  usableHosts: number;
  totalAddresses: number;
  subnetMask: string;
  wildcardMask: string;
  magicNumber: number; // Block size in interesting octet
  interestingOctet: number; // 1-indexed (1, 2, 3, 4)
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
  broadcastBinary: string;
  ipClass: "A" | "B" | "C" | "D (Multicast)" | "E (Experimental)";
  isPrivate: boolean;
  isValid: true;
}

export interface SubnetCalculationError {
  input: string;
  isValid: false;
  errorMessage: string;
}

export type SubnetResult = SubnetCalculationResult | SubnetCalculationError;

function octetToBinary8(n: number): string {
  return n.toString(2).padStart(8, "0");
}

function intToIpv4(int: number): string {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join(".");
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => {
    if (!/^\d+$/.test(p)) return -1;
    const n = Number(p);
    return n >= 0 && n <= 255 ? n : -1;
  });
  if (nums.some((n) => n === -1)) return null;
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

export function calculateSubnet(input: string): SubnetResult {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return {
      input: trimmed,
      isValid: false,
      errorMessage:
        "Bitte eine IPv4-Adresse mit CIDR-Maske eingeben (z. B. 192.168.10.77/27).",
    };
  }

  const slashIdx = trimmed.indexOf("/");
  let ipPart = trimmed;
  let cidrPart = "24";

  if (slashIdx !== -1) {
    ipPart = trimmed.substring(0, slashIdx).trim();
    cidrPart = trimmed.substring(slashIdx + 1).trim();
  }

  if (!/^\d{1,2}$/.test(cidrPart)) {
    return {
      input: trimmed,
      isValid: false,
      errorMessage: `Ungültige CIDR-Präfixlänge: "/${cidrPart}". Erlaubt sind /0 bis /32.`,
    };
  }

  const cidr = Number(cidrPart);
  if (cidr < 0 || cidr > 32) {
    return {
      input: trimmed,
      isValid: false,
      errorMessage: `CIDR-Präfix /${cidr} außerhalb des gültigen Bereichs (0 bis 32).`,
    };
  }

  const ipInt = ipv4ToInt(ipPart);
  if (ipInt === null) {
    return {
      input: trimmed,
      isValid: false,
      errorMessage: `Ungültige IPv4-Adresse: "${ipPart}". Erwartet: 4 Oktette zwischen 0 und 255.`,
    };
  }

  // 32-Bit Mask integer
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardInt = ~maskInt >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalAddresses = Math.pow(2, 32 - cidr);

  // Usable Hosts handling (RFC 3021 for /31, Host route for /32)
  let usableHosts = 0;
  let firstUsableInt = networkInt;
  let lastUsableInt = broadcastInt;

  if (cidr === 32) {
    usableHosts = 1;
    firstUsableInt = networkInt;
    lastUsableInt = networkInt;
  } else if (cidr === 31) {
    usableHosts = 2; // P2P RFC 3021
    firstUsableInt = networkInt;
    lastUsableInt = broadcastInt;
  } else if (cidr === 0) {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableInt = 1;
    lastUsableInt = 0xfffffffe >>> 0;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
  }

  const ipOctets = [
    (ipInt >>> 24) & 0xff,
    (ipInt >>> 16) & 0xff,
    (ipInt >>> 8) & 0xff,
    ipInt & 0xff,
  ];
  const maskOctets = [
    (maskInt >>> 24) & 0xff,
    (maskInt >>> 16) & 0xff,
    (maskInt >>> 8) & 0xff,
    maskInt & 0xff,
  ];
  const netOctets = [
    (networkInt >>> 24) & 0xff,
    (networkInt >>> 16) & 0xff,
    (networkInt >>> 8) & 0xff,
    networkInt & 0xff,
  ];
  const bcastOctets = [
    (broadcastInt >>> 24) & 0xff,
    (broadcastInt >>> 16) & 0xff,
    (broadcastInt >>> 8) & 0xff,
    broadcastInt & 0xff,
  ];

  // Interesting octet (1..4) & magic number (block size)
  let interestingOctet = 4;
  let magicNumber = 1;
  if (cidr <= 8) {
    interestingOctet = 1;
    magicNumber = Math.pow(2, 8 - cidr);
  } else if (cidr <= 16) {
    interestingOctet = 2;
    magicNumber = Math.pow(2, 16 - cidr);
  } else if (cidr <= 24) {
    interestingOctet = 3;
    magicNumber = Math.pow(2, 24 - cidr);
  } else {
    interestingOctet = 4;
    magicNumber = Math.pow(2, 32 - cidr);
  }

  // IP Class determination (First octet)
  const firstOctet = ipOctets[0];
  let ipClass: SubnetCalculationResult["ipClass"] = "C";
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = "A";
  else if (firstOctet === 127)
    ipClass = "A"; // Loopback
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = "B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "D (Multicast)";
  else if (firstOctet >= 240) ipClass = "E (Experimental)";

  // RFC 1918 Private Address check
  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 && ipOctets[1] >= 16 && ipOctets[1] <= 31) ||
    (firstOctet === 192 && ipOctets[1] === 168);

  return {
    input: trimmed,
    ip: intToIpv4(ipInt),
    cidr,
    networkAddress: intToIpv4(networkInt),
    broadcastAddress: intToIpv4(broadcastInt),
    firstUsableHost: intToIpv4(firstUsableInt),
    lastUsableHost: intToIpv4(lastUsableInt),
    usableHosts,
    totalAddresses,
    subnetMask: intToIpv4(maskInt),
    wildcardMask: intToIpv4(wildcardInt),
    magicNumber,
    interestingOctet,
    ipBinary: ipOctets.map(octetToBinary8).join("."),
    maskBinary: maskOctets.map(octetToBinary8).join("."),
    networkBinary: netOctets.map(octetToBinary8).join("."),
    broadcastBinary: bcastOctets.map(octetToBinary8).join("."),
    ipClass,
    isPrivate,
    isValid: true,
  };
}

/** Random realistic CCNA subnet generator for training */
const SAMPLE_SUBNETS = [
  "192.168.10.77/27",
  "10.0.4.150/22",
  "172.16.55.20/26",
  "192.168.1.130/28",
  "10.200.1.5/30",
  "172.20.100.45/23",
  "192.168.50.88/25",
  "10.10.10.14/29",
  "172.16.1.1/24",
  "192.168.100.2/31",
];

export function getRandomSampleSubnet(current = ""): string {
  const filtered = SAMPLE_SUBNETS.filter((s) => s !== current);
  return (
    filtered[Math.floor(Math.random() * filtered.length)] || "192.168.10.77/27"
  );
}
