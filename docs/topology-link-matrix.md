# CCNA 200-301: Topologie-Link & Verbindungsmatrix

Dieses Dokument definiert die vollständige Regelmatrix für physikalische und logische Verbindungen zwischen CCNA-Gerätetypen im neuen Canvas-Renderer.

---

## 1. Übersicht der Gerätetypen (10 Typen laut Schema)

| Gerätetyp (`type`) | Cisco Referenz-Hardware | Schnittstellen-Charakteristik |
| :--- | :--- | :--- |
| **`router`** | Cisco 2911 (Packet Tracer ISR) | Gi0/0, Gi0/1, Gi0/2, Se0/1/0, Se0/1/1, Lo0 |
| **`switch-l2`** | Cisco Catalyst 2960-24TT | Fa0/1–Fa0/24 (FastEthernet Access/Trunk), Gi0/1, Gi0/2, Vlan1 |
| **`switch-l3`** | Cisco Catalyst 3650-24PS Multilayer | Gi1/0/1–Gi1/0/24 (Gigabit Routed/Switchports), SVI Vlan10/20, Lo0 |
| **`firewall`** | Cisco ASA 5506-X Security Appliance | Gi1/1 (Inside), Gi1/2 (Outside), Gi1/3 (DMZ), mgmt0 |
| **`access-point`** | Cisco Catalyst 9115 Wi-Fi 6 AP | Gi0 (PoE+ Uplink kabelgebunden), Radio0 (2.4G), Radio1 (5G) |
| **`wlc`** | Cisco Catalyst 9800-L / 3504 | Gi1 (Data Trunk), Gi2 (HA), mgmt0 *(Kein Funk!)* |
| **`server`** | Dual-NIC Server | eth0 (LAN 1), eth1 (Storage SAN) |
| **`pc`** | Desktop Host Workstation | eth0 (Gigabit NIC primär), wlan0 (Wi-Fi) |
| **`laptop`** | Mobiles Endgerät | wlan0 (Wi-Fi primär), eth0 (Gigabit NIC) |
| **`cloud`** | WAN Service Provider / Internet | Serial0, Serial1, Ethernet0 |

---

## 2. Vollständige Verbindungsmatrix (Gerätetyp × Gerätetyp × Link-Typ)

| Quellgerät | Zielgerät | Erlaubte Link-Typen | Fachliche CCNA-Begründung / Restriktionen |
| :--- | :--- | :--- | :--- |
| **Router** | **Router** | `ethernet`, `serial` | Ethernet P2P Transit (`/30`) oder serielle Punkt-zu-Punkt WAN-Leitung (HDLC/PPP). |
| **Router** | **Switch L2** | `ethernet` | Router-on-a-Stick (802.1Q Subinterfaces) oder LAN-Default-Gateway. *(Serial unzulässig)*. |
| **Router** | **Switch L3** | `ethernet` | Routed Uplink (Point-to-Point Transit) mit OSPF/EIGRP. |
| **Router** | **Firewall** | `ethernet` | Übergabe an Perimeter-Firewall (Outside oder Inside Interface). |
| **Router** | **Server / PC / Laptop** | `ethernet` | Direktes LAN-Interface (Out-of-Band Management oder Single-Host-Subnetz). |
| **Router** | **Cloud** | `ethernet`, `serial` | WAN-Uplink zu ISP / Provider-Edge-Router (BGP / DHCP / Static Default Route). |
| **Switch L2** | **Switch L2** | `ethernet` | Trunking (802.1Q) mit Spanning-Tree-Topologie (Root / Designated / Blocking). |
| **Switch L2** | **Switch L3** | `ethernet` | Access- oder Trunk-Uplink zur Distribution-Schicht. |
| **Switch L2** | **Host (PC / Laptop / Server)**| `ethernet` | Access-Ports in Ziel-VLAN (VLAN 10, 20 etc.) mit PortFast/BPDU Guard. |
| **Switch L2** | **Access Point** | `ethernet` | PoE-Uplink am physischen Port `Gi0` des APs (Trunk für Multi-SSID). |
| **Switch L2 / L3** | **WLC** | `ethernet` | Distribution-Trunk für CAPWAP-Tunnel-Transport. **WLC besitzt keinen Funk!** |
| **Access Point** | **Host (PC / Laptop)** | `wireless` | **802.11 WLAN-Funkverbindung.** Nur zwischen AP-Radio und PC/Laptop-WLAN-Adapter! |
| **WLC** | *(beliebig)* | `ethernet` | **WLC wird ausschließlich kabelgebunden (Ethernet) angebunden!** Drahtlose Verbindungen mit WLC sind physikalisch unmöglich. |
| **Firewall** | **Switch / Server / PC / Laptop** | `ethernet` | Segmentierte Sicherheitszonen (Inside = LAN, DMZ = Server, Outside = WAN). |
| **Cloud** | *(beliebig)* | `ethernet`, `serial` | Provider-Handoff zu Routern oder Firewalls. |

---

## 3. CCNA-Regeln für logische Technologien (2d-3 Vorausschau)

* **802.1Q Trunk:**
  Trunk ist **kein eigenes physisches Kabel**, sondern ein logischer Port-Modus (`switchport mode trunk`) auf einem physischen Ethernet-Link.
* **EtherChannel (LACP / PAgP):**
  EtherChannel ist **kein eigenes physisches Kabel**, sondern die Bündelung von 2 bis 8 physischen Ethernet-Links (`channel-group 1 mode active`).
* **CAPWAP-Tunnel:**
  CAPWAP ist ein logischer UDP-Tunnel (Ports 5246/5247) über das bestehende Ethernet-Netzwerk zwischen AP und WLC, kein physisches Medium.
