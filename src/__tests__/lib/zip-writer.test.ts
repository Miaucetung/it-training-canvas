import { describe, it, expect } from "vitest";
import { createZip } from "@/lib/zip-writer";

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function readU32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(
    0,
    true,
  );
}

describe("zip-writer", () => {
  it("erzeugt valide ZIP-Signaturen (Local Header, Central Dir, EOCD)", async () => {
    const blob = createZip([
      { name: "README.txt", content: "hello" },
      { name: "R1.ios.txt", content: "enable\nconfigure terminal\n" },
    ]);
    const bytes = await blobToBytes(blob);

    // Local file header am Anfang
    expect(readU32(bytes, 0)).toBe(0x04034b50);
    // EOCD am Ende (22 Bytes, kein Kommentar)
    expect(readU32(bytes, bytes.length - 22)).toBe(0x06054b50);
    // Eintragszahl im EOCD
    const eocd = new DataView(
      bytes.buffer,
      bytes.byteOffset + bytes.length - 22,
      22,
    );
    expect(eocd.getUint16(10, true)).toBe(2);
    // Central Directory Signatur an der im EOCD angegebenen Position
    const cdOffset = eocd.getUint32(16, true);
    expect(readU32(bytes, cdOffset)).toBe(0x02014b50);
  });

  it("berechnet korrekten CRC32 (bekannter Testvektor)", async () => {
    // CRC32("hello") = 0x3610A686
    const blob = createZip([{ name: "a", content: "hello" }]);
    const bytes = await blobToBytes(blob);
    const crc = readU32(bytes, 14);
    expect(crc).toBe(0x3610a686);
  });

  it("speichert Inhalte unkomprimiert und auffindbar", async () => {
    const content = "ip route 0.0.0.0 0.0.0.0 192.168.1.1";
    const blob = createZip([{ name: "route.txt", content }]);
    const bytes = await blobToBytes(blob);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain(content);
    expect(text).toContain("route.txt");
  });
});
