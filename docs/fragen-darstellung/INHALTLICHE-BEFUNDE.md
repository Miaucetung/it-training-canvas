# Fachliche und inhaltliche Befunde in CCNA-Prüfungsfragen

**Status:** Dokumentation inhaltlicher Auffälligkeiten (Gemäß Projektauftrag nicht verändert)
**Datum:** 14. Oktober 2026
**Referenz-Dokument:** `00-FragenBeantwortetKomplett200_301.pdf` (590 Seiten)

---

## 1. Fachliche Auffälligkeiten in Routing-Tabellen, Exhibits und Fragen

Diese Fragen enthalten technische Widersprüche in den Cisco IOS CLI-Ausgaben oder Diagrammen:

### Q0466: Routing-Tabelle mit Mehrfachbelegung & unerreichbarem Next-Hop
- **Fragetext:** Refer to the exhibit. If OSPF is running on this network, how does Router2 handle traffic from Site B to 10.10.13.128/25 at Site A?
- **CLI-Exhibit:**
```text
Router2#show ip route
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.10.10.8/30 is directly connected, FastEthernet0/2
C        10.10.12.0/30 is directly connected, FastEthernet0/2
O        10.10.13.0/25 [110/11] via 10.10.10.9, 00:00:03, FastEthernet0/2
                       [110/11] via 10.10.10.1, 00:00:03, FastEthernet0/1
C        10.10.4.0/30 is directly connected, FastEthernet0/1
```
- **Befund:** 1. FastEthernet0/2 hat zwei directly connected Subnetze (10.10.10.8/30 und 10.10.12.0/30) ohne Subinterfaces/Secondary IPs.
  2. OSPF-Route via Next-Hop 10.10.10.1 nutzt FastEthernet0/1, an dem direkt das Netz 10.10.4.0/30 anliegt (Next-Hop gehört nicht zum Subnetz des Interfaces).
  3. Topologie-Grafik zeigt Router1/Router2 und Site A/B ohne jegliche Schnittstellen- oder Subnetzbeschriftung.

### Q0368: Drei directly connected Netze an FastEthernet0/2 & fehlendes Interface-Netz
- **Fragetext:** Refer to the exhibit. If OSPF is running on this network, how does Router2 handle traffic from Site B to 10.10.13.128/25 at Site A?
- **CLI-Exhibit:**
```text
Router2#show ip route
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.10.8.0/30 is directly connected, FastEthernet0/2
C        10.10.12.0/30 is directly connected, FastEthernet0/2
O        10.10.13.0/25 [110/11] via 10.10.10.5, FastEthernet0/1
                       [110/11] via 10.10.10.9, FastEthernet0/2
C        10.10.4.0/30 is directly connected, FastEthernet0/2
```
- **Befund:** 1. FastEthernet0/2 ist dreifach als directly connected belegt: 10.10.8.0/30, 10.10.12.0/30 und 10.10.4.0/30.
  2. OSPF-Route nutzt FastEthernet0/1 mit Next-Hop 10.10.10.5, aber FastEthernet0/1 hat kein directly connected Netz in der Tabelle.
  3. Topologie-Grafik hat keine Interface-Beschriftung.

### Q0386: Drei /24-Subnetze an FastEthernet0/0 & unangebundenes FastEthernet0/1
- **Fragetext:** Refer to the exhibit. If R1 receives a packet destined to 172.16.1.1, to which IP address does it send the packet?
- **CLI-Exhibit:**
```text
R1#show ip route
<Ausgabe gekuerzt>
Gateway of last resort is 192.168.14.4 to network 0.0.0.0

C     172.16.1.128/25 is directly connected, GigabitEthernet1/1/0
C     192.168.12.0/24 is directly connected, FastEthernet0/0
C     192.168.13.0/24 is directly connected, FastEthernet0/0
C     192.168.14.0/24 is directly connected, FastEthernet0/0
C     172.16.16.1 is directly connected, Loopback1
      192.168.10.0/24 is variably subnetted, 3 subnets, 3 masks
O     192.168.10.0/24 [110/2] via 192.168.14.4, FastEthernet0/0
O     192.168.10.32/27 [110/1] via 192.168.14.3, FastEthernet0/1
O     192.168.0.0/16 [110/2] via 192.168.15.5, FastEthernet0/1
D     192.168.10.1/32 [90/52776] via 192.168.12.2, FastEthernet0/0
O*E2  0.0.0.0/0 [110/1] via 192.168.14.4, FastEthernet0/0
```
- **Befund:** 1. Drei separate /24-Subnetze (192.168.12.0/24, 192.168.13.0/24, 192.168.14.0/24) sind alle an FastEthernet0/0 direkt angebunden.
  2. Next-Hops 192.168.14.3 und 192.168.15.5 nutzen FastEthernet0/1, für das kein direkt verbundenes Netz existiert.

### Q0387: Drei /24-Subnetze an FastEthernet0/0 (Parallele Frage zu q0386)
- **Fragetext:** Refer to the exhibit. On R1 which routing protocol is in use on the route to 192.168.10.1?
- **CLI-Exhibit:**
```text
R1#show ip route
Codes: C - connected, S - static, R - RIP, B - BGP
       D - EIGRP, O - OSPF, O*E2 - OSPF external type 2

Gateway of last resort is 192.168.14.4 to network 0.0.0.0

C     192.168.12.0/24 is directly connected, FastEthernet0/0
C     192.168.13.0/24 is directly connected, FastEthernet0/0
C     192.168.14.0/24 is directly connected, FastEthernet0/0
      192.168.10.0/24 is variably subnetted, 3 subnets, 3 masks
O     192.168.10.0/24 [110/2] via 192.168.14.4, FastEthernet0/0
O     192.168.10.32/27 [110/1] via 192.168.14.3, FastEthernet1/0
D     192.168.10.1/32 [90/52776] via 192.168.12.2, FastEthernet1/0
O*E2  0.0.0.0/0 [110/1] via 192.168.14.4, FastEthernet0/0
```
- **Befund:** Identische CLI-Routingtabelle wie q0386 mit denselben Interface-Widersprüchen.

### Q0456: Zieladresse 10.10.8.14 in Routingtabelle nicht vorhanden
- **Fragetext:** Refer to the exhibit. A packet sourced from 10.10.10.1 is destined for 10.10.8.14. What is the subnet mask of the destination route?
- **CLI-Exhibit:**
```text
R1# show ip route
Gateway of last resort is 172.16.2.2 to network 0.0.0.0
      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks
C        10.0.0.0/28 is directly connected, GigabitEthernet0/0
C        10.0.10.0/24 is directly connected, GigabitEthernet0/0
C        10.10.10.0/24 is directly connected, GigabitEthernet0/1
S*    0.0.0.0/0 [1/0] via 172.16.2.2
```
- **Befund:** Frage fragt nach Subnetzmaske für Ziel 10.10.8.14. Tabelle enthält nur 10.0.0.0/28, 10.0.10.0/24, 10.10.10.0/24 und Default Route. Lösung ist als /28 markiert und 10.0.0.0/28 hervorgehoben, matcht das Ziel jedoch nicht.

### Q0101: Tippfehler im Fragetext, fehlendes Interface fa0/1 & MAC-Verstümmelung
- **Fragetext:** Refer to the exhibit. An engineer is configuring the HO router. Which IPv6 address configuration must be applied to the router fa0/1 interface for the router to assign a unique 64-bit IPv6 address to itself?
- **Befund:** 1. Fragetext nennt 'HO router' statt 'HQ1 router'.
  2. Topologie-Grafik beschriftet Interface fa0/1 nicht.
  3. Option C verstümmelt die MAC C601.420F.2007 bei der EUI-64-Generierung zu C601:42FF:FE0F:7/64.

---

## 2. Abweichende Antwort- und Lösungsbuchstaben (31 Fälle im Vergleich zur Referenz-PDF)

In der Referenz-PDF `00-FragenBeantwortetKomplett200_301.pdf` sind die richtigen Antworten farblich (meist grün) hinterlegt. Bei folgenden 31 Fragen weicht die in der App hinterlegte Lösung davon ab:

| Fragen-ID | PDF-Seite | App-Lösung | PDF-Lösung (grün) | Fragetext |
| :--- | :---: | :---: | :---: | :--- |
| q0008 | 4 | C | A,C | In which way does a spine-and-leaf architecture allow for scalability in a network when additional a... |
| q0034 | 12 | A corporate office uses four floors in a building. ✑ Floor 1 has 24 users. ✑ Floor 2 has 29 users. Floor 3 has 28 users. | ✑ Floor 2 has 29 users. Floor 3 has 28 users. ✑ Floor 4 has 22 users. Which subnet summarizes and gives the most efficie | A corporate office uses four floors in a building. ✑ Floor 1 has 24 users. ✑ Floor 2 has 29 users. F... |
| q0145 | 53 | The address block 192.168.32.0/24 must be subnetted into smaller networks. The engineer must meet these requirements: ✑  | ✑ Each subnet must accommodate 30 hosts. ✑ Interface VLAN 10 must use the last usable IP in the first new subnet. ✑ A La | The address block 192.168.32.0/24 must be subnetted into smaller networks. The engineer must meet th... |
| q0219 | 81 | A,C,D,E | A | Which statement about Cisco Discovery Protocol is true?... |
| q0222 | 82 | B,D,E | A,B,D,E | Which three statements are typical characteristics of VLAN arrangements? (Choose three.)... |
| q0267 | 101 | A network engineer must configure two new subnets using the address block 10.70.128.0/19 to meet these requirements: ✑ T | ✑ The second subnet must support 472 hosts. ✑ Both subnets must use the longest subnet mask possible from the address bl | A network engineer must configure two new subnets using the address block 10.70.128.0/19 to meet the... |
| q0297 | 115 | A Cisco engineer must configure a single switch interface to meet these requirements: ✑ Accept untagged frames and place | Which command set must the engineer apply? | A Cisco engineer must configure a single switch interface to meet these requirements: ✑ Accept untag... |
| q0415 | 173 | B | A,B | Refer to the exhibit. A network administrator assumes a task to complete the connectivity between PC... |
| q0445 | 187 | A | A,B | Refer to the exhibit. An engineer assumes a configuration task from a peer. Router A must establish ... |
| q0501 | 226 | B,D | B | What is the MAC address used with VRRP as a virtual address?... |
| q0522 | 232 | B,D,F | B,D | A network administrator enters the following command on a router: logging trap 3. What are three mes... |
| q0533 | 236 | C | A,C | If a notice-level message is sent to a syslog server, which event has occurred?... |
| q0551 | 241 | When deploying syslog, which severity level logs informational messages? A. | A. | When deploying syslog, which severity level logs informational messages? • A.... |
| q0565 | 246 | Refer to the exhibit. Which configuration must be applied to the router that configures PAT to translate all addresses i | Refer to the exhibit. Which configuration must be applied to the router that configures PAT to translate all addresses i | Refer to the exhibit. Which configuration must be applied to the router that configures PAT to trans... |
| q0593 | 261 | C | B | Refer to the exhibit. A newly configured PC fails to connect to the internet by using TCP port 80 to... |
| q0625 | 275 | B,E | A,B,E | While examining excessive traffic on the network, it is noted that all incoming packets on an interf... |
| q0656 | 286 | B | B,D | When a WPA2-PSK WLAN is configured in the Wireless LAN Controller, what is the minimum number of cha... |
| q0658 | 286 | A,B,C | A | Refer to the exhibit. An access-list is required to permit traffic from any host on interface Gi0/0 ... |
| q0665 | 289 | How does MAC learning function? | 1.#switchport mode access 2.#switchport port-security 3.#switchport port-security maximum 2 4.#switchport port-security  | How does MAC learning function?... |
| q0769 | 326 | A,D | A | Refer to the exhibit. How many JSON objects are represented?... |
| q0795 | 338 | B,D | A,B,D | What are two characteristics of a small office / home office connection environment? (Choose two.)... |
| q0876 | 377 | B | A,B | Refer to the exhibit. How must router A be configured so that it only sends Cisco Discovery Protocol... |
| q0983 | 437 | C,E | C | What are two protocols within the IPsec suite? (Choose two.)... |
| q1006 | 449 | Refer to the exhibit. In which structure does the word “warning” directly reside? | Which advantage does the network assurance capability of Cisco DNA Center provide over traditional campus management? | Refer to the exhibit. In which structure does the word “warning” directly reside?... |
| q1006 | 449 | A | D | Refer to the exhibit. In which structure does the word “warning” directly reside?... |
| q1151 | 527 | B,C | C | Refer to the exhibit. Which address will the client contact to renew their IP address when the curre... |
| q1157 | 530 | B | D | What is a service that is provided by a wireless controller?... |
| q1227 | 560 | C | A | Refer to the exhibit. A newly configured PC fails to connect to the internet by using TCP port 80 to... |
| q1235 | 562 | B | A,B | What is a difference between an IPv6 multicast address and an IPv6 anycast address?... |
| q1245 | 566 | C | A,C | Refer to the exhibit. The switch cat9k-acc-1 connects users to the campus LAN. Printing services are... |
| q1288 | 579 | Which selections must be used on the WLC when implementing a RADIUS server for wireless authentication? | What is a characteristic of an SSID in wireless networks? | Which selections must be used on the WLC when implementing a RADIUS server for wireless authenticati... |

---

## 3. Einlesefehler / Abweichende Optionenanzahl (23 Fälle im Vergleich zur Referenz-PDF)

Bei diesen 23 Fragen weicht die Anzahl der Antwortoptionen zwischen App und PDF ab (z. B. durch unvollständigen Import oder zusammengefasste Optionen):

| Fragen-ID | PDF-Seite | Optionen App | Optionen PDF | Abweichung | Fragetext |
| :--- | :---: | :---: | :---: | :--- | :--- |
| q0045 | 17 | 5 Optionen | 4 Optionen | App hat 5 Optionen, PDF hat 4 Optionen | What is the Destionation Mac Address of a broadcast frame?... |
| q0086 | 29 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | What is the maximum bandwidth of a T1 point-to-point connection?... |
| q0166 | 61 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. An engineer assigns IP addressing to the current VLAN with three PCs... |
| q0171 | 62 | 4 Optionen | 2 Optionen | App hat 4 Optionen, PDF hat 2 Optionen | What is the path for traffic sent from one user workstation to another workstation on a se... |
| q0181 | 66 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. Which switch in this configuration will be elected as the root bridg... |
| q0219 | 81 | 6 Optionen | 4 Optionen | App hat 6 Optionen, PDF hat 4 Optionen | Which statement about Cisco Discovery Protocol is true?... |
| q0313 | 123 | 4 Optionen | 2 Optionen | App hat 4 Optionen, PDF hat 2 Optionen | Which mode must be set for Aps to communicate to a Wireless LAN Controller using the Contr... |
| q0382 | 156 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | You have two paths for the 10.10.10.0 network - one that has a feasible distance of 3072 a... |
| q0419 | 176 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. With which metric was the route to host 172.16.0.202 learned? • A.... |
| q0476 | 206 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | An application in the network is being scaled up from 300 servers to 600. Each server requ... |
| q0522 | 232 | 6 Optionen | 5 Optionen | App hat 6 Optionen, PDF hat 5 Optionen | A network administrator enters the following command on a router: logging trap 3. What are... |
| q0551 | 241 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | When deploying syslog, which severity level logs informational messages? • A.... |
| q0565 | 246 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. Which configuration must be applied to the router that configures PA... |
| q0658 | 286 | 5 Optionen | 4 Optionen | App hat 5 Optionen, PDF hat 4 Optionen | Refer to the exhibit. An access-list is required to permit traffic from any host on interf... |
| q0821 | 347 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | What is a function of spine-and-leaf architecture?... |
| q0834 | 352 | 4 Optionen | 2 Optionen | App hat 4 Optionen, PDF hat 2 Optionen | Refer to the exhibit. Which configuration enables an EtherChannel to form dynamically betw... |
| q0875 | 374 | 4 Optionen | 1 Optionen | App hat 4 Optionen, PDF hat 1 Optionen | Refer to the exhibit. The SW1 and SW2 Gi0/0 ports have been preconfigured. An engineer is ... |
| q0876 | 377 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. How must router A be configured so that it only sends Cisco Discover... |
| q0983 | 437 | 5 Optionen | 4 Optionen | App hat 5 Optionen, PDF hat 4 Optionen | What are two protocols within the IPsec suite? (Choose two.)... |
| q0984 | 439 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. Local access for R4 must be established and these requirements must ... |
| q1014 | 452 | 4 Optionen | 8 Optionen | App hat 4 Optionen, PDF hat 8 Optionen | What is the advantage of separating the control plane from the data plane within an SDN ne... |
| q1149 | 525 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. The engineer configured the VLANs on the new AccSw2 switch. A router... |
| q1198 | 546 | 4 Optionen | 3 Optionen | App hat 4 Optionen, PDF hat 3 Optionen | Refer to the exhibit. Router R1 receives static routing updates from routers A, B, C, and ... |
