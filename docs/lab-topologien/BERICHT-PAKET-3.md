# Lab-Topologien — Paket 3 (IPv6): Bericht

Branch `feature/lab-topologies-ipv6` (von `main` @ `c6999e7`). Nicht gemergt.
Neue Topologien (4): **ipv6, ipv6-static, ospfv3-ipv6, ipv6-ospfv3-eigrpv6**.
Lint 0 Fehler (48 Warnungen wie vorher), **999 Tests in 56 Dateien grün** (vorher 918 / 55), Build grün, Layout-Audit: 0 Überlappungen, 0 Zonen-Konflikte, 0 Raster-Abweichungen in allen 23 Labs.

## 1. Neu im Fundament

| Baustein | Inhalt |
|---|---|
| IPv6-Modell | `TopologyInterface.ipv6` (Adresse/Präfix), `DeviceConfig.defaultGatewayV6`; Schema ergänzt. Canvas: IPv6 im Gerätebadge (Detail), im Inspector und in der Beschreibung |
| Konverter | liest `ipv6 address`, `ipv6 unicast-routing`, `ipv6 ospf N area A`, `ipv6 router ospf/eigrp`, `router-id`, `passive-interface`, Desktop-Zeilen `IPv6 Address/Gateway`; Loopbacks. Fehlt bei einem PC die Desktop-Zeile, wird die Adresse aus dem Geräte-Label des Labs gelesen (nur ipv6-ospfv3-eigrpv6) |
| Protokolle | `OSPFv3 1 Area 0` und `EIGRPv6 1` als Routing-Protokoll am Gerät. Der OSPFv2-Code (Nachbarn, `show ip ospf neighbor`) ignoriert sie bewusst |
| Hardware | Profil „2911 mit zweiter HWIC-2T“ (`Se0/1/0`, `Se0/1/1`) für ipv6-static, Modellname `Cisco 2911 · 2×HWIC-2T`; `S0/0/0` wird als `Se0/0/0` erkannt |
| Tabelle | Spalte „Subnetzmaske / Präfix“; bei IPv6 steht das Präfix (`/64`, `/127`, `/128`) dort |
| Tests | datengetrieben um IPv6 erweitert (Adresse+Präfix gegen Befehle/Desktop/Label, Verbindungszeilen mit IPv6-Zusatz, Startzustand ohne IPv6); neue Datei `lab-ipv6-topologies.test.ts` (5 Prüfungen) |

## 2. Die Labs

| Lab | Geräte | Links | Besonderheit |
|---|---|---|---|
| ipv6 | 2 R, 2 PC | 3 | PCs direkt am Router (Cross-Kabel), statische IPv6-Routen im CLI-Export |
| ipv6-static | Internet, R1-1, R2-1 | 2 (Serial) | Loopbacks (/128) nur in der Tabelle; Internet-Seite ohne Adresse |
| ospfv3-ipv6 | 2 R, 2 PC | 3 | OSPFv3 Area 0, Router-IDs 1.1.1.1 / 2.2.2.2, LAN passive |
| ipv6-ospfv3-eigrpv6 | 3 R, 3 PC | 6 | /127-Backbone-Dreieck, OSPFv3 + EIGRPv6; R1–R3-Link über Zwischenpunkte oberhalb der Router |

## 3. Offene Punkte

- **Keine IPv6-Nachbarschaften und keine `show ipv6`-Ausgaben.** `show ip ospf neighbor` wird für OSPFv3-Router nicht erzeugt (kein falscher v2-Inhalt). Link-Local-Adressen und DR/BDR in v3 sind nicht berechnet; das wäre eine eigene Funktion (Link-Local ist im Lab nicht angegeben).
- **ipv6-static:** Ziel `2001:DB8:CCAF:254::1/128` ist im Lab keinem Gerät zugeordnet; Internet-Seite der Serial-Links nicht konfiguriert (nur Next-Hop `…::1`). Siehe `KORREKTURVORSCHLAEGE-LABTEXT.md`, Abschnitt 9.
- **ipv6-ospfv3-eigrpv6:** PC-Gateway im Lab nicht angegeben; Tabelle sagt „im Lab nicht angegeben“.
- Keine angenommenen Switch-Ports in diesem Paket (keine Switches).

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

**ipv6, ospfv3-ipv6.** Gut: gleiche ruhige Struktur wie die Routing-Labs, IPv6-Adressen ohne Präfix an den Links, Zonen mit Netzadresse. Schwach: die Adress-Labels sind breit (bis ca. 100 px), dadurch große Port-Abstände.

**ipv6-static.** Gut: Serial-Links rot, Internet oben, zwei Standorte. Schwach: die Internet-Seite zeigt keine Adresse (bewusst); Loopbacks sieht man nur in der Tabelle; die langen Adressen (`2001:DB8:CCA1:1::2`) machen die Labels breit.

**ipv6-ospfv3-eigrpv6.** Gut: Dreieck als Zeile mit Bogen oben, keine Kreuzungen. Schwach: der Bogenlink R1–R3 liegt dicht am oberen Rand; die Beschriftung „OSPFv3 + EIGRPv6“ steht nur in der Tabelle, nicht am Link.

**Alle.** Wie in den Paketen davor: im Canvas fehlt der Modelltext am Gerät, IPv6 erscheint bei mehr als zwei Interfaces nur für die ersten zwei im Badge.

## 5. Weitere Änderungen in dieser Runde

- Inspector (`show ip ospf neighbor`, Broadcast-Segment): Hinweis „DR-Wahl ist nicht präemptiv. Angezeigt ist das Ergebnis bei gleichzeitigem Start; in Packet Tracer kann der DR abweichen (clear ip ospf process).“
- Screenshots aller 23 Labs (Paket 1–3) mit dem neuen Dialog-Layout neu erzeugt.
