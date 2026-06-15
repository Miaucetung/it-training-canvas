import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase-Client mocken (Query-Builder-Kette) ──────────────
const maybeSingle = vi.fn();
const single = vi.fn();
const selectAfterUpsert = vi.fn(() => ({ single }));
const eq = vi.fn(() => ({ maybeSingle }));
const selectAfterFrom = vi.fn(() => ({ eq }));
const upsert = vi.fn(() => ({ select: selectAfterUpsert }));
const from = vi.fn((_table: string) => ({ select: selectAfterFrom, upsert }));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: (table: string) => from(table) },
}));

import { getProfile, updateDisplayName } from "@/lib/profile";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getProfile", () => {
  it("liefert das Profil bei Erfolg", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "u1", display_name: "Max", updated_at: "2026-06-15T00:00:00Z" },
      error: null,
    });
    const p = await getProfile("u1");
    expect(from).toHaveBeenCalledWith("profiles");
    expect(eq).toHaveBeenCalledWith("id", "u1");
    expect(p?.display_name).toBe("Max");
  });

  it("liefert null, wenn kein Profil existiert", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await getProfile("u1")).toBeNull();
  });

  it("liefert null bei DB-Fehler (leise)", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await getProfile("u1")).toBeNull();
  });

  it("liefert null, wenn die Query wirft", async () => {
    maybeSingle.mockRejectedValue(new Error("network"));
    expect(await getProfile("u1")).toBeNull();
  });
});

describe("updateDisplayName", () => {
  it("speichert den getrimmten Namen und gibt das Profil zurück", async () => {
    single.mockResolvedValue({
      data: { id: "u1", display_name: "Erika", updated_at: "x" },
      error: null,
    });
    const { profile, error } = await updateDisplayName("u1", "  Erika  ");
    expect(upsert).toHaveBeenCalledWith(
      { id: "u1", display_name: "Erika" },
      { onConflict: "id" },
    );
    expect(profile?.display_name).toBe("Erika");
    expect(error).toBeNull();
  });

  it("schreibt null, wenn der Name leer ist", async () => {
    single.mockResolvedValue({ data: { id: "u1", display_name: null, updated_at: "x" }, error: null });
    await updateDisplayName("u1", "   ");
    expect(upsert).toHaveBeenCalledWith(
      { id: "u1", display_name: null },
      { onConflict: "id" },
    );
  });

  it("liefert die Fehlermeldung bei DB-Fehler", async () => {
    single.mockResolvedValue({ data: null, error: { message: "denied" } });
    const { profile, error } = await updateDisplayName("u1", "X");
    expect(profile).toBeNull();
    expect(error).toBe("denied");
  });
});
