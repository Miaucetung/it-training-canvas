# CCNA 200-301: Topologie-Link & Verbindungsmatrix

Dieses Dokument definiert die vollständige Regelmatrix für physikalische und logische Verbindungen zwischen CCNA-Gerätetypen im neuen Canvas-Renderer.

---

## 1. Übersicht der Gerätetypen (9 Typen laut Schema)

| Gerätetyp (`type`) | Cisco Referenz-Hardware | Schnittstellen-Charakteristik |
| :--- | :--- | :--- |
| **`router`** | Cisco ISR 4321 / ISR 4000 | GigabitEthernet (Routed), Serial WAN WIC, Loopback |
| **`switch-l2`** | Cisco Catalyst 2960-X / 9200-24T | 24x FastEthernet/Gigabit Access/Trunk, SVI Vlan1 |
| **`switch-l3`** | Cisco Catalyst 3650 / 3850 Multilayer | Gigabit Routed / Switchports, SVI Gateways (VLAN 10/20) |
| **`firewall`** | Cisco ASA 5506-X / Secure Firewall 1000 | Gigabit (Inside, Outside, DMZ), Management |
| **`access-point`** | Cisco Catalyst 9100 / Aironet 2800 | GigabitEthernet0 (PoE Uplink), Radio0 (2.4G), Radio1 (5G) |
| **`wlc`** | Cisco Catalyst 9800-L / 3504 Controller | Gigabit Distribution/Trunk, Service Port *(Kein Funk!)* |
| **`server`** | Dual-NIC Server | Gigabit eth0 (LAN), eth1 (Backup/SAN) |
| **`pc`** | Host Client (PC / Laptop) | eth0 (Gigabit NIC), wlan0 (Wi-Fi Client) |
| **`cloud`** | WAN Service Provider / Internet | Gigabit ISP Gateway, WAN Handoff |

---

## 2. Vollständige Verbindungsmatrix (Gerätetyp × Gerätetyp × Link-Typ)

| Quellgerät | Zielgerät | Erlaubte Link-Typen | Fachliche CCNA-Begründung / Restriktionen |
| :--- | :--- | :--- | :--- |
| **Router** | **Router** | `ethernet`, `serial` | Ethernet P2P Transit (`/30`) oder serielle Punkt-zu-Punkt WAN-Leitung (HDLC/PPP). |
| **Router** | **Switch L2** | `ethernet` | Router-on-a-Stick (802.1Q Subinterfaces) oder LAN-Default-Gateway. *(Serial unzulässig)*. |
| **Router** | **Switch L3** | `ethernet` | Routed Uplink (Point-to-Point Transit) mit OSPF/EIGRP. |
| **Router** | **Firewall** | `ethernet` | Übergabe an Perimeter-Firewall (Outside oder Inside Interface). |
| **Router** | **Server / PC** | `ethernet` | Direktes LAN-Interface (Out-of-Band Management oder Single-Host-Subnetz). |
| **Router** | **Cloud** | `ethernet`, `serial` | WAN-Uplink zu ISP / Provider-Edge-Router (BGP / DHCP / Static Default Route). |
| **Switch L2** | **Switch L2** | `ethernet` | Trunking (802.1Q) mit Spanning-Tree-Topologie (Root / Designated / Blocking). |
| **Switch L2** | **Switch L3** | `ethernet` | Access- oder Trunk-Uplink zur Distribution-Schicht. |
| **Switch L2** | **Host (PC / Server)**| `ethernet` | Access-Ports in Ziel-VLAN (VLAN 10, 20 etc.) mit PortFast/BPDU Guard. |
| **Switch L2** | **Access Point** | `ethernet` | PoE-Uplink am physischen Port `GigabitEthernet0` des APs (Trunk für Multi-SSID). |
| **Switch L2 / L3** | **WLC** | `ethernet` | Distribution-Trunk für CAPWAP-Tunnel-Transport. **WLC besitzt keinen Funk!** |
| **Access Point** | **Host (PC)** | `wireless` | **802.11 WLAN-Funkverbindung.** Nur zwischen AP-Radio und PC/Host-WLAN-Adapter! |
| **WLC** | *(beliebig)* | `ethernet` | **WLC wird ausschließlich kabelgebunden (Ethernet) angebunden!** Drahtlose Verbindungen mit WLC sind physikalisch unmöglich. |
| **Firewall** | **Switch / Server / PC** | `ethernet` | Segmentierte Sicherheitszonen (Inside = LAN, DMZ = Server, Outside = WAN). |
| **Cloud** | *(beliebig)* | `ethernet`, `serial` | Provider-Handoff zu Routern oder Firewalls. |

---

## 3. CCNA-Regeln für logische Technologien (2d-3 Vorausschau)

* **802.1Q Trunk:**
  Trunk ist **kein eigenes physisches Kabel**, sondern ein logischer Port-Modus (`switchport mode trunk`) auf einem physischen Ethernet-Link.
* **EtherChannel (LACP / PAgP):**
  EtherChannel ist **kein eigenes physisches Kabel**, sondern die Bündelung von 2 bis 8 physischen Ethernet-Links (`channel-group 1 mode active`).
* **CAPWAP-Tunnel:**
  CAPWAP ist ein logischer UDP-Tunnel (Ports 5246/5247) über das bestehende Ethernet-Netzwerk zwischen AP und WLC, kein physisches Medium.
