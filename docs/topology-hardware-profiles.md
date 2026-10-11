# CCNA 200-301: Hardware-Profile & Schnittstellen-Standards

Dieses Dokument definiert die realistischen Cisco-Hardware-Profile, die beim Erzeugen neuer Geräte im Canvas initialisiert werden.

---

## 1. Cisco ISR 4321 / ISR 4000 Serie (`router`)
* **Modell-Referenz:** Cisco ISR 4321 Integrated Services Router (Modular Gigabit WAN Router)
* **Standard-Schnittstellen:**
  * `Gi0/0/0` (GigabitEthernet - WAN/Internet, standardmäßig routed)
  * `Gi0/0/1` (GigabitEthernet - LAN Gateway / Router-on-a-Stick Trunk)
  * `Gi0/0/2` (GigabitEthernet / SFP Combo Port)
  * `Lo0` (Loopback 0, Management / OSPF Router-ID `1.1.1.1/32`)

---

## 2. Cisco Catalyst 2960-X / 9200-24T (`switch-l2`)
* **Modell-Referenz:** Cisco Catalyst 2960-X Enterprise L2 Switch (24x Gigabit Access + SFP Uplinks)
* **Standard-Schnittstellen:**
  * `Gi0/1` bis `Gi0/8` (GigabitEthernet Access/Trunk Ports für Endgeräte und Server)
  * `Gi0/23`, `Gi0/24` (GigabitEthernet Uplink Ports zu Core-Switchen / Routern)
  * `Vlan1` (Switched Virtual Interface - SVI Management IP)

---

## 3. Cisco Catalyst 3650 / 3850 Multilayer Switch (`switch-l3`)
* **Modell-Referenz:** Cisco Catalyst 3650-24TS Multilayer Switch (L2 Switching + Hardware-Routing)
* **Standard-Schnittstellen:**
  * `Gi1/0/1` bis `Gi1/0/8` (GigabitEthernet Routed oder Switchports)
  * `Vlan10` (SVI Default Gateway für VLAN 10)
  * `Vlan20` (SVI Default Gateway für VLAN 20)
  * `Lo0` (Loopback Management)

---

## 4. Cisco Catalyst 9100 / Aironet 2800 (`access-point`)
* **Modell-Referenz:** Cisco Catalyst 9115 Wi-Fi 6 Access Point
* **Standard-Schnittstellen:**
  * `GigabitEthernet0` (mGig PoE+ Uplink zum Switch - kabelgebunden)
  * `Radio0` (2.4 GHz 802.11b/g/n/ax WLAN Funknetz)
  * `Radio1` (5 GHz 802.11a/n/ac/ax WLAN Funknetz)

---

## 5. Cisco Catalyst 9800-L / 3504 Controller (`wlc`)
* **Modell-Referenz:** Cisco Catalyst 9800-L Wireless Controller
* **Standard-Schnittstellen:**
  * `GigabitEthernet1` (Service Port - Out-of-Band Management)
  * `GigabitEthernet2` (Distribution Port - 802.1Q Trunk zum Switch für CAPWAP-Tunnel)
  * `GigabitEthernet3` (Redundancy Port - High Availability SSO)
  > [!IMPORTANT]
  > Ein WLC besitzt **keine Funkantennen**. Er steuert Access Points zentral über das Netzwerk via CAPWAP.

---

## 6. Cisco ASA 5506-X / Secure Firewall 1000 (`firewall`)
* **Modell-Referenz:** Cisco ASA 5506-X with FirePOWER Services
* **Standard-Schnittstellen:**
  * `GigabitEthernet1/1` (Inside - LAN Sicherheitszone)
  * `GigabitEthernet1/2` (Outside - Internet Sicherheitszone)
  * `GigabitEthernet1/3` (DMZ - Demilitarized Zone für Web-/Mail-Server)
  * `Management1/1` (Dedizierter OOB Management Port)

---

## 7. Endgeräte & Server (`pc`, `server`, `cloud`)
* **`pc` (Client Host / Laptop):**
  * `eth0` (Gigabit NIC)
  * `wlan0` (802.11 Wi-Fi Client Adapter)
* **`server` (Dual-NIC Server):**
  * `eth0` (Primary Production LAN)
  * `eth1` (Secondary / Storage NIC)
* **`cloud` (WAN Service Provider / Internet):**
  * `GigabitEthernet0/0` (ISP Gateway)
  * `GigabitEthernet0/1` (Customer Handoff)
