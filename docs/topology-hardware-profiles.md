# CCNA 200-301: Hardware-Profile & Schnittstellen-Standards (Packet Tracer Standard)

Dieses Dokument definiert die realistischen Cisco-Hardware-Profile, abgestimmt auf gängige Cisco Packet Tracer Modelle (Cisco 2911, Catalyst 2960-24TT, Catalyst 3650-24PS).

---

## 1. Cisco 2911 Integrated Services Router (`router`)

- **Modell-Referenz:** Cisco 2911 Integrated Services Router (Packet Tracer Standard-Router)
- **Standard-Schnittstellen:**
  - `Gi0/0` (GigabitEthernet - LAN Default Gateway / Router-on-a-Stick Trunk)
  - `Gi0/1` (GigabitEthernet - WAN / Point-to-Point Transit / ISP)
  - `Gi0/2` (GigabitEthernet - Zusätzliches Routed LAN/DMZ)
  - `Se0/1/0` (Serial WAN WIC-2T - HDLC / PPP Punkt-zu-Punkt)
  - `Se0/1/1` (Serial WAN WIC-2T - Sekundäre serielle Leitung)
  - `Lo0` (Loopback 0, Management / OSPF Router-ID `1.1.1.1/32`)

---

## 2. Cisco Catalyst 2960-24TT (`switch-l2`)

- **Modell-Referenz:** Cisco Catalyst 2960-24TT Enterprise L2 Switch (24x FastEthernet + 2x GigabitEthernet Uplinks)
- **Standard-Schnittstellen:**
  - `Fa0/1` bis `Fa0/4` (FastEthernet Access/Trunk Ports für Endgeräte und Server)
  - `Gi0/1`, `Gi0/2` (GigabitEthernet Uplink/Trunk Ports zu Core-Switches / Routern)
  - `Vlan1` (Switched Virtual Interface - SVI Management IP)

---

## 3. Cisco Catalyst 3650-24PS Multilayer Switch (`switch-l3`)

- **Modell-Referenz:** Cisco Catalyst 3650-24PS Multilayer Switch (L2 Switching + Hardware-Routing)
- **Standard-Schnittstellen:**
  - `Gi1/0/1` bis `Gi1/0/4` (GigabitEthernet Routed Ports oder Switchports)
  - `Vlan10` (SVI Default Gateway für VLAN 10)
  - `Vlan20` (SVI Default Gateway für VLAN 20)
  - `Lo0` (Loopback Management)

---

## 4. Cisco Catalyst 9115 / Aironet 2800 (`access-point`)

- **Modell-Referenz:** Cisco Catalyst 9115 Wi-Fi 6 Access Point
- **Standard-Schnittstellen:**
  - `Gi0` (PoE+ Gigabit Uplink zum Switch - kabelgebunden)
  - `Radio0` (2.4 GHz 802.11b/g/n/ax WLAN Funknetz)
  - `Radio1` (5 GHz 802.11a/n/ac/ax WLAN Funknetz)

---

## 5. Cisco Catalyst 9800-L / 3504 Wireless Controller (`wlc`)

- **Modell-Referenz:** Cisco Catalyst 9800-L Wireless Controller
- **Standard-Schnittstellen:**
  - `Gi1` (Distribution Trunk Port zum Switch für CAPWAP-Tunnel)
  - `Gi2` (Redundancy Port - High Availability SSO)
  - `mgmt0` (Service Port - Out-of-Band Management)
    > [!IMPORTANT]
    > Ein WLC besitzt **keine Funkantennen**. Er steuert Access Points zentral über das Netzwerk via CAPWAP über Ethernet.

---

## 6. Cisco ASA 5506-X Security Appliance (`firewall`)

- **Modell-Referenz:** Cisco ASA 5506-X with FirePOWER Services
- **Standard-Schnittstellen:**
  - `Gi1/1` (Inside - LAN Sicherheitszone)
  - `Gi1/2` (Outside - Internet Sicherheitszone)
  - `Gi1/3` (DMZ - Demilitarized Zone für Web-/Mail-Server)
  - `mgmt0` (Dedizierter OOB Management Port)

---

## 7. Endgeräte, Server & Cloud (`pc`, `laptop`, `server`, `cloud`)

- **`pc` (Desktop Workstation):**
  - `eth0` (Gigabit NIC)
  - `wlan0` (802.11 Wi-Fi Client Adapter)
- **`laptop` (Mobiler Client):**
  - `wlan0` (802.11 Wi-Fi Client Adapter - Standard primär)
  - `eth0` (Gigabit NIC Docking-Port)
- **`server` (Dual-NIC Server):**
  - `eth0` (Primary Production LAN)
  - `eth1` (Secondary / Storage NIC)
- **`cloud` (WAN Service Provider / Frame Relay / Internet):**
  - `Serial0` (Serial WAN Provider Port)
  - `Serial1` (Serial WAN Provider Port)
  - `Ethernet0` (ISP Gigabit Handoff)

