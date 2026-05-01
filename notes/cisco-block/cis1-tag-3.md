# Tag 3 — TCP/UDP, IP, Subnetting, IP-Klassen

> Quellen: `Tag3.docx`, `01 - IP-Klassen.doc`, `03 - Subnetting_1.doc` (in Markdown konvertiert)

---

## Teil 1 — OSI-Schicht 4: TCP, UDP, 3-Wege-Handshake

### TCP
TCP ist verbindungsorientiert und garantiert die Zustellung der Daten, da jedes Segment mit einem ACK bestätigt wird. Kommt ein ACK nicht innerhalb eines Zeitraumes, wird das fehlende Segment erneut angefordert. TCP eignet sich deshalb zum Versenden großer Dateien und wenn die Zustellung garantiert sein muss.

### UDP
UDP ist verbindungslos und schickt die Daten einfach raus. Eine Bestätigung, dass die Daten angekommen sind, gibt es nicht. Es findet auch kein Windowing statt.

UDP ist sehr schnell und findet seine Anwendung in der Übertragung von Daten in Echtzeit. Hierbei muss die Anwendung einen gewissen Prozentsatz an Paketverlust eventuell hinnehmen.

### 3-Wege-Handshake (TCP)
```
Client → Server : SYN     (seq=x)
Server → Client : SYN-ACK (seq=y, ack=x+1)
Client → Server : ACK     (ack=y+1)
```

---

## Teil 2 — IP (OSI-Schicht 3)

IP sitzt auf OSI-Schicht 3 und nutzt **ICMP** als Nachrichtenboten. Die IPv4-Adresse ist eine 32-Bit-Adresse, die einen Host/Client im Netzwerk spezifiziert. Eine IPv4-Adresse besteht aus zwei Teilen:

- **Netzwerkanteil**
- **Hostanteil**

Um diese zwei Teile zu identifizieren, nutzt man die **Subnetzmaske**.

### Beispiel — 192.168.1.20 / 255.255.255.0

| 2^7 | 2^6 | 2^5 | 2^4 | 2^3 | 2^2 | 2^1 | 2^0 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| 128 | 64  | 32  | 16  | 8   | 4   | 2   | 1   |

```
IP-Adresse :  11000000.10101000.00000001.00010100   (192.168.1.20)
Subnetmaske:  11111111.11111111.11111111.00000000   (255.255.255.0)
Netz-ID    :  11000000.10101000.00000001.00000000   (192.168.1.0)
Broadcast  :  11000000.10101000.00000001.11111111   (192.168.1.255)
Host-Range :  192.168.1.1 bis 192.168.1.254
```

### RFC 1918 — private IP-Bereiche

| Klasse | Bereich                          | Anwendung      |
|--------|----------------------------------|----------------|
| A      | 10.0.0.0 – 10.255.255.255        | privat         |
| B      | 172.16.0.0 – 172.31.255.255      | privat         |
| C      | 192.168.0.0 – 192.168.255.255    | privat         |

### Subnetzmaske 255.255.255.252 (= /30)

```
11111111.11111111.11111111.11111100  =  255.255.255.252
→ 4 IP-Adressen pro Subnetz, 2 nutzbare Hosts
```

---

## Teil 3 — Übung: IP-Klassen (binär + Klasse A/B/C/D/E)

> **Hinweis:** In der Prüfung kein Taschenrechner. Binär-Schreibweise und Klasse jeweils ohne Hilfsmittel ermitteln.

### Klassen-Schwellen (Erstes Oktett)
- **A**: 1–126 (`0xxxxxxx`)
- **B**: 128–191 (`10xxxxxx`)
- **C**: 192–223 (`110xxxxx`)
- **D**: 224–239 (`1110xxxx`) — Multicast
- **E**: 240–255 (`1111xxxx`) — reserviert/experimentell

### Aufgaben

| #  | IP-Adresse        | Binär (auszufüllen) | Klasse |
|----|-------------------|---------------------|--------|
| 1  | 101.29.16.200     | _____.____.____.____ | _      |
| 2  | 172.20.0.39       | _____.____.____.____ | _      |
| 3  | 212.14.154.0      | _____.____.____.____ | _      |
| 4  | 25.246.133.37     | _____.____.____.____ | _      |
| 5  | 128.2.229.1       | _____.____.____.____ | _      |
| 6  | 192.168.5.254     | _____.____.____.____ | _      |
| 7  | 185.138.123.40    | _____.____.____.____ | _      |
| 8  | 223.255.199.80    | _____.____.____.____ | _      |
| 9  | 203.7.224.240     | _____.____.____.____ | _      |
| 10 | 198.162.13.252    | _____.____.____.____ | _      |
| 11 | 19.249.83.75      | _____.____.____.____ | _      |
| 12 | 95.127.11.239     | _____.____.____.____ | _      |
| 13 | 224.0.0.5         | _____.____.____.____ | _      |
| 14 | 134.78.45.227     | _____.____.____.____ | _      |
| 15 | 245.72.189.160    | _____.____.____.____ | _      |
| 16 | 145.23.12.24      | _____.____.____.____ | _      |
| 17 | 42.36.53.234      | _____.____.____.____ | _      |

---

## Teil 4 — Übung: Subnetz, Broadcast, Hostbereich, Magic Number

> **Beispiel-Methode (siehe Aufgabe 1):**
> - Magic Number = 256 − Subnet-Mask-Oktett (Wechseloktett)
> - Subnetz-ID = größtes Vielfaches der Magic Number ≤ Host-Oktett
> - Broadcast = nächste Subnetz-ID − 1
>
> **Beispiel zu Aufgabe 1:** `220.8.7.100 / 255.255.255.240`
> 256 − 240 = **16** → 100 / 16 = 6 (Rest) → 6 × 16 = **96** + 15 = **111**

### Aufgaben (Lösungen aus Unterricht)

#### 1) 220.8.7.100 / 255.255.255.240
| Feld | 1 | 2 | 3 | 4 |
|------|---|---|---|---|
| IP-Adresse       | 220 | 8 | 7 | 100 |
| Subnetzmaske     | 255 | 255 | 255 | 240 |
| Subnetz-ID       | 220 | 8 | 7 | **96** |
| Broadcast        | 220 | 8 | 7 | **111** |
| Erste Host-IP    | 220 | 8 | 7 | **97** |
| Letzte Host-IP   | 220 | 8 | 7 | **110** |
| Magic Number     | **16** |   |   |     |

#### 2) 177.88.77.154 / 255.255.255.224
| Feld | 1 | 2 | 3 | 4 |
|------|---|---|---|---|
| Subnetz-ID     | 177 | 88 | 77 | **128** |
| Broadcast      | 177 | 88 | 77 | **159** |
| Erste Host     | 177 | 88 | 77 | **129** |
| Letzte Host    | 177 | 88 | 77 | **158** |
| Magic Number   | **32** |    |    |     |

#### 3) 180.1.111.1 / 255.255.255.192
Subnetz-ID **180.1.111.0**, Broadcast **180.1.111.63**, Range **.1 – .62**, Magic **64**.

#### 4) 167.155.85.97 / 255.255.255.254
Subnetz-ID **167.155.85.96**, Broadcast **167.155.85.97**, Magic **2** (P2P-Variante mit /31).

#### 5) 197.99.178.212 / 255.255.255.128
Subnetz-ID **197.99.178.128**, Broadcast **197.99.178.255**, Range **.129 – .254**, Magic **128**.

#### 6) 180.45.102.1 / 255.255.192.0
Subnetz-ID **180.45.64.0**, Broadcast **180.45.127.255**, Range **180.45.64.1 – 180.45.127.254**, Magic **64**.

#### 7) 8.2.255.6 / 255.255.224.0
Subnetz-ID **8.2.224.0**, Broadcast **8.2.255.255**, Range **8.2.224.1 – 8.2.255.254**, Magic **32**.

#### 8) 200.3.53.254 / 255.255.255.224
Subnetz-ID **200.3.53.224**, Broadcast **200.3.53.255**, Range **.225 – .254**, Magic **32**.

#### 9) 3.56.70.99 / 255.192.0.0
Subnetz-ID **3.0.0.0**, Broadcast **3.63.255.255**, Range **3.0.0.1 – 3.63.255.254**, Magic **64**.

#### 10) 32.123.245.22 / 255.255.192.0
Subnetz-ID **32.123.192.0**, Broadcast **32.123.255.255**, Range **32.123.192.1 – 32.123.255.254**, Magic **64**.

#### 11) 172.25.45.154 / 255.255.252.0
Subnetz-ID **172.25.44.0**, Broadcast **172.25.47.255**, Range **172.25.44.1 – 172.25.47.254**, Magic **4**.

#### 12) 77.33.145.99 / 255.255.224.0
Subnetz-ID **77.33.128.0**, Broadcast **77.33.159.255**, Range **77.33.128.1 – 77.33.159.254**, Magic **32**.

#### 13) 218.212.85.192 / 255.255.255.192
Subnetz-ID **218.212.85.192**, Broadcast **218.212.85.255**, Range **.193 – .254**, Magic **64**.

#### 14) 20.56.160.80 / 255.254.0.0
Subnetz-ID **20.56.0.0**, Broadcast **20.57.255.255**, Range **20.56.0.1 – 20.57.255.254**, Magic **2**.

#### 15) 10.1.98.199 / 255.255.224.0
Subnetz-ID **10.1.96.0**, Broadcast **10.1.127.255**, Range **10.1.96.1 – 10.1.127.254**, Magic **32**.

#### 16) 172.21.172.78 / 255.255.240.0
Subnetz-ID **172.21.160.0**, Broadcast **172.21.175.255**, Range **172.21.160.1 – 172.21.175.254**, Magic **16**.

#### 17) 133.33.158.31 / 255.255.248.0
Subnetz-ID **133.33.152.0**, Broadcast **133.33.159.255**, Range **133.33.152.1 – 133.33.159.254**, Magic **8**.

#### 18) 206.7.32.156 / 255.255.255.248
Subnetz-ID **206.7.32.152**, Broadcast **206.7.32.159**, Range **.153 – .158**, Magic **8**.

#### 19) 192.168.78.189 / 255.255.255.240
Subnetz-ID **192.168.78.176**, Broadcast **192.168.78.191**, Range **.177 – .190**, Magic **16**.

---

## Lerntransfer / TODO

- ✅ In das CCNA-Modul eingearbeitet: V1 (Netzarten), V2 (funktionale Klassifikation), V3 (Vorteile von Netzwerken), V4 (Linie+Baum-Topologie), V5 (Layer-3-Switch), V6 (Bandbreite/Durchsatz/Latenz), V7 (RFC), V8 (Binär-Drill), V9 (Klassen-Verifikation), V10 (Quiz-Erweiterung).
- ✅ Interaktiver Subnetting-Drill (30 generierte Aufgaben) — neue Komponente in der App, erreichbar aus dem Topic „IPv4-Adressierung & Subnetting".
