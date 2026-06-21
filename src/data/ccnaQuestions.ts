// Auto-generated from CCNA 200-301 Fragenpool
// Extrahiert: 1078 Fragen
// Davon mit Exhibit-Hinweis: 334

import type { ExhibitData } from "../types/exhibit";

export type CorrectAnswer = number | number[];

export interface CCNAQuestion {
  id: string;
  question: string;
  options: string[];
  correct: CorrectAnswer;
  // boolean = noch nicht migriert (true = Grafik nötig, false = keine);
  // ExhibitData = strukturiertes Exhibit (cli/topology/table/none).
  exhibit: boolean | ExhibitData;
}

export const ccnaQuestions: CCNAQuestion[] = [
  {
    id: "q0001",
    question: "Refer to the exhibit. Which type of route does R1 use to reach host 10.10.13.10/32?",
    options: [
    "default route",
    "network route",
    "host route",
    "floating static route"
    ],
    correct: 1,
    exhibit: {
      type: "cli",
      content: `R1#sh ip route
Gateway of last resort is 10.10.10.18 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
O        10.10.10.0/30 is directly connected, FastEthernet0/1
O        10.10.13.0/25 [110/6576] via 10.10.10.1, 06:58:21, FastEthernet0/1
O        10.10.10.16/30 is directly connected, FastEthernet0/24
O        10.10.13.144/28 [110/10] via 10.10.10.1, 06:58:21, FastEthernet0/1
B*   0.0.0.0/0 [20/0] via 10.10.10.18, 01:17:58`,
      highlight: [
        "O        10.10.13.0/25 [110/6576] via 10.10.10.1, 06:58:21, FastEthernet0/1",
      ],
    },
  },
  {
    id: "q0002",
    question: "Refer to the exhibit. Which prefix does Router1 use for traffic to Host A?",
    options: [
    "10.10.10.0/28",
    "10.10.13.0/25",
    "10.10.13.144/28",
    "10.10.13.208/29"
    ],
    correct: 3,
    exhibit: {
      type: "cli",
      content: `Router1#show ip route
Gateway of last resort is 10.10.11.2 to network 0.0.0.0

      209.165.200.0/27 is subnetted, 1 subnets
B        209.165.200.224 [20/0] via 10.10.12.2, 03:22:14
      209.165.201.0/27 is subnetted, 1 subnets
B        209.165.201.0 [20/0] via 10.10.12.2, 02:26:33
      209.165.202.0/27 is subnetted, 1 subnets
B        209.165.202.128 [20/0] via 10.10.12.2, 02:26:03
      10.0.0.0/8 is variably subnetted, 8 subnets, 4 masks
C        10.10.10.0/28 is directly connected, GigabitEthernet0/0
C        10.10.11.0/30 is directly connected, FastEthernet2/0
C        10.10.12.0/30 is directly connected, GigabitEthernet0/1
O        10.10.13.0/25 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0
O        10.10.13.128/28 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0
O        10.10.13.144/28 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0
O        10.10.13.160/29 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0
O        10.10.13.208/29 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0
S*   0.0.0.0/0 [1/0] via 10.10.11.2`,
      highlight: [
        "O        10.10.13.208/29 [110/2] via 10.10.10.1, 00:00:04, GigabitEthernet0/0",
      ],
    },
  },
  {
    id: "q0006",
    question: "How do TCP and UDP differ in the way that they establish a connection between two endpoints?",
    options: [
    "TCP uses the three-way handshake, and UDP does not guarantee message delivery.",
    "TCP uses synchronization packets, and UDP uses acknowledgment packets.",
    "UDP provides reliable message transfer, and TCP is a connectionless protocol.",
    "UDP uses SYN, SYN ACK, and FIN bits in the frame header while TCP uses SYN, SYN ACK, and ACK bits."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0007",
    question: "Which 802.11 frame type is Association Response?",
    options: [
    "management",
    "protected frame",
    "action",
    "control"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0008",
    question: "In which way does a spine-and-leaf architecture allow for scalability in a network when additional access ports are required?",
    options: [
    "A spine switch and a leaf switch can be added with redundant connections between them.",
    "A spine switch can be added with at least 40 GB uplinks.",
    "A leaf switch can be added with connections to every spine switch.",
    "A leaf switch can be added with a single connection to a core spine switch."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0009",
    question: "What identifies the functionality of virtual machines?",
    options: [
    "The hypervisor communicates on Layer 3 without the need for additional resources.",
    "Each hypervisor supports a single virtual machine and a single software switch.",
    "The hypervisor virtualizes physical components including CPU, memory, and storage.",
    "Virtualized servers run efficiently when physically connected to a switch that is separate from the hypervisor."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0010",
    question: "Which command automatically generates an IPv6 address from a specified IPv6 prefix and MAC address of an interface?",
    options: [
    "ipv6 address dhcp",
    "ipv6 address 2001:DB8:5:112::/64 eui-64",
    "ipv6 address autoconfig",
    "ipv6 address 2001:DB8:5:112::2/64 link-local"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0011",
    question: "When configuring IPv6 on an interface, which two IPv6 multicast groups are joined? (Choose two.)",
    options: [
    "2000::/3",
    "2002::5",
    "FC00::/7",
    "FF02::1",
    "FF02::2"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0013",
    question: "What is the default behavior of a Layer 2 switch when a frame with an unknown destination MAC address is received?",
    options: [
    "The Layer 2 switch forwards the packet and adds the destination MAC address to its MAC address table.",
    "The Layer 2 switch sends a copy of a packet to CPU for destination MAC address learning.",
    "The Layer 2 switch floods packets to all ports except the receiving port in the given VLAN.",
    "The Layer 2 switch drops the received frame."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0014",
    question: "An engineer must configure a /30 subnet between two routes. Which usable IP address and subnet mask combination meets this criteria?",
    options: [
    "interface e0/0 description to XX-AXXX:XXXXX ip address 10.2.1.3 255.255.255.252",
    "interface e0/0 description to XX-AXXX:XXXXX ip address 192.168.1.1 255.255.255.248",
    "interface e0/0 description to XX-AXXX:XXXXX ip address 172.16.1.4 255.255.255.248",
    "interface e0/0 description to XX-AXXX:XXXXX ip address 209.165.201.2 225.255.255.252 •"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0015",
    question: "Which network allows devices to communicate without the need to access the Internet?",
    options: [
    "172.9.0.0/16",
    "172.28.0.0/16",
    "192.0.0.0/8",
    "209.165.201.0/24"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0016",
    question: "Refer to the exhibit. Which statement explains the configuration error message that is received?",
    options: [
    "It belongs to a private IP address range.",
    "The router does not support /28 mask.",
    "It is a network IP address.",
    "It is a broadcast IP address."
    ],
    correct: 3,
    exhibit: {
      type: "cli",
      content: `Router(config)#interface GigabitEthernet 1/0/1
Router(config-if)#ip address 192.168.16.143 255.255.255.240
Bad mask /28 for address 192.168.16.143`,
      highlight: ["Bad mask /28 for address 192.168.16.143"],
    },
  },
  {
    id: "q0017",
    question: "Which IPv6 address type provides communication between subnets and cannot route on the Internet?",
    options: [
    "link-local",
    "unique local",
    "multicast",
    "global unicast"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0018",
    question: "Which IPv6 address block sends packets to a group address rather than a single address?",
    options: [
    "2000::/3",
    "FC00::/7",
    "FE80::/10",
    "FF00::/8"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0019",
    question: "What are two reasons that cause late collisions to increment on an Ethernet interface? (Choose two.)",
    options: [
    "when Carrier Sense Multiple Access/Collision Detection is used",
    "when one side of the connection is configured for half-duplex",
    "when the sending device waits 15 seconds before sending the frame again",
    "when a collision occurs after the 32nd byte of a frame has been transmitted",
    "when the cable length limits are exceeded"
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q0020",
    question: "What is a benefit of using a Cisco Wireless LAN Controller?",
    options: [
    "It eliminates the need to configure each access point individually.",
    "Central AP management requires more complex configurations.",
    "Unique SSIDs cannot use the same authentication method.",
    "It supports autonomous and lightweight APs."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0021",
    question: "Which action is taken by switch port enabled for PoE power classification override?",
    options: [
    "If a monitored port exceeds the maximum administrative value for power, the port is shutdown and err-disabled.",
    "When a powered device begins drawing power from a PoE switch port, a syslog message is generated.",
    "As power usage on a PoE switch port is checked, data flow to the connected device is temporarily paused.",
    "If a switch determines that a device is using less than the minimum configured power, it assumes the device has failed and disconnects it."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0022",
    question: "What occurs to frames during the process of frame flooding?",
    options: [
    "Frames are sent to all ports, including those that are assigned to other VLANs.",
    "Frames are sent to every port on the switch that has a matching entry in MAC address table.",
    "Frames are sent to every port on the switch in the same VLAN except from the originating port.",
    "Frames are sent to every port on the switch in the same VLAN."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0023",
    question: "Which function does the range of private IPv4 addresses perform?",
    options: [
    "allows multiple companies to each use the same addresses without conflicts",
    "provides a direct connection for hosts from outside of the enterprise network",
    "ensures that NAT is not required to reach the Internet with private range addressing",
    "enables secure communications to the Internet for all external hosts"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0024",
    question: "Which action must be taken to assign a global unicast IPv6 address on an interface that is derived from the MAC address of that interface?",
    options: [
    "explicitly assign a link-local address",
    "disable the EUI-64 bit process",
    "enable SLAAC on an interface",
    "configure a stateful DHCPv6 server on the network"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0025",
    question: "Several new coverage cells are required to improve the Wi-Fi network of an organization. Which two standard designs are recommended? (Choose two.)",
    options: [
    "5GHz provides increased network capacity with up to 23 nonoverlapping channels.",
    "5GHz channel selection requires an autonomous access point.",
    "Cells that overlap one another are configured to use nonoverlapping channels.",
    "Adjacent cells with overlapping channels use a repeater access point.",
    "For maximum throughput, the WLC is configured to dynamically set adjacent access points to the channel."
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0026",
    question: "How do TCP and UDP differ in the way they provide reliability for delivery of packets?",
    options: [
    "TCP does not guarantee delivery or error checking to ensure that there is no corruption of data, UDP provides message acknowledgement and retransmits data if lost.",
    "TCP provides flow control to avoid overwhelming a receiver by sending too many packets at once, UDP sends packets to the receiver in a continuous stream without checking.",
    "TCP is a connectionless protocol that does not provide reliable delivery of data; UDP is a connection-oriented protocol that uses sequencing to provide reliable delivery.",
    "TCP uses windowing to deliver packets reliably; UDP provides reliable message transfer between hosts by establishing a three-way handshake."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0027",
    question: "What are two differences between optical-fiber cabling and copper cabling? (Choose two.)",
    options: [
    "A BNC connector is used for fiber connections",
    "The glass core component is encased in a cladding",
    "The data can pass through the cladding",
    "Light is transmitted through the core of the fiber",
    "Fiber connects to physical interfaces using RJ-45 connections"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0028",
    question: "How does CAPWAP communicate between an access point in local mode and a WLC?",
    options: [
    "The access point must not be connected to the wired network, as it would create a loop",
    "The access point must be connected to the same switch as the WLC",
    "The access point must directly connect to the WLC using a copper cable",
    "The access point has the ability to link to any switch in the network, assuming connectivity to the WLC"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0029",
    question: "Which IPv6 address block forwards packets to a multicast address rather than a unicast address?",
    options: [
    "2000::/3",
    "FC00::/7",
    "FE80::/10",
    "FF00::/12"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0030",
    question: "What is the difference regarding reliability and communication type between TCP and UDP?",
    options: [
    "TCP is reliable and is a connectionless protocol; UDP is not reliable and is a connection- oriented protocol.",
    "TCP is not reliable and is a connectionless protocol; UDP is reliable and is a connection- oriented protocol.",
    "TCP is not reliable and is a connection-oriented protocol; UDP is reliable and is a connectionless protocol.",
    "TCP is reliable and is a connection-oriented protocol; UDP is not reliable and is a connectionless protocol."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0031",
    question: "What are two descriptions of three-tier network topologies? (Choose two.)",
    options: [
    "The distribution layer runs Layer 2 and Layer 3 technologies",
    "The network core is designed to maintain continuous connectivity when devices fail",
    "The access layer manages routing between devices in different domains",
    "The core layer maintains wired connections for each host",
    "The core and distribution layers perform the same functions"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0032",
    question: "Which type of IPv6 address is publicly routable in the same way as IPv4 public addresses?",
    options: [
    "multicast",
    "unique local",
    "link-local",
    "global unicast"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0033",
    question: "What is the expected outcome when an EUI-64 address is generated?",
    options: [
    "The interface ID is configured as a random 64-bit value",
    "The characters FE80 are inserted at the beginning of the MAC address of the interface",
    "The seventh bit of the original MAC address of the interface is inverted",
    "The MAC address of the interface is used as the interface ID without modification"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0034",
    question: "A corporate office uses four floors in a building. ✑ Floor 1 has 24 users. ✑ Floor 2 has 29 users. Floor 3 has 28 users. ✑ Floor 4 has 22 users. Which subnet summarizes and gives the most efficient distribution of IP addresses for the router configuration?",
    options: [
    "192.168.0.0/24 as summary and 192.168.0.0/28 for each floor",
    "192.168.0.0/23 as summary and 192.168.0.0/25 for each floor",
    "192.168.0.0/25 as summary and 192.168.0.0/27 for each floor",
    "192.168.0.0/26 as summary and 192.168.0.0/29 for each floor"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0035",
    question: "Refer to the exhibit. An engineer must add a subnet for a new office that will add 20 users to the network. Which IPv4 network and subnet mask combination does the engineer assign to minimize wasting addresses?",
    options: [
    "10.10.225.48 255.255.255.240",
    "10.10.225.32 255.255.255.240",
    "10.10.225.48 255.255.255.224",
    "10.10.225.32 255.255.255.224"
    ],
    correct: 3,
    exhibit: {
      type: "topology",
      devices: [
        { id: "r1", type: "router", label: "R1", x: 40, y: 60 },
        { id: "r2", type: "router", label: "R2", x: 200, y: 60 },
        { id: "r3", type: "router", label: "R3", x: 360, y: 60 },
        { id: "r4", type: "router", label: "R4", x: 520, y: 60 },
      ],
      links: [
        { from: "r1", to: "r2" },
        { from: "r2", to: "r3" },
        { from: "r3", to: "r4" },
      ],
      labels: [
        { text: "10.10.225.0/28", attachTo: "r1", position: "below" },
        { text: "10.10.225.16/28", attachTo: "r2", position: "below" },
        { text: "10.10.225.64/26", attachTo: "r3", position: "below" },
        { text: "20 Hosts (neu)", attachTo: "r4", position: "below" },
      ],
    },
  },
  {
    id: "q0036",
    question: "What is a characteristic of spine-and-leaf architecture?",
    options: [
    "Each link between leaf switches allows for higher bandwidth.",
    "It provides greater predictability on STP blocked ports.",
    "It provides variable latency.",
    "Each device is separated by the same number of hops."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0037",
    question: "An office has 8 floors with approximately 30-40 users per floor. One subnet must be used. Which command must be configured on the router Switched Virtual Interface to use address space efficiently?",
    options: [
    "ip address 192.168.0.0 255.255.0.0",
    "ip address 192.168.0.0 255.255.254.0",
    "ip address 192.168.0.0 255.255.255.128",
    "ip address 192.168.0.0 255.255.255.224"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0039",
    question: "A device detects two stations transmitting frames at the same time. This condition occurs after the first 64 bytes of the frame is received. Which interface counter increments?",
    options: [
    "runt",
    "collision",
    "late collision",
    "CRC"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0040",
    question: "Refer to the exhibit. Which outcome is expected when PC_A sends data to PC_B after their initial communication?",
    options: [
    "The source MAC address is changed.",
    "The destination MAC address is replaced with ffff.ffff.ffff.",
    "The source and destination MAC addresses remain the same.",
    "The switch rewrites the source and destination MAC addresses with its own. Weil wir im selben VLAN sind"
    ],
    correct: 2,
    exhibit: {
      type: "topology",
      devices: [
        { id: "sw1", type: "switch", label: "Switch1", x: 200, y: 40 },
        { id: "pca", type: "pc", label: "PC_A", x: 80, y: 200 },
        { id: "pcb", type: "pc", label: "PC_B", x: 320, y: 200 },
      ],
      links: [
        { from: "sw1", to: "pca", labelFrom: "VLAN 200" },
        { from: "sw1", to: "pcb", labelFrom: "VLAN 200" },
      ],
    },
  },
  {
    id: "q0041",
    question: "Using direct sequence spread spectrum, which three 2.4-GHz channels are used to limit collisions?",
    options: [
    "5, 6, 7",
    "1, 2, 3",
    "1, 6, 11",
    "1, 5, 10"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0042",
    question: "How do TCP and UDP differ in the way they guarantee packet delivery?",
    options: [
    "TCP uses retransmissions, acknowledgment, and parity checks, and UDP uses cyclic redundancy checks only",
    "TCP uses two-dimensional parity checks, checksums, and cyclic redundancy checks, and UDP uses retransmissions only",
    "TCP uses checksum, acknowledgements, and retransmissions, and UDP uses checksums only",
    "TCP uses checksum, parity checks, and retransmissions, and UDP uses acknowledgements only"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0043",
    question: "A wireless administrator has configured a WLAN; however, the clients need access to a less congested 5-GHz network for their voice quality. Which action must be taken to meet the requirement?",
    options: [
    "enable Band Select",
    "enable DTIM",
    "enable RX-SOP",
    "enable AAA override"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0045",
    question: "What is the Destionation Mac Address of a broadcast frame?",
    options: [
    "00:00:0c:07:ac:01",
    "ff:ff:ff:ff:ff:ff",
    "43:2e:08:00:00:0c",
    "00:00:0c:43:2e:08",
    "00:00:0c:ff:ff:ff"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0046",
    question: "For what two purposes does the Ethernet protocol use physical addresses?",
    options: [
    "to uniquely identify devices at Layer 2",
    "to allow communication with devices on a different network",
    "to differentiate a Layer 2 frame from a Layer 3 packet",
    "to establish a priority system to determine which device gets to transmit first",
    "to allow communication between different devices on the same network",
    "to allow detection of a remote device when its physical address is unknown"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0048",
    question: "Which component of an Ethernet frame is used to notify a host that traffic is coming?",
    options: [
    "start of frame delimiter",
    "Type field",
    "preamble",
    "Data field"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0049",
    question: "You are configuring your edge routers interface with a public IP address for Internet connectivity. The router needs to obtain the IP address from the service provider dynamically. Which command is needed on interface FastEthernet 0/0 to accomplish this?",
    options: [
    "ip default-gateway",
    "ip route",
    "ip default-network",
    "ip address dhcp",
    "ip address dynamic"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0050",
    question: "Which two statements about the purpose of the OSI model are accurate? (Choose two.)",
    options: [
    "Defines the network functions that occur at each layer",
    "Facilitates an understanding of how information travels throughout a network",
    "Changes in one layer do not impact other layer",
    "Ensures reliable data delivery through its layered approach"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0051",
    question: "Which three statements about MAC addresses are correct? (Choose three.)",
    options: [
    "To communicate with other devices on a network, a network device must have a unique MAC address",
    "The MAC address is also referred to as the IP address",
    "The MAC address of a device must be configured in the Cisco IOS CLI by a user with administrative privileges",
    "A MAC address contains two main components, the first of which identifies the manufacturer of the hardware and the second of which uniquely identifies the hardware",
    "An example of a MAC address is 0A:26:B8:D6:65:90",
    "A MAC address contains two main components, the first of which identifies the network on which the host resides and the second of which uniquely identifies the host on the network"
    ],
    correct: [0, 3, 4],
    exhibit: false,
  },
  {
    id: "q0052",
    question: "Which technique can you use to route IPv6 traffic over an IPv4 infrastructure?",
    options: [
    "NAT",
    "6 to 4 tunneling",
    "L2TPv3",
    "dual-stack"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0053",
    question: "Refer to the exhibit. A network technician is asked to design a small network with redundancy. The exhibit represents this design, with all hosts configured in the same VLAN. What conclusions can be made about this design?",
    options: [
    "This design will function as intended.",
    "Spanning-tree will need to be used.",
    "The router will not accept the addressing scheme.",
    "The connection between switches should be a trunk.",
    "The router interfaces must be encapsulated with the 802.1Q protocol."
    ],
    correct: 2,
    exhibit: {
      type: "topology",
      devices: [
        { id: "isp", type: "cloud", label: "ISP", x: 40, y: 60 },
        { id: "r0", type: "router", label: "Router0", x: 260, y: 60 },
        { id: "sw1", type: "switch", label: "Switch1", x: 160, y: 200 },
        { id: "sw2", type: "switch", label: "Switch2", x: 360, y: 200 },
        { id: "h3", type: "pc", label: "Host 3", x: 90, y: 320 },
        { id: "h4", type: "pc", label: "Host 4", x: 230, y: 320 },
        { id: "h5", type: "pc", label: "Host 5", x: 300, y: 320 },
        { id: "h6", type: "pc", label: "Host 6", x: 440, y: 320 },
      ],
      links: [
        { from: "isp", to: "r0" },
        { from: "r0", to: "sw1", subnet: "192.168.1.1 /24" },
        { from: "r0", to: "sw2", subnet: "192.168.1.2 /24" },
        { from: "sw1", to: "h3" },
        { from: "sw1", to: "h4" },
        { from: "sw2", to: "h5" },
        { from: "sw2", to: "h6" },
      ],
    },
  },
  {
    id: "q0054",
    question: "Which two statements are true about the command ip route 172.16.3.0 255.255.255.0 192.168.2.4? (Choose two.)",
    options: [
    "It establishes a static route to the 172.16.3.0 network.",
    "It establishes a static route to the 192.168.2.0 network.",
    "It configures the router to send any traffic for an unknown destination to the 172.16.3.0 network.",
    "It configures the router to send any traffic for an unknown destination out the interface with the address 192.168.2.4.",
    "It uses the default administrative distance.",
    "It is a route that would be used last if other routes to the same destination exist."
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0055",
    question: "What are two benefits of private IPv4 IP addresses? (Choose two.)",
    options: [
    "They are routed the same as public IP addresses.",
    "They are less costly than public IP addresses.",
    "They can be assigned to devices without Internet connections.",
    "They eliminate the necessity for NAT policies.",
    "They eliminate duplicate IP conflicts."
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0056",
    question: "What are two benefits that the UDP protocol provide for application traffic? (Choose two.)",
    options: [
    "UDP traffic has lower overhead than TCP traffic",
    "UDP provides a built-in recovery mechanism to retransmit lost packets",
    "The CTL field in the UDP packet header enables a three-way handshake to establish the connection",
    "UDP maintains the connection state to provide more stable connections than TCP",
    "The application can use checksums to verify the integrity of application data"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0057",
    question: "Which two goals reasons to implement private IPv4 addressing on your network? (Choose two.)",
    options: [
    "Comply with PCI regulations",
    "Conserve IPv4 address",
    "Reduce the size of the forwarding table on network routers",
    "Reduce the risk of a network security breach",
    "Comply with local law"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0058",
    question: "Which WAN access technology is preferred for a small office / home office architecture?",
    options: [
    "broadband cable access",
    "frame-relay packet switching",
    "dedicated point-to-point leased line",
    "Integrated Services Digital Network switching"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0059",
    question: "Which two WAN architecture options help a business scalability and reliability for the network? (Choose two.)",
    options: [
    "asychronous routing",
    "single-homed branches",
    "dual-homed branches",
    "static routing",
    "dynamic routing"
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0060",
    question: "What is the binary pattern of unique ipv6 unique local address?",
    options: [
    "00000000",
    "11111100",
    "11111111",
    "11111101"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0061",
    question: "Which two options are the best reasons to use an IPV4 private IP space? (Choose two.)",
    options: [
    "to enable intra-enterprise communication",
    "to implement NAT",
    "to connect applications",
    "to conserve global address space",
    "to manage routing overhead"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0062",
    question: "Refer to the exhibit. When PC1 sends a packet to PC2, the packet has which source and destination IP address when it arrives at interface Gi0/0 on router R2?",
    options: [
    "source 192.168.10.10 and destination 10.10.2.2",
    "source 192.168.20.10 and destination 192.168.20.1",
    "source 192.168.10.10 and destination 192.168.20.10",
    "source 10.10.1.1 and destination 10.10.2.2"
    ],
    correct: 2,
    exhibit: {
      type: "topology",
      devices: [
        { id: "pc1", type: "pc", label: "PC1", x: 40, y: 120 },
        { id: "r1", type: "router", label: "R1", x: 200, y: 120 },
        { id: "r2", type: "router", label: "R2", x: 380, y: 120 },
        { id: "pc2", type: "pc", label: "PC2", x: 540, y: 120 },
      ],
      links: [
        { from: "pc1", to: "r1", subnet: "192.168.10.0/24", labelTo: "Gi0/0" },
        { from: "r1", to: "r2", subnet: "10.10.1.0/30" },
        { from: "r2", to: "pc2", subnet: "192.168.20.0/24", labelFrom: "Gi0/0" },
      ],
      labels: [
        { text: "192.168.10.10", attachTo: "pc1", position: "below" },
        { text: "192.168.20.10", attachTo: "pc2", position: "below" },
      ],
    },
  },
  {
    id: "q0063",
    question: "What is the same for both copper and fiber interfaces when using SFP modules?",
    options: [
    "They support an inline optical attenuator to enhance signal strength",
    "They accommodate single-mode and multi-mode in a single module",
    "They provide minimal interruption to services by being hot-swappable",
    "They offer reliable bandwidth up to 100 Mbps in half duplex mode"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0064",
    question: "What are two functions of a server on a network? (Choose two.)",
    options: [
    "handles requests from multiple workstations at the same time",
    "achieves redundancy by exclusively using virtual server clustering",
    "housed solely in a data center that is dedicated to a single client achieves redundancy by exclusively using virtual server clustering",
    "runs the same operating system in order to communicate with other servers",
    "runs applications that send and retrieve data for workstations that make requests"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0065",
    question: "Which function is performed by the collapsed core layer in a two-tier architecture?",
    options: [
    "enforcing routing policies",
    "marking interesting traffic for data policies",
    "applying security policies",
    "attaching users to the edge of the network"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0066",
    question: "What is the primary function of a Layer 3 device?",
    options: [
    "to transmit wireless traffic between hosts",
    "to analyze traffic and drop unauthorized traffic from the Internet",
    "to forward traffic within the same broadcast domain",
    "to pass traffic between different networks"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0067",
    question: "Which two functions are performed by the core layer in a three-tier architecture? (Choose two.)",
    options: [
    "Provide uninterrupted forwarding service",
    "Inspect packets for malicious activity",
    "Ensure timely data transfer between layers",
    "Provide direct connectivity for end user devices",
    "Police traffic that is sent to the edge of the network"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0068",
    question: "What is a recommended approach to avoid co-channel congestion while installing access points that use the 2.4 GHz frequency?",
    options: [
    "different nonoverlapping channels",
    "one overlapping channel",
    "one nonoverlapping channel",
    "different overlapping channels"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0069",
    question: "A manager asks a network engineer to advise which cloud service models are used so employees do not have to waste their time installing, managing, and updating software that is only used occasionally. Which cloud service model does the engineer recommend?",
    options: [
    "infrastructure-as-a-service",
    "platform-as-a-service",
    "business process as service to support different types of service",
    "software-as-a-service"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0070",
    question: "What are two functions of a Layer 2 switch? (Choose two.)",
    options: [
    "acts as a central point for association and authentication servers",
    "selects the best route between networks on a WAN",
    "moves packets within a VLAN",
    "moves packets between different VLANs",
    "makes forwarding decisions based on the MAC address of a packet"
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0072",
    question: "An engineer observes high usage on the 2.4GHz channels and lower usage on the 5GHz channels. What must be configured to allow clients to preferentially use 5GHz access points?",
    options: [
    "Client Band Select",
    "Re-Anchor Roamed Clients",
    "OEAP Spilt Tunnel",
    "11ac MU-MIMO"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0073",
    question: "Which networking function occurs on the data plane?",
    options: [
    "processing inbound SSH management traffic",
    "sending and receiving OSPF Hello packets",
    "facilitates spanning-tree elections",
    "forwarding remote client/server traffic"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0074",
    question: "Under which condition is TCP preferred over UDP?",
    options: [
    "UDP is used when low latency is optimal, and TCP is used when latency is tolerable.",
    "TCP is used when dropped data is more acceptable, and UDP is used when data is accepted out-of-order.",
    "TCP is used when data reliability is critical, and UDP is used when missing packets are acceptable.",
    "UDP is used when data is highly interactive, and TCP is used when data is time-sensitive."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0075",
    question: "Refer to the exhibit. Shortly after SiteA was connected to SiteB over a new single-mode fiber path, users at SiteA report intermittent connectivity issues with applications hosted at SiteB. What is the cause of the intermittent connectivity issue?",
    options: [
    "Interface errors are incrementing.",
    "High usage is causing high latency.",
    "An incorrect SFP media type was used at SiteA.",
    "The sites were connected with the wrong cable type."
    ],
    correct: 0,
    exhibit: {
      type: "cli",
      content: `SiteA#show interface TenGigabitEthernet1/0/0
TenGigabitEthernet1/0/0 is up, line protocol is up
  Hardware is BUILT-IN-EPA-8x10G, address is 780c.f02a.db91
  Description: Connection to SiteB
  Internet address is 10.10.10.1/30
  MTU 8146 bytes, BW 10000000 Kbit/sec, DLY 10 usec,
     reliability 166/255, txload 1/255, rxload 1/255
  Full Duplex, 10000Mbps, link type is force-up, media type is SFP-LR

SiteB#show interface TenGigabitEthernet1/0/0
TenGigabitEthernet1/0/0 is up, line protocol is up
  Hardware is BUILT-IN-EPA-8x10G, address is 780c.f02a.db26
  Description: Connection to SiteA
  Internet address is 10.10.10.2/30
  MTU 8146 bytes, BW 10000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Full Duplex, 10000Mbps, link type is force-up, media type is SFP-LR`,
      highlight: ["     reliability 166/255, txload 1/255, rxload 1/255"],
    },
  },
  {
    id: "q0076",
    question: "A network engineer must configure the router R1 GigabitEthernet1/1 interface to connect to the router R2 GigabitEthernet1/1 interface. For the configuration to be applied, the engineer must compress the address 2001:0db8:0000:0000:0500:000a:400F:583B. Which command must be issued on the interface?",
    options: [
    "ipv6 address 2001::db8:0000::500:a:400F:583B",
    "ipv6 address 2001:db8:0::500:a:4F:583B",
    "ipv6 address 2001:db8::500:a:400F:583B",
    "ipv6 address 2001:0db8::5:a:4F:583B"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0077",
    question: "What is a network appliance that checks the state of a packet to determine whether the packet is legitimate?",
    options: [
    "Layer 2 switch",
    "LAN controller",
    "load balancer",
    "firewall"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0078",
    question: "What is a role of access points in an enterprise network?",
    options: [
    "integrate with SNMP in preventing DDoS attacks",
    "serve as a first line of defense in an enterprise network",
    "connect wireless devices to a wired network",
    "support secure user logins to devices on the network"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0079",
    question: "An implementer is preparing hardware for virtualization to create virtual machines on a host. What is needed to provide communication between hardware and virtual machines?",
    options: [
    "router",
    "hypervisor",
    "switch",
    "straight cable"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0080",
    question: "How does a Cisco Unified Wireless Network respond to Wi-Fi channel overlap?",
    options: [
    "It allows the administrator to assign the channels on a per-device or per-interface basis.",
    "It segregates devices from different manufactures onto different channels.",
    "It analyzes client load and background noise and dynamically assigns a channel.",
    "It alternates automatically between 2.4 GHz and 5 GHz on adjacent access points."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0083",
    question: "Which 802.11 frame type is indicated by a probe response after a client sends a probe request?",
    options: [
    "data",
    "management",
    "control",
    "action"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0084",
    question: "What is the difference in data transmission delivery and reliability between TCP and UDP?",
    options: [
    "TCP transmits data at a higher rate and ensures packet delivery. UDP retransmits lost data to ensure applications receive the data on the remote end.",
    "TCP requires the connection to be established before transmitting data. UDP transmits data at a higher rate without ensuring packet delivery.",
    "UDP sets up a connection between both devices before transmitting data. TCP uses the three- way handshake to transmit data with a reliable connection.",
    "UDP is used for multicast and broadcast communication. TCP is used for unicast communication and transmits data at a higher rate with error checking."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0085",
    question: "Refer to the exhibit. When PC-A sends traffic to PC-B, which network component is in charge of receiving the packet from PC-A, verifying the IP addresses, and forwarding the packet to PC-B?",
    options: [
    "router",
    "Layer 2 switch",
    "load balancer",
    "firewall"
    ],
    correct: 0,
    exhibit: {
      type: "topology",
      devices: [
        { id: "r", type: "router", label: "Router", x: 240, y: 40 },
        { id: "swl", type: "switch", label: "Switch", x: 120, y: 170 },
        { id: "swr", type: "switch", label: "Switch", x: 360, y: 170 },
        { id: "pca", type: "pc", label: "PC-A", x: 120, y: 300 },
        { id: "pcb", type: "pc", label: "PC-B", x: 360, y: 300 },
      ],
      links: [
        { from: "r", to: "swl", labelFrom: "e0/1" },
        { from: "r", to: "swr", labelFrom: "e0/0" },
        { from: "swl", to: "pca" },
        { from: "swr", to: "pcb" },
      ],
      labels: [
        { text: "10.10.10.0 /24", attachTo: "pca", position: "below" },
        { text: "10.10.100.0 /24", attachTo: "pcb", position: "below" },
      ],
    },
  },
  {
    id: "q0086",
    question: "What is the maximum bandwidth of a T1 point-to-point connection?",
    options: [
    "1.544 Mbps",
    "2.048 Mbps",
    "34.368 Mbps",
    "43.7 Mbps"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0087",
    question: "What are two similarities between UTP Cat 5e and Cat 6a cabling? (Choose two.)",
    options: [
    "Both support speeds up to 10 Gigabit.",
    "Both support speeds of at least 1 Gigabit.",
    "Both support runs of up to 55 meters.",
    "Both support runs of up to 100 meters.",
    "Both operate at a frequency of 500 MHz."
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0088",
    question: "What is a characteristic of cloud-based network topology?",
    options: [
    "onsite network services are provided with physical Layer 2 and Layer 3 components",
    "wireless connections provide the sole access method to services",
    "physical workstations are configured to share resources",
    "services are provided by a public, private, or hybrid deployment"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0089",
    question: "Which network action occurs within the data plane?",
    options: [
    "reply to an incoming ICMP echo request 10.10.13.0/25 [1/0] via 10.10.10.2",
    "make a configuration change from an incoming NETCONF RPC 10.10.13.0/25 [108/0] via 10.10.10.10",
    "run routing protocols (OSPF, EIGRP, RIP, BGP) 10.10.13.0/25 [110/2] via 10.10.10.6",
    "compare the destination IP address to the IP routing table Q0090 LAB12-CIS3 Refer to the exhibit. R1 has just received a packet from host A that is destined to host B. Which route in the routing table is used by R1 to reach host B? 10.10.13.0/25 [110/2] via 10.10.10.2"
    ],
    correct: [3, 1],
    exhibit: { type: "none" },
  },
  {
    id: "q0091",
    question: "Which two network actions occur within the data plane? (Choose two.)",
    options: [
    "Run routing protocols.",
    "Make a configuration change from an incoming NETCONF RPC.",
    "Add or remove an 802.1Q trunking header.",
    "Match the destination MAC address to the MAC address table.",
    "Reply to an incoming ICMP echo request."
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0092",
    question: "What are network endpoints?",
    options: [
    "support inter-VLAN connectivity",
    "a threat to the network if they are compromised",
    "act as routers to connect a user to the service provider network",
    "enforce policies for campus-wide traffic going to the Internet"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0093",
    question: "Refer to the exhibit. The link between PC1 and the switch is up, but it is performing poorly. Which interface condition is causing the performance problem?",
    options: [
    "There is an issue with the fiber on the switch interface.",
    "There is a duplex mismatch on the interface.",
    "There is an interface type mismatch.",
    "There is a speed mismatch on the interface."
    ],
    correct: 1,
    exhibit: {
      type: "cli",
      content: `! PC1 (fa0): Manual settings - 100 speed, full duplex
Switch#show interfaces status
Port      Name      Status       Vlan    Duplex    Speed    Type
Fa0/1               connected    1       auto      auto     10/100BaseTX`,
      highlight: [
        "Fa0/1               connected    1       auto      auto     10/100BaseTX",
      ],
    },
  },
  {
    id: "q0094",
    question: "Why was the RFC 1918 address space defined?",
    options: [
    "conserve public IPv4 addressing",
    "support the NAT protocol",
    "preserve public IPv6 address space",
    "reduce instances of overlapping IP addresses"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0097",
    question: "Which type of organization should use a collapsed-core architecture?",
    options: [
    "small and needs to reduce networking costs",
    "large and must minimize downtime when hardware fails",
    "large and requires a flexible, scalable network design",
    "currently small but is expected to grow dramatically in the near future"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0098",
    question: "A network administrator is setting up a new IPv6 network using the 64-bit address 2001:0EB8:00C1:2200:0001:0000:0000:0331/64. To simplify the configuration, the administrator has decided to compress the address. Which IP address must the administrator configure?",
    options: [
    "ipv6 address 2001:EB8:C1:22:1::331/64",
    "ipv6 address 21:EB8:C1:2200:1::331/64",
    "ipv6 address 2001:EB8:C1:2200:1:0000:331/64",
    "ipv6 address 2001:EB8:C1:2200:1::331/64"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0100",
    question: "What is an appropriate use for private IPv4 addressing?",
    options: [
    "to allow hosts inside to communicate in both directions with hosts outside the organization",
    "on internal hosts that stream data solely to external resources",
    "on the public-facing interface of a firewall",
    "on hosts that communicate only with other internal hosts"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0101",
    question: "Refer to the exhibit. An engineer is configuring the HO router. Which IPv6 address configuration must be applied to the router fa0/1 interface for the router to assign a unique 64-bit IPv6 address to itself?",
    options: [
    "ipv6 address 2001:DB8:0:1:FFFF:C601:420F:7/64",
    "ipv6 address 2001:DB8:0:1:FE80:C601:420F:7/64",
    "ipv6 address 2001:DB8:0:1:C601:42FF:FE0F:7/64",
    "ipv6 address 2001:DB8:0:1:C601:42FF:800F:7/64"
    ],
    correct: 2,
    exhibit: {
      type: "topology",
      devices: [
        { id: "server", type: "pc", label: "Server", x: 220, y: 30 },
        { id: "hq1", type: "router", label: "HQ1", x: 120, y: 170 },
        { id: "cloud", type: "cloud", label: "IPv6-Cloud", x: 300, y: 170 },
        { id: "hosta", type: "pc", label: "Host A", x: 300, y: 300 },
      ],
      links: [
        { from: "server", to: "hq1" },
        { from: "hq1", to: "cloud", subnet: "2001:DB8:0:1::/64" },
        { from: "cloud", to: "hosta" },
      ],
      labels: [
        { text: "MAC C601.420F.2007", attachTo: "hq1", position: "below" },
      ],
    },
  },
  {
    id: "q0102",
    question: "What is a similarity between 1000BASE-LX and 1000BASE-T standards?",
    options: [
    "Both use the same data-link header and trailer formats.",
    "Both cable types support RJ-45 connectors.",
    "Both support up to 550 meters between nodes.",
    "Both cable types support LR connectors."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0103",
    question: "Refer to the exhibit. The given Windows PC is requesting the IP address of the host at www.cisco.com. To which IP address is the request sent?",
    options: [
    "192.168.1.253",
    "192.168.1.100",
    "192.168.1.226",
    "192.168.1.254"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0104",
    question: "Which function forwards frames to ports that have a matching destination MAC address?",
    options: [
    "frame flooding",
    "frame filtering",
    "frame pushing",
    "frame switching"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0105",
    question: "Which type of IPv6 address is similar to a unicast address but is assigned to multiple devices on the same network at the same time?",
    options: [
    "global unicast address",
    "link-local address",
    "anycast address",
    "multicast address"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0106",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "composed of up to 65,536 available addresses",
    "issued by IANA in conjunction with an autonomous system number",
    "used without tracking or registration",
    "traverse the Internet when an outbound ACL is applied"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0107",
    question: "What is a function of an endpoint on a network?",
    options: [
    "provides wireless services to users in a building",
    "connects server and client device to a network",
    "allows users to record data and transmit to a file server",
    "forwards traffic between VLANs on a network"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0108",
    question: "What is the function of a controller in controller-based networking?",
    options: [
    "It serves as the centralized management point of an SDN architecture",
    "It is a pair of core routers that maintain all routing decisions for a campus",
    "It centralizes the data plane for the network",
    "It is the card on a core router that maintains all routing decisions for a campus."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0109",
    question: "Refer to the exhibit. Each router must be configured with the last usable IP address in the subnet. Which configuration fulfills this requirement?",
    options: [
    "R7# interface FastEthernet1/0 ip address 10.88.31.127 255.255.255.192 R8# interface FastEthernet0/0 ip address 10.19.63.95 255.255.255.240 R9# interface FastEthernet1/1 ip address 10.23.98.159 255.255.255.224",
    "R7# interface FastEthernet1/0 ip address 10.88.31.126 255.255.255.240 R8# interface FastEthernet0/0 ip address 10.19.63.94 255.255.255.192 R9# interface FastEthernet1/1 ip address 10.23.98.158 255.255.255.248",
    "R7# interface FastEthernet1/0 ip address 10.88.31.127 255.255.255.240 R8# interface FastEthernet0/0 ip address 10.19.63.95 255.255.255.192 R9# interface FastEthernet1/1 ip address 10.23.98.159 255.255.255.248",
    "R7# interface FastEthernet1/0 ip address 10.88.31.126 255.255.255.192 R8# interface FastEthernet0/0 ip address 10.19.63.94 255.255.255.240 R9# interface FastEthernet1/1 ip address 10.23.98.158 255.255.255.224"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0110",
    question: "How do TCP and UDP fit into a query-responsible model?",
    options: [
    "TCP avoids using sequencing and UDP avoids using acknowledgments",
    "TCP establishes a connection prior to sending data, and UDP sends immediately",
    "TCP encourages out-of-order packet delivery, and UDP prevents re-ordering",
    "TCP uses error detection for packets, and UDP uses error recovery."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0111",
    question: "What provides centralized control of authentication and roaming in an enterprise network?",
    options: [
    "a lightweight access point",
    "a wireless LAN controller",
    "a firewall",
    "a LAN switch"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0112",
    question: "Which set of 2 4 GHz nonoverlapping wireless channels is standard in the United States?",
    options: [
    "channels 1, 6, 11, and 14",
    "channels 2, 7, 9, and 11",
    "channels 2, 7, and 11",
    "channels 1, 6, and 11"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0113",
    question: "A network engineer is installing an IPv6-only capable device. The client has requested that the device IP address be reachable only from the internal network. Which type of IPv6 address must the engineer assign?",
    options: [
    "IPv4-compatible IPv6 address",
    "unique local address",
    "link-local address",
    "aggregatable global address"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0114",
    question: "What is a requirement for nonoverlapping Wi-Fi channels?",
    options: [
    "different security settings",
    "discontinuous frequency ranges",
    "unique SSIDs",
    "different transmission speeds"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0115",
    question: "A network engineer must implement an IPv6 configuration on the vlan 2000 interface to create a routable locally-unique unicast address that is blocked from being advertised to the internet. Which configuration must the engineer apply?",
    options: [
    "interface vlan 2000 ipv6 address ff00:0000:aaaa::1234:2343/64",
    "interface vlan 2000 ipv6 address fd00::1234:2343/64",
    "interface vlan 2000 ipv6 address fe80:0000:aaaa::1234:2343/64",
    "interface vlan 2000 ipv6 address fc00:0000:aaaa::a15d:1234:2343:8aca/64"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0116",
    question: "What are two characteristics of an SSID? (Choose two.)",
    options: [
    "It uniquely identifies a client in a WLAN.",
    "It is at most 32 characters long",
    "It uniquely identifies an access point in a WLAN",
    "It provides secured access to a WLAN.",
    "It can be hidden or broadcast in a WLAN."
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q0117",
    question: "When a switch receives a frame for a known destination MAC address, how is the frame handled?",
    options: [
    "flooded to all ports except the one from which it originated",
    "forwarded to the first available port",
    "sent to the port identified for the known MAC address",
    "broadcast to all ports"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0119",
    question: "What is the collapsed layer in collapsed core architectures?",
    options: [
    "Core and distribution",
    "access and WAN",
    "distribution and access",
    "core and WAN"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0120",
    question: "What is a characteristic of a SOHO network?",
    options: [
    "includes at least three tiers of devices to provide load balancing and redundancy",
    "connects each switch to every other switch in the network",
    "enables multiple users to share a single broadband connection",
    "provides high throughput access for 1000 or more users"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0121",
    question: "What is the role of disaggregation in controller-based networking?",
    options: [
    "It divides the control-plane and data-plane functions.",
    "It streamlines traffic handling by assigning individual devices to perform either Layer 2 or Layer 3 functions",
    "It summarizes the routes between the core and distribution layers of the network topology",
    "It enables a network topology to quickly adjust from a ring network to a star network"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0122",
    question: "What is a function performed by a web server?",
    options: [
    "send and retrieve email from client devices",
    "securely store files for FTP access",
    "authenticate and authorize a user's identity",
    "provide an application that is transmitted over HTTP"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0123",
    question: "Refer to the exhibit. Site A was recently connected to site B over a new single-mode fiber path. Users at site A report intermittent connectivity issues with applications hosted at site B. What is the reason for the problem?",
    options: [
    "Physical network errors are being transmitted between the two sites.",
    "Heavy usage is causing high latency.",
    "The wrong cable type was used to make the connection.",
    "An incorrect type of transceiver has been inserted into a device on the link"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0124",
    question: "Which protocol uses the SSL?",
    options: [
    "SSH",
    "HTTPS",
    "HTTP",
    "Telnet"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0125",
    question: "Why is UDP more suitable than TCP for applications that require low latency such as VoIP?",
    options: [
    "UDP reliably guarantees delivery of all packets: TCP drops packets under heavy load",
    "UDP uses sequencing data for packets to arrive in order TCP offers the capability to receive packets in random order",
    "TCP uses congestion control for efficient packet delivery: UDP uses flow control mechanisms for the delivery of packets",
    "TCP sends an acknowledgement for every packet received: UDP operates without acknowledgments"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0126",
    question: "What are the two functions of SSIDs? (Choose two.)",
    options: [
    "uses the maximum of 32 alphanumeric characters",
    "controls the speed of the Wi-Fi network",
    "used exclusively with controller-based Wi-Fi networks",
    "supports a single access point",
    "broadcasts by default"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0127",
    question: "Which two characteristics describe the access layer in a three-tier network architecture? (Choose two.)",
    options: [
    "serves as the network aggregation point",
    "physical connection point for a LAN printer",
    "designed to meet continuous redundant uptime requirements",
    "layer at which a wireless access point connects to the wired network",
    "provides a boundary between Layer 2 and Layer 3 communications"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0128",
    question: "Which PoE mode enables powered-devices detection and guarantees power when the device detected?",
    options: [
    "auto",
    "static",
    "dynamic",
    "active"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0129",
    question: "Refer to the exhibit. The router has been configured with a super net to accommodate the requirements for 380 users on a Subnet. The requirement already considers 30% future growth. Which configuration verifies the IP subnet on router R4?",
    options: [
    "Subnet: 10.7.54.0 Subnet mask: 255.255.128.0 Broadcast address: 10.5.55.255 Usable IP address range: 10.7.54.1 ג€ \" 10.7.55.254",
    "Subnet: 10.7.54.0 Subnet mask: 255.255.255.0 Broadcast address: 10.7.54.255 Usable IP address range: 10.7.54.1 ג€ \" 10.7.55.254",
    "Subnet: 10.7.54.0 Subnet mask: 255.255.254.0 Broadcast address: 10.7.54.255 Usable IP address range: 10.7.54.1 ג€ \" 10.7.55.254",
    "Subnet: 10.7.54.0 Subnet mask: 255.255.254.0 Broadcast address: 10.7.55.255 Usable IP address range: 10.7.54.1 10.7.55.254 € \" ג"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0130",
    question: "Refer to the exhibit. Configurations for the switch and PCs are complete. Which configuration must be applied so that VLANs 2 and 3 communicate back and forth?",
    options: [
    "interface GigabitEthernet0/0 ip address 10.10.2.10 255.255.252.0",
    "interface GigabitEthernet0/0.10 encapsulation dot1Q 3 ip address 10.10.2.10 255.255.254.0",
    "interface GigabitEthernet0/0.3 encapsulation dot1Q 3 native ip address 10.10.2.10 255.255.252.0",
    "interface GigabitEthernet0/0.3 encapsulation dot1Q 10 ip address 10.10.2.10 255.255.255.252"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0133",
    question: "How is RFC 1918 addressing used in a network?",
    options: [
    "They are used to access the Internet from the internal network without conversion.",
    "They are used in place of public addresses for Increased security.",
    "They are used with NAT to preserve public IPv4 addresses.",
    "They are used by Internet Service Providers to route over the Internet."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0135",
    question: "Refer to the exhibit. What is a reason for poor performance on the network interface?",
    options: [
    "The interface is receiving excessive broadcast traffic.",
    "The bandwidth setting of the interface is misconfigured.",
    "The cable connection between the two devices is faulty.",
    "The interface is operating at a different speed than the connected device."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0138",
    question: "Which WAN topology has the highest degree of reliability?",
    options: [
    "point-to-point",
    "router-on-a-stick",
    "full mesh",
    "hub-and-spoke"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0140",
    question: "What causes a port to be placed in the err-disabled state?",
    options: [
    "nothing plugged into the port",
    "link flapping",
    "latency",
    "shutdown command issued on the port"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0142",
    question: "A network engineer must configure an interface with IP address 10.10.10.145 and a subnet mask equivalent to 11111111.11111111.11111111.11111000. Which subnet mask must the engineer use?",
    options: [
    "/29",
    "/30",
    "/27",
    "/28"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0143",
    question: "Refer to the exhibit. The switches are connected via a Cat5 Ethernet cable that is tested successfully. The interfaces are configured as access ports and are both in a down status. What is the cause of the issue?",
    options: [
    "The speed settings on the switches are mismatched",
    "The distance between the two switches is not supported by Cat5",
    "The switches are configured with incompatible duplex settings",
    "The portfast command is missing from the configuration"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0144",
    question: "Which two IP addressing schemes provide internet access to users on the network while preserving the public IPv4 address space? (Choose two.)",
    options: [
    "IPv6 addressing",
    "PAT with private internal addressing",
    "single public Class A network",
    "private networks only",
    "custom addresses from ARIN"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0145",
    question: "The address block 192.168.32.0/24 must be subnetted into smaller networks. The engineer must meet these requirements: ✑ Create 8 new subnets. ✑ Each subnet must accommodate 30 hosts. ✑ Interface VLAN 10 must use the last usable IP in the first new subnet. ✑ A Layer 3 interface is used. Which configuration must be applied to the interface?",
    options: [
    "no switchport mode trunk ip address 192.168.32.97 255.255.255.224",
    "switchport ip address 192.168.32.65 255.255.255.240",
    "no switchport ip address 192.168.32.30 255.255.255.224",
    "no switchport mode access ip address 192.168.32.62 255.255.255.240"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0147",
    question: "What are two reasons to deploy private addressing on a network? (Choose two.)",
    options: [
    "to subnet addresses in an organized hierarchy",
    "to reduce network maintenance costs",
    "to segment local IP addresses from the global routing table",
    "to hide sensitive data from access users within an enterprise",
    "to route protected data securely via an Internet service provider"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0149",
    question: "Which property is shared by 10GBase-SR and 10GBase-LR interfaces?",
    options: [
    "Both use the single-mode fiber type.",
    "Both require UTP cable media for transmission.",
    "Both require fiber cable media for transmission.",
    "Both use the multimode fiber type."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0151",
    question: "Which device permits or denies network traffic based on a set of rules?",
    options: [
    "switch",
    "firewall",
    "wireless controller",
    "access point"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0152",
    question: "What is the role of a firewall in an enterprise network?",
    options: [
    "determines which packets are allowed to cross from unsecured to secured networks",
    "processes unauthorized packets and allows passage to less secure segments of the network",
    "forwards packets based on stateless packet inspection",
    "explicitly denies all packets from entering an administrative domain"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0157",
    question: "Which action is taken by a switch port enabled for PoE power classification override?",
    options: [
    "As power usage on a PoE switch port is checked data flow to the connected device is temporarily paused",
    "When a powered device begins drawing power from a PoE switch port, a syslog message is generated",
    "If a switch determines that a device is using less than the minimum configured power, it assumes the device has failed and disconnects it",
    "Should a monitored port exceed the maximum administrative value for power, the port is shut down and err-disabled"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0158",
    question: "What is a function spine-and-leaf architecture?",
    options: [
    "Offers predictable latency of the traffic path between end devices.",
    "Exclusively sends multicast traffic between servers that are directly connected to the spine.",
    "Mitigates oversubscription by adding a layer of leaf switches.",
    "Limits payload size of traffic within the leaf layer."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0159",
    question: "Which action is taken by the data plane within a network device?",
    options: [
    "Constructs a routing table based on a routing protocol.",
    "Forwards traffic to the next hop.",
    "Looks up an egress interface in the forwarding information base.",
    "Provides CLI access to the network device."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0160",
    question: "What is the function of the control plane?",
    options: [
    "It exchanges routing table information.",
    "It provides CLI access to the network device.",
    "It looks up an egress interface in the forwarding information base.",
    "It forwards traffic to the next hop."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0161",
    question: "Which two cable types must be used to connect an access point to the WLC when 2.5-Gbps and 5-Gbps upload speeds are required? (Choose two.)",
    options: [
    "10GBASE-T",
    "1000BASE-LX/LH",
    "Cat 5e",
    "Cat 5",
    "Cat 3"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0162",
    question: "What is a benefit for external users who consume public cloud resources?",
    options: [
    "Implemented over a dedicated WAN",
    "All hosted on physical servers",
    "Accessed over the Internet",
    "Located in the same data center as the users"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0163",
    question: "An engineer must update the configuration on two PCs in two different subnets to communicate locally with each other. One PC is configured with IP address 192.168.25.128/25 and the other with 192.168.25.100/25. Which network mask must the engineer configure on both PCs to enable the communication?",
    options: [
    "255.255.255.248",
    "255.255.255.224",
    "255.255.255.0",
    "255.255.255.252"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0164",
    question: "Which key function is provided by the data plane?",
    options: [
    "Originating packets",
    "Exchanging routing table data",
    "Making routing decisions",
    "Forwarding traffic to the next hop"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0165",
    question: "When should an engineer implement a collapsed-core architecture?",
    options: [
    "Only when using VSS technology",
    "For small networks with minimal need for growth",
    "For large networks that are connected to multiple remote sites",
    "The access and distribution layers must be on the same device"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0166",
    question: "Refer to the exhibit. An engineer assigns IP addressing to the current VLAN with three PCs. The configuration must also account for the expansion of 30 additional VLANS using the same Class C subnet for subnetting and host count. Which command set fulfills the request while reserving address space for the expected growth?",
    options: [
    "Switch(config)#interface vlan 10 Switch(config-if)#ip address 192.168.0.1 265 255.255.252",
    "Switch(config)#interface vlan 10 Switch(config-if)#ip address 192.168.0.1 255 255.255.248",
    "Switch(config)#interface vlan 10 Switch(config-if)#ip address 192.168.0.1 255 255.255.0",
    "Switch(config)#interface vlan 10 Switch(config-if)#ip address 192.168.0.1 255.255.255.128"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0167",
    question: "A client experiences slow throughput from a server that is directly connected to the core switch in a data center. A network engineer finds minimal latency on connections to the server, but data transfers are unreliable, and the output of the show interfaces counters errors command shows a high FCS-Err count on the interface that is connected to the server. What is the cause of the throughput issue?",
    options: [
    "a physical cable fault",
    "a speed mismatch",
    "high bandwidth usage",
    "a cable that is too long"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0168",
    question: "What is the difference between 1000BASE-LX/LH and 1000BASE-ZX interfaces?",
    options: [
    "1000BASE-LX/LH interoperates with multimode and single-mode fiber, and 1000BASE-ZX needs a conditioning patch cable with multimode.",
    "1000BASE-ZX interoperates with dual-rate 100M/1G 10Km SFP over multimode fiber, and 1000BASE-LX/LH supports only single-rate",
    "1000BASE-ZX is supported on links up to 1000km, and 1000BASE-LX/LH operates over links up to 70 km",
    "1000BASE- LX/LH is supported on links up to 10km, and 1000Base-ZX operates over links up to 70 km"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0169",
    question: "What are two reasons to implement IPv4 private addressing on a network? (Choose two.)",
    options: [
    "To enable internal applications to treat the private IPv4 addresses as unique",
    "To facilitate renumbering when merging networks",
    "To expand the routing table on the router",
    "To provide protection from external denial-of-service attacks",
    "To conserve global unique IPv4 addresses"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0170",
    question: "Which concern is addressed with the use of private IPv4 addressing?",
    options: [
    "Lack of routing protocol support for CIDR and VLSM",
    "Lack of security protocols at the network perimeter",
    "Lack of available TCP/UDP ports per IPv5 address",
    "Lack of available publicly routable unique IPv4 address"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0171",
    question: "What is the path for traffic sent from one user workstation to another workstation on a separate switch in a three-tier architecture model?",
    options: [
    "access ג€\" core ג€\" access",
    "access ג€\" distribution ג€\" distribution ג€\" access",
    "access ג€\" core ג€\" distribution ג€\" access",
    "access ג€\" distribution ג€\" core ג€\" distribution ג€\" access"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0172",
    question: "What is the difference between IPv6 unicast and anycast addressing?",
    options: [
    "An individual IPv6 unicast address is supported on a single interface on one node, but an IPv6 anycast address is assigned to a group of interfaces on multiple nodes.",
    "IPv6 anycast nodes must be explicitly configured to recognize the anycast address, but IPv6 unicast nodes require no special configuration.",
    "IPv6 unicast nodes must be explicitly configured to recognize the unicast address, but IPv6 anycast nodes require no special configuration.",
    "Unlike an IPv6 anycast address, an IPv6 unicast address is assigned to a group of interfaces on multiple nodes."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0173",
    question: "Refer to the exhibit. Between which zones do wireless users expect to experience intermittent connectivity?",
    options: [
    "between zones 1 and 2",
    "between zones 2 and 5",
    "between zones 3 and 4",
    "between zones 3 and 6"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0174",
    question: "Which WAN topology provides a combination of simplicity quality, and availability?",
    options: [
    "partial mesh",
    "full mesh",
    "point-to-point",
    "hub-and-spoke"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0177",
    question: "How are the switches in a spine-and-leaf topology interconnected?",
    options: [
    "Each leaf switch is connected to one of the spine switches",
    "Each leaf switch is connected to each spine switch.",
    "Each leaf switch is connected to two spine switches, making a loop.",
    "Each leaf switch is connected to a central leaf switch, then uplinked to a core spine switch."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0178",
    question: "What is the primary effect of the spanning-tree portfast command?",
    options: [
    "It immediately enables the port in the listening state.",
    "It immediately puts the port into the forwarding state when the switch is reloaded.",
    "It enables BPDU messages.",
    "It minimizes spanning-tree convergence time."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0179",
    question: "What occurs when PortFast is enabled on an interface that is connected to another switch?",
    options: [
    "Root port choice and spanning-tree recalculation are accelerated when a switch link goes down.",
    "After spanning-tree converges, PortFast shuts down any port that receives BPDUs.",
    "VTP is allowed to propagate VLAN configuration information from switch to switch automatically.",
    "Spanning-tree fails to detect a switching loop increasing the likelihood of broadcast storms."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0180",
    question: "Which QoS Profile is selected in the GUI when configuring a voice over WLAN deployment?",
    options: [
    "Platinum",
    "Bronze",
    "Gold",
    "Silver"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0181",
    question: "Refer to the exhibit. Which switch in this configuration will be elected as the root bridge? SW1: 0C:E0:38:41:86:07 - SW2: 0C:0E:15:22:05:97 - SW3: 0C:0E:15:1A:3C:9D - SW4: 0C:E0:18:A1:B3:19 -",
    options: [
    "SW1",
    "SW2",
    "SW3",
    "SW4"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0183",
    question: "An engineer needs to configure LLDP to send the port description type length value (TLV). Which command sequence must be implemented?",
    options: [
    "switch(config-if)#lldp port-description",
    "switch#lldp port-description",
    "switch(config-line)#lldp port-description",
    "switch(config)#lldp port-description"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0184",
    question: "Refer to the exhibit. Which switch becomes the root bridge?",
    options: [
    "S1",
    "S2",
    "S3",
    "S4"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0185",
    question: "Which configuration ensures that the switch is always the root for VLAN 750?",
    options: [
    "Switch(config)#spanning-tree vlan 750 priority 38418607",
    "Switch(config)#spanning-tree vlan 750 priority",
    "Switch(config)#spanning-tree vlan 750 root primary",
    "Switch(config)#spanning-tree vlan 750 priority 614440"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0186",
    question: "Refer to the exhibit. After the switch configuration, the ping test fails between PC A and PC B. Based on the output for switch 1, which error must be corrected?",
    options: [
    "The PCs are in the incorrect VLAN.",
    "All VLANs are not enabled on the trunk.",
    "Access mode is configured on the switch ports.",
    "There is a native VLAN mismatch."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0188",
    question: "Which unified access point mode continues to serve wireless clients after losing connectivity to the Cisco Wireless LAN Controller?",
    options: [
    "local",
    "mesh",
    "flexconnect",
    "sniffer"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0189",
    question: "Refer to the exhibit. Which command provides this output?",
    options: [
    "show ip route",
    "show cdp neighbor",
    "show ip interface",
    "show interface"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0190",
    question: "Which mode must be used to configure EtherChannel between two switches without using a negotiation protocol?",
    options: [
    "active",
    "on",
    "auto",
    "desirable"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0191",
    question: "Which mode allows access points to be managed by Cisco Wireless LAN Controllers?",
    options: [
    "bridge",
    "lightweight",
    "mobility express",
    "autonomous"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0192",
    question: "Which two values or settings must be entered when configuring a new WLAN in the Cisco Wireless LAN Controller GUI? (Choose two.)",
    options: [
    "QoS settings",
    "IP address of one or more access points",
    "SSID",
    "profile name",
    "management interface settings"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0193",
    question: "Which command is used to specify the delay time in seconds for LLDP to initialize on any interface?",
    options: [
    "lldp timer",
    "lldp tlv-select",
    "lldp reinit",
    "lldp holdtime"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0194",
    question: "Refer to the exhibit. How does SW2 interact with other switches in this VTP domain?",
    options: [
    "It transmits and processes VTP updates from any VTP clients on the network on its trunk ports.",
    "It processes VTP updates from any VTP clients on the network on its access ports.",
    "It receives updates from all VTP servers and forwards all locally configured VLANs out all trunk ports.",
    "It forwards only the VTP advertisements that it receives on its trunk ports."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0195",
    question: "Refer to the exhibit. Based on the LACP neighbor status, in which mode is the SW1 port channel configured?",
    options: [
    "mode on",
    "active",
    "passive",
    "auto"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0196",
    question: "Two switches are connected and using Cisco Dynamic Trunking Protocol. SW1 is set to Dynamic Auto and SW2 is set to Dynamic Desirable. What is the result of this configuration?",
    options: [
    "The link becomes an access port.",
    "The link is in an error disabled state.",
    "The link is in a down state.",
    "The link becomes a trunk port."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0197",
    question: "A Cisco IP phone receives untagged data traffic from an attached PC. Which action is taken by the phone?",
    options: [
    "It drops the traffic.",
    "It allows the traffic to pass through unchanged.",
    "It tags the traffic with the native VLAN.",
    "It tags the traffic with the default VLAN."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0198",
    question: "Which design element is a best practice when deploying an 802.11b wireless infrastructure?",
    options: [
    "allocating nonoverlapping channels to access points that are in close physical proximity to one another",
    "disabling TCP so that access points can negotiate signal levels with their attached wireless devices",
    "configuring access points to provide clients with a maximum of 5 Mbps",
    "setting the maximum data rate to 54 Mbps on the Cisco Wireless LAN Controller"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0199",
    question: "Refer to the exhibit. The network administrator wants VLAN 67 traffic to be untagged between Switch 1 and Switch 2, while all other VLANs are to remain tagged. Which command accomplishes this task?",
    options: [
    "switchport access vlan 67",
    "switchport trunk allowed vlan 67",
    "switchport private-vlan association host 67",
    "switchport trunk native vlan 67"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0200",
    question: "Which two command sequences must be configured on a switch to establish a Layer 3 EtherChannel with an open-standard protocol? (Choose two.)",
    options: [
    "interface GigabitEthernet0/0/1 channel-group 10 mode auto",
    "interface GigabitEthernet0/0/1 channel-group 10 mode on",
    "interface port-channel 10 no switchport ip address 172.16.0.1 255.255.255.0",
    "interface GigabitEthernet0/0/1 channel-group 10 mode active",
    "interface port-channel 10 switchport switchport mode trunk"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0201",
    question: "Refer to the exhibit. Which two commands when used together create port channel 10? (Choose two.)",
    options: [
    "int range g0/0-1 channel-group 10 mode active",
    "int range g0/0-1 channel-group 10 mode desirable",
    "int range g0/0-1 channel-group 10 mode passive",
    "int range g0/0-1 channel-group 10 mode auto",
    "int range g0/0-1 channel-group 10 mode on"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0202",
    question: "What is the expected outcome when a Cisco phone is connected to the GigabitEthernet 3/1/4 port on a switch?",
    options: [
    "The phone and a workstation that is connected to the phone do not have VLAN connectivity.",
    "The phone sends and receives data in VLAN 50, but a workstation connected to the phone sends and receives data in VLAN 1.",
    "The phone sends and receives data in VLAN 50, but a workstation connected to the phone has no VLAN connectivity.",
    "The phone and a workstation that is connected to the phone send and receive data in VLAN 50."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0203",
    question: "Refer to the exhibit. Which action is expected from SW1 when the untagged frame is received on the GigabitEthernet0/1 interface?",
    options: [
    "The frame is processed in VLAN 1",
    "The frame is processed in VLAN 11",
    "The frame is processed in VLAN 5",
    "The frame is dropped"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0204",
    question: "Which command is used to enable LLDP globally on a Cisco IOS ISR?",
    options: [
    "lldp run",
    "lldp enable",
    "lldp transmit",
    "cdp run",
    "cdp enable"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0205",
    question: "Which command should you enter to configure an LLDP delay time of 5 seconds?",
    options: [
    "lldp timer 5000",
    "lldp holdtime 5",
    "lldp reinit 5000",
    "lldp reinit 5"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0206",
    question: "In a CDP environment, what happens when the CDP interface on an adjacent device is configured without an IP address?",
    options: [
    "CDP becomes inoperable on that neighbor",
    "CDP uses the IP address of another interface for that neighbor",
    "CDP operates normally, but it cannot provide IP address information for that neighbor",
    "CDP operates normally, but it cannot provide any information for that neighbor"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0208",
    question: "When configuring an EtherChannel bundle, which mode enables LACP only if a LACP device is detected?",
    options: [
    "Passive",
    "Desirable",
    "On",
    "Auto",
    "Active"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0209",
    question: "Which VLAN ID is associated with the default VLAN in the given environment?",
    options: [
    "VLAN 1",
    "VLAN 5",
    "VLAN 10",
    "VLAN 20"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0210",
    question: "Which two VLAN IDs indicate a default VLAN? (Choose two.)",
    options: [
    "0",
    "1",
    "1005",
    "1006",
    "4096"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0211",
    question: "Which two pieces of information about a Cisco device can Cisco Discovery Protocol communicate? (Choose two.)",
    options: [
    "the native VLAN",
    "the trunking protocol",
    "the VTP domain",
    "the spanning-tree priority",
    "the spanning-tree protocol"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0212",
    question: "After you deploy a new WLAN controller on your network, which two additional tasks should you consider? (Choose two.)",
    options: [
    "deploy load balancers",
    "configure additional vlans",
    "configure multiple VRRP groups",
    "deploy POE switches",
    "configure additional security policies"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0213",
    question: "How will switch SW2 handle traffic from VLAN 10 on SW1?",
    options: [
    "It sends the traffic to VLAN 10.",
    "It sends the traffic to VLAN 100.",
    "It drops the traffic.",
    "It sends the traffic to VLAN 1."
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0214",
    question: "Which two commands can you use to configure an actively negotiate EtherChannel? (Choose two.)",
    options: [
    "channel-group 10 mode on",
    "channel-group 10 mode auto",
    "channel-group 10 mode passive",
    "channel-group 10 mode desirable",
    "channel-group 10 mode active"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0215",
    question: "How does STP prevent forwarding loops at OSI Layer 2?",
    options: [
    "TTL",
    "MAC address forwarding",
    "Collision avoidance",
    "Port blocking"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0216",
    question: "Which two statements about VTP are true? (Choose two.)",
    options: [
    "All switches must be configured with the same VTP domain name",
    "All switches must be configured to perform trunk negotiation",
    "All switches must be configured with a unique VTP domain name",
    "The VTP server must have the highest revision number in the domain",
    "All switches must use the same VTP version"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0217",
    question: "Which type does a port become when it receives the best BPDU on a bridge?",
    options: [
    "The designated port",
    "The backup port",
    "The alternate port",
    "The root port"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0218",
    question: "Which value can you modify to configure a specific interface as the preferred forwarding interface?",
    options: [
    "The interface number",
    "The port priority",
    "The VLAN priority",
    "The hello time"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0219",
    question: "Which statement about Cisco Discovery Protocol is true?",
    options: [
    "It is a Cisco-proprietary protocol. to verify the type of cable interconnecting two devices",
    "It runs on the network layer. to determine the status of network services on a remote device",
    "It can discover information from routers, firewalls, and switches. to obtain VLAN information from directly connected switches",
    "It runs on the physical layer and the data link layer. Q0220 Nachfragen What are two reasons a network administrator would use CDP? (Choose two.) to verify Layer 2 connectivity between two devices when Layer 3 fails",
    "to obtain the IP address of a connected device in order to telnet to the device Jonny statt C.",
    "to determine the status of the routing protocols between directly connected routers"
    ],
    correct: [0, 2, 3, 4],
    exhibit: false,
  },
  {
    id: "q0221",
    question: "What are two benefits of using VTP in a switching environment? (Choose two.)",
    options: [
    "It allows switches to read frame tags.",
    "It allows ports to be assigned to VLANs automatically.",
    "It maintains VLAN consistency across a switched network.",
    "It allows frames from multiple VLANs to use a single interface.",
    "It allows VLAN information to be automatically propagated throughout the switching environment."
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0222",
    question: "Which three statements are typical characteristics of VLAN arrangements? (Choose three.)",
    options: [
    "A new switch has no VLANs configured.",
    "Connectivity between VLANs requires a Layer 3 device.",
    "VLANs typically decrease the number of collision domains.",
    "Each VLAN uses a separate address space.",
    "A switch maintains a separate bridging table for each VLAN.",
    "VLANs cannot span multiple switches."
    ],
    correct: [1, 3, 4],
    exhibit: false,
  },
  {
    id: "q0223",
    question: "On a corporate network, hosts on the same VLAN can communicate with each other, but they are unable to communicate with hosts on different VLANs. What is needed to allow communication between the VLANs?",
    options: [
    "a router with subinterfaces configured on the physical interface that is connected to the switch",
    "a router with an IP address on the physical interface connected to the switch",
    "a switch with an access link that is configured between the switches",
    "a switch with a trunk link that is configured between the switches"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0224",
    question: "Which statement about LLDP is true?",
    options: [
    "It is a Cisco proprietary protocol.",
    "It is configured in global configuration mode.",
    "The LLDP update frequency is a fixed value.",
    "It runs over the transport layer."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0225",
    question: "What is a function of Wireless LAN Controller?",
    options: [
    "register with a single access point that controls traffic between wired and wireless endpoints",
    "use SSIDs to distinguish between wireless clients",
    "send LWAPP packets to access points",
    "monitor activity on wireless and wired LANs"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0226",
    question: "Which technology is used to improve web traffic performance by proxy caching?",
    options: [
    "WSA",
    "Firepower",
    "ASA",
    "FireSIGHT"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0227",
    question: "What criteria is used first during the root port selection process?",
    options: [
    "local port ID",
    "lowest path cost to the root bridge",
    "lowest neighbor's bridge ID",
    "lowest neighbor's port ID"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0228",
    question: "Which statement about VLAN configuration is true?",
    options: [
    "The switch must be in VTP server or transparent mode before you can configure a VLAN",
    "The switch must be in config-vlan mode before you configure an extended VLAN",
    "Dynamic inter-VLAN routing is supported on VLAN2 through VLAN 4064",
    "A switch in VTP transparent mode save the VLAN databases to the running configuration only"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0229",
    question: "Refer to the exhibit. What two conclusions should be made about this configuration? (Choose two.)",
    options: [
    "The root port is FastEthernet 2/1",
    "The designated port is FastEthernet 2/1",
    "The spanning-tree mode is PVST+",
    "This is a root bridge",
    "The spanning-tree mode is Rapid PVST+"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0230",
    question: "A network engineer must create a diagram of a multivendor network. Which command must be configured on the Cisco devices so that the topology of the network is allowed to be mapped?",
    options: [
    "Device(config)#lldp run",
    "Device(config)#cdp run",
    "Device(config-if)#cdp enable",
    "Device(config)#flow-sampler-map topology"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0231",
    question: "How do AAA operations compare regarding user identification, user services, and access control?",
    options: [
    "Authorization provides access control, and authentication tracks user services",
    "Authentication identifies users, and accounting tracks user services",
    "Accounting tracks user services, and authentication provides access control",
    "Authorization identifies users, and authentication provides access control"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0232",
    question: "What is the difference between RADIUS and TACACS+?",
    options: [
    "RADIUS logs all commands that are entered by the administrator, but TACACS+ logs only start, stop, and interim commands.",
    "TACACS+ separates authentication and authorization, and RADIUS merges them.",
    "TACACS+ encrypts only password information, and RADIUS encrypts the entire payload.",
    "RADIUS is most appropriate for dial authentication, but TACACS+ can be used for multiple types of authentication."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0233",
    question: "What is a difference between local AP mode and FlexConnect AP mode?",
    options: [
    "Local AP mode creates two CAPWAP tunnels per AP to the WLC",
    "Local AP mode causes the AP to behave as if it were an autonomous AP",
    "FlexConnect AP mode fails to function if the AP loses connectivity with the WLC",
    "FlexConnect AP mode bridges the traffic from the AP to the WLC when local switching is configured"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0234",
    question: "The SW1 interface g0/1 is in the down/down state. What are two reasons for the interface condition? (Choose two.)",
    options: [
    "There is a protocol mismatch",
    "There is a duplex mismatch",
    "The interface is shut down",
    "The interface is error-disabled",
    "There is a speed mismatch"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0235",
    question: "How will Link Aggregation be implemented on a Cisco Wireless LAN Controller?",
    options: [
    "The EtherChannel must be configured in ג€mode activeג€.",
    "When enabled, the WLC bandwidth drops to 500 Mbps.",
    "To pass client traffic, two or more ports must be configured.",
    "One functional physical port is needed to pass client traffic."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0236",
    question: "Which two conditions must be met before SSH operates normally on a Cisco IOS switch? (Choose two.)",
    options: [
    "IP routing must be enabled on the switch.",
    "A console password must be configured on the switch.",
    "Telnet must be disabled on the switch.",
    "The switch must be running a k9 (crypto) IOS image.",
    "The ip domain-name command must be configured on the switch."
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0237",
    question: "Refer to the exhibit. Which password must an engineer use to enter the enable mode?",
    options: [
    "adminadmin123",
    "cisco123",
    "default",
    "testing1234"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0238",
    question: "Which state does the switch port move to when PortFast is enabled?",
    options: [
    "blocking",
    "listening",
    "learning",
    "forwarding"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0239",
    question: "Which protocol prompts the Wireless LAN Controller to generate its own local web administration SSL certificate for GUI access?",
    options: [
    "RADIUS",
    "HTTPS",
    "TACACS+",
    "HTTP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0240",
    question: "An engineer must configure interswitch VLAN communication between a Cisco switch and a third- party switch. Which action should be taken?",
    options: [
    "configure DSCP",
    "configure IEEE 802.1q",
    "configure ISL",
    "configure IEEE 802.1p"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0241",
    question: "An engineer requires a switch interface to actively attempt to establish a trunk link with a neighbor switch. What command must be configured?",
    options: [
    "switchport mode trunk",
    "switchport mode dynamic desirable",
    "switchport nonegotiate",
    "switchport mode dynamic auto"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0242",
    question: "Refer to the exhibit. After the election process, what is the root bridge in the HQ LAN? Switch 1: 0C:E0:38:81:32:58 - Switch 2: 0C:0E:15:22:1A:61 - Switch 3: 0C:0E:15:1D:3C:9A - Switch 4: 0C:E0:19:A1:4D:16 -",
    options: [
    "Switch 1",
    "Switch 2",
    "Switch 3",
    "Switch 4"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0243",
    question: "An engineer must establish a trunk link between two switches. The neighboring switch is set to trunk or desirable mode. What action should be taken?",
    options: [
    "configure switchport nonegotiate",
    "configure switchport mode dynamic desirable",
    "configure switchport mode dynamic auto",
    "configure switchport trunk dynamic desirable"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0244",
    question: "Which spanning-tree enhancement avoids the learning and listening states and immediately places ports in the forwarding state?",
    options: [
    "BPDUfilter",
    "PortFast",
    "Backbonefast",
    "BPDUguard"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0245",
    question: "How does the dynamically-learned MAC address feature function?",
    options: [
    "The CAM table is empty until ingress traffic arrives at each port",
    "Switches dynamically learn MAC addresses of each connecting CAM table.",
    "The ports are restricted and learn up to a maximum of 10 dynamically-learned addresses",
    "It requires a minimum number of secure MAC addresses to be filled dynamically"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0246",
    question: "When using Rapid PVST+, which command guarantees the switch is always the root bridge for VLAN 200?",
    options: [
    "spanning-tree vlan 200 priority 614440",
    "spanning-tree vlan 200 priority",
    "spanning-tree vlan 200 root primary",
    "spanning-tree vlan 200 priority 38813258"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0247",
    question: "Refer to the exhibit. Which command must be executed for Gi1/1 on SW1 to passively become a trunk port if Gi1/1 on SW2 is configured in desirable or trunk mode?",
    options: [
    "switchport mode dynamic auto",
    "switchport mode dot1-tunnel",
    "switchport mode dynamic desirable",
    "switchport mode trunk"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0248",
    question: "Refer to the exhibit. The entire contents or the MAC address table are shown. Sales-4 sends a data frame to Sales-1. What does the switch do as it receives the frame from Sales-4?",
    options: [
    "Map the Layer 2 MAC address to the Layer 3 IP address and forward the frame.",
    "Insert the source MAC address and port into the forwarding table and forward the frame to Sales-1.",
    "Perform a lookup in the MAC address table and discard the frame due to a missing entry.",
    "Flood the frame out of all ports except on the port where Sales-1 is connected."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0249",
    question: "Refer to the exhibit. An engineer must configure GigabitEthernet1/1 to accommodate voice and data traffic. Which configuration accomplishes this task?",
    options: [
    "interface gigabitethernet1/1 switchport mode access switchport access vlan 300 switchport voice vlan 400",
    "interface gigabitethernet1/1 switchport mode trunk switchport trunk vlan 300 switchport trunk vlan 400",
    "interface gigabitethernet1/1 switchport mode access switchport voice vlan 300 switchport access vlan 400",
    "interface gigabitethernet1/1 switchport mode trunk switchport trunk vlan 300 switchport voice vlan 400"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0250",
    question: "An engineer needs to add an old switch back into a network. To prevent the switch from corrupting the VLAN database, with action must be taken?",
    options: [
    "Add the switch in the VTP domain with a lower revision number.",
    "Add the switch in the VTP domain with a higher revision number.",
    "Add the switch with DTP set to dynamic desirable.",
    "Add the switch with DTP set to desirable."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0251",
    question: "Which technology prevents client devices from arbitrarily connecting to the network without state remediation?",
    options: [
    "802.11n",
    "802.1x",
    "MAC Authentication Bypass",
    "IP Source Guard"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0252",
    question: "Which protocol does an access point use to draw power from a connected switch?",
    options: [
    "Internet Group Management Protocol",
    "Cisco Discovery Protocol",
    "Adaptive Wireless Path Protocol",
    "Neighbor Discovery Protocol"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0253",
    question: "An administrator must secure the WLC from receiving spoofed association requests. Which steps must be taken to configure the WLC to restrict the requests and force the user to wait 10 ms to retry an association request?",
    options: [
    "Enable MAC filtering and set the SA Query timeout to 10.",
    "Enable 802.1x Layer 2 security and set the Comeback timer to 10.",
    "Enable Security Association Teardown Protection and set the SA Query timeout to 10.",
    "Enable the Protected Management Frame service and set the Comeback timer to 10."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0254",
    question: "Refer to the exhibit. Only four switches are participating in the VLAN spanning-tree process. Branch-1: priority 614440 - Branch-2: priority 39391170 - Branch-3: priority- Branch-4: root primary - Which switch becomes the permanent root bridge for VLAN 5?",
    options: [
    "Branch-1",
    "Branch-2",
    "Branch-3",
    "Branch-4"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0255",
    question: "An engineer must configure traffic for a VLAN that is untagged by the switch as it crosses a trunk link. Which command should be used?",
    options: [
    "switchport trunk encapsulation dot1q",
    "switchport trunk allowed vlan 10",
    "switchport mode trunk",
    "switchport trunk native vlan 10"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0256",
    question: "What are two benefits of using the PortFast feature? (Choose two.)",
    options: [
    "Enabled interfaces are automatically placed in listening state.",
    "Enabled interfaces wait 50 seconds before they move to the forwarding state.",
    "Enabled interfaces never generate topology change notifications.",
    "Enabled interfaces come up and move to the forwarding state immediately.",
    "Enabled interfaces that move to the learning state generate switch topology change notifications."
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0257",
    question: "What is the benefit of configuring PortFast on an interface?",
    options: [
    "The frames entering the interface are marked with the higher priority and then processed faster by a switch.",
    "After the cable is connected, the interface is available faster to send and receive user data.",
    "Real-time voice and video frames entering the interface are processed faster.",
    "After the cable is connected, the interface uses the fastest speed setting available for that cable type."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0259",
    question: "Why does a switch flood a frame to all ports?",
    options: [
    "The frame has zero destination MAC addresses.",
    "The destination MAC address of the frame is unknown.",
    "The source MAC address of the frame is unknown",
    "The source and destination MAC addresses of the frame are the same."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0262",
    question: "Which access point mode relies on a centralized controller for management, roaming, and SSID configuration?",
    options: [
    "lightweight mode",
    "autonomous mode",
    "bridge mode",
    "repeater mode"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0263",
    question: "Refer to the exhibit. A network engineer must configure communication between PC A and the File Server. To prevent interruption for any other communications, which command must be configured?",
    options: [
    "switchport truck allowed vlan 12",
    "switchport truck allowed vlan none",
    "switchport truck allowed vlan add 13",
    "switchport truck allowed vlan remove 10-11"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0264",
    question: "Refer to the exhibit. What is the result if Gig1/11 receives an STP BPDU?",
    options: [
    "The port transitions to STP blocking.",
    "The port immediately transitions to STP forwarding.",
    "The port goes into error-disable state.",
    "The port transitions to the root port."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0265",
    question: "Which access layer threat-mitigation technique provides security based on identity?",
    options: [
    "Dynamic ARP Inspection The trunk does not form, and the ports go into an err-disabled status.",
    "DHCP snooping The trunk forms, but the mismatched native VLANs are merged into a single broadcast",
    "802.1x The trunk forms, but VLAN 99 and VLAN 999 are in a shutdown state.",
    "using a non-default native VLAN Q0266 Nachfragen Refer to the exhibit. Which action do the switches take on the trunk link? domain. The trunk does not form, but VLAN 99 and VLAN 999 are allowed to traverse the link."
    ],
    correct: [2, 1],
    exhibit: true,
  },
  {
    id: "q0267",
    question: "A network engineer must configure two new subnets using the address block 10.70.128.0/19 to meet these requirements: ✑ The first subnet must support 24 hosts. ✑ The second subnet must support 472 hosts. ✑ Both subnets must use the longest subnet mask possible from the address block. Which two configurations must be used to configure the new subnets and meet a requirement to use the first available address in each subnet for the router interfaces? (Choose two.)",
    options: [
    "interface vlan 1148 ip address 10.70.148.1 255.255.254.0",
    "interface vlan 3002 ip address 10.70.147.17 255.255.255.224",
    "interface vlan 4722 ip address 10.70.133.17 255.255.255.192",
    "interface vlan 1234 ip address 10.70.159.1 255.255.254.0",
    "interface vlan 155 ip address 10.70.155.65 255.255.255.224"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0268",
    question: "Refer to the exhibit. An administrator must configure interfaces Gi1/1 and Gi1/3 on switch SW11. PC-1 and PC-2 must be placed in the Data VLAN, and Phone-1 must be placed in the Voice VLAN. Which configuration meets these requirements?",
    options: [
    "interface gigabitethernet1/1 switchport mode access switchport access vlan 8 ! interface gigabitethernet1/3 switchport mode access switchport access vlan 8 switchport voice vlan 9",
    "interface gigabitethernet1/1 switchport mode access switchport access vlan 8 ! interface gigabitethernet1/3 switchport mode trunk switchport trunk vlan 8 switchport voice vlan 9",
    "interface gigabitethernet1/1 switchport mode access switchport access vlan 9 ! interface gigabitethernet1/3 switchport mode trunk switchport trunk vlan 8 switchport trunk vlan 9",
    "interface gigabitethernet1/1 switchport mode access switchport access vlan 8 ! interface gigabitethernet1/3 switchport mode access switchport voice vlan 8 switchport access vlan 9"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0269",
    question: "Refer to the exhibit. Users need to connect to the wireless network with IEEE 802.11r-compatible devices. The connection must be maintained as users travel between floors or to other areas in the building. What must be the configuration of the connection?",
    options: [
    "Disable AES encryption.",
    "Enable Fast Transition and select the FT 802.1x option.",
    "Enable Fast Transition and select the FT PSK option.",
    "Select the WPA Policy option with the CCKM option."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0270",
    question: "Refer to the exhibit. An engineer is asked to insert the new VLAN into the existing trunk without modifying anything previously configured. Which command accomplishes this task?",
    options: [
    "switchport trunk allowed vlan 100-104",
    "switchport trunk allowed vlan 104",
    "switchport trunk allowed vlan all",
    "switchport trunk allowed vlan add 104"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0271",
    question: "Aside from discarding, which two states does the switch port transition through while using RSTP (802.1w)? (Choose two.)",
    options: [
    "blocking",
    "speaking",
    "listening",
    "learning",
    "forwarding Q0272 #autonomousaccesspoint #cloudbasedaccesspoint AAP = Requires and Accessible CBAP = Support und managed"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0273",
    question: "Which interface mode must be configured to connect the lightweight APs in a centralized architecture?",
    options: [
    "WLAN dynamic",
    "trunk",
    "access",
    "management"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0274",
    question: "Refer to the exhibit. The following must be considered: ✑ SW1 is fully configured for all traffic. ✑ The SW4 and SW9 links to SW1 have been configured. ✑ The SW4 interface Gi0/1 and Gi0/0 on SW9 have been configured. ✑ The remaining switches have had all VLANs added to their VLAN database. Which configuration establishes a successful ping from PC2 to PC7 without interruption to traffic flow between other PCs?",
    options: [
    "SW4 interface Gi0/7 switchport mode trunk switchport trunk allowed vlan 108 ! interface Gi/0/2 switchport mode access switchport access vlan 14 SW11# interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14,108 ! interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 14,108 SW9# interface Gi0/2 switchport mode access switchport access vlan 14",
    "SW4 interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14,108 SW11# interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14,108 !! interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 14,108 SW9# interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14",
    "SW4 interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14 SW11# interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 14 SW9# interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 108",
    "SW4 interface Gi/0/2 switchport mode access switchport access vlan 14 SW11# interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 14 ! interface Gi0/0 switchport mode access switchport access vlan 14 ! interface Gi0/1 switchport mode trunk SW9# interface Gi0/2 switchport mode access switchport access vlan 14"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0275",
    question: "Refer to the exhibit. The network administrator must prevent the switch Cat9K-2 IP address from being visible in LLDP without disabling the protocol. Which action must be taken to complete the task?",
    options: [
    "Configure the no lldp mac-phy-cfg command globally on Cat9K-2.",
    "Configure the no lldp receive command on interface G1/0/21 on Cat9K-1.",
    "Configure the no lldp transmit command on interface G1/0/21 on Cat9K-1.",
    "Configure the no lldp tlv-select management-address command globally on Cat9K-2."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0276",
    question: "Refer to the exhibit. An engineer has started to configure replacement switch SW1. To verify part of the configuration, the engineer issued the commands as shown and noticed that the entry for PC2 is missing. Which change must be applied to SW1 so that PC1 and PC2 communicate normally?",
    options: [
    "SW1(config)#interface fa0/2 SW1(config-if)#no switchport access vlan 2 SW1(config-if)#no switchport trunk allowed vlan 3 SW1(config-if)#switchport trunk allowed vlan 2",
    "SW1(config)#interface fa0/2 SW1(config-if)#no switchport access vlan 2 SW1(config- if)#switchport trunk native vlan 2 SW1(config-if)#switchport trunk allowed vlan 3",
    "SW1(config)#interface fa0/2 SW1(config-if)#no switchport mode trunk SW1(config-if)#no switchport trunk allowed vlan 3 SW1(config-if)#switchport mode access",
    "SW1(config)#interface fa0/1 SW1(config-if)#no switchport access vlan 2 SW1(config- if)#switchport access vlan 3 SW1(config-if)#switchport trunk allowed vlan 2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0277",
    question: "Refer to the exhibit. Which switch becomes the root of the spanning tree? Switch 1 - BID: 32778 0018.184e.3c00 - Switch 2 - BID: 24586 001a.e3ff.a680 - Switch 3 - BID: 28682 0022.55cf.cc00 - Switch 4 - BID: 64000 4e15.8403.08f -",
    options: [
    "Switch 1",
    "Switch 2",
    "Switch 3",
    "Switch 4"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0279",
    question: "Refer to the exhibit. An engineer is configuring a Layer 3 port-channel interface with LACP. The configuration on the first device is complete, and it is verified that both interfaces have registered the neighbor device in the CDP table. Which task on the neighbor device enables the new port channel to come up without negotiating the channel?",
    options: [
    "Configure the IP address of the neighboring device.",
    "Bring up the neighboring interfaces using the no shutdown command.",
    "Change the EtherChannel mode on the neighboring interfaces to auto.",
    "Modify the static EtherChannel configuration of the device to passive mode."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0280",
    question: "Refer to the exhibit. Which configuration establishes a Layer 2 LACP EtherChannel when applied to both switches?",
    options: [
    "Interface range G1/1 1/3 € \" ג switchport mode trunk channel-group 1 mode active no shutdown",
    "Interface range G1/1 ג€ \" 1/3 switchport mode access channel-group 1 mode passive no shutdown",
    "Interface range G1/1 ג€ \" 1/3 switchport mode trunk channel-group 1 mode desirable no shutdown",
    "Interface range G1/1 ג€ \" 1/3 switchport mode access channel-group 1 mode on no shutdown"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0281",
    question: "Which switching concept is used to create separate broadcast domains?",
    options: [
    "STP",
    "VTP",
    "VLAN",
    "CSMA/CD"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0282",
    question: "Refer to the exhibit. Which action must be taken so that neighboring devices rapidly discover switch Cat9300?",
    options: [
    "Enable portfast on the ports that connect to neighboring devices.",
    "Configure the cdp timer 10 command on switch Cat9300.",
    "Configure the cdp holdtime 10 command on switch Cat9300",
    "Configure the cdp timer 10 command on the neighbors of switch Cat9300"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0283",
    question: "What is a requirement when configuring or removing LAG on a WLC?",
    options: [
    "The incoming and outgoing ports for traffic flow must be specified if LAG is enabled.",
    "The management interface must be reassigned if LAG is disabled",
    "The controller must be rebooted after enabling or reconfiguring LAG",
    "Multiple untagged interfaces on the same port must be supported"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0285",
    question: "Which type of port is used to connect the wired network when an autonomous AP maps two VLANs to its WLANs?",
    options: [
    "access",
    "LAG",
    "trunk",
    "EtherChannel"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0286",
    question: "A network administrator needs to aggregate 4 ports into a single logical link which must negotiate layer 2 connectivity to ports on another switch. What must be configured when using active mode on both sides of the connection?",
    options: [
    "LLDP",
    "LACP",
    "Cisco vPC",
    "802 1q trunks"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0287",
    question: "Refer to the exhibit. An engineer built a new L2 LACP EtherChannel between SW1 and SW2 and executed these show commands to verify the work establish an LACP port channel?",
    options: [
    "Change the channel-group mode on SW1 to desirable",
    "Change the channel-group mode on SW1 to active or passive",
    "Change the channel-group mode on SW2 to auto",
    "Configure the interface port-channel 1 command on both swtiches"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0288",
    question: "Refer to the exhibit. For security reasons, automatic neighbor discovery must be disabled on the R5 Gi0/1 interface. These tasks must be completed: ✑ Disable all neighbor discovery methods on R5 interface Gi0/1 ✑ Permit neighbor discovery on R5 interface Gi0/2. ✑ Verify there are no dynamically learned neighbors on R5 interface Gi0/1. ✑ Display the IP address of R6's interface Gi0/2 Which configuration must be used?",
    options: [
    "R5(config)#int Gi0/1 R5(config-if)#no cdp enable R5(config-if)#exit R5(config)#lldp run R5(config)#no cdp run R5#sh cdp neighbor detail R5#sh lldp neighbor",
    "R5(config)#int Gi0/1 R5(config-if)#no cdp enable R5(config-if)#exit R5(config)#no lldp run R5(config)#cdp run R5#sh cdp neighbor R5#sh lldp neighbor",
    "R5(config)#int Gi0/1 R5(config-if)#no cdp run R5(config-if)#exit R5(config)#lldp run R5(config)#cdp enable R5#sh cdp neighbor R5#sh lldp neighbor",
    "R5(config)#int Gi0/1 R5(config-if)#no cdp enable R5(config-if)#exit R5(config)#no lldp run R5(config)#cdp run R5#sh cdp neighbor detail R5#sh lldp neighbor"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0289",
    question: "Which two spanning-tree states are bypassed on an interface running PortFast? (Choose two.)",
    options: [
    "disabled",
    "listening",
    "learning",
    "blocking",
    "forwarding"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0291",
    question: "An engineer is configuring data and voice services to pass through the same port. The designated switch interface fastethernet0/1 must transmit packets using the same priority for data when they are received from the access port of the IP phone. Which configuration must be used?",
    options: [
    "interface fastethernet0/1 switchport voice vlan dot1p",
    "interface fastethernet0/1 switchport priority extend cos 7",
    "interface fastethernet0/1 switchport voice vlan untagged",
    "interface fastethernet0/1 switchport priority extend trust"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0292",
    question: "Refer to the exhibit. Which change to the configuration on Switch2 allows the two switches to establish an EtherChannel?",
    options: [
    "Change the LACP mode to desirable",
    "Change the protocol to PAgP and use auto mode",
    "Change the LACP mode to active",
    "Change the protocol to EtherChannel mode on"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0293",
    question: "Refer to the exhibit. An engineer must configure the interface that connects to PC1 and secure it in a way that only PC1 is allowed to use the port. No VLAN tagging can be used except for a voice VLAN. Which command sequence must be entered to configure the switch?",
    options: [
    "SW1(config-if)#switchport mode dynamic auto SW1(config-if)#switchport port-security SW1(config-if)#switchport port-security violation restrict",
    "SW1(config-if)#switchport mode nonegotiate SW1(config-if)#switchport port-security SW1(config-if)#switchport port-security maximum 1",
    "SW1(config-if)#switchport mode access SW1(config-if)#switchport port-security SW1(config-if)#switchport port-security mac-address 0050.7966.6800",
    "SW1(config-if)#switchport mode dynamic desirable SW1(config-if)#switchport port- security mac-address 0050.7966.6800 SW1(config-if)#switchport port-security mac-address sticky"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0294",
    question: "Which protocol must be implemented to support separate authorization and authentication solutions for wireless APs?",
    options: [
    "RADIUS",
    "TACACS+",
    "802.1X",
    "Kerberos"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0295",
    question: "Which port type supports the spanning-tree portfast command without additional configuration?",
    options: [
    "trunk ports",
    "Layer 3 sub interfaces",
    "Layer 3 main interfaces",
    "access ports"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0296",
    question: "Refer to the exhibit. What are two conclusions about this configuration? (Choose two.)",
    options: [
    "The spanning-tree mode is Rapid PVST+",
    "This tea root bridge",
    "The spanning-tree mode is PVST+",
    "The designated port is FastEthernet 2/1",
    "The root port is FastEthernet 2/1"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0297",
    question: "A Cisco engineer must configure a single switch interface to meet these requirements: ✑ Accept untagged frames and place them in VLAN 20 Accept tagged frames in VLAN 30 when CDP detects a Cisco IP phone Which command set must the engineer apply?",
    options: [
    "switchport mode dynamic desirable switchport access vlan 20 switchport trunk allowed vlan 30 switchport voice vlan 30",
    "switchport mode access switchport access vlan 20 switchport voice vlan 30",
    "switchport mode dynamic auto switchport trunk native vlan 20 switchport trunk allowed vlan 30 switchport voice vlan 30",
    "switchport mode trunk switchport access vlan 20 switchport voice vlan 30"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0298",
    question: "What does a switch use to build its MAC address table?",
    options: [
    "VTP",
    "DTP",
    "ingress traffic",
    "egress traffic"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0299",
    question: "Refer to the exhibit. The EtherChannel is configured with a speed of 1000 and duplex as full on both ends of channel group 1. What is the next step to configure the channel on switch A to respond to but not initiate LACP communication?",
    options: [
    "interface range gigabitethernet0/0/0-15 channel-group 1 mode on",
    "interface range gigabitethernet0/0/0-15 channel-group 1 mode desirable",
    "interface port-channel 1 channel-group 1 mode auto",
    "interface port-channel 1 channel-group 1 mode passive"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0300",
    question: "Which command entered on a switch configured with Rapid PVST+ listens and learns for a specific time period?",
    options: [
    "switch(config)#spanning-tree vlan 1 priority 4096",
    "switch(config)#spanning-tree vlan 1 hello-time 10",
    "switch(config)#spanning-tree vlan 1 max-age 6",
    "switch(config)#spanning-tree vlan 1 forward-time 20"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0301",
    question: "What must a network administrator consider when deciding whether to configure a new wireless network with APs in autonomous mode or APs running in cloud- based mode?",
    options: [
    "Autonomous mode APs are less dependent on an underlay but more complex to maintain than APs in cloud-based mode.",
    "Cloud-based mode APs relay on underlays and are more complex to maintain than APs in autonomous mode.",
    "Cloud-based mode APs are easy to deploy but harder to automate than APs in autonomous mode.",
    "Autonomous mode APs are easy to deploy and automate than APs in cloud-based mode."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0302",
    question: "When a switch receives a frame for an unknown destination MAC address, how is the frame handled?",
    options: [
    "flooded to all ports except the origination port",
    "forwarded to the first available port",
    "broadcast to all ports on the switch",
    "inspected and dropped by the switch"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0303",
    question: "Which state is bypassed in Rapid PVST+ when PortFast is enabled on a port?",
    options: [
    "blocking",
    "forwarding",
    "learning",
    "discarding"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0304",
    question: "What happens when a switch receives a frame with a destination MAC address that recently aged out?",
    options: [
    "The switch floods the frame to all ports in all VLANs except the port that received the frame.",
    "The switch floods the frame to all ports in the VLAN except the port that received the frame.",
    "The switch references the MAC address aging table for historical addresses on the port that received the frame.",
    "The switch drops the frame and learns the destination MAC address again from the port that received the frame."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0305",
    question: "What is a function of store-and forward switching?",
    options: [
    "It reduces latency by eliminating error checking within the frame",
    "It produces an effective level of error-free network traffic using CRCs.",
    "It buffers frames and forwards regardless of errors within the frames.",
    "It forwards a frame by checking only the destination MAC address"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0306",
    question: "Refer to the exhibit. Switch AccSw1 has just been added to the network along with PC2. All VLANs have been implemented on AccSw2. How must the ports on AccSw2 be configured to establish Layer 2 connectivity between PC1 and PC2?",
    options: [
    "interface GigabitEthernet1/2 switchport mode access switchport access vlan 2 ! interface GigabitEthernet1/24 switchport mode trunk",
    "interface GigabitEthernet1/1 switchport mode access switchport access vlan 11 ! interface GigabitEthernet1/24 switchport mode trunk",
    "interface GigabitEthernet1/24 switchport mode trunk switchport trunk allowed vlan 11, 12 ! interface GigabitEthernet1/1 switchport access vlan 11",
    "interface GigabitEthernet1/2 switchport mode access switchport access vlan 12 ! interface GigabitEthernet1/24 switchport mode trunk switchport trunk allowed vlan 11, 12"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0307",
    question: "Refer to the exhibit. A network engineer must update the configuration on Switch2 so that it sends LLDP packets every minute and the information sent via LLDP is refreshed every 3 minutes. Which configuration must the engineer apply?",
    options: [
    "Switch2(config)#lldp timer 60 Switch2(config)#lldp tlv-select 180",
    "Switch2(config)#lldp timer 60 Switch2(config)#lldp holdtime 180",
    "Switch2(config)#lldp timer 1 Switch2(config)#lldp holdtime 3",
    "Switch2(config)#lldp timer 1 Switch2(config)#lldp tlv-select 3"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0308",
    question: "Refer to the exhibit. Switch A is newly configured. All VLANs are present in the VLAN database. The IP phone and PC A on Gi0/1 must be configured for the appropriate VLANs to establish connectivity between the PCs. Which command set fulfills the requirement?",
    options: [
    "SwitchA(config-if)#switchport mode access SwitchA(config-if)#switchport access vlan 50 SwitchA(config-if)#switchport voice vlan 51",
    "SwitchA(config-if)#switchport mode trunk SwitchA(config-if)#switchport trunk allowed vlan add 50, 51 SwitchA(config-if)#switchport voice vlan dot1p",
    "SwitchA(config-if)#switchport mode trunk SwitchA(config-if)#switchport trunk allowed vlan 50, 51 SwitchA(config-if)#mis qos trust cos",
    "SwitchA(config-if)#switchport mode access SwitchA(config-if)#switchport access vlan 50 SwitchA(config-if)#switchport voice vlan untagged"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0309",
    question: "Refer to the exhibit. Two new switches are being installed. The remote monitoring team uses the support network to monitor both switches. Which configuration is the next step to establish a Layer 2 connection between the two PCs?",
    options: [
    "SwitchA(config)#interface GigabitEthernet0/1 SwitchA(config-if)#switchport access vlan 500 SwitchB(config)#interface GigabitEthernet0/1 SwitchB(config-if)#switchport access vlan 500",
    "SwitchA(config)#interface GigabitEthernet0/1 SwitchA(config-if)#switchport mode trunk SwitchB(config)#interface GigabitEthernet0/1 SwitchB(config-if)#switchport mode trunk",
    "SwitchA(config)#interface GigabitEthernet0/0 SwitchA(config-if)#switchport trunk allowed vlan 500, 550 SwitchB(config)#interface GigabitEthernet0/0 SwitchB(config-if)#switchport trunk allowed vlan 500, 550",
    "SwitchA(config)#interface GigabitEthernet0/0 SwitchA(config-if)#spanning-tree portfast SwitchA(config-if)#spanning-tree bpduguard enable SwitchB(config)#interface GigabitEthernet0/0 SwitchB(config-if)#spanning-tree portfast SwitchB(config-if)#spanning-tree bpduguard enable"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0310",
    question: "Refer to the exhibit. An engineer is configuring a new Cisco switch, NewSW, to replace SW2. The details have been provided: ✑ Switches SW1 and SW2 are third-party devices without support for trunk ports. ✑ The existing connections must be maintained between PC1, PC2, and PC3. ✑ Allow the switch to pass traffic from future VLAN 10. Which configuration must be applied?",
    options: [
    "NewSW(config)#interface f0/0 • NewSW(config-if)#switchport mode trunk • NewSW(config-if)#switchport trunk native vlan 10 •  NewSW(config-if)#switchport trunk native vlan 10 •",
    "NewSW(config)#interface f0/0 •  NewSW(config-if)#switchport mode access • NewSW(config-if)#switchport trunk allowed vlan 2, 10 • NewSW(config-if)#switchport trunk native vlan 2 •",
    "NewSW(config)#interface f0/0 • NewSW(config-if)#switchport mode access • NewSW(config-if)#switchport trunk allowed vlan 2, 10 • NewSW(config-if)#switchport trunk native vlan 10 •",
    "NewSW(config)#interface f0/0 • NewSW(config-if)#switchport mode trunk • NewSW(config-if)#switchport trunk allowed vlan 2, 10 • NewSW(config-if)#switchport trunk native vlan 2"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0311",
    question: "Which WLC interface provides out-of-band management in the Cisco Unified Wireless Network Architecture?",
    options: [
    "AP-Manager",
    "service port",
    "dynamic",
    "virtual"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0312",
    question: "Refer to the exhibit. The network engineer is configuring a new WLAN and is told to use a setup password for authentication instead of the RADIUS servers. Which additional set of tasks must the engineer perform to complete the configuration?",
    options: [
    "Disable PMF Enable PSK Enable 802.1x",
    "Select WPA Policy Enable CCKM Enable PSK",
    "Select WPA Policy Select WPA2 Policy Enable FT PSK",
    "Select WPA2 Policy Disable PMF Enable PSK"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0313",
    question: "Which mode must be set for Aps to communicate to a Wireless LAN Controller using the Control and Provisioning of Wireless Access Points (CAPWAP) protocol?",
    options: [
    "route",
    "bridge",
    "lightweight",
    "autonomous"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0314",
    question: "Which switch technology establishes a network connection immediately when it is plugged in?",
    options: [
    "PortFast",
    "BPDU guard",
    "UplinkFast",
    "BackboneFast"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0315",
    question: "Which command on a port enters the forwarding state immediately when a PC is connected to it?",
    options: [
    "switch(config)#spanning-tree portfast default",
    "switch(config)#spanning-tree portfast bpduguard default",
    "switch(config-if)#spanning-tree portfast trunk",
    "switch(config-if)#no spanning-tree portfast"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0316",
    question: "If a switch port receives a new frame while it is actively transmitting a previous frame, how does it process the frames?",
    options: [
    "The new frame is delivered first, the previous frame is dropped, and a retransmission request is sent",
    "The previous frame is delivered, the new frame is dropped, and a retransmission request is sent",
    "The new frame is placed in a queue for transmission after the previous frame",
    "The two frames are processed and delivered at the same time"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0317",
    question: "Refer to the exhibit. The entire MAC address table for SW1 is shown here: What does SW1 do when Br-4 sends a frame for Br-2",
    options: [
    "It performs a lookup in the MAC address table for Br-4 and discards toe frame due to a missing entry.",
    "It floods the frame out or all ports except on the port where Br-2 is connected.",
    "It Inserts the source MAC address and port into the forwarding table and forwards the frame to Br-2.",
    "It maps the Layer 2 MAC address for Fa0/3 to the Layer 3 IP address and towards the frame."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0318",
    question: "Which statement about Link Aggregation when implemented on a Cisco Wireless LAN Controller is true?",
    options: [
    "To pass client traffic two or more ports must be configured",
    "The EtherChannel must be configured in ג€mode activeג€",
    "When enabled, the WLC bandwidth drops to 500 Mbps",
    "One functional physical port is needed to pass client traffic"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0320",
    question: "Refer to the exhibit. The entire Marketing-SW1 MAC address table is shown here: What does the switch do when PC-4 sends a frame to PC-1?",
    options: [
    "It performs a lookup in the MAC address table and discards the frame due to a missing entry.",
    "It maps the Layer 2 MAC address to the Layer 3 IP address and forwards the frame.",
    "It inserts the source MAC address and port into the table and forwards the frame to PC-1.",
    "It floods the frame out of all ports except on the port where PC-1 is connected."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0322",
    question: "Refer to the exhibit. Which switch becomes the root of a spanning tree for VLAN 10 if the primary switch fails and all links are of equal speed?",
    options: [
    "SW1",
    "SW2",
    "SW3",
    "SW4"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0323",
    question: "Refer to the exhibit. Host A sent a data frame destined for host D. What does the switch do when it receives the frame from host A?",
    options: [
    "It floods the frame out of all ports except port Fa0/1",
    "It experiences a broadcast storm",
    "It shuts down the port Fa0/1 and places it in err-disable mode",
    "It drops the frame from the switch CAM table"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0324",
    question: "Refer to the exhibit. Which switch becomes the root of the spanning tree?",
    options: [
    "Switch 1",
    "Switch 2",
    "Switch 3",
    "Switch 4"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0325",
    question: "Which channel-group mode must be configured when multiple distribution interfaces connected to a WLC are bundled?",
    options: [
    "Channel-group mode passive. SW1",
    "Channel-group mode on. SW2",
    "Channel-group mode desirable. SW3",
    "Channel-group mode active. Q 0326 Topic Refer to the exhibit. Which switch become the root of a spanning tree for VLAN 20 if all links are of equal speed? SW4"
    ],
    correct: [1, 0],
    exhibit: true,
  },
  {
    id: "q0327",
    question: "Which Layer 2 switch function encapsulates packets for different VLANs so that the packets transverse the same port and maintain traffic separation between the VLANs?",
    options: [
    "VLAN marking",
    "VLAN numbering",
    "VLAN DSCP",
    "VLAN tagging"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0328",
    question: "Which value is the unique identifier that an access point uses to establish and maintain wireless connectivity to wireless network devices?",
    options: [
    "VLAN ID",
    "(B)SSID",
    "RFID",
    "WLAN ID"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0329",
    question: "An engineer must configure neighbor discovery between the company router and an ISP. What is the next step to complete the configuration if the ISP uses a third-party router?",
    options: [
    "Enable LLDP globally.",
    "Disable CDP on gi0/0.",
    "Enable LLDP TLVs on the ISP router.",
    "Disable auto-negotiation."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0331",
    question: "What is a function of MAC learning on a switch?",
    options: [
    "MAC address learning is disabled by default on all VLANs.",
    "Frames received for a destination MAC address not listed in the address table are dropped.",
    "The MAC address table is used to populate the ARP table.",
    "A static MAC address is manually added to the MAC table."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0332",
    question: "What does a switch do when it receives a frame whose destination MAC address is missing from the MAC address table?",
    options: [
    "It changes the checksum of the frame to a value that indicates an invalid frame.",
    "It updates the CAM table with the destination MAC address of the frame.",
    "It appends the table with a static entry for the MAC and shuts down the port.",
    "It floods the frame unchanged across all remaining ports in the incoming VLAN."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0333",
    question: "By default, how long will the switch continue to know a workstation MAC address after the workstation stops sending traffic?",
    options: [
    "200 seconds",
    "300 seconds",
    "600 seconds",
    "900 seconds"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0334",
    question: "A project objective is to minimize the association time to the different access points as mobile devices move around the office. The ideal solution must cover numerous devices and device types, including laptops, mobile phones, tablets and wireless printers. What must be configured?",
    options: [
    "802.11v BSS Max Idle Service",
    "802.11v Disassociation Imminent",
    "802.11ax BSS configure",
    "802.11k neighbor List Dual Band"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0337",
    question: "A WLC sends alarms about a rogue AP, and the network administrator verifies that the alarms are caused by a legitimate autonomous AP. How must the alarms be stopped for the MAC address of the AP?",
    options: [
    "Remove the AP from WLC management",
    "Place the AP into manual containment.",
    "Manually remove the AP from Pending state.",
    "Set the AP Class Type to Friendly."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0338",
    question: "What is one reason to implement LAG on a Cisco WLC?",
    options: [
    "to increase security and encrypt management frames",
    "to enable connected switch ports to failover and use different VLANs",
    "to provide link redundancy and load balancing",
    "to allow for stateful and link-state failover"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0339",
    question: "When an access point is seeking to join wireless LAN controller, which message is sent to the AP- Manager interface?",
    options: [
    "Discovery response",
    "DHCP request",
    "DHCP discover",
    "Discovery request"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0340",
    question: "Refer to the exhibit. A network engineer configures the Cisco WLC to authenticate local wireless clients against a RADIUS server. Which task must be performed to complete the process?",
    options: [
    "Change the Support for CoA to Enabled",
    "Select Enable next to Management",
    "Select Enable next to Network User",
    "Change the Server Status to Disabled"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0341",
    question: "After installing a new Cisco ISE server which task must the engineer perform on the Cisco WLC to connect wireless clients on a specific VLAN based on their credentials?",
    options: [
    "Disable the LAG Mode on Next Reboot.",
    "Enable the Event Driven RRM.",
    "Enable the Allow AAA Override.",
    "Enable the Authorize MIC APs against auth-list or AAA"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0342",
    question: "Refer to the exhibit. Router R1 is running three different routing protocols. Which route characteristic is used by the router to forward the packet that it receives for destination IP 172.16.32.1?",
    options: [
    "longest prefix",
    "administrative distance",
    "cost",
    "metric"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0343",
    question: "Refer to the exhibit. Router R1 Fa0/0 cannot ping router R3 Fa0/1. Which action must be taken in router R1 to help resolve the configuration issue?",
    options: [
    "set the default gateway as 20.20.20.2",
    "configure a static route with Fa0/1 as the egress interface to reach the 20.20.2.0/24 network",
    "configure a static route with 10.10.10.2 as the next hop to reach the 20.20.20.0/24 network",
    "set the default network as 20.20.20.0/24"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0344",
    question: "By default, how does EIGRP determine the metric of a route for the routing table?",
    options: [
    "It uses the bandwidth and delay values of the path to calculate the route metric.",
    "It uses a default metric of 10 for all routes that are learned by the router.",
    "It counts the number of hops between the receiving and destination routers and uses that value as the metric.",
    "It uses a reference bandwidth and the actual bandwidth of the connected link to calculate the route metric."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0345",
    question: "Router R1 must send all traffic without a matching routing-table entry to 192.168.1.1. Which configuration accomplishes this task?",
    options: [
    "R1#config t R1(config)#ip routing R1(config)#ip route default-route 192.168.1.1",
    "R1#config t R1(config)#ip routing R1(config)#ip route 192.168.1.1 0.0.0.0 0.0.0.0",
    "R1#config t R1(config)#ip routing R1(config)#ip route 0.0.0.0 0.0.0.0 192.168.1.1",
    "R1#config t R1(config)#ip routing R1(config)#ip default-gateway 192.168.1.1"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0346",
    question: "A packet is destined for 10.10.1.22. Which static route does the router choose to forward the packet?",
    options: [
    "ip route 10.10.1.0 255.255.255.240 10.10.255.1",
    "ip route 10.10.1.20 255.255.255.252 10.10.255.1",
    "ip route 10.10.1.16 255.255.255.252 10.10.255.1",
    "ip route 10.10.1.20 255.255.255.254 10.10.255.1"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0347",
    question: "Refer to the exhibit. How does the router manage traffic to 192.168.12.16?",
    options: [
    "It chooses the EIGRP route because it has the lowest administrative distance.",
    "It load-balances traffic between all three routes.",
    "It chooses the OSPF route because it has the longest prefix inclusive of the destination address.",
    "It selects the RIP route because it has the longest prefix inclusive of the destination address."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0348",
    question: "What are two reasons for an engineer to configure a floating static route? (Choose two.)",
    options: [
    "to enable fallback static routing when the dynamic routing protocol fails",
    "to route traffic differently based on the source IP of the packet",
    "to automatically route traffic on a secondary path when the primary path goes down",
    "to support load balancing via static routing",
    "to control the return path of traffic that is sent from the router"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0349",
    question: "Refer to the exhibit. How does router R1 handle traffic to 192.168.10.16?",
    options: [
    "It selects the IS-IS route because it has the shortest prefix inclusive of the destination address",
    "It selects the RIP route because it has the longest prefix inclusive of the destination address",
    "It selects the OSPF route because it has the lowest cost",
    "It selects the EIGRP route because it has the lowest administrative distance"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0350",
    question: "Refer to the exhibit. A router received these five routes from different routing information sources. Which two routes does the router install in its routing table? (Choose two.)",
    options: [
    "OSPF route 10.0.0.0/30",
    "IBGP route 10.0.0.0/30",
    "OSPF route 10.0.0.0/16",
    "EIGRP route 10.0.0.1/32",
    "RIP route 10.0.0.0/30"
    ],
    correct: [0, 3],
    exhibit: true,
  },
  {
    id: "q0351",
    question: "Refer to the exhibit. To which device does Router1 send packets that are destined to host 10.10.13.165?",
    options: [
    "Router2",
    "Router3",
    "Router4",
    "Router5"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0352",
    question: "R1 has learned route 10.10.10.0/24 via numerous routing protocols. Which route is installed?",
    options: [
    "route with the next hop that has the highest IP",
    "route with the lowest cost",
    "route with the lowest administrative distance",
    "route with the shortest prefix length"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0353",
    question: "Which two minimum parameters must be configured on an active interface to enable OSPFV2 to operate? (Choose two.)",
    options: [
    "OSPF process ID",
    "OSPF MD5 authentication key",
    "OSPF stub flag",
    "IPv6 address",
    "OSPF area"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0354",
    question: "Refer to the exhibit. What commands are needed to add a sub-interface to Ethernet0/0 on R1 to allow for VLAN 20, with IP address 10.20.20.1/24?",
    options: [
    "R1(config)#interface ethernet0/0 R1(config-if)#encapsulation dot1q 20 R1(config-if)#ip address 10.20.20.1 255.255.255.0",
    "R1(config)#interface ethernet0/0.20 R1(config-if)#encapsulation dot1q 20 R1(config-if)#ip address 10.20.20.1 255.255.255.0",
    "R1(config)#interface ethernet0/0.20 R1(config-if)#ip address 10.20.20.1 255.255.255.0",
    "R1(config)#interface ethernet0/0 R1(config-if)#ip address 10.20.20.1 255.255.255.0"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0355",
    question: "Refer to the exhibit. What does router R1 use as its OSPF router-ID?",
    options: [
    "10.10.1.10",
    "10.10.10.20",
    "172.16.15.10",
    "192.168.0.1"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0356",
    question: "Refer to the exhibit. The loopback1 interface of the Atlanta router must reach the loopback3 interface of the Washington router. Which two static host routes must be configured on the New York router? (Choose two.)",
    options: [
    "ipv6 route 2000::3/128 s0/0/0",
    "ipv6 route 2000::1/128 s0/0/1",
    "ipv6 route 2000::1/128 2012::1",
    "ipv6 route 2000::1/128 2012::2",
    "ipv6 route 2000::3/128 2023::3"
    ],
    correct: [2, 4],
    exhibit: true,
  },
  {
    id: "q0357",
    question: "Refer to the exhibit. After the configuration is applied, the two routers fail to establish an OSPF neighbor relationship. What is the reason for the problem?",
    options: [
    "The OSPF process IDs are mismatched",
    "The network statement on Router1 is misconfigured",
    "Router2 is using the default hello timer",
    "The OSPF router IDs are mismatched"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0358",
    question: "Refer to the exhibit. Which route type is configured to reach the Internet?",
    options: [
    "floating static route",
    "host route",
    "network route",
    "default route"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0359",
    question: "Refer to the exhibit. Which path is used by the router for Internet traffic?",
    options: [
    "209.165.200.0/27",
    "0.0.0.0/0",
    "10.10.13.0/24",
    "10.10.10.0/28"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0360",
    question: "When OSPF learns multiple paths to a network, how does it select a route?",
    options: [
    "For each existing interface, it adds the metric from the source router to the destination to calculate the route with the lowest bandwidth.",
    "It counts the number of hops between the source router and the destination to determine the route with the lowest metric.",
    "It divides a reference bandwidth of 100 Mbps by the actual bandwidth of the exiting interface to calculate the route with the lowest cost.",
    "It multiplies the active K values by 256 to calculate the route with the lowest metric."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0361",
    question: "When a floating static route is configured, which action ensures that the backup route is used when the primary route fails?",
    options: [
    "The administrative distance must be higher on the primary route so that the backup route becomes secondary.",
    "The default-information originate command must be configured for the route to be installed into the routing table.",
    "The floating static route must have a lower administrative distance than the primary route so it is used as a backup.",
    "The floating static route must have a higher administrative distance than the primary route so it is used as a backup"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0362",
    question: "Refer to the exhibit. The show ip ospf interface command has been executed on R1. How is OSPF configured?",
    options: [
    "A point-to-point network type is configured.",
    "The interface is not participating in OSPF.",
    "The default Hello and Dead timers are in use.",
    "There are six OSPF neighbors on this interface."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0363",
    question: "A user configured OSPF and advertised the Gigabit Ethernet interface in OSPF. By default, to which type of OSPF network does this interface belong?",
    options: [
    "point-to-multipoint",
    "point-to-point",
    "broadcast",
    "nonbroadcast"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0364",
    question: "Which attribute does a router use to select the best path when two or more different routes to the same destination exist from two different routing protocols?",
    options: [
    "dual algorithm",
    "metric",
    "administrative distance",
    "hop count"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0365",
    question: "Router A learns the same route from two different neighbors; one of the neighbor routers is an OSPF neighbor, and the other is an EIGRP neighbor. What is the administrative distance of the route that will be installed in the routing table?",
    options: [
    "20 Traffic to 10.10.13.0/25 is load balanced out of multiple interfaces.",
    "90 Traffic to 10.10.13.0/25 is asymmetrical.",
    "110 Route 10.10.13.0/25 is updated in the routing table as being learned from interface Gi0/1.",
    "115 Q0366 Nachfragen CCNA? Refer to the exhibit. An engineer is bringing up a new circuit to the MPLS provider on the Gi0/1 interface of Router 1. The new circuit uses eBGP and learns the route to VLAN25 from the BGP path. What is the expected behavior for the traffic flow for route 10.10.13.0/25? Jonny Route 10.10.13.0/25 learned via the Gi0/0 interface remains in the routing table."
    ],
    correct: [1, 2, 3],
    exhibit: true,
  },
  {
    id: "q0367",
    question: "Which two actions influence the EIGRP route selection process? (Choose two.)",
    options: [
    "The advertised distance is calculated by a downstream neighbor to inform the local router of the bandwidth on the link.",
    "The router calculates the feasible distance of all paths to the destination route.",
    "The router must use the advertised distance as the metric for any given route.",
    "The router calculates the best backup path to the destination route and assigns it as the feasible successor.",
    "The router calculates the reported distance by multiplying the delay on the exiting interface by 256."
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0368",
    question: "Refer to the exhibit. If OSPF is running on this network, how does Router2 handle traffic from Site B to 10.10.13.128/25 at Site A?",
    options: [
    "It sends packets out of interface Fa0/1 only.",
    "It sends packets out of interface Fa0/2 only.",
    "It load-balances traffic out of Fa0/1 and Fa0/2.",
    "It cannot send packets to 10.10.13.128/25."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0369",
    question: "Which two outcomes are predictable behaviors for HSRP? (Choose two.)",
    options: [
    "The two routers negotiate one router as the active router and the other as the standby router.",
    "The two routers share the same interface IP address, and default gateway traffic is load- balanced between them.",
    "The two routers synchronize configurations to provide consistent packet forwarding.",
    "Each router has a different IP address, both routers act as the default gateway on the LAN, and traffic is load-balanced between them.",
    "The two routers share a virtual IP address that is used as the default gateway for devices on the LAN."
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0370",
    question: "Refer to the exhibit. An engineer is configuring the New York router to reach the Lo1 interface of the Atlanta router using interface Se0/0/0 as the primary path. Which two commands must be configured on the New York router so that it reaches the Lo1 interface of the Atlanta router via Washington when the link between New York and Atlanta goes down? (Choose two.)",
    options: [
    "Ipv6 route 2000::1/128 2012::1",
    "Ipv6 route 2000::1/128 2012::1 5",
    "Ipv6 route 2000::1/128 2012::2",
    "Ipv6 route 2000::1/128 2023::2 5",
    "Ipv6 route 2000::1/128 2023::3 5"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0371",
    question: "How does HSRP provide first hop redundancy?",
    options: [
    "It load-balances Layer 2 traffic along the path by flooding traffic out all interfaces configured with the same VLAN.",
    "It uses a shared virtual MAC and a virtual IP address to a group of routers that serve as the default gateway for hosts on a LAN.",
    "It forwards multiple packets to the same destination over different routed links in the data path.",
    "It load-balances traffic by assigning the same metric value to more than one route to the same destination in the IP routing table."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0372",
    question: "Refer to the exhibit. Which action establishes the OSPF neighbor relationship without forming an adjacency?",
    options: [
    "modify hello interval",
    "modify process ID",
    "modify priority",
    "modify network type"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0373",
    question: "Which command must you enter to guarantee that an HSRP router with higher priority becomes the HSRP primary router after it is reloaded?",
    options: [
    "standby 10 preempt",
    "standby 10 version 1",
    "standby 10 priority 150",
    "standby 10 version 2"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0374",
    question: "Which command should you enter to verify the priority of a router in an HSRP group?",
    options: [
    "show hsrp",
    "show sessions",
    "show interfaces",
    "show standby"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0375",
    question: "Refer to the exhibit. Which command would you use to configure a static route on Router1 to network 192.168.202.0/24 with a nondefault administrative distance?",
    options: [
    "router1(config)#ip route 192.168.202.0 255.255.255.0 192.168.201.2 1",
    "router1(config)#ip route 192.168.202.0 255.255.255.0 192.168.201.2 5",
    "router1(config)#ip route 1 192.168.201.1 255.255.255.0 192.168.201.2",
    "router1(config)#ip route 5 192.168.202.0 255.255.255.0 192.168.201.2"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0376",
    question: "Which of the following dynamic routing protocols are Distance Vector routing protocols?",
    options: [
    "IS-IS",
    "EIGRP",
    "OSPF",
    "BGP",
    "RIP"
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q0377",
    question: "You have configured a router with an OSPF router ID, but its IP address still reflects the physical interface. Which action can you take to correct the problem in the least disruptive way?",
    options: [
    "Reload the OSPF process",
    "Specify a loopback address",
    "Reboot the router",
    "Save the router configuration"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0378",
    question: "Which command should you enter to view the error log in an EIGRP for IPv6 environment?",
    options: [
    "show ipv6 eigrp neighbors",
    "show ipv6 eigrp topology",
    "show ipv6 eigrp traffic",
    "show ipv6 eigrp events"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0379",
    question: "Refer to the exhibit. Router R1 must be configured to reach the 10.0.3.0/24 network from the 10.0.1.0/24 segment. Which command must be used to configure the route?",
    options: [
    "route add 10.0.3.0 0.255.255.255 10.0.4.2",
    "ip route 10.0.3.0 0.255.255.255 10.0.4.2",
    "route add 10.0.3.0 mask 255.255.255.0 10.0.4.3",
    "ip route 10.0.3.0 255.255.255.0 10.0.4.3"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0380",
    question: "Refer to the exhibit. Which two statements about the network environment of router R1 must be true? (Choose two.)",
    options: [
    "The EIGRP administrative distance was manually changed from 90 to 170.",
    "There are 20 different network masks within the 10.0.0.0/8 network.",
    "Ten routes are equally load-balanced between Te0/1/0.100 and Te0/2/0.100.",
    "The 10.0.0.0/8 network was learned via external EIGRP.",
    "A static default route to 10.85.33.14 was defined."
    ],
    correct: [1, 2],
    exhibit: true,
  },
  {
    id: "q0381",
    question: "Which two statements about exterior routing protocols are true? (Choose two.)",
    options: [
    "They determine the optimal within an autonomous system.",
    "They determine the optimal path between autonomous systems.",
    "BGP is the current standard exterior routing protocol.",
    "Most modern networking supports both EGP and BGP for external routing.",
    "Most modern network routers support both EGP and EIGRP for external routing."
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0382",
    question: "You have two paths for the 10.10.10.0 network - one that has a feasible distance of 3072 and the other of 6144. What do you need to do to load balance your EIGRP routes?",
    options: [
    "Change the maximum paths to 2",
    "Change the configuration so they both have the same feasible distance",
    "Change the variance for the path that has a feasible distance of 3072 to 2",
    "Change the IP addresses so both paths have the same source IP address"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0384",
    question: "Which two circumstances can prevent two routers from establishing an OSPF neighbor adjacency? (Choose two.)",
    options: [
    "mismatched autonomous system numbers",
    "an ACL blocking traffic from multicast address 224.0.0.10",
    "mismatched process IDs",
    "mismatched hello timers and dead timers",
    "use of the same router ID on both devices"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0385",
    question: "Which three describe the reasons large OSPF networks use a hierarchical design? (Choose three.)",
    options: [
    "to speed up convergence",
    "to reduce routing overhead",
    "to lower costs by replacing routers with distribution layer switches",
    "to decrease latency by increasing bandwidth",
    "to confine network instability to single areas of the network",
    "to reduce the complexity of router configuration"
    ],
    correct: [0, 1, 4],
    exhibit: false,
  },
  {
    id: "q0386",
    question: "Refer to the exhibit. If R1 receives a packet destined to 172.16.1.1, to which IP address does it send the packet?",
    options: [
    "192.168.14.4",
    "192.168.12.2",
    "192.168.13.3",
    "192.168.15.5"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0387",
    question: "Refer to the exhibit. On R1 which routing protocol is in use on the route to 192.168.10.1?",
    options: [
    "RIP",
    "OSPF",
    "IGRP",
    "EIGRP"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0388",
    question: "Refer to the exhibit. Which Command do you enter so that R1 advertises the loopback0 interface to the BGP Peers?",
    options: [
    "Network 172.16.1.32 mask 255.255.255.224",
    "Network 172.16.1.0 0.0.0.255",
    "Network 172.16.1.32 255.255.255.224",
    "Network 172.16.1.33 mask 255.255.255.224",
    "Network 172.16.1.32 mask 0.0.0.31",
    "Network 172.16.1.32 0.0.0.31"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0389",
    question: "Refer to exhibit. What Administrative distance has route to 192.168.10.1?",
    options: [
    "1",
    "90",
    "110",
    "120"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0390",
    question: "Which value is used to determine the active router in an HSRP default configuration?",
    options: [
    "Router loopback address",
    "Router IP address",
    "Router priority",
    "Router tracking number"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0391",
    question: "Refer to the exhibit. If RTR01 is configured as shown, which three addresses will be received by other routers that are running EIGRP on the network? (Choose three.)",
    options: [
    "192.168.2.0",
    "10.4.3.0",
    "10.0.0.0",
    "172.16.0.0",
    "172.16.4.0",
    "192.168.0.0"
    ],
    correct: [0, 2, 3],
    exhibit: true,
  },
  {
    id: "q0392",
    question: "Which configuration command can you apply to a HSRP router so that its local interface becomes active if all other routers in the group fail?",
    options: [
    "no additional config is required",
    "standby 1 track ethernet",
    "standby 1 preempt",
    "standby 1 priority 250"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0393",
    question: "Which two statements about eBGP neighbor relationships are true? (Choose two.)",
    options: [
    "The two devices must reside in different autonomous systems",
    "Neighbors must be specifically declared in the configuration of each device",
    "They can be created dynamically after the network statement is configured",
    "The two devices must reside in the same autonomous system",
    "The two devices must have matching timer settings"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0394",
    question: "Refer to the exhibit. How will the router handle a packet destined for 192.0.2.156?",
    options: [
    "The router will forward the packet via either Serial0 or Serial1.",
    "The router will return the packet to its source.",
    "The router will forward the packet via Serial2.",
    "The router will drop the packet."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0395",
    question: "Which statements describe the routing protocol OSPF? (Choose three.)",
    options: [
    "It supports VLSM.",
    "It is used to route between autonomous systems.",
    "It confines network instability to one area of the network.",
    "It increases routing overhead on the network.",
    "It allows extensive control of routing updates.",
    "It is simpler to configure than RIP v2."
    ],
    correct: [0, 2, 4],
    exhibit: false,
  },
  {
    id: "q0396",
    question: "Refer to the exhibit. After you apply the given configurations to R1 and R2 you notice that OSPFv3 fails to start.",
    options: [
    "The area numbers on R1 and R2 are mismatched",
    "The IPv6 network addresses on R1 and R2 are mismatched",
    "The autonomous system numbers on R1 and R2 are mismatched",
    "The router ids on R1 and R2 are mismatched"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0397",
    question: "Which command is used to display the collection of OSPF link states?",
    options: [
    "show ip ospf link-state",
    "show ip ospf lsa database",
    "show ip ospf neighbors",
    "show ip ospf database"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0398",
    question: "Refer to the exhibit. A network associate has configured OSPF with the command: City(config-router)# network 192.168.12.64 0.0.0.63 area 0 After completing the configuration, the associate discovers that not all the interfaces are participating in OSPF. Which three of the interfaces shown in the exhibit will participate in OSPF according to this configuration statement? (Choose three.)",
    options: [
    "FastEthernet0 /0",
    "FastEthernet0 /1",
    "Serial0/0",
    "Serial0/1.102",
    "Serial0/1.103",
    "Serial0/1.104"
    ],
    correct: [1, 2, 3],
    exhibit: true,
  },
  {
    id: "q0399",
    question: "Refer to the exhibit. C-router is to be used as a \"router-on-a-stick\" to route between the VLANs. All the interfaces have been properly configured and IP routing is operational. The hosts in the VLANs have been configured with the appropriate default gateway. What is true about this configuration?",
    options: [
    "These commands need to be added to the configuration: C-router(config)# router eigrp 123 C-router(config-router)# network 172.19.0.0",
    "These commands need to be added to the configuration: C-router(config)# router ospf 1 C- router(config-router)# network 172.19.0.0 0.0.3.255 area",
    "These commands need to be added to the configuration: C-router(config)# router rip C- router(config-router)# network 172.19.0.0",
    "No further routing configuration is required."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0400",
    question: "Refer to the exhibit. Which address and mask combination represents a summary of the routes learned by EIGRP?",
    options: [
    "192.168.25.0 255.255.255.240",
    "192.168.25.0 255.255.255.252",
    "192.168.25.16 255.255.255.240",
    "192.168.25.16 255.255.255.252",
    "192.168.25.28 255.255.255.240",
    "192.168.25.28 255.255.255.252 •"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0401",
    question: "Refer to the exhibit. Given the output for this command, if the router ID has not been manually set, what router ID will OSPF use for this router?",
    options: [
    "10.1.1.2",
    "10.154.154.1",
    "172.16.5.1",
    "192.168.5.3"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0402",
    question: "Refer to the exhibit. When running EIGRP, what is required for RouterA to exchange routing updates with RouterC?",
    options: [
    "AS numbers must be changed to match on all the routers",
    "Loopback interfaces must be configured so a DR is elected",
    "The no auto-summary command is needed on Router A and Router C",
    "Router B needs to have two network statements, one for each connected network"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0403",
    question: "A network administrator is troubleshooting the OSPF configuration of routers R1 and R2. The routers cannot establish an adjacency relationship on their common Ethernet link. The graphic shows the output of the show ip ospf interface e0 command for routers R1 and R2. Based on the information in the graphic, what is the cause of this problem?",
    options: [
    "The OSPF area is not configured properly.",
    "The priority on R1 should be set higher.",
    "The cost on R1 should be set higher.",
    "The hello and dead timers are not configured properly.",
    "A backup designated router needs to be added to the network.",
    "The OSPF process ID numbers must match."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0404",
    question: "Refer to the exhibit. Which two statements are true about the loopback address that is configured on RouterB? (Choose two.)",
    options: [
    "It ensures that data will be forwarded by RouterB.",
    "It provides stability for the OSPF process on RouterB.",
    "It specifies that the router ID for RouterB should be 10.0.0.1.",
    "It decreases the metric for routes that are advertised from RouterB.",
    "It indicates that RouterB should be elected the DR for the LAN."
    ],
    correct: [1, 2],
    exhibit: true,
  },
  {
    id: "q0405",
    question: "If all OSPF routers in a single area are configured with the same priority value, what value does a router use for the OSPF router ID in the absence of a loopback interface?",
    options: [
    "the IP address of the first Fast Ethernet interface",
    "the IP address of the console management interface",
    "the highest IP address among its active interfaces",
    "the lowest IP address among its active interfaces",
    "the priority value until a loopback interface is configured"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0406",
    question: "The OSPF Hello protocol performs which of the following tasks? (Choose two.)",
    options: [
    "It provides dynamic neighbor discovery.",
    "It detects unreachable neighbors in 90 second intervals.",
    "It maintains neighbor relationships.",
    "It negotiates correctness parameters between neighboring interfaces.",
    "It uses timers to elect the router with the fastest links as the designated router.",
    "It broadcasts hello packets throughout the internetwork to discover all routers that are running OSPF."
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0407",
    question: "What are two requirements for an HSRP group? (Choose two.)",
    options: [
    "exactly one active router",
    "one or more standby routers",
    "one or more backup virtual routers",
    "exactly one standby active router",
    "exactly one backup virtual router"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0408",
    question: "Which two pieces of information can you learn by viewing the routing table? (Choose two.)",
    options: [
    "whether an ACL was applied inbound or outbound to an interface",
    "the EIGRP or BGP autonomous system",
    "whether the administrative distance was manually or dynamically configured",
    "which neighbor adjacencies are established",
    "the length of time that a route has been known"
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0409",
    question: "Refer to the exhibit. Which route type does the routing protocol Code D represent in the output?",
    options: [
    "statically assigned route",
    "route learned through EIGRP",
    "724 route of a locally configured IP",
    "internal BGP route"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0410",
    question: "An engineer must configure an OSPF neighbor relationship between router R1 and R3. The authentication configuration has been configured and the connecting interfaces are in the same 192.168.1.0/30 subnet. What are the next two steps to complete the configuration? (Choose two.)",
    options: [
    "configure the interfaces as OSPF active on both sides",
    "configure both interfaces with the same area ID",
    "configure the hello and dead timers to match on both sides",
    "configure the same process ID for the router OSPF process",
    "configure the same router ID on both routing processes"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0411",
    question: "Refer to the exhibit. A packet is being sent across router R1 to host 172.16.0.14. What is the destination route for the packet?",
    options: [
    "209.165.200.250 via Serial0/0/0",
    "209.165.200.254 via Serial0/0/0",
    "209.165.200.254 via Serial0/0/1",
    "209.165.200.246 via Serial0/1/0"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0412",
    question: "Refer to the exhibit. A packet is being sent across router R1 to host 172.16.3.14. To which destination does the router send the packet?",
    options: [
    "207.165.200.246 via Serial0/1/0",
    "207.165.200.254 via Serial0/0/0",
    "207.165.200.250 via Serial0/0/0",
    "207.165.200.254 via Serial0/0/1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0413",
    question: "Refer to the exhibit. Router R2 is configured with multiple routes to reach network 10.1.1.0/24 from router R1. Which path is chosen by router R2 to reach the destination network 10.1.1.0/24?",
    options: [
    "static",
    "EIGRP",
    "eBGP",
    "OSPF"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0414",
    question: "Refer to the exhibit. What is the next hop address for traffic that is destined to host 10.0.1.5?",
    options: [
    "Loopback",
    "10.0.1.4",
    "10.0.1.3",
    "10.0.1.50"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0415",
    question: "Refer to the exhibit. A network administrator assumes a task to complete the connectivity between PC A and the File Server. Switch A and Switch B have been partially configured with VLANs 10, 11, 12, and 13. What is the next step in the configuration?",
    options: [
    "Add PC A to VLAN 10 and the File Server to VLAN 11 for VLAN segmentation",
    "Add VLAN 13 to the trunk links on Switch A and Switch B for VLAN propagation",
    "Add a router on a stick between Switch A and Switch B allowing for Inter-VLAN routing",
    "Add PC A to the same subnet as the File Server allowing for intra-VLAN communication"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0417",
    question: "R1 has learned route 192.168.12.0/24 via IS-IS, OSPF, RIP, and Internal EIGRP. Under normal operating conditions, which routing protocol is installed in the routing table?",
    options: [
    "IS-IS",
    "Internal EIGRP",
    "RIP",
    "OSPF"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0418",
    question: "Refer to the exhibit. The default-information originate command is configured under the R1 OSPF configuration. After testing, workstations on VLAN 20 at Site B cannot reach a DNS server on the Internet. Which action corrects the configuration issue?",
    options: [
    "Add the default-information originate command on R2.",
    "Add the always keyword to the default-information originate command on R1.",
    "Configure the ip route 0.0.0.0 0.0.0.0 10.10.10.18 command on R1.",
    "Configure the ip route 0.0.0.0 0.0.0.0 10.10.10.2 command on R2."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0419",
    question: "Refer to the exhibit. With which metric was the route to host 172.16.0.202 learned? • A.",
    options: [
    "",
    "110",
    "38443",
    "3184439"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0420",
    question: "A user configured OSPF in a single area between two routers. A serial interface connecting R1 and R2 is running encapsulation PPP. By default, which OSPF network type is seen on this interface when the user types show ip ospf interface on R1 or R2?",
    options: [
    "nonbroadcast",
    "point-to-point",
    "point-to-multipoint",
    "broadcast"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0421",
    question: "Which MAC address is recognized as a VRRP virtual address?",
    options: [
    "0000.5E00.010a",
    "0005.3709.8968",
    "0000.0C07.AC99",
    "0007.C070.AB01"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0422",
    question: "Refer to the exhibit. The New York router is configured with static routes pointing to the Atlanta and Washington sites. Which two tasks must be performed so that the Se0/0/0 interfaces on the Atlanta and Washington routers reach one another? (Choose two.)",
    options: [
    "Configure the ipv6 route 2023::/126 2012::1 command on the Atlanta router.",
    "Configure the ipv6 route 2012::/126 2023::2 command on the Washington router.",
    "Configure the ipv6 route 2012::/126 2023::1 command on the Washington router.",
    "Configure the ipv6 route 2023::/126 2012::2 command on the Atlanta router.",
    "Configure the ipv6 route 2012::/126 s0/0/0 command on the Atlanta router."
    ],
    correct: [1, 3],
    exhibit: true,
  },
  {
    id: "q0423",
    question: "A router running EIGRP has learned the same route from two different paths. Which parameter does the router use to select the best path?",
    options: [
    "as-path",
    "administrative distance",
    "metric",
    "cost"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0424",
    question: "An engineer configured an OSPF neighbor as a designated router. Which state verifies the designated router is in the proper mode?",
    options: [
    "Init",
    "2-way",
    "Exchange",
    "Full"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0425",
    question: "Refer to the exhibit. Which route does R1 select for traffic that is destined to 192.168.16.2?",
    options: [
    "192.168.16.0/21",
    "192.168.16.0/24",
    "192.168.16.0/26",
    "192.168.16.0/27"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0426",
    question: "Refer to the exhibit. If configuring a static default route on the router with the ip route 0.0.0.0 0.0.0.0 10.13.0.1 120 command, how does the router respond?",
    options: [
    "It starts sending traffic without a specific matching entry in the routing table to GigabitEthernet0/1.",
    "It immediately replaces the existing OSPF route in the routing table with the newly configured static route.",
    "It starts load-balancing traffic between the two default routes.",
    "It ignores the new static route until the existing OSPF default route is removed."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0427",
    question: "Refer to the graphic. R1 is unable to establish an OSPF neighbor relationship with R3. What are possible reasons for this problem? (Choose two.)",
    options: [
    "All of the routers need to be configured for backbone Area 1.",
    "R1 and R2 are the DR and BDR, so OSPF will not establish neighbor adjacency with R3.",
    "A static route has been configured from R1 to R3 and prevents the neighbor adjacency from being established.",
    "The hello and dead interval timers are not set to the same values on R1 and R3.",
    "EIGRP is also configured on these routers with a lower administrative distance.",
    "R1 and R3 are configured in different areas."
    ],
    correct: [3, 5],
    exhibit: false,
  },
  {
    id: "q0428",
    question: "Refer to the exhibit. Which command configures a floating static route to provide a backup to the primary link?",
    options: [
    "ip route 209.165.200.224 255.255.255.224 209.165.202.129 254",
    "ip route 209.165.201.0 255.255.255.224 209.165.202.130",
    "ip route 0.0.0.0 0.0.0.0 209.165.200.224",
    "ip route 0.0.0.0 0.0.0.0 209.165.202.131"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0429",
    question: "Refer to the exhibit. An engineer configured the New York router with static routes that point to the and Washington sites. Which command must be configured on the Atlanta and Washington routers so that both sites are able to reach the loopback2 interface on the New York router?",
    options: [
    "ipv6 route::/0 Serial 0/0/0",
    "ipv6 route::/0 Serial 0/0/1",
    "ipv6 route:0/0 Serial 0/0/0",
    "ip route 0.0.0.0 0.0.0.0 Serial 0/0/0",
    "ipv6 route::/0 2000::2"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0430",
    question: "What is the effect when loopback interfaces and the configured router ID are absent during the OSPF Process configuration?",
    options: [
    "The lowest IP address is incremented by 1 and selected as the router ID.",
    "The router ID 0.0.0.0 is selected and placed in the OSPF process.",
    "No router ID is set, and the OSPF protocol does not run.",
    "The highest up/up physical interface IP address is selected as the router ID."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0431",
    question: "Refer to the exhibit. What is the metric of the route to the 192.168.10.33/28 subnet?",
    options: [
    "84",
    "110",
    "128",
    "192",
    "193"
    ],
    correct: 4,
    exhibit: true,
  },
  {
    id: "q0432",
    question: "Refer to the exhibit. Traffic sourced from the loopback0 interface is trying to connect via ssh to the host at 10.0.1.15. What is the next hop to the destination address?",
    options: [
    "192.168.0.7",
    "192.168.0.4",
    "192.168.0.40",
    "192.168.3.5"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0433",
    question: "When the active router in a VRRP group fails, which router assumes the role and forwards packets?",
    options: [
    "forwarding",
    "standby",
    "backup",
    "listening"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0434",
    question: "Which action does the router take as it forwards a packet through the network?",
    options: [
    "The router encapsulates the original packet and then includes a tag that identifies the source router MAC address and transmits it transparently to the destination.",
    "The router encapsulates the source and destination IP addresses with the sending router IP address as the source and the neighbor IP address as the destination.",
    "The router replaces the original source and destination MAC addresses with the sending router MAC address as the source and neighbor MAC address as the destination.",
    "The router replaces the source and destination labels with the sending router interface label as a source and the next hop router label as a destination."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0435",
    question: "Refer to the exhibit. Which two prefixes are included in this routing table entry? (Choose two.)",
    options: [
    "192.168.1.17",
    "192.168.1.61",
    "192.168.1.64",
    "192.168.1.127",
    "192.168.1.254"
    ],
    correct: [0, 1],
    exhibit: true,
  },
  {
    id: "q0436",
    question: "Which virtual MAC address is used by VRRP group 1?",
    options: [
    "0504.0367.4921",
    "0007.c061.bc01",
    "0050.0c05.ad81",
    "0000.5E00.0101"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0437",
    question: "What is the purpose of using First Hop Redundancy Protocol on a specific subnet?",
    options: [
    "forwards multicast hello messages between routers",
    "sends the default route to the hosts on a network",
    "ensures a loop-free physical topology",
    "filters traffic based on destination IP addressing"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0438",
    question: "Refer to the exhibit. Which configuration issue is preventing the OSPF neighbor relationship from being established between the two routers?",
    options: [
    "R1 has an incorrect network command for interface Gi1/0.",
    "R2 should have its network command in area 1.",
    "R1 interface Gi1/0 has a larger MTU size.",
    "R2 is using the passive-interface default command."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0439",
    question: "Refer to the exhibit. When router R1 is sending traffic to IP address 10.56.192.1, which interface or next hop address does it use to route the packet?",
    options: [
    "10.56.0.1",
    "0.0.0.0/0",
    "Vlan57",
    "10.56.128.19"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0440",
    question: "Refer to the exhibit. Load-balanced traffic is coming in from the WAN destined to a host at 172.16.1.190. Which next-hop is used by the router to forward the request?",
    options: [
    "192.168.7.4",
    "192.168.7.7",
    "192.168.7.35",
    "192.168.7.40"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0441",
    question: "What is a benefit of VRRP?",
    options: [
    "It provides the default gateway redundancy on a LAN using two or more routers.",
    "It provides traffic load balancing to destinations that are more than two hops from the source.",
    "It prevents loops in a Layer 2 LAN by forwarding all traffic to a root bridge, which then makes the final forwarding decision.",
    "It allows neighbors to share routing table information between each other."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0442",
    question: "Refer to the exhibit. Routers R1 and R3 have the default configuration. The router R2 priority is set to 99. Which commands on R3 configure it as the DR in the 10.0.4.0/24 network?",
    options: [
    "R3(config)#interface Gig0/0 R3(config-if)#ip ospf priority 100",
    "R3(config)#interface Gig0/0 R3(config-if)#ip ospf priority 1",
    "R3(config)#interface Gig0/1 R3(config-if)#ip ospf priority",
    "R3(config)#interface Gig0/1 R3(config-if)#ip ospf priority 100"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0443",
    question: "Refer to the exhibit. A network engineer must configure R1 so that it sends all packets destined to the 10.0.0.0/24 network to R3, and all packets destined to PC1 to R2. Which configuration must the engineer implement?",
    options: [
    "R1(config)#ip route 10.0.0.0 255.255.255.0 172.16.0.2 R1(config)#ip route 10.0.0.5 255.255.255.255 192.168.0.2",
    "R1(config)#ip route 10.0.0.0 255.255.0.0 172.16.0.2 R1(config)#ip route 10.0.0.5 255.255.255.255 192.168.0.2",
    "R1(config)#ip route 10.0.0.0 255.255.255.0 192.168.0.2 R1(config)#ip route 10.0.0.5 255.255.255.255 172.16.0.2",
    "R1(config)#ip route 10.0.0.0 255.255.0.0 192.168.0.2 R1(config)#ip route 10.0.0.5 255.255.255.0 172.16.0.2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0444",
    question: "Refer to the exhibit. All traffic enters the CPE router from interface Serial0/3 with an IP address of 192.168.50.1. Web traffic from the WAN is destined for a LAN network where servers are load- balanced. An IP packet with a destination address of the HTTP virtual IP of 192.168.1.250 must be forwarded. Which routing table entry does the router use?",
    options: [
    "192.168.1.0/24 via 192.168.12.2",
    "192.168.1.128/25 via 192.168.13.3",
    "192.168.1.192/26 via 192.168.14.4",
    "192.168.1.224/27 via 192.168.15.5"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0445",
    question: "Refer to the exhibit. An engineer assumes a configuration task from a peer. Router A must establish an OSPF neighbor relationship with neighbor 172.1.1.1. The output displays the status of the adjacency after 2 hours. What is the next step in the configuration process for the routers to establish an adjacency?",
    options: [
    "Configure router A to use the same MTU size as router B.",
    "Configure a point-to-point link between router A and router B.",
    "Set the router B OSPF ID to the same value as its IP address.",
    "Set the router B OSPF ID to a nonhost address."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0446",
    question: "Refer to the exhibit. Which two configurations must the engineer apply on this network so that R1 becomes the DR? (Choose two.)",
    options: [
    "R3(config)#interface fastethernet 0/0 R3(config-if)#ip ospf priority 0",
    "R1(config)#router ospf 1 R1(config-router)#router-id 192.168.100.1",
    "R1(config)#interface fastethernet 0/0 R1(config-if)#ip ospf priority 200",
    "R1(config)#interface fastethernet 0/0 R1(config-if)#ip ospf priority 0",
    "R3(config)#interface fastethernet 0/0 R3(config-if)#ip ospf priority 200"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0447",
    question: "Refer to the exhibit. Which command configures OSPF on the point-to-point link between routers R1 and R2?",
    options: [
    "router-id 10.0.0.15",
    "neighbor 10.1.2.0 cost 180",
    "network 10.0.0.0 0.0.0.255 area 0",
    "ip ospf priority 100"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0448",
    question: "Refer to the exhibit. A network engineer is in the process of establishing IP connectivity between two sites. Routers R1 and R2 are partially configured with IP addressing. Both routers have the ability to access devices on their respective LANs. Which command set configures the IP connectivity between devices located on both LANs in each site?",
    options: [
    "R1 ip route 192.168.1.1 255.255.255.0 GigabitEthernet0/1 R2 ip route 10.1.1.1 255.255.255.0 GigabitEthernet0/1",
    "R1 ip route 192.168.1.0 255.255.255.0 GigabitEthernet0/0 R2 ip route 10.1.1.1 255.255.255.0 GigabitEthernet0/0",
    "R1 ip route 0.0.0.0 0.0.0.0 209.165.200.225 R2 ip route 0.0.0.0 0.0.0.0 209.165.200.226",
    "R1 ip route 0.0.0.0 0.0.0.0 209.165.200.226 R2 ip route 0.0.0.0 0.0.0.0 209.165.200.225"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0449",
    question: "Refer to the exhibit. Which next-hop IP address does Router1 use for packets destined to host 10.10.13.158?",
    options: [
    "10.10.10.9",
    "10.10.10.5",
    "10.10.11.2",
    "10.10.12.2"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0450",
    question: "Refer to the exhibit. Packets received by the router from BGP enter via a serial interface at 209.165.201.1. Each route is present within the routing table. Which interface is used to forward traffic with a destination IP of 10.1.1.19?",
    options: [
    "F0/0",
    "F0/1",
    "F0/4",
    "F0/3"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0451",
    question: "Refer to the exhibit. Which route must be configured on R1 so that OSPF routing is used when OSPF is up, but the server is still reachable when OSPF goes down?",
    options: [
    "ip route 10.1.1.10 255.255.255.255 gi0/0 125",
    "ip route 10.1.1.0 255.255.255.0 172.16.2.2 100",
    "ip route 10.1.1.0 255.255.255.0 gi0/1 125",
    "ip route 10.1.1.10 255.255.255.255 172.16.2.2 100"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0452",
    question: "Refer to the exhibit. What is the next hop for traffic entering R1 with a destination of 10.1.2.126?",
    options: [
    "10.165.20.126",
    "10.165.20.146",
    "10.165.20.166",
    "10.165.20.226"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0453",
    question: "Refer to the exhibit. Which prefix did router R1 learn from internal EIGRP?",
    options: [
    "192.168.3.0/24",
    "192.168.1.0/24",
    "172.16.1.0/24",
    "192.168.2.0/24"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0454",
    question: "Refer to the exhibit. R5 is the current DR on the network, and R4 is the BDR. Their interfaces are flapping, so a network engineer wants the OSPF network to elect a different DR and BDR. Which set of configurations must the engineer implement?",
    options: [
    "R4(config)#interface gi0/0 • R4(config-if)#ip ospf priority 20 • R5(config)#interface gi0/0 • R5(config-if)#ip ospf priority 10 •",
    "R5(config)#interface gi0/0 • R5(config-if)#ip ospf priority 120 • R4(config)#interface gi0/0 • R4(config-if)#ip ospf priority 110 •",
    "R3(config)#interface gi0/0 • R3(config-if)#ip ospf priority 255 •  R2(config)#interface gi0/0 • R2(config-if)#ip ospf priority 240 •",
    "R2(config)#interface gi0/0 • R2(config-if)#ip ospf priority 259 • R3(config)#interface gi0/0 • R3(config-if)#ip ospf priority 256"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0455",
    question: "Refer to the exhibit. Web traffic is coming in from the WAN interface. Which route takes precedence when the router is processing traffic destined for the LAN network at 10.0.10.0/24?",
    options: [
    "via next-hop 10.0.1.5",
    "via next-hop 10.0.1.4",
    "via next-hop 10.0.1.50",
    "via next-hop 10.0.1.100"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0456",
    question: "Refer to the exhibit. A packet sourced from 10.10.10.1 is destined for 10.10.8.14. What is the subnet mask of the destination route?",
    options: [
    "255.255.254.0",
    "255.255.255.240",
    "255.255.255.248",
    "255.255.255.252"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0457",
    question: "Refer to the exhibit. An engineer must configure router R2 so it is elected as the DR on the WAN subnet. Which command sequence must be configured?",
    options: [
    "interface gigabitethernet0/0 ip address 10.0.0.34 255.255.255.248 ip ospf priority",
    "interface gigabitethernet0/0 ip address 10.0.0.34 255.255.255.224 ip ospf priority 100",
    "interface gigabitethernet0/0 ip address 10.0.1.1 255.255.255.0 ip ospf priority 255",
    "interface gigabitethernet0/0 ip address 10.0.1.1 255.255.255.224 ip ospf priority 98"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0458",
    question: "An engineer is configuring router R1 with an IPv6 static route for prefix 2019:C15C:0CAF:E001::/64. The next hop must be 2019:C15C:0CAF:E002::1. The route must be reachable via the R1 Gigabit 0/0 interface. Which command configures the designated route?",
    options: [
    "R1(config-if)#ip route 2019:C15C:0CAF:E001::/64 GigabitEthernet 0/0",
    "R1(config)#ip route 2019:C15C:0CAF:E001::/64 GigabitEthernet 0/0",
    "R1(config-if)#ipv6 route 2019:C15C:0CAF:E001::/64 2019:C15C:0CAF:E002::1",
    "R1(config)#ipv6 route 2019:C15C:0CAF:E001::/64 2019:C15C:0CAF:E002::1"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0459",
    question: "Refer to the exhibit. Which IPv6 configuration is required for R17 to successfully ping the WAN interface on R18?",
    options: [
    "R17# ! no ip domain lookup ip cef ipv6 cef ! interface FastEthernet0/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:2::201/64 ! Interface FastEthernet1/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:3::201/64 ! no cdp log mismatch duplex ipv6 route 2001:DB8:4::/64 2001:DB8:4::302",
    "R17# ! no ip domain lookup ip cef ipv6 unicast-routing ! • interface FastEthernet0/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:2::201/64 ! • Interface FastEthernet1/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:3::201/64 ! • no cdp log mismatch duplex • ipv6 route 2001:DB8:4::/64 2001:DB8:3::301",
    "R17# ! no ip domain lookup ip cef ! interface FastEthernet0/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:3::201/64 ! Interface FastEthernet1/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:2::201/64 ! no cdp log mismatch duplex ipv6 route 2001:DB8:4::/64 2001:DB8:5::101",
    "R17# ! no ip domain lookup ip cef ipv6 unicast-routing ! interface FastEthernet0/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:2::201/64 ! Interface FastEthernet1/0 no ip address duplex auto speed auto ipv6 address 2001:DB8:3::201/64 ! no cdp log mismatch duplex ipv6 route 2001:DB8:4::/64 2001:DB8:2::201"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0460",
    question: "Refer to the exhibit. A company is configuring a failover plan and must implement the default routes in such a way that a floating static route will assume traffic forwarding when the primary link goes down. Which primary route configuration must be used?",
    options: [
    "ip route 0.0.0.0 0.0.0.0 192.168.0.2",
    "ip route 0.0.0.0 0.0.0.0 192.168.0.2 GigabitEthernet1/0",
    "ip route 0.0.0.0 0.0.0.0 192.168.0.2 floating",
    "ip route 0.0.0.0 0.0.0.0 192.168.0.2 tracked"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0461",
    question: "OSPF must be configured between routers R1 and R2. Which OSPF configuration must be applied to router R1 to avoid a DR'BDR election?",
    options: [
    "router ospf 1 network 192.168.1.1 0.0.0.0 areainterface e1/1 ip address 192.168.1.1 255.255.255.252 ip ospf cost",
    "router ospf 1 network 192.168.1.1 0.0.0.0 areahello interval 15 interface e1/1 ip address 192.168.1.1 255.255.255.252",
    "router ospf 1 network 192.168.1.1 0.0.0.0 areainterface e1/1 ip address 192.168.1.1 255.255.255.252 ip ospf network broadcast",
    "router ospf 1 network 192.168.1.1 0.0.0.0 areainterface e1/1 ip address 192.168.1.1 255.255.255.252 ip ospf network point-to-point"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0462",
    question: "Refer to the exhibit. An engineer is updating the R1 configuration to connect a new server to the management network. The PCs on the management network must be blocked from pinging the default gateway of the new server. Which command must be configured on R1 to complete the task?",
    options: [
    "R1(config)#ip route 172.16.2.0.255.255.255.0 192.168.1.15",
    "R1(config)#ip route 172.16.2.2 255.255.255.248 gi0/1",
    "R1(config)#ip route 172.16.2.2 255.255.255.255 gi0/0",
    "R1(config)#ip route 172.16.2.0 255.255.255.0 192.168.1.5"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0463",
    question: "Refer to the exhibit. Router R1 currently is configured to use R3 as the primary route to the internet, and the route uses the default administrative distance settings. A network engineer must configure R1 so that it uses R2 as a backup, but only if R3 goes down. Which command must the engineer configure on R1 so that it correctly uses R2 as a backup route, without changing the administrative distance configuration on the link to R3?",
    options: [
    "ip route 0.0.0.0 0.0.0.0 209.165.201.5.10",
    "ip route 0.0.0.0 0.0.0.0 g0/1 1",
    "ip route 0.0.0.0 0.0.0.0 209.165.200.226 1",
    "ip route 0.0.0.0 0.0.0.0 g0/1 6"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0464",
    question: "Refer to the exhibit. Which action must be taken to ensure that router A is elected as the DR for OSPF area 0?",
    options: [
    "Configure the router A interfaces with the highest OSPF priority value within the area",
    "Configure router B and router C as OSPF neighbors of router A",
    "Configure the OSPF priority on router A with the lowest value between the three routers.",
    "Configure router A with a fixed OSPF router ID"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0465",
    question: "Refer to the exhibit. Packets received by the router from BGP enter via a serial interface at 209.165.201.10. Each route is present within the routing table. Which interface is used to forward traffic with a destination IP of 10.10 10 24?",
    options: [
    "F0/10",
    "F0/11",
    "F0/12",
    "F0/1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0466",
    question: "Refer to the exhibit. If OSPF is running on this network, how does Router2 handle traffic from Site B to 10.10.13.128/25 at Site A?",
    options: [
    "It sends packets out of interface Fa0/1.",
    "It sends packets out of interface Fa0/2.",
    "It load-balances traffic out of Fa0/1 and Fa0/2.",
    "It is unreachable and discards the traffic."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0467",
    question: "Refer to the exhibit. Router R1 resides in OSPF Area 0. After updating the R1 configuration to influence the paths that it will use to direct traffic, an engineer verified that each of the four Gigabit interfaces has the same route to 10 10.0.0/16. Which interface will R1 choose to send traffic to reach the route?",
    options: [
    "GigabitEthernet0/0",
    "GigabitEthernet0/1",
    "GigabitEthernet0/2",
    "GigabitEthernet0/3"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0468",
    question: "Refer to the exhibit. Which network prefix was learned via EIGRP?",
    options: [
    "172.160.0/16",
    "207.165.200.0/24",
    "192.168.1.0/24",
    "192.168.2.0/24"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0469",
    question: "Refer to the exhibit. Which command must be issued to enable a floating static default route on router A?",
    options: [
    "ip route 0.0.0.0 0.0.0.0 192.168.1.2 10",
    "ip route 0.0.0.0 0.0.0.0 192.168.1.2",
    "ip default-gateway 192.168.2.1",
    "ip route 0.0.0.0 0.0.0.0 192.168.2.1 10"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0470",
    question: "Refer to the exhibit. Which configuration allows routers R14 and R86 to form an OSPFv2 adjacency while acting as a central point for exchanging OSPF information between routers?",
    options: [
    "R14# interface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf network broadcast ip ospf priorityip mtu 1400 router ospf 10 router-id 10.10.1.14 network 10.10.1.14 0.0.0.0 area0 network 10.73.65.64 0.0.0.3 area0 R86# interface Loopback0 ip address 10.10.1.86 255.255.255.255 interface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf network broadcast ip mtu 1500 router ospf 10 router-id 10.10.1.86 network 10.10.1.86 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 area",
    "R14# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf network broadcast ip ospf 10 areaip mtu 1500 router ospf 10 ip ospf priority 255 router-id 10.10.1 14 R86# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf network broadcast ip ospf 10 areaip mtu 1500 router ospf 10 router-id 10.10.1.86",
    "R14# interface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf network broadcast ip ospf priority 255 ip mtu 1500 router ospf 10 router-id 10.10.1.14 network 10.10.1.14 0.0.0.0 area0 network 10.73.65.64 0.0.0.3 area0 R86# interface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf network broadcast ip mtu 1500 router ospf 10 router-id 10.10.1.86 network 10.10.1.86 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 area",
    "R14# interface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf network broadcast ip ospf priority 255 ip mtu 1500 router ospf 10 router-id 10.10.1.14 network 10.10.1.14 0.0.0.0 area0 network 10.73.65.64 0.0.0.3 area0 R86# interface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf network broadcast ip mtu 1400 router ospf 10 router-id 10.10.1.86 network 10.10.1.86 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 area"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0471",
    question: "Refer to the exhibit. When an administrator executes the show ip route command on router D to view its routing table, which value is displayed for the administrative distance for the route to network 192.168 1.0?",
    options: [
    "110",
    "120",
    "170",
    "90"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0472",
    question: "Refer to the exhibit Routers R1 and R2 have been configured with their respective LAN interfaces. The two circuits are operational and reachable across WAN. Which command set establishes failover redundancy if the primary circuit goes down?",
    options: [
    "R1(config)#ip route 0.0.0.0 0.0.0.0 10.10.10.6 R2(config)#ip route 0.0.0.0 0.0.0.0 10.10.10.5",
    "R1(config)#ip route 10.10.13.10 255.255.255.255 10.10.10.2 R2(config)#ip route 192.168.0.100 255.255.255.255 10.10.10.1",
    "R1(config)#ip route 10.10.13.10 255.255.255.255 10.10.10.6 R2(config)#ip route 192.168.0.100 255.255.255.255 10.10.10.5",
    "R1(config)#ip route 0.0.0.0 0.0.0.0 10.10.10.6 2 R2(config)#ip route 0.0.0.0 0.0.0.0 10.10.10.5 2"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0473",
    question: "Refer to the exhibit. R1 learns all routes via OSPF. Which command configures a backup static route on R1 to reach the 192.168.20 0/24 network via R3?",
    options: [
    "R1(config)#ip route 192.168.20.0 255.255.255.0 192.168.30.2 111",
    "R1(config)#ip route 192.168.20.0 255.255.255.0 192.168.30.2 90",
    "R1(config)#ip route 192.168.20.0 255.255.0.0 192.168.30.2",
    "R1(config)#ip route 192.168.20.0 255.255.255.0 192.168.30.2"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0474",
    question: "Refer to the exhibit. R1 has taken the DROTHER role in the OSPF DR/BDR election process. Which configuration must an engineer implement so that R1 is elected as the DR?",
    options: [
    "R1(config)#interface FastEthernet 0/0 R1(config-if)#ip ospf priority 1 R1#clear ip ospf process",
    "R3(config)#interface FastEthernet 0/1 R3(config-if)#ip ospf priority 200 R3#clear ip ospf process",
    "R2(config)#interface FastEthernet 0/2 R2(config-if)#ip ospf priority 1 R2#clear ip ospf process",
    "R1(config)#interface FastEthernet 0/0 R1(config-if)#ip ospf priority 200 R1#clear ip ospf process"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0475",
    question: "Which SDN plane forwards user-generated traffic?",
    options: [
    "Management plane",
    "Control plane",
    "Policy plane",
    "Data plane"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0476",
    question: "An application in the network is being scaled up from 300 servers to 600. Each server requires 3 network connections to support production, backup, and management traffic. Each connection resides on a different subnet. The router configuration for the production network must be configured first using a subnet in the 10.0.0.0/8 network. Which command must be configured on the interface of the router to accommodate the requirements and limit wasted IP address space?",
    options: [
    "ip address 10.10.10.1 255.255.254.0",
    "ip address 10.10.10.1 255.255.252.0",
    "ip address 10.10.10.1 255.255.240.0",
    "ip address 10.10.10.1 255.255.255.240"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0477",
    question: "Refer to the exhibit. Which interface is chosen to forward traffic to the host at 192.168.0.55?",
    options: [
    "GigabitEthernet0/3",
    "Null0",
    "GigabitEthernet0/1",
    "GigabitEthernet0/2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0478",
    question: "Refer to the exhibit. The administrator must configure a floating static default route that points to 2001:db8:1234:2::1 and replaces the current default route only if it fails. Which command must the engineer configure on the CPE?",
    options: [
    "ipv6 route ::/0 2001:db8:1234:2::1 3",
    "ipv6 route ::/128 2001:db8:1234:2::1 3",
    "ipv6 route ::/0 2001:db8:1234:2::1 1",
    "ipv6 route ::/0 2001:db8:1234:2::1 2"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0479",
    question: "Refer to the exhibit. Router OldR is replacing another router on the network with the intention of having OldR and R2 exchange routes. After the engineer applied the initial OSPF configuration, the routes were still missing on both devices. Which command sequence must be issued before the clear IP ospf process command is entered to enable the neighbor relationship?",
    options: [
    "OldR(config)#interface g0/0/0 OldR(config-if)#ip ospf hello-interval 15",
    "OldR(config)#router ospf 1 OldR(config-router)#network 192.168.1.0 255.255.255.0 area 2",
    "OldR(config)#interface g0/0/0 OldR(config-if)#ip ospf dead-interval 15",
    "OldR(config)#router ospf 1 OldR(config-router)#no router-id 192.168.1.1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0481",
    question: "Refer to the exhibit. What is the subnet mask for route 172.16.4.0?",
    options: [
    "255.255.255.192",
    "255.255.254.0",
    "255.255.248.0",
    "255.255.240.0"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0482",
    question: "Refer to the exhibit. A static route must be configured on R14 to forward traffic for the 172.21.34.0/25 network that resides on R86. Which command must be used to fulfill the request?",
    options: [
    "ip route 172.21.34.0 255.255.255.192 10.73.65.65",
    "ip route 172.21.34.0 255.255.255.128 10.73.65.66",
    "ip route 172.21.34.0 255.255.255.0 10.73.65.65",
    "ip route 172.21.34.0 255.255.128.0 10.73.65.64"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0483",
    question: "Refer to the exhibit. The network engineer is configuring router R2 as a replacement router on the network. After the initial configuration is applied, it is determined that R2 failed to show R1 as a neighbor. Which configuration must be applied to R2 to complete the OSPF configuration and enable it to establish the neighbor relationship with R1?",
    options: [
    "R2(config)#router ospf 1 R2(config-router)#network 192.168.1.0 255.255.255.0 area 2",
    "R2(config)#interface g0/0/0 R2(config-if)#ip ospf hello-interval 10",
    "R2(config)#interface g0/0/0 R2(config-if)#ip ospf dead-interval 40",
    "R2(config)#router ospf 1 R2(config-router)#router-id 192.168.1.2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0484",
    question: "Refer to the exhibit. All interfaces are configured with duplex auto and ip ospf network broadcast. Which configuration allows routers R14 and R86 to form an OSPFv2 adjacency and act as a central point for exchanging OSPF information between routers?",
    options: [
    "R14# interface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf priority 255 ip mtu 1500 router ospf 10 router-id 10.10.1.14 network 10.10.1.14 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 areaR86# interface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip mtu 1400 router ospf 10 router-id 10.10.1.86 network 10.10.1.86 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 area",
    "R14# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf 10 areaip mtu 1500 router ospf 10 ip ospf priority 255 router-id 10.10.1.14 R86# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf 10 areaip mtu 1500 router ospf 10 router-id 10.10.1.86",
    "R14# interface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf priorityip mtu 1500 router ospf 10 router-id 10.10.1.14 network 10.10.1.14 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 areaR86# interface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip mtu 1500 router ospf 10 router-id 10.10.1.86 network 10.10.1.86 0.0.0.0 areanetwork 10.73.65.64 0.0.0.3 area",
    "R14# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.65 255.255.255.252 ip ospf priority 255 ip ospf 10 areaip mtu 1500 router ospf 10 router-id 10.10.1.14 R86# interface Loopback0 ip ospf 10 areainterface FastEthernet0/0 ip address 10.73.65.66 255.255.255.252 ip ospf 10 areaip mtu 1500 router ospf 10 router-id 10.10.1.86"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0485",
    question: "A packet from a company's branch office is destined to host 172.31.0.1 at headquarters. The sending router has three possible matches in its routing table for the packet: prefixes 172.31.0.0/16, 172.31.0.0/24, and 172.31.0.0/25. How does the router handle the packet?",
    options: [
    "It sends the traffic via prefix 172.31.0.0/24.",
    "It sends the traffic via prefix 172.31.0.0/16.",
    "It sends the traffic via prefix 172.31.0.0/25.",
    "It sends the traffic via the default gateway 0.0.0.0/0."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0486",
    question: "Refer to the exhibit. An engineer is asked to configure router R1 so that it forms an OSPF single-area neighbor relationship with R2. Which command sequence must be implemented to configure the router?",
    options: [
    "router ospf 100 network 10.0.0.0 0.0.0.252 area0 network 10.0.1.0 0.0.0.255 area0",
    "router ospf 100 network 10.0.0.0 0.0.0.3 area0 network 10.0.2.0 255.255.255.0 area0",
    "router ospf 10 network 10.0.0.0 0.0.0.3 area0 network 10.0.1.0 0.0.0.255 area0",
    "router ospf 10 network 10.0.0.0 0.0.0.3 area0 network 10.0.2.0 0.0.0.255 area0"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0487",
    question: "Refer to the exhibit. All routers in the network are configured. R2 must be the DR. After the engineer connected the devices, R1 was elected as the DR. Which command sequence must be configured on R2 to be elected as the DR in the network?",
    options: [
    "R2(config)#intergface gi0/0 R2(config-if)#ip ospf priority 100",
    "R2(config)#router ospf 1 R2(config-router)#router-id 192.168.2.7",
    "R2(config)#router ospf 1 R2(config-router)#router-id 10.100.100.100",
    "R2(config)#intergface gi0/0 R2(config-if)#ip ospf priority 1"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0488",
    question: "Refer to the exhibit. The router R1 is in the process of being configured. Routers R2 and R3 are configured correctly for the new environment. Which two commands must be configured on R1 for PC1 to communicate to all PCs on the 10.10.10.0/24 network? (Choose two.)",
    options: [
    "ip route 10.10.10.0 255.255.255.0 192.168.2.3",
    "ip route 10.10.10.10 255.255.255.255 192.168.2.2",
    "ip route 10.10.10.10 255.255.255.255 g0/1",
    "ip route 10.10.10.8 255.255.255.248 g0/1",
    "ip route 10.10.10.0 255.255.255.248 192.168.2.2"
    ],
    correct: [0, 1],
    exhibit: true,
  },
  {
    id: "q0489",
    question: "Refer to the exhibit. What is the subnet mask of the route to the 10.10.13.160 prefix?",
    options: [
    "255.255.255.240",
    "255.255.255.128",
    "255.255.248.0",
    "255.255.255.248"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0490",
    question: "Refer to the exhibit. Which two commands, when configured on router R1, fulfill these requirements? (Choose two.) ✑ Packets toward the entire network 2001:db8:23::/64 must be forwarded through router R2. Packets toward host 2001:db8:23::14 preferably must be forwarded through R3.",
    options: [
    "ipv6 route 2001:db8:23::/128 fd00:12::2",
    "ipv6 route 2001:db8:23::14/128 fd00:13::3",
    "ipv6 route 2001:db8:23::/64 fd00:12::2",
    "ipv6 route 2001:db8:23::14/64 fd00:12::2 200",
    "ipv6 route 2001:db8:23::14/64 fd00:12::2"
    ],
    correct: [1, 2],
    exhibit: true,
  },
  {
    id: "q0491",
    question: "Refer to the exhibit. Traffic from R1 to the 10.10.2.0/24 subnet uses 192.168.1.2 as its next hop. A network engineer wants to update the R1 configuration so that traffic with destination 10.10 2.1 passes through router R3, and all other traffic to the 10.10.2.0/24 subnet passes through R2. Which command must be used?",
    options: [
    "ip route 10.10.2.1 255.255.255.255 192.168.1.4 115",
    "ip route 10.10.2.0 255.255.255.0 192.168.1.4 115",
    "ip route 10.10.2.0 255.255.255.0 192.168.1.4 100",
    "ip route 10.10.2.1 255.255.255.255192.168.1.4 100"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0492",
    question: "Refer to the exhibit. The image server and client A are running an application that transfers an extremely high volume of data between the two. An engineer is configuring a dedicated circuit between R1 and R2. Which set of commands must the engineer apply to the routers so that only traffic between the image server and client A is forces to use the new circuit?",
    options: [
    "R1(config)#ip route 10.10.13.10 255.255.255.255 10.10.10.6 R2(config)#ip route 192.168.0.100 255.255.255.255 10.10.10.5",
    "R1(config)#ip route 10.10.13.10 255.255.255.128 10.10.10.6 R2(config)#lp route 192.168.0.100 255.255.255.0 10.10.10.5",
    "R1(config)#ip route 10.10.13.10 255.255.255.252 10.10.10.6 R2(config)#tp route 192.168.0.100 255.255.255.252 10.10.10.5",
    "R1(config)#ip route 10.10.13.10 255.255.255.255 10.10.10.2 R2(config)#ip route 192.168.0.100 255.255.255.255 10.10.10.1"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0493",
    question: "Refer to the exhibit. An engineer is checking the routing table in the main router to identify the path to a server on the network. Which route does the router use to reach the server at 192.168.2.2?",
    options: [
    "S 192.168.0.0/20 [1/0] via 10.1.1.1",
    "S 192.168.2.0/29 [1/0] via 10.1.1.1",
    "S 192.168.2.0/28 [1/0] via 10.1.1.1",
    "S 192.168.1.0/30 [1/0] via 10.1.1.1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0495",
    question: "Refer to the exhibit. What is the prefix length for the route that router1 will use to reach host A?",
    options: [
    "/25",
    "/27",
    "/28",
    "/29"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0496",
    question: "Refer to the exhibit. After applying this configuration to router R1, a network engineer is verifying the implementation. If all links are operating normally, and the engineer sends a series of packets from PC1 to PC3, how are the packets routed?",
    options: [
    "They are distributed sent round robin to interfaces S0/0/0 and S0/0/1",
    "They are routed to 10.0.0.2",
    "They are routed to 192.168.100.2",
    "They are routed to 172.16.20.2"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0497",
    question: "Refer to the exhibit. When router R1 receives a packet with destination IP address 10.56.0.62, through which interface does it route the packet?",
    options: [
    "Vlan58",
    "Null0",
    "Vlan59",
    "Vlan60"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0498",
    question: "Refer to the exhibit. How much OSPF be configured on the GigabitEthernet0/0 interface of the neighbor device to achieve the destined neighbor relationship?",
    options: [
    "Router(config)#interface GigabitEthernet 0/0 Router(config-if)#ip ospf cost 5",
    "Router(config)#interface GigabitEthernet 0/0 Router(config-if)#ip ospf priority 1",
    "Router(config)#interface GigabitEthernet 0/0 Router(config-if)#ip ospf area 2",
    "Router(config)#interface GigabitEthernet 0/0 Router(config-if)#ip ospf network point-to- point"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0499",
    question: "An engineer just installed network 10.120.10.0/24. Which configuration must be applied to the R14 router to add the new network to its OSPF routing table?",
    options: [
    "Router ospf 100 Network 10.120.10.0 0.0.0.255 area 0",
    "Router ospf 120 Network 10.120.10.0 255.255.255.0 areaIp route 10.120.10.0 255.255.255.0 fa0/1",
    "Router ospf 100 areaNetwork 10.120.10.0 0.0.0.255",
    "Router ospf 100 Network 10.120.10.0 255.255.255.0 area 0"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0500",
    question: "What are two benefits of FHRPs? (Choose two.)",
    options: [
    "They allow encrypted traffic",
    "They prevent loops in the Layer 2 network.",
    "They are able to bundle multiple ports to increase bandwidth",
    "They enable automatic failover of the default gateway",
    "They allow multiple devices to serve as a single virtual gateway for clients in the network"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0501",
    question: "What is the MAC address used with VRRP as a virtual address?",
    options: [
    "00-05-42-38-53-31 when a gateway protocol is required that supports more than two Cisco devices for",
    "00-00-5E-00-01-0a to interoperate normally with all vendors and provide additional security features for Cisco",
    "00-00-0C-07-AD-89 to ensure that the spanning-tree forwarding path to the gateway is loop-free",
    "00-07-C0-70-AB-01 Q0502 Nahcfragen Why would VRRP be implemented when configuring a new subnet in a multivendor environment? redundancy devices  Jonny to enable normal operations to continue after a member failure without requiring a change in a host ARP cache"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0503",
    question: "Why implement VRRP?",
    options: [
    "To hand over to end users the autodiscovery of virtual gateways",
    "To provide end users with a virtual gateway in a multivendor network",
    "To leverage a weighting scheme to provide uninterrupted service",
    "To detect link failures without the overhead of Bidirectional Forwarding Detection"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0504",
    question: "Which type of address is shared by routers in a HSRP implementation and used by hosts on the subnet as their default gateway address?",
    options: [
    "multicast address",
    "virtual IP address",
    "loopback IP address",
    "broadcast address"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0505",
    question: "By default, which virtual MAC address does HSRP group 14 use?",
    options: [
    "00:05:5e:19:0c:14",
    "00:05:0c:07:ac:14",
    "04:15:26:73:3c:0e",
    "00:00:0c:07:ac:0e"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0506",
    question: "Refer to the exhibit. Router R1 is added to the network and configured with the 10.0.0.64/26 and 10.0.20.0/26 subnets. However, traffic destined for the LAN on R3 is not accessible. Which command when executed on R1 defines a static route to reach the R3 LAN?",
    options: [
    "ip route 10.0.0.64 255.255.255.192 10.0.20.3",
    "ip route 10.0.15.0 255.255.255.0 10.0.20.1",
    "ip route 10.0.15.0 255.255.255.192 10.0.20.1",
    "ip route 10.0.15.0 255.255.255.0 10.0.20.3"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0507",
    question: "A router has two static routes to the same destination network under the same OSPF process. How does the router forward packets to the destination if the net- hop devices are different?",
    options: [
    "The router chooses the route with the oldest age.",
    "The router chooses the next hop with the lowest IP address.",
    "The router chooses the next hop with the lowest MAC address.",
    "The router load-balances traffic over all routes to the destination."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0508",
    question: "What does the implementation of a first-hop redundancy protocol protect against on a network?",
    options: [
    "default gateway failure",
    "BGP neighbor flapping",
    "spanning-tree loops",
    "root-bridge loss"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0509",
    question: "Which feature or protocol is required for an IP SLA to measure UDP jitter?",
    options: [
    "LLDP",
    "EEM",
    "CDP",
    "NTP"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0510",
    question: "Refer to the exhibit. Which feature is enabled by this configuration?",
    options: [
    "static NAT translation",
    "a DHCP pool",
    "a dynamic NAT address pool",
    "PAT"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0511",
    question: "Which NAT term is defined as a group of addresses available for NAT use?",
    options: [
    "NAT pool",
    "dynamic NAT",
    "static NAT",
    "one-way NAT"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0512",
    question: "Which command can you enter to allow Telnet to be supported in addition to SSH?",
    options: [
    "transport input telnet ssh",
    "transport input telnet",
    "no transport input telnet",
    "privilege level 15"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0513",
    question: "Refer to the exhibit. After you apply the given configuration to a router, the DHCP clients behind the device cannot communicate with hosts outside of their subnet. Which action is most likely to correct the problem?",
    options: [
    "Configure the dns server on the same subnet as the clients",
    "Activate the dhcp pool",
    "Correct the subnet mask",
    "Configure the default gateway"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0514",
    question: "Refer to the exhibit. Which rule does the DHCP server use when there is an IP address conflict?",
    options: [
    "The address is removed from the pool until the conflict is resolved.",
    "The address remains in the pool until the conflict is resolved.",
    "Only the IP detected by Gratuitous ARP is removed from the pool.",
    "Only the IP detected by Ping is removed from the pool.",
    "The IP will be shown, even after the conflict is resolved."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0515",
    question: "Which command can you enter to determine the addresses that have been assigned on a DHCP Server?",
    options: [
    "Show ip DHCP database.",
    "Show ip DHCP pool.",
    "Show ip DHCP binding.",
    "Show ip DHCP server statistic."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0516",
    question: "What is the authoritative source for an address lookup?",
    options: [
    "a recursive DNS search",
    "the operating system cache",
    "the ISP local cache",
    "the browser cache"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0517",
    question: "Which command is used to verify the DHCP relay agent address that has been set up on your Cisco IOS router?",
    options: [
    "show ip interface brief",
    "show ip dhcp bindings",
    "show ip route",
    "show ip interface  Da schaust du dir dann den Helper reiter an",
    "show interface",
    "show ip dhcp pool"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0518",
    question: "Which type of information resides on a DHCP server?",
    options: [
    "a list of the available IP addresses in a pool",
    "a list of public IP addresses and their corresponding names",
    "usernames and passwords for the end users in a domain",
    "a list of statically assigned MAC addresses"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0519",
    question: "What are two roles of Domain Name Services (DNS)? (Choose two.)",
    options: [
    "builds a flat structure of DNS names for more efficient IP operations",
    "encrypts network Traffic as it travels across a WAN by default",
    "improves security by protecting IP addresses under Fully Qualified Domain Names (FQDNs)",
    "enables applications to identify resources by name instead of IP address",
    "allows a single host name to be shared across more than one IP address"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0520",
    question: "Which Cisco IOS command will indicate that interface GigabitEthernet 0/0 is configured via DHCP?",
    options: [
    "show ip interface GigabitEthernet 0/0 dhcp",
    "show interface GigabitEthernet 0/0",
    "show ip interface dhcp",
    "show ip interface GigabitEthernet 0/0",
    "show ip interface GigabitEthernet 0/0 brief"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0521",
    question: "What will happen if you configure the logging trap debug command on a router?",
    options: [
    "It causes the router to send messages with lower severity levels to the syslog server",
    "It causes the router to send all messages with the severity levels Warning, Error, Critical, and Emergency to the syslog server",
    "It causes the router to send all messages to the syslog server",
    "It causes the router to stop sending all messages to the syslog server"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0522",
    question: "A network administrator enters the following command on a router: logging trap 3. What are three message types that will be sent to the Syslog server? (Choose three.)",
    options: [
    "informational",
    "emergency",
    "warning",
    "critical",
    "debug",
    "error"
    ],
    correct: [1, 3, 5],
    exhibit: false,
  },
  {
    id: "q0524",
    question: "A network engineer must back up 20 network router configurations globally within a customer environment. Which protocol allows the engineer to perform this function using the Cisco IOS MIB?",
    options: [
    "ARP",
    "SNMP",
    "SMTP",
    "CDP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0525",
    question: "Which command enables a router to become a DHCP client?",
    options: [
    "ip address dhcp",
    "ip dhcp client",
    "ip helper-address",
    "ip dhcp pool"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0526",
    question: "Which function does an SNMP agent perform?",
    options: [
    "It sends information about MIB variables in response to requests from the NMS",
    "It manages routing between Layer 3 devices in a network",
    "It coordinates user authentication between a network device and a TACACS+ or RADIUS server",
    "It requests information from remote network nodes about catastrophic system events"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0527",
    question: "What are two roles of the Dynamic Host Configuration Protocol (DHCP)? (Choose two.)",
    options: [
    "The DHCP server assigns IP addresses without requiring the client to renew them.",
    "The DHCP server leases client IP addresses dynamically.",
    "The DHCP client is able to request up to four DNS server addresses.",
    "The DHCP server offers the ability to exclude specific IP addresses from a pool of IP addresses.",
    "The DHCP client maintains a pool of IP addresses it is able to assign."
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0528",
    question: "Which command must be entered when a device is configured as an NTP server?",
    options: [
    "ntp peer",
    "ntp master",
    "ntp authenticate",
    "ntp server"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0529",
    question: "What event has occurred if a router sends a notice level message to a syslog server?",
    options: [
    "A certificate has expired",
    "An interface line has changed status",
    "A TCP connection has been torn down",
    "An ICMP connection has been built"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0530",
    question: "Refer to the exhibit. An engineer deploys a topology in which R1 obtains its IP configuration from DHCP. If the switch and DHCP server configurations are complete and correct, which two sets of commands must be configured on R1 and R2 to complete the task? (Choose two.)",
    options: [
    "R1(config)# interface fa0/0 R1(config-if)# ip helper-address 198.51.100.100",
    "R2(config)# interface gi0/0 R2(config-if)# ip helper-address 198.51.100.100",
    "R1(config)# interface fa0/0 R1(config-if)# ip address dhcp R1(config-if)# no shutdown",
    "R2(config)# interface gi0/0 R2(config-if)# ip address dhcp",
    "R1(config)# interface fa0/0 R1(config-if)# ip helper-address 192.0.2.2"
    ],
    correct: [1, 2],
    exhibit: true,
  },
  {
    id: "q0531",
    question: "Which two actions are performed by the Weighted Random Early Detection mechanism? (Choose two.)",
    options: [
    "It supports protocol discovery.",
    "It guarantees the delivery of high-priority packets.",
    "It can identify different flows with a high level of granularity.",
    "It can mitigate congestion by preventing the queue from filling up.",
    "It drops lower-priority packets before it drops higher-priority packets."
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0532",
    question: "Refer to the exhibit. An engineer configured NAT translations and has verified that the configuration is correct. Which IP address is the source IP after the NAT has taken place?",
    options: [
    "10.4.4.4",
    "10.4.4.5",
    "172.23.103.10",
    "172.23.104.4"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0533",
    question: "If a notice-level message is sent to a syslog server, which event has occurred?",
    options: [
    "A network device has restarted.",
    "A debug operation is running.",
    "A routing instance has flapped.",
    "An ARP inspection has failed."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0535",
    question: "Which two tasks must be performed to configure NTP to a trusted server in client mode on a single network device? (Choose two.)",
    options: [
    "Enable NTP authentication.",
    "Verify the time zone.",
    "Specify the IP address of the NTP server.",
    "Set the NTP server private key.",
    "Disable NTP broadcasts."
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0536",
    question: "What is the primary purpose of a First Hop Redundancy Protocol?",
    options: [
    "It allows directly connected neighbors to share configuration information",
    "It reduces routing failures by allowing Layer 3 load balancing between OSPF neighbors that have the same link metric",
    "It allows a router to use bridge priorities to create multiple loop-free paths to a single destination",
    "It reduces routing failures by allowing more than one router to represent itself as the default gateway of a network"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0537",
    question: "An engineer is configuring NAT to translate the source subnet of 10.10.0.0/24 to any one of three addresses: 192.168.3.1, 192.168.3.2, or 192.168.3.3. Which configuration should be used?",
    options: [
    "enable configure terminal ip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30 access-list 1 permit 10.10.0.0 0.0.0.255 ip nat outside destination list 1 pool mypool interface g1/1 ip nat inside interface g1/2 ip nat outside",
    "enable configure terminal ip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30 access-list 1 permit 10.10.0.0 0.0.0.254 ip nat inside source list 1 pool mypool interface g1/1 ip nat inside interface g1/2 ip nat outside",
    "enable configure terminal ip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30 route map permit 10.10.0.0 255.255.255.0 ip nat outside destination list 1 pool mypool interface g1/1 ip nat inside interface g1/2 ip nat outside",
    "enable configure terminal ip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30 access-list 1 permit 10.10.0.0 0.0.0.255 ip nat inside source list 1 pool mypool interface g1/1 ip nat inside interface g1/2 ip nat outside"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0538",
    question: "When the active router in an HSRP group fails, which router assumes the role and forwards packets?",
    options: [
    "forwarding",
    "listening",
    "standby",
    "backup"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0539",
    question: "What protocol allows an engineer to back up 20 network router configurations globally while using the copy function?",
    options: [
    "TCP",
    "SMTP",
    "FTP",
    "SNMP"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0540",
    question: "Which type of address is the public IP address of a NAT device?",
    options: [
    "outside global",
    "outside local",
    "inside global",
    "inside local",
    "outside public",
    "inside public"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0541",
    question: "Which two pieces of information can you determine from the output of the show ntp status command? (Choose two.)",
    options: [
    "whether the NTP peer is statically configured",
    "the IP address of the peer to which the clock is synchronized",
    "the configured NTP servers",
    "whether the clock is synchronized",
    "the NTP version number of the peer"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0542",
    question: "Which keyword in a NAT configuration enables the use of one outside IP address for multiple inside hosts?",
    options: [
    "source",
    "static",
    "pool",
    "overload"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0543",
    question: "Which feature or protocol determines whether the QOS on the network is sufficient to support IP services?",
    options: [
    "LLDP",
    "CDP",
    "IP SLA",
    "EEM"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0544",
    question: "In QoS, which prioritization method is appropriate for interactive voice and video?",
    options: [
    "traffic policing",
    "round-robin scheduling",
    "low-latency queuing",
    "expedited forwarding"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0546",
    question: "What is the purpose of traffic shaping?",
    options: [
    "to be a marking mechanism that identifies different flows",
    "to provide fair queuing for buffered flows",
    "to mitigate delays over slow links",
    "to limit the bandwidth that a flow can use"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0547",
    question: "What is a function of TFTP in network operations?",
    options: [
    "transfers IOS images from a server to a router for firmware upgrades",
    "transfers a backup configuration file from a server to a switch using a username and password",
    "transfers configuration files from a server to a router on a congested link",
    "transfers files between file systems on a router"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0548",
    question: "What is a DHCP client?",
    options: [
    "a workstation that requests a domain name associated with its IP address",
    "a host that is configured to request an IP address automatically",
    "a server that dynamically assigns IP addresses to hosts.",
    "a router that statically assigns IP addresses to hosts."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0549",
    question: "Where does the configuration reside when a helper address is configured lo support DHCP?",
    options: [
    "on the router closest to the server",
    "on the router closest to the client",
    "on every router along the path",
    "on the switch trunk interface"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0550",
    question: "What facilitates a Telnet connection between devices by entering the device name?",
    options: [
    "SNMP",
    "DNS lookup",
    "syslog",
    "NTP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0551",
    question: "When deploying syslog, which severity level logs informational messages? • A.",
    options: [
    "",
    "2",
    "4",
    "6"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0553",
    question: "Which two QoS tools provide congestion management? (Choose two.)",
    options: [
    "CBWFQ",
    "FRTS",
    "CAR",
    "PBR",
    "PQ"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0554",
    question: "Which QoS tool is used to optimize voice traffic on a network that is primarily intended for data traffic?",
    options: [
    "WRED",
    "FIFO",
    "WFQ",
    "PQ"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0555",
    question: "An engineer is installing a new wireless printer with a static IP address on the Wi-Fi network. Which feature must be enabled and configured to prevent connection issues with the printer?",
    options: [
    "client exclusion",
    "DHCP address assignment",
    "passive client",
    "static IP tunneling"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0556",
    question: "When a client and server are not on the same physical network, which device is used to forward requests and replies between client and server for DHCP?",
    options: [
    "DHCPOFFER",
    "DHCP relay agent",
    "DHCP server",
    "DHCPDISCOVER"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0557",
    question: "Refer to the exhibit. The ntp server 192.168.0.3 command has been configured on router 1 to make it an NTP client of router 2. Which command must be configured on router 2 so that it operates in server- only mode and relies only on its internal clock?",
    options: [
    "Router2(config)#ntp server 172.17.0.1",
    "Router2(config)#ntp server 192.168.0.2",
    "Router2(config)#ntp passive",
    "Router2(config)#ntp master 4"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0558",
    question: "Which protocol requires authentication to transfer a backup configuration file from a router to a remote server?",
    options: [
    "FTP",
    "SMTP",
    "TFTP",
    "DTP"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0559",
    question: "Which condition must be met before an NMS handles an SNMP trap from an agent?",
    options: [
    "The NMS must receive the same trap from two different SNMP agents to verify that it is reliable.",
    "The NMS must receive a trap and an inform message from the SNMP agent within a configured interval.",
    "The NMS software must be loaded with the MIB associated with the trap.",
    "The NMS must be configured on the same router as the SNMP agent."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0560",
    question: "An engineer is configuring switch SW1 to act as an NTP server when all upstream NTP server connectivity fails. Which configuration must be used?",
    options: [
    "SW1# config t SW1(config)#ntp peer 192.168.1.1 SW1(config)#ntp access-group peer accesslist1",
    "SW1# config t SW1(config)#ntp master SW1(config)#ntp server192.168.1.1",
    "SW1# config t SW1(config)#ntp backup SW1(config)#ntp server192.168.1.1",
    "SW1# config t SW1(config)#ntp server192.168.1.1 SW1(config)#ntp access-group peer accesslist1"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0561",
    question: "A network administrator must enable DHCP services between two sites. What must be configured for the router to pass DHCPDISCOVER messages on to the server?",
    options: [
    "DHCP Binding",
    "a DHCP Relay Agent",
    "DHCP Snooping",
    "a DHCP Pool"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0562",
    question: "Which level of severity must be set to get informational syslogs?",
    options: [
    "alert",
    "critical",
    "notice",
    "debug"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0563",
    question: "On workstations running Microsoft Windows, which protocol provides the default gateway for the device?",
    options: [
    "STP",
    "DHCP",
    "SNMP",
    "DNS"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0564",
    question: "Which two statements about NTP operations are true? (Choose two.)",
    options: [
    "NTP uses UDP over IP.",
    "Cisco routers can act as both NTP authoritative servers and NTP clients.",
    "Cisco routers can act only as NTP servers.",
    "Cisco routers can act only as NTP clients.",
    "NTP uses TCP over IP."
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0565",
    question: "Refer to the exhibit. Which configuration must be applied to the router that configures PAT to translate all addresses in VLAN 200 while allowing devices on VLAN 100 to use their own IP addresses?",
    options: [
    "Router1(config)#access-list 99 permit 192.168.100.32 0.0.0.31 • Router1(config)#ip nat inside source list 99 interface gi1/0/0 overload Router1(config)#interface gi2/0/1.200 • Router1(config)#ip nat inside Router1(config)#interface gi1/0/0 • Router1(config)#ip nat outside",
    "Router1(config)#access-list 99 permit 192.168.100.0 0.0.0.255 Router1(config)#ip nat inside source list 99 interface gi1/0/0 overload Router1(config)#interface gi2/0/1.200 Router1(config)#ip nat inside Router1(config)#interface gi1/0/0 Router1(config)#ip nat outside",
    "Router1(config)#access-list 99 permit 209.165.201.2 255.255.255.255 Router1(config)#ip nat inside source list 99 interface gi1/0/0 overload Router1(config)#interface gi2/0/1.200 Router1(config)#ip nat inside Router1(config)#interface gi1/0/0 Router1(config)#ip nat outside",
    "Router1(config)#access- list 99 permit 209.165.201.2 0.0.0.0 Router1(config)#ip nat inside source list 99 interface gi1/0/0 overload Router1(config)#interface gi2/0/1.200 Router1(config)#ip nat inside Router1(config)#interface gi1/0/0 Router1(config)#ip nat outside"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0566",
    question: "Refer to the exhibit. Which two commands must be added to update the configuration of router R1 so that it accepts only encrypted connections? (Choose two.)",
    options: [
    "transport input ssh",
    "username CNAC secret R!41!3705926@",
    "crypto key generate rsa 1024",
    "line vty4",
    "ip ssh version 2"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0567",
    question: "Which command implies the use of SNMPv3?",
    options: [
    "snmp-server user",
    "snmp-server host",
    "snmp-server enable traps",
    "snmp-server community"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0568",
    question: "R1 as an NTP server must have: ✑ NTP authentication enabled ✑ NTP packets sourced from Interface loopback 0 ✑ NTP stratum 2 ✑ NTP packets only permitted to client IP 209.165.200.225 How should R1 be configured?",
    options: [
    "ntp authenticate ntp authentication-key 2 sha1 CISCO123 ntp source Loopback0 ntp access- group server-only 10 ntp master 2 ! access-list 10 permit udp host 209.165.200.225 any eq 123",
    "ntp authenticate ntp authentication-key 2 md5 CISCO123 ntp interface Loopback0 ntp access-group server-only 10 ntp stratum 2 ! access-list 10 permit 209.165.200.225",
    "ntp authenticate ntp authentication-key 2 md5 CISCO123 ntp source Loopback0 ntp access- group server-only 10 ntp master 2 ! access-list 10 permit 209.165.200.225",
    "ntp authenticate ntp authentication-key 2 md5 CISCO123 ntp source Loopback0 ntp access- group server-only 10 ntp stratum 2 ! access-list 10 permit udp host 209.165.200.225 any eq 123"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0569",
    question: "What is a capability of FTP in network management operations?",
    options: [
    "offers proprietary support at the session layer when transferring data",
    "uses separate control and data connections to move files between server and client",
    "encrypts data before sending between data resources",
    "devices are directly connected and use UDP to pass file information"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0570",
    question: "A network engineer is configuring a switch so that it is remotely reachable via SSH. The engineer has already configured the host name on the router. Which additional command must the engineer configure before entering the command to generate the RSA key?",
    options: [
    "password password",
    "ip ssh authentication-retries 2",
    "ip domain-name domain",
    "crypto key generate rsa modulus 1024"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0571",
    question: "Which QoS traffic handling technique retains excess packets in a queue and reschedules these packets for later transmission when the configured maximum bandwidth has been surpassed?",
    options: [
    "traffic policing",
    "weighted random early detection",
    "traffic prioritization",
    "traffic shaping"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0572",
    question: "Which command must be entered to configure a DHCP relay?",
    options: [
    "ip dhcp relay",
    "ip dhcp pool",
    "ip address dhcp",
    "ip helper-address"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0573",
    question: "Refer to the exhibit. The DHCP server and clients are connected to the same switch. What is the next step to complete the DHCP configuration to allow clients on VLAN 1 to receive addresses from the DHCP server?",
    options: [
    "Configure the ip dhcp snooping trust command on the interface that is connected to the DHCP client.",
    "Configure ip dhcp relay information option command on the interface that is connected to the DHCP server.",
    "Configure ip dhcp snooping trust command on the interface that is connected to the DHCP server.",
    "Configure the ip dhcp information option command on the interface that is connected to the DHCP client."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0574",
    question: "A network analyst is tasked with configuring the date and time on a router using EXEC mode. The date must be set to January 1, 2020 and the time must be set to 12:00 am. Which command should be used?",
    options: [
    "clock timezone",
    "clock summer-time date",
    "clock summer-time recurring",
    "clock set"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0575",
    question: "Refer to the exhibit. What is the metric of the route to the 192.168.10.33/28 subnet?",
    options: [
    "84",
    "110",
    "192",
    "193"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0576",
    question: "Which command creates a static NAT binding for a PC address of 10.1.1.1 to the public routable address 209.165.200.225 assigned to the PC?",
    options: [
    "R1(config)#ip nat inside source static 10.1.1.1 209.165.200.225",
    "R1(config)#ip nat outside source static 209.165.200.225 10.1.1.1",
    "R1(config)#ip nat inside source static 209.165.200.225 10.1.1.1",
    "R1(config)#ip nat outside source static 10.1.1.1 209.165.200.225"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0577",
    question: "What prevents a workstation from receiving a DHCP address?",
    options: [
    "STP",
    "VTP",
    "802.1Q",
    "DTP"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0578",
    question: "What is a feature of TFTP?",
    options: [
    "offers anonymous user login ability",
    "uses two separate connections for control and data traffic",
    "relies on the well-known TCP port 20 to transmit data",
    "provides secure data transfer"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0579",
    question: "Which QoS forwarding per-hop behavior changes a specific value in a packet header to set the class of service for the packet?",
    options: [
    "shaping",
    "classification",
    "policing",
    "marking"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0580",
    question: "Refer to the exhibit. How should the configuration be updated to allow PC1 and PC2 access to the Internet?",
    options: [
    "Modify the configured number of the second access list",
    "Change the ip nat inside source command to use interface GigabitEthernet0/0",
    "Remove the overload keyword from the ip nat inside source command",
    "Add either the ip nat {inside|outside} command under both interfaces"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0581",
    question: "What is the purpose of the ip address dhcp command?",
    options: [
    "to configure an interface as a DHCP relay",
    "to configure an interface as a DHCP client",
    "to configure an interface as a DHCP helper",
    "to configure an interface as a DHCP server"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0582",
    question: "Refer to the exhibit. Which configuration enables DHCP addressing for hosts connected to interface FastEthernet0/1 on router R4?",
    options: [
    "interface FastEthernet0/1 ip helper-address 10.0.1.1 ! access-list 100 permit tcp host 10.0.1.1 eq 67 host 10.148.2.1",
    "interface FastEthernet0/0 ip helper-address 10.0.1.1 ! access-list 100 permit udp host 10.0.1.1 eq bootps host 10.148.2.1",
    "interface FastEthernet0/0 ip helper-address 10.0.1.1 ! access-list 100 permit host 10.0.1.1 host 10.148.2.1 eq bootps",
    "interface FastEthernet0/1 ip helper-address 10.0.1.1 ! access-list 100 permit udp host 10.0.1.1 eq bootps host 10.148.2.1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0584",
    question: "An engineer is configuring SSH version 2 exclusively on the R1 router. What is the minimum configuration required to permit remote management using the cryptographic protocol?",
    options: [
    "hostname R1 service password-encryption crypto key generate rsa general-keys modulus 1024 username cisco privilege 15 passwordcisco123 ip ssh version 2 line vty15 transport input ssh login local",
    "hostname R1 ip domain name cisco crypto key generate rsa general-keys modulus 1024 username cisco privilege 15 passwordcisco123 ip ssh version 2 line vty15 transport input ssh login local",
    "hostname R1 crypto key generate rsa general-keys modulus 1024 username cisco privilege 15 passwordcisco123 ip ssh version 2 line vty15 transport input ssh login local",
    "hostname R1 ip domain name cisco crypto key generate rsa general-keys modulus 1024 username cisco privilege 15 passwordcisco123 ip ssh version 2 line vty15 transport input all login local"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0585",
    question: "Which per-hop traffic-control feature does an ISP implement to mitigate the potential negative effects of a customer exceeding its committed bandwidth?",
    options: [
    "policing",
    "queuing",
    "marking",
    "shaping"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0587",
    question: "Which remote access protocol provides unsecured remote CLI access?",
    options: [
    "console",
    "Telnet",
    "SSH",
    "Bash"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0589",
    question: "Refer to the exhibit. Which router or router group are NTP clients?",
    options: [
    "R1",
    "R2 and R3",
    "R1, R3, and R4",
    "R1, R2, and R3"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0590",
    question: "Refer to the exhibit. What is the next step to complete the implementation for the partial NAT configuration shown?",
    options: [
    "Modify the access list for the internal network on e0/1.",
    "Reconfigure the static NAT entries that overlap the NAT pool.",
    "Apply the ACL to the pool configuration.",
    "Configure the NAT outside interface."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0591",
    question: "What is a syslog facility?",
    options: [
    "host that is configured for the system to send log messages",
    "password that authenticates a Network Management System to receive log messages",
    "group of log messages associated with the configured severity level",
    "set of values that represent the processes that can generate a log message"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0593",
    question: "Refer to the exhibit. A newly configured PC fails to connect to the internet by using TCP port 80 to www.cisco.com. Which setting must be modified for the connection to work?",
    options: [
    "Subnet Mask",
    "DNS Servers",
    "Default Gateway",
    "DHCP Servers"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0594",
    question: "Which QoS queuing method discards or marks packets that exceed the desired bit rate of traffic flow?",
    options: [
    "CBWFQ",
    "policing",
    "LLQ",
    "shaping"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0595",
    question: "Which QoS per-hop behavior changes the value of the ToS field in the IPv4 packet header?",
    options: [
    "Shaping",
    "Policing",
    "Classification",
    "Marking"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0596",
    question: "What is the function of FTP?",
    options: [
    "Always operated without user connection validation",
    "Uses block number to identify and mitigate data-transfer errors",
    "Relies on the well-known UDO port 69 for data transfer",
    "Uses two separate connections for control and data traffic"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0597",
    question: "How does TFTP operate in a network?",
    options: [
    "Provides secure data transfer",
    "Relies on the well-known TCP port 20 to transmit data",
    "Uses block numbers to identify and mitigate data-transfer errors",
    "Requires two separate connections for control and data traffic"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0598",
    question: "Refer to the exhibit. Which plan must be implemented to ensure optimal QoS marking practices on this network?",
    options: [
    "Trust the IP phone markings on SW1 and mark traffic entering SW2 at SW2",
    "As traffic traverses MLS1 remark the traffic, but trust all markings at the access layer",
    "Remark traffic as it traverses R1 and trust all markings at the access layer.",
    "As traffic enters from the access layer on SW1 and SW2, trust all traffic markings."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0599",
    question: "How does QoS optimize voice traffic?",
    options: [
    "by reducing bandwidth usage",
    "by reducing packet loss",
    "by differentiating voice and video traffic",
    "by increasing jitter"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0600",
    question: "Which QoS tool can you use to optimize voice traffic on a network that is primarily intended for data traffic?",
    options: [
    "WRED",
    "FIFO",
    "PQ",
    "WFQ"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0601",
    question: "Refer to the exhibit. Users on existing VLAN 100 can reach sites on the Internet. Which action must the administrator take to establish connectivity to the Internet for users in VLAN 200?",
    options: [
    "Define a NAT pool on the router.",
    "Configure the ip nat outside command on another interface for VLAN 200",
    "Configure static NAT translations for VLAN 200.",
    "Update the NAT_INSIDE_RANGES ACL."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0602",
    question: "An organization secures its network with multi-factor authentication using an authenticator app on employee smartphones. How is the application secured in the case of a user's smartphone being lost or stolen?",
    options: [
    "The application requires the user to enter a PIN before it provides the second factor",
    "The application requires an administrator password to reactivate after a configured interval",
    "The application verifies that the user is in a specific location before it provides the second factor",
    "The application challenges a user by requiring an administrator password to reactivate when the smartphone is rebooted"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0603",
    question: "Which device performs stateful inspection of traffic?",
    options: [
    "switch",
    "firewall",
    "access point",
    "wireless controller"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0604",
    question: "A network administrator enabled port security on a switch interface connected to a printer. What is the next configuration action in order to allow the port to learn the MAC address of the printer and insert it into the table automatically?",
    options: [
    "enable dynamic MAC address learning",
    "implement static MAC addressing",
    "enable sticky MAC addressing",
    "implement auto MAC address learning"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0605",
    question: "Refer to the exhibit. An engineer booted a new switch and applied this configuration via the console port. Which additional configuration must be applied to allow administrators to authenticate directly to enable privilege mode via Telnet using a local username and password?",
    options: [
    "R1(config)#username admin R1(config-if)#line vty4 R1(config-line)#password p@ss1234 R1(config-line)#transport input telnet",
    "R1(config)#username admin privilege 15 secret p@ss1234 R1(config-if)#line vty4 R1(config-line)#login local",
    "R1(config)#username admin secret p@ss1234 R1(config-if)#line vty4 R1(config-line)#login local R1(config)#enable secret p@ss1234",
    "R1(config)#username admin R1(config-if)#line vty4 R1(config-line)#password p@ss1234"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0606",
    question: "Which effect does the aaa new-model configuration command have?",
    options: [
    "It enables AAA services on the device.",
    "It configures the device to connect to a RADIUS server for AAA.",
    "It associates a RADIUS server to the group.",
    "It configures a local user on the device."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0607",
    question: "Refer to the exhibit. Which two events occur on the interface, if packets from an unknown Source address arrive after the interface learns the maximum number of secure MAC address? (Choose two.)",
    options: [
    "The security violation counter dose not increment",
    "The port LED turns off",
    "The interface is error-disabled",
    "A syslog message is generated",
    "The interface drops traffic from unknown MAC address"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0608",
    question: "Which technology must be implemented to configure network device monitoring with the highest security?",
    options: [
    "IP SLA",
    "syslog",
    "NetFlow",
    "SNMPv3"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0609",
    question: "Refer to the exhibit. Which two statements about the interface that generated the output are true? (Choose two.)",
    options: [
    "learned MAC addresses are deleted after five minutes of inactivity",
    "the interface is error-disabled if packets arrive from a new unknown source address",
    "it has dynamically learned two secure MAC addresses",
    "it has dynamically learned three secure MAC addresses",
    "the security violation counter increments if packets arrive from a new unknown source address"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0610",
    question: "Refer to the exhibit. Which statement about the interface that generated the output is true?",
    options: [
    "A syslog message is generated when a violation occurs.",
    "One secure MAC address is manually configured on the interface.",
    "One secure MAC address is dynamically learned on the interface.",
    "Five secure MAC addresses are dynamically learned on the interface."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0611",
    question: "Refer to the exhibit. What is the effect of this configuration?",
    options: [
    "The switch port remains administratively down until the interface is connected to another switch.",
    "Dynamic ARP Inspection is disabled because the ARP ACL is missing.",
    "The switch port interface trust state becomes untrusted.",
    "The switch port remains down until it is configured to trust or untrust incoming packets."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0612",
    question: "What is the difference between AAA authentication and authorization?",
    options: [
    "Authentication identifies and verifies a user who is attempting to access a system, and authorization controls the tasks the user performs.",
    "Authentication controls the system processes a user accesses, and authorization logs the activities the user initiates.",
    "Authentication verifies a username and password, and authorization handles the communication between the authentication agent and the user database.",
    "Authentication identifies a user who is attempting to access a system, and authorization validates the user's password."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0613",
    question: "When configuring a WLAN with WPA2 PSK in the Cisco Wireless LAN Controller GUI, which two formats are available to select? (Choose two.)",
    options: [
    "decimal",
    "ASCII",
    "hexadecimal",
    "binary",
    "base64"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0615",
    question: "An engineer is asked to protect unused ports that are configured in the default VLAN on a switch. Which two steps will fulfill the request? (Choose two.)",
    options: [
    "Configure the ports as trunk ports.",
    "Enable the Cisco Discovery Protocol.",
    "Configure the port type as access and place in VLAN 99.",
    "Administratively shut down the ports.",
    "Configure the ports in an EtherChannel."
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0616",
    question: "An email user has been lured into clicking a link in an email sent by their company's security organization. The webpage that opens reports that it was safe, but the link may have contained malicious code. Which type of security program is in place?",
    options: [
    "user awareness",
    "brute force attack",
    "physical access control",
    "social engineering attack"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0618",
    question: "Which feature on the Cisco Wireless LAN Controller when enabled restricts management access from specific networks?",
    options: [
    "TACACS",
    "CPU ACL",
    "Flex ACL",
    "RADIUS"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0619",
    question: "Which set of actions satisfy the requirement for multifactor authentication?",
    options: [
    "The user enters a user name and password, and then re-enters the credentials on a second screen.",
    "The user swipes a key fob, then clicks through an email link.",
    "The user enters a user name and password, and then clicks a notification in an authentication app on a mobile device.",
    "The user enters a PIN into an RSA token, and then enters the displayed RSA key on a login screen."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0620",
    question: "Which configuration is needed to generate an RSA key for SSH on a router?",
    options: [
    "Configure VTY access.",
    "Configure the version of SSH.",
    "Assign a DNS domain name.",
    "Create a user with a password."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0621",
    question: "Refer to the exhibit. An extended ACL has been configured and applied to router R2. The configuration failed to work as intended. Which two changes stop outbound traffic on TCP ports 25 and 80 to 10.0.20.0/26 from the 10.0.10.0/26 subnet while still allowing all other traffic? (Choose two.)",
    options: [
    "Add a ג€permit ip any anyג€ statement at the end of ACL 101 for allowed traffic.",
    "Add a ג€permit ip any anyג€ statement to the beginning of ACL 101 for allowed traffic.",
    "The ACL must be moved to the Gi0/1 interface outbound on R2.",
    "The source and destination IPs must be swapped in ACL 101.",
    "The ACL must be configured the Gi0/2 interface inbound on R1."
    ],
    correct: [0, 3],
    exhibit: true,
  },
  {
    id: "q0622",
    question: "An engineer must configure a WLAN using the strongest encryption type for WPA2-PSK. Which cipher fulfills the configuration requirement?",
    options: [
    "WEP",
    "AES",
    "RC4",
    "TKIP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0625",
    question: "While examining excessive traffic on the network, it is noted that all incoming packets on an interface appear to be allowed even though an IPv4 ACL is applied to the interface. Which two misconfigurations cause this behavior? (Choose two.)",
    options: [
    "The ACL is empty",
    "A matching permit statement is too broadly defined",
    "The packets fail to match any permit statement",
    "A matching deny statement is too high in the access list",
    "A matching permit statement is too high in the access list"
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q0626",
    question: "The service password-encryption command is entered on a router. What is the effect of this configuration?",
    options: [
    "restricts unauthorized users from viewing clear-text passwords in the running configuration",
    "prevents network administrators from configuring clear-text passwords",
    "protects the VLAN database from unauthorized PC connections on the switch",
    "encrypts the password exchange when a VPN tunnel is established"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0627",
    question: "Which WPA3 enhancement protects against hackers viewing traffic on the Wi-Fi network?",
    options: [
    "SAE encryption",
    "TKIP encryption",
    "scrambled encryption key",
    "AES encryption"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0628",
    question: "Refer to the exhibit. If the network environment is operating normally, which type of device must be connected to interface fastethernet 0/1?",
    options: [
    "DHCP client",
    "access point",
    "router",
    "PC"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0629",
    question: "Refer to the exhibit. An administrator configures four switches for local authentication using passwords that are stored as a cryptographic hash. The four switches must also support SSH access for administrators to manage the network infrastructure. Which switch is configured correctly to meet these requirements?",
    options: [
    "SW1",
    "SW2",
    "SW3",
    "SW4"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0630",
    question: "Refer to the exhibit. What is the effect of this configuration?",
    options: [
    "The switch discards all ingress ARP traffic with invalid MAC-to-IP address bindings.",
    "All ARP packets are dropped by the switch.",
    "Egress traffic is passed only if the destination is a DHCP server.",
    "All ingress and egress traffic is dropped because the interface is untrusted."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0631",
    question: "When a site-to-site VPN is used, which protocol is responsible for the transport of user data?",
    options: [
    "IPsec",
    "IKEv1",
    "MD5",
    "IKEv2"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0632",
    question: "Which type of wireless encryption is used for WPA2 in preshared key mode?",
    options: [
    "AES-128",
    "TKIP with RC4",
    "AES-256",
    "RC4"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0633",
    question: "What is the difference between an IPv6 link-local address and a unique local address?",
    options: [
    "The scope of an IPv6 link-local address is limited to a directly attached interface, but an IPv6 unique local address is used throughout a company site or network.",
    "The scope of an IPv6 link-local address is global, but the scope of an IPv6 unique local address is limited to a loopback address.",
    "The scope of an IPv6 link-local address can be used throughout a company site or network, but an IPv6 unique local address is limited to a loopback address.",
    "The scope of an IPv6 link-local address is limited to a loopback address, and an IPv6 unique local address is limited to a directly attached interface."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0634",
    question: "Which command prevents passwords from being stored in the configuration as plain text on a router or switch?",
    options: [
    "enable secret",
    "enable password",
    "service password-encryption",
    "username cisco password encrypt"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0636",
    question: "In which two ways does a password manager reduce the chance of a hacker stealing a user's password? (Choose two.)",
    options: [
    "It encourages users to create stronger passwords",
    "It uses an internal firewall to protect the password repository from unauthorized access",
    "It stores the password repository on the local workstation with built-in antivirus and anti- malware functionality",
    "It automatically provides a second authentication factor that is unknown to the original user",
    "It protects against keystroke logging on a compromised device or web site"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0637",
    question: "Which goal is achieved by the implementation of private IPv4 addressing on a network?",
    options: [
    "provides an added level of protection against Internet exposure",
    "provides a reduction in size of the forwarding table on network routers",
    "allows communication across the Internet to other private networks",
    "allows servers and workstations to communicate across public network boundaries"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0638",
    question: "Which type of attack is mitigated by dynamic ARP inspection?",
    options: [
    "DDoS",
    "malware",
    "man-in-the-middle",
    "worm"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0639",
    question: "What is a function of a remote access VPN?",
    options: [
    "establishes a secure tunnel between two branch sites",
    "uses cryptographic tunneling to protect the privacy of data for multiple users simultaneously",
    "used exclusively when a user is connected to a company's internal network",
    "allows the users to access company internal network resources through a secure tunnel"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0640",
    question: "What are two recommendations for protecting network ports from being exploited when located in an office space outside of an IT closet? (Choose two.)",
    options: [
    "enable the PortFast feature on ports",
    "configure static ARP entries",
    "configure ports to a fixed speed",
    "implement port-based authentication",
    "shut down unused ports"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0641",
    question: "Refer to the exhibit. A network administrator must permit SSH access to remotely manage routers in a network. The operations team resides on the 10.20.1.0/25 network. Which command will accomplish this task?",
    options: [
    "access-list 2699 permit udp 10.20.1.0 0.0.0.255",
    "no access-list 2699 deny tcp any 10.20.1.0 0.0.0.127 eq 22",
    "access-list 2699 permit tcp any 10.20.1.0 0.0.0.255 eq 22",
    "no access-list 2699 deny ip any 10.20.1.0 0.0.0.255"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0642",
    question: "A port security violation has occurred on a switch port due to the maximum MAC address count being exceeded. Which command must be configured to increment the security-violation count and forward an SNMP trap?",
    options: [
    "switchport port-security violation access",
    "switchport port-security violation protect",
    "switchport port-security violation restrict",
    "switchport port-security violation shutdown"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0643",
    question: "What is a practice that protects a network from VLAN hopping attacks?",
    options: [
    "Enable dynamic ARP inspection",
    "Configure an ACL to prevent traffic from changing VLANs",
    "Change native VLAN to an unused VLAN ID",
    "Implement port security on internet-facing VLANs"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0644",
    question: "Where does a switch maintain DHCP snooping information?",
    options: [
    "In the CAM table",
    "In the frame forwarding database",
    "In the MAC address table",
    "In the binding database"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0645",
    question: "A network administrator must configure SSH for remote access to router R1. The requirement is to use a public and private key pair to encrypt management traffic to and from the connecting client. Which configuration, when applied, meets the requirements?",
    options: [
    "R1#enable R1#configure terminal R1(config)#ip domain-name cisco.com R1(config)#crypto key generate ec keysize 1024",
    "R1#enable R1#configure terminal R1(config)#ip domain-name cisco.com R1(config)#crypto key generate ec keysize 2048",
    "R1#enable R1#configure terminal R1(config)#ip domain-name cisco.com R1(config)#crypto key encrypt rsa name myKey",
    "R1#enable R1#configure terminal R1(config)#ip domain-name cisco.com R1(config)#crypto key generate rsa modulus 1024"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0646",
    question: "When a WLAN with WPA2 PSK is configured in the Wireless LAN Controller GUI, which format is supported?",
    options: [
    "decimal",
    "ASCII",
    "unicode",
    "base64"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0647",
    question: "Refer to the exhibit. A network administrator has been tasked with securing VTY access to a router. Which access-list entry accomplishes this task?",
    options: [
    "access-list 101 permit tcp 10.1.1.0 0.0.0.255 172.16.1.0 0.0.0.255 eq telnet",
    "access-list 101 permit tcp 10.1.1.0 0.0.0.255 172.16.1.0 0.0.0.255 eq scp",
    "access-list 101 permit tcp 10.1.1.0 0.0.0.255 172.16.1.0 0.0.0.255 eq https",
    "access-list 101 permit tcp 10.1.1.0 0.0.0.255 172.16.1.0 0.0.0.255 eq ssh"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0648",
    question: "Which two protocols must be disabled to increase security for management connections to a Wireless LAN Controller? (Choose two.)",
    options: [
    "HTTPS",
    "SSH",
    "HTTP",
    "Telnet",
    "TFTP"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0649",
    question: "Which security program element involves installing badge readers on data-center doors to allow workers to enter and exit based on their job roles?",
    options: [
    "physical access control",
    "biometrics",
    "role-based access control",
    "multifactor authentication"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0650",
    question: "Which function is performed by DHCP snooping?",
    options: [
    "listens to multicast traffic for packet forwarding",
    "rate-limits certain traffic",
    "propagates VLAN information between switches",
    "provides DDoS mitigation"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0652",
    question: "Which protocol is used for secure remote CLI access?",
    options: [
    "Telnet",
    "HTTP",
    "HTTPS",
    "SSH"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0653",
    question: "In a Cisco Software Defined Networking (SDN) architecture, what is used to describe the API communication between the SDN controller and the network elements (routers and switches) that it manages?",
    options: [
    "Southbound API",
    "Northbound API",
    "Westbound API",
    "Eastbound API."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0654",
    question: "What does physical access control regulate?",
    options: [
    "access to networking equipment and facilities",
    "access to servers to prevent malicious activity",
    "access to specific networks based on business function",
    "access to computer networks and file systems"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0655",
    question: "A network engineer is asked to configure VLANS 2, 3, and 4 for a new implementation. Some ports must be assigned to the new VLANS with unused ports remaining. Which action should be taken for the unused ports?",
    options: [
    "configure in a nondefault native VLAN",
    "configure ports in the native VLAN",
    "configure ports in a black hole VLAN",
    "configure ports as access ports"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0656",
    question: "When a WPA2-PSK WLAN is configured in the Wireless LAN Controller, what is the minimum number of characters that is required in ASCII format?",
    options: [
    "6",
    "8",
    "12",
    "18"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0657",
    question: "What mechanism carries multicast traffic between remote sites and supports encryption?",
    options: [
    "ISATAP",
    "IPsec over ISATAP",
    "GRE",
    "GRE over IPsec"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0658",
    question: "Refer to the exhibit. An access-list is required to permit traffic from any host on interface Gi0/0 and deny traffic from interface Gi0/1. Which access list must be applied?",
    options: [
    "ip access-list standard 99 permit 10.100.100.0 0.0.0.255 deny 192.168.0.0 0.0.255.255 ip ssh pubkey-chain",
    "ip access-list standard 99 permit 10.100.100.0 0.0.0.255 deny 192.168.0.0 0.255.255.255 username cisco password 0 cisco",
    "ip access-list standard 199 permit 10.100.100.0 0.0.0.255 deny 192.168.0.0 0.255.255.255 crypto key generate rsa",
    "ip access-list standard 199 permit 10.100.100.0 0.0.0.255 deny 192.168.0.0 0.0.255.255 Q0659 Nachfragen Refer to the exhibit. Which two commands must be configured on router R1 to enable the router to accept secure remote-access connections? (Choose two.) transport input telnet",
    "login console"
    ],
    correct: [0, 1, 2],
    exhibit: true,
  },
  {
    id: "q0660",
    question: "Which service is missing when RADIUS is selected to provide management access to the WLC?",
    options: [
    "authorization",
    "authentication",
    "accounting",
    "confidentiality"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0661",
    question: "Which action implements physical access control as part of the security program of an organization?",
    options: [
    "setting up IP cameras to monitor key infrastructure",
    "configuring a password for the console port",
    "backing up syslogs at a remote location",
    "configuring enable passwords on network devices"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0662",
    question: "Which field within the access-request packet is encrypted by RADIUS?",
    options: [
    "authorized services",
    "password",
    "authenticator",
    "username"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0663",
    question: "A Cisco engineer is configuring a factory-default router with these three passwords: ✑ The user EXEC password for console access is p4ssw0rd1. ✑ The user EXEC password for Telnet access is s3cr3t2. ✑ The password for privileged EXEC mode is priv4t3p4ss. Which command sequence must the engineer configure?",
    options: [
    "enable secret priv4t3p4ss ! line con 0 password p4ssw0rd1 ! line vty 0 15 password s3cr3t2",
    "enable secret priv4t3p4ss ! line con 0 password p4ssw0rd1 login ! line vty 0 15 password s3cr3t2 login",
    "enable secret priv4t3p4ss ! line con 0 password login p4ssw0rd1 ! line vty 0 15 password login s3cr3t2 login",
    "enable secret privilege 15 priv4t3p4ss ! line con 0 password p4ssw0rd1 login ! line vty 0 15 password s3cr3t2 login"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0664",
    question: "Refer to the exhibit. An access list is created to deny Telnet access from host PC-1 to RTR-1 and allow access from all other hosts. A Telnet attempt from PC-2 gives this message: \"% Connection refused by remote host.\" Without allowing Telnet access from PC-1, which action must be taken to permit the traffic?",
    options: [
    "Add the access-list 10 permit any command to the configuration. sends the frame back to the source to verify availably",
    "Remove the access-class 10 in command from line vty 0 4 rewrites the source and destination MAC address",
    "Add the ip access-group 10 out command to interface g0/0. drops received MAC addresses not listed in the address table",
    "Remove the password command from line vty 0 4. Q0664 (2) How does MAC learning function? adds unknown source MAC addresses to the CAM table"
    ],
    correct: [0, 3],
    exhibit: true,
  },
  {
    id: "q0666",
    question: "What is a function of Opportunistic Wireless Encryption in an environment?",
    options: [
    "provide authentication",
    "protect traffic on open networks",
    "offer compression",
    "increase security by using a WEP connection"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0668",
    question: "Refer to the exhibit. Clients on the WLAN are required to use 802.11r. What action must be taken to meet the requirement?",
    options: [
    "Under Protected Management Frames, set the PMF option to Required.",
    "Enable CCKM under Authentication Key Management.",
    "Set the Fast Transition option and the WPA gtk-randomize State to disable.",
    "Set the Fast Transition option to Enable and enable FT 802.1X under Authentication Key Management."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0669",
    question: "Refer to the exhibit. What must be configured to enable 802.11w on the WLAN?",
    options: [
    "Set Fast Transition to Enabled.",
    "Enable WPA Policy.",
    "Set PMF to Required.",
    "Enable MAC Filtering."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0670",
    question: "Which encryption method is used by WPA3?",
    options: [
    "TKIP",
    "AES",
    "SAE",
    "PSK"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0671",
    question: "Which type of traffic is sent with pure IPsec?",
    options: [
    "multicast traffic from a server at one site to hosts at another location",
    "broadcast packets from a switch that is attempting to locate a MAC address at one of several remote sites",
    "unicast messages from a host at a remote site to a server at headquarters",
    "spanning-tree updates between switches that are at two different sites"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0672",
    question: "How does authentication differ from authorization?",
    options: [
    "Authentication is used to record what resource a user accesses, and authorization is used to determine what resources a user can access.",
    "Authentication verifies the identity of a person accessing a network, and authorization determines what resource a user can access.",
    "Authentication is used to determine what resources a user is allowed to access, and authorization is used to track what equipment is allowed access to the network.",
    "Authentication is used to verify a person's identity, and authorization is used to create syslog messages for logins."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0673",
    question: "An engineer has configured the domain name, user name, and password on the local router. What is the next step to complete the configuration for a Secure Shell access RSA key?",
    options: [
    "crypto key import rsa pem",
    "crypto key generate rsa",
    "crypto key zeroize rsa",
    "crypto key pubkey-chain rsa"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0674",
    question: "Which type if network attack overwhelms the target server by sending multiple packets to a port until the half-open TCP resources of the target are exhausted?",
    options: [
    "SYN flood",
    "reflection",
    "teardrop",
    "amplification"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0675",
    question: "Which two components comprise part of a PKI? (Choose two.)",
    options: [
    "preshared key that authenticates connections",
    "one or more CRLs",
    "RSA token",
    "CA that grants certificates",
    "clear-text password that authenticates connections"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0677",
    question: "After a recent security breach and a RADIUS failure, an engineer must secure the console port of each enterprise router with a local username and password. Which configuration must the engineer apply to accomplish this task?",
    options: [
    "aaa new-model line con 0 password plaintextpassword privilege level 15",
    "aaa new-model aaa authorization exec default local aaa authentication login default radius username localuser privilege 15 secret plaintextpassword",
    "username localuser secret plaintextpassword line con 0 no login local privilege level 15",
    "username localuser secret plaintextpassword line con 0 login authentication default privilege level 15"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0678",
    question: "Which wireless security protocol relies on Perfect Forward Secrecy?",
    options: [
    "WEP",
    "WPA2",
    "WPA",
    "WPA3"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0679",
    question: "What is a zero-day exploit?",
    options: [
    "It is when the network is saturated with malicious traffic that overloads resources and bandwidth.",
    "It is when an attacker inserts malicious code into a SQL server.",
    "It is when a new network vulnerability is discovered before a fix is available.",
    "It is when the perpetrator inserts itself in a conversation between two parties and captures or alters data."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0680",
    question: "A network engineer is replacing the switches that belong to a managed-services client with new Cisco Catalyst switches. The new switches will be configured for updated security standards including replacing. Telnet services with encrypted connections and doubling the modulus size from 1024. Which two commands must the engineer configure on the new switches? (Choose two.)",
    options: [
    "transport input ssh",
    "transport input all",
    "crypto key generate rsa modulus 2048",
    "crypto key generate rsa general-keys modulus 1024",
    "crypto key generate rsa usage-keys"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0681",
    question: "What are two examples of multifactor authentication? (Choose two.)",
    options: [
    "single sign-on",
    "soft tokens",
    "passwords that expire",
    "shared password repository",
    "unique user knowledge"
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q0682",
    question: "Which characteristic differentiates the concept of authentication from authorization and accounting?",
    options: [
    "consumption-based billing",
    "identity verification",
    "user-activity logging",
    "service limitations"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0683",
    question: "What is a function of Cisco Advanced Malware Protection for a Next-Generation IPS?",
    options: [
    "inspecting specific files and file types for malware",
    "authorizing potentially compromised wireless traffic",
    "authenticating end users",
    "URL filtering"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0684",
    question: "What is a feature of WPA?",
    options: [
    "TKIP/MIC encryption",
    "small Wi-Fi application",
    "preshared key",
    "802.1x authentication"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0685",
    question: "Which two practices are recommended for an acceptable security posture in a network? (Choose two.)",
    options: [
    "Use a cryptographic keychain to authenticate to network devices.",
    "Place internal email and file servers in a designated DMZ.",
    "Back up device configurations to encrypted USB drives for secure retrieval.",
    "Disable unused or unnecessary ports, interfaces, and services.",
    "Maintain network equipment in a secure location."
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0686",
    question: "How does WPA3 improve security?",
    options: [
    "It uses SAE for authentication.",
    "It uses RC4 for encryption.",
    "It uses TKIP for encryption.",
    "It uses a 4-way handshake for authentication."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0687",
    question: "What is a function of a Next-Generation IPS?",
    options: [
    "correlates user activity with network events",
    "serves as a controller within a controller-based network",
    "integrates with a RADIUS server to enforce Layer 2 device authentication rules",
    "makes forwarding decisions based on learned MAC addresses"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0690",
    question: "Which IPsec transport mode encrypts the IP header and the payload?",
    options: [
    "pipe",
    "transport",
    "control",
    "tunnel"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0691",
    question: "What is the default port-security behavior on a trunk link?",
    options: [
    "It places the port in the err-disabled state if it learns more than one MAC address.",
    "It causes a network loop when a violation occurs.",
    "It disables the native VLAN configuration as soon as port security is enabled.",
    "It places the port in the err-disabled state after 10 MAC addresses are statically configured."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0692",
    question: "Which device separates networks by security domains?",
    options: [
    "intrusion protection system",
    "firewall",
    "wireless controller",
    "access point"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0693",
    question: "How are VLAN hopping attacks mitigated?",
    options: [
    "manually implement trunk ports and disable DTP",
    "configure extended VLANs",
    "activate all ports and place in the default VLAN",
    "enable dynamic ARP inspection"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0694",
    question: "Which enhancements were implemented as part of WPA3?",
    options: [
    "Forward secrecy and SAE in personal mode for secure initial key exchange",
    "802.1x authentication and AES-128 encryption",
    "AES-64 in personal mode and AES-128 in enterprise mode",
    "TKIP encryption improving WEP and per-packet keying"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0695",
    question: "When a site-to-site VPN is configured which IPsec mode provides encapsulation and encryption of the entire original IP packet?",
    options: [
    "IPsec transport mode with AH",
    "IPsec tunnel mode with AH",
    "IPsec transport mode with ESP",
    "IPsec tunnel mode with ESP"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0696",
    question: "An engineer is configuring remote access to a router from IP subnet 10.139.58.0/28. The domain name, crypto keys, and SSH have been configured. Which configuration enables the traffic on the destination router?",
    options: [
    "line vty 0 15 access-class 120 in ! ip access-list extended 120 permit tcp 10.139.58.0 0.0.0.15 any eq 22",
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.252 ip access-group 10 in ! ip access-list standard 10 permit udp 10.139.58.0 0.0.0.7 host 10.122.49.1 eq 22",
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.252 ip access-group 110 in ! ip access-list standard 110 permit tcp 10.139.58.0 0.0.0.15 eq 22 host 10.122.49.1",
    "line vty 0 15 access-group 120 in ! ip access-list extended 120 permit tcp 10.139.58.0 0.0.0.15 any eq 22"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0697",
    question: "In an SDN architecture, which function of a network node is centralized on a controller?",
    options: [
    "Creates the IP routing table",
    "Discards a message due filtering",
    "Makes a routing decision",
    "Provides protocol access for remote access devices"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0698",
    question: "How do cloud deployments compare to on-premises deployments?",
    options: [
    "Cloud deployments provide a better user experience across world regions, whereas on- premises deployments depend upon region-specific conditions.",
    "Cloud deployments mandate a secure architecture, whereas on-premises deployments are inherently unsecure.",
    "Cloud deployments must include automation infrastructure, whereas on-premises deployments often lack the ability for automation.",
    "Cloud deployments are inherently unsecure, whereas a secure architecture is mandatory for on-premises deployments."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0699",
    question: "Refer to the exhibit. What are the two steps an engineer must take to provide the highest encryption and authentication using domain credentials from LDAP? (Choose two.)",
    options: [
    "Select PSK under Authentication Key Management.",
    "Select Static-WEP + 802.1X on Layer 2 Security.",
    "Select WPA+WPA2 on Layer 2 Security.",
    "Select 802.1X from under Authentication Key Management.",
    "Select WPA Policy with TKIP Encryption."
    ],
    correct: [2, 3],
    exhibit: true,
  },
  {
    id: "q0702",
    question: "SW1 supports connectivity for a lobby conference room and must be secured. The engineer must limit the connectivity from PC1 to the SW1 and SW2 network. The MAC addresses allowed must be limited to two. Which configuration secures the conference room connectivity?",
    options: [
    "interface gi1/0/15 switchport port-security switchport port-security maximum 2",
    "interface gi1/0/15 switchport port-security switchport port-security mac-address 0000.abcd.0004vlan 100",
    "interface gi1/0/15 switchport port-security mac-address 0000.abcd.0004 vlan 100",
    "interface gi1/0/15 switchport port-security mac-address 0000.abcd.0004 vlan 100 interface switchport secure-mac limit 2"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0703",
    question: "Refer to the exhibit. An engineer is updating the management access configuration of switch SW1 to allow secured, encrypted remote configuration. Which two commands or command sequences must the engineer apply to the switch? (Choose two.)",
    options: [
    "SW1(config)#enable secret ccnaTest123",
    "SW1(config)#username NEW secret R3mote123",
    "SW1(config)#line vty 0 15 SW1(config-line)#transport input ssh",
    "SW1(config)# crypto key generate rsa",
    "SW1(config)# interface f0/1 SW1(confif-if)# switchport mode trunk"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0704",
    question: "Which port security violation mode allows from valid MAC addresses to pass but blocks traffic from invalid MAC addresses?",
    options: [
    "restrict",
    "shutdown",
    "protect",
    "shutdown VLAN"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0705",
    question: "A customer wants to provide wireless access to contractors using a guest portal on Cisco ISE. The portal is also used by employees. A solution is implemented, but contractors receive a certificate error when they attempt to access the portal. Employees can access the portal without any errors. Which change must be implemented to allow the contractors and employees to access the portal?",
    options: [
    "Install an Internal CA signed certificate on the Cisco ISE.",
    "Install a trusted third-party certificate on the Cisco ISE.",
    "Install an internal CA signed certificate on the contractor devices.",
    "Install a trusted third-party certificate on the contractor devices."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0706",
    question: "Which two wireless security standards use counter mode cipher block chaining Message Authentication Code Protocol for encryption and data integrity? (Choose two.)",
    options: [
    "Wi-Fi 6",
    "WPA3",
    "WEP",
    "WPA2",
    "WPA"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0707",
    question: "A network engineer is implementing a corporate SSID for WPA3-Personal security with a PSK. Which encryption cipher must be configured?",
    options: [
    "CCMP128",
    "GCMP256",
    "CCMP256",
    "GCMP128"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0708",
    question: "What is a practice that protects a network from VLAN hopping attacks?",
    options: [
    "Implement port security on internet-facing VLANs",
    "Enable dynamic ARP inspection",
    "Assign all access ports to VLANs other than the native VLAN",
    "Configure an ACL to prevent traffic from changing VLANs"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0709",
    question: "An administrator must use the password complexity not manufacturer-name command to prevent users from adding `Cisco` as a password. Which command must be issued before this command?",
    options: [
    "login authentication my-auth-list",
    "service password-encryption",
    "password complexity enable",
    "confreg 0x2142"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0710",
    question: "An organization has decided to start using cloud-provided services. Which cloud service allows the organization to install its own operating system on a virtual machine?",
    options: [
    "platform-as-a-service",
    "network-as-a-service",
    "software-as-a-service",
    "infrastructure-as-a-service"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0711",
    question: "How do traditional campus device management and Cisco DNA Center device management differ in regards to deployment?",
    options: [
    "Traditional campus device management allows a network to scale more quickly than with Cisco DNA Center device management.",
    "Cisco DNA Center device management can deploy a network more quickly than traditional campus device management.",
    "Cisco DNA Center device management can be implemented at a lower cost than most traditional campus device management options.",
    "Traditional campus device management schemes can typically deploy patches and updates more quickly than Cisco DNA Center device management."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0712",
    question: "Which purpose does a northbound API serve in a controller-based networking architecture?",
    options: [
    "facilitates communication between the controller and the applications",
    "reports device errors to a controller",
    "generates statistics for network hardware and traffic",
    "communicates between the controller and the physical network hardware"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0713",
    question: "What benefit does controller-based networking provide versus traditional networking?",
    options: [
    "allows configuration and monitoring of the network from one centralized point",
    "provides an added layer of security to protect from DDoS attacks",
    "combines control and data plane functionality on a single device to minimize latency",
    "moves from a two-tier to a three-tier network architecture to provide maximum redundancy"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0714",
    question: "What is an advantage of Cisco DNA Center versus traditional campus device management?",
    options: [
    "It is designed primarily to provide network assurance.",
    "It supports numerous extensibility options, including cross-domain adapters and third-party SDKs.",
    "It supports high availability for management functions when operating in cluster mode.",
    "It enables easy autodiscovery of network elements in a brownfield deployment."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0716",
    question: "What are two fundamentals of virtualization? (Choose two.)",
    options: [
    "It allows logical network devices to move traffic between virtual machines and the rest of the physical network.",
    "It allows multiple operating systems and applications to run independently on one physical server.",
    "It allows a physical router to directly connect NICs from each virtual machine into the network.",
    "It requires that some servers, virtual machines, and network gear reside on the Internet.",
    "The environment must be configured with one hypervisor that serves solely as a network manager to monitor SNMP traffic."
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0717",
    question: "How does Cisco DNA Center gather data from the network?",
    options: [
    "Devices use the call-home protocol to periodically send data to the controller",
    "Devices establish an IPsec tunnel to exchange data with the controller",
    "The Cisco CLI Analyzer tool gathers data from each licensed network device and streams it to the controller",
    "Network devices use different services like SNMP, syslog, and streaming telemetry to send data to the controller"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0718",
    question: "Which statement compares traditional networks and controller-based networks?",
    options: [
    "Only controller-based networks decouple the control plane and the data plane.",
    "Traditional and controller-based networks abstract policies from device configurations.",
    "Only traditional networks natively support centralized management.",
    "Only traditional networks offer a centralized control plane."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0719",
    question: "What are two benefits of network automation? (Choose two.)",
    options: [
    "reduced hardware footprint",
    "reduced operational costs",
    "faster changes with more reliable results",
    "fewer network failures",
    "increased network security"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0720",
    question: "Which two encoding methods are supported by REST APIs? (Choose two.)",
    options: [
    "SGML",
    "YAML",
    "XML",
    "JSON",
    "EBCDIC"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0721",
    question: "What are two characteristics of a controller-based network? (Choose two.)",
    options: [
    "It uses Telnet to report system issues.",
    "The administrator can make configuration updates from the CLI.",
    "It uses northbound and southbound APIs to communicate between architectural layers.",
    "It decentralizes the control plane, which allows each device to make its own forwarding decisions.",
    "It moves the control plane to a central point."
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0724",
    question: "Which two capabilities of Cisco DNA Center make it more extensible as compared to traditional campus device management? (Choose two.)",
    options: [
    "REST APIs that allow for external applications to interact natively",
    "adapters that support all families of Cisco IOS software",
    "SDKs that support interaction with third-party network equipment",
    "modular design that is upgradable as needed",
    "customized versions for small, medium, and large enterprises"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0726",
    question: "What software-defined architecture plane assists network devices with making packet-forwarding decisions by providing Layer 2 reachability and Layer 3 routing information?",
    options: [
    "management plane",
    "control plane",
    "data plane",
    "policy plane"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0727",
    question: "What are two benefits of controller-based networking compared to traditional networking? (Choose two.)",
    options: [
    "controller-based increases network bandwidth usage, while traditional lightens the load on the network",
    "controller-based reduces network configuration complexity, while traditional increases the potential for errors",
    "controller-based allows for fewer network failures, while traditional increases failure rates",
    "controller-based provides centralization of key IT functions, while traditional requires distributed management functions",
    "controller-based inflates software costs, while traditional decreases individual licensing costs"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0728",
    question: "Which type of API allows SDN controllers to dynamically make changes to the network?",
    options: [
    "northbound API",
    "REST API",
    "SOAP API",
    "southbound API"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0730",
    question: "Which option about JSON is true -",
    options: [
    "uses predefined tags or angle brackets () to delimit markup text",
    "used to describe structured data that includes arrays",
    "used for storing information",
    "similar to HTML, it is more verbose than XML"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0731",
    question: "Which option best describes an API?",
    options: [
    "a contract that describes how various components communicate and exchange data with each other",
    "an architectural style (versus a protocol) for designing applications",
    "a stateless client-server model",
    "request a certain type of data by specifying the URL path that models the data"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0734",
    question: "Which role does a hypervisor provide for each virtual machine in server virtualization?",
    options: [
    "infrastructure-as-a-service",
    "Software-as-a-service",
    "control and distribution of physical resources",
    "services as a hardware controller"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0735",
    question: "What is the function of a server?",
    options: [
    "It transmits packets between hosts in the same broadcast domain.",
    "It provides shared applications to end users.",
    "It routes traffic between Layer 3 devices.",
    "It ◌ׁ reates security zones between trusted and untrusted networks."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0736",
    question: "Which CRUD operation modifies an existing table or view?",
    options: [
    "read",
    "update",
    "replace",
    "create"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0737",
    question: "In software-defined architectures, which plane is distributed and responsible for traffic forwarding?",
    options: [
    "management plane",
    "policy plane",
    "data plane",
    "control plane"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0738",
    question: "Refer to the exhibit. Which type of configuration is represented in the output?",
    options: [
    "Ansible",
    "JSON",
    "Chef",
    "Puppet"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0739",
    question: "Which configuration management mechanism uses TCP port 22 by default when communicating with managed nodes?",
    options: [
    "Ansible",
    "Python",
    "Puppet",
    "Chef"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0740",
    question: "What does an SDN controller use as a communication protocol to relay forwarding changes to a southbound API?",
    options: [
    "Java",
    "REST",
    "OpenFlow",
    "XML"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0741",
    question: "What uses HTTP messages to transfer data to applications residing on different hosts?",
    options: [
    "OpenStack",
    "OpFlex",
    "REST",
    "OpenFlow"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0742",
    question: "Which JSON data type is an unordered set of attribute-value pairs?",
    options: [
    "string",
    "array",
    "Boolean",
    "object"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0743",
    question: "Which protocol is used in Software Defined Access (SDA) to provide a tunnel between two edge nodes in different fabrics?",
    options: [
    "Generic Router Encapsulation (GRE)",
    "Virtual Local Area Network (VLAN)",
    "Virtual Extensible LAN (VXLAN)",
    "Point-to-Point Protocol (PPP)"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0744",
    question: "Which plane is centralized by an SDN controller?",
    options: [
    "management-plane",
    "data-plane",
    "services-plane",
    "control-plane"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0745",
    question: "Where is the interface between the control plane and data plane within the software-defined architecture?",
    options: [
    "application layer and the management layer",
    "application layer and the infrastructure layer",
    "control layer and the application layer",
    "control layer and the infrastructure layer"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0746",
    question: "Why would a network administrator choose to implement automation in a network environment?",
    options: [
    "To simplify the process of maintaining a consistent configuration state across all devices",
    "To centralize device information storage",
    "To implement centralized user account management",
    "To deploy the management plane separately from the rest of the network"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0747",
    question: "Which two events occur automatically when a device is added to Cisco DNA Center? (Choose two.)",
    options: [
    "The device is placed into the Managed state.",
    "The device is placed into the Unmanaged state.",
    "The device is assigned to the Local site.",
    "The device is assigned to the Global site.",
    "The device is placed into the Provisioned state."
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0748",
    question: "Which two components are needed to create an Ansible script that configures a VLAN on a switch? (Choose two.)",
    options: [
    "playbook",
    "recipe",
    "model",
    "cookbook",
    "task"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0749",
    question: "In software-defined architecture, which plane handles switching for traffic through a Cisco router?",
    options: [
    "control",
    "data",
    "management",
    "application"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0750",
    question: "What are two southbound APIs? (Choose two.)",
    options: [
    "Thrift",
    "DSC",
    "CORBA",
    "NETCONF",
    "OpenFlow"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0751",
    question: "What makes Cisco DNA Center different from traditional network management applications and their management of networks?",
    options: [
    "Its modular design allows the implementation of different versions to meet the specific needs of an organization.",
    "It only supports auto-discovery of network elements in a greenfield deployment.",
    "It omits support high availability of management functions when operating in cluster mode.",
    "It abstracts policy from the actual device configuration."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0752",
    question: "Which API is used in controller-based architectures to interact with edge devices?",
    options: [
    "southbound",
    "overlay",
    "northbound",
    "underlay"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0754",
    question: "Refer to the exhibit. What is represented beginning with line 1 and ending with line 5?",
    options: [
    "object",
    "value",
    "key",
    "array"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0755",
    question: "Which CRUD operation corresponds to the HTTP GET method?",
    options: [
    "create",
    "read",
    "delete",
    "update"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0756",
    question: "What differentiates device management enabled by Cisco DNA Center from traditional campus device management?",
    options: [
    "CLI-oriented device",
    "centralized",
    "device-by-device hands-on",
    "per-device"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0758",
    question: "Which two REST API status-code classes represent errors? (Choose two.)",
    options: [
    "1XX",
    "2XX",
    "3XX",
    "4XX",
    "5XX"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0759",
    question: "How do servers connect to the network in a virtual environment?",
    options: [
    "a cable connected to a physical switch on the network",
    "wireless to an access point that is physically connected to the network",
    "a virtual switch that links to an access point that is physically connected to the network",
    "a software switch on a hypervisor that is physically connected to the network"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0760",
    question: "What is the function of the controller in a software-defined network?",
    options: [
    "forwarding packets",
    "multicast replication at the hardware level",
    "making routing decisions",
    "fragmenting and reassembling packets"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0762",
    question: "What is a function of a southbound API?",
    options: [
    "Use orchestration to provision a virtual server configuration from a web server",
    "Automate configuration changes between a server and a switching fabric",
    "Manage flow control between an SDN controller and a switching fabric",
    "Facilitate the information exchange between an SDN controller and application"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0763",
    question: "Which script paradigm does Puppet use?",
    options: [
    "recipes and cookbooks",
    "playbooks and roles",
    "strings and marionettes",
    "manifests and modules"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0764",
    question: "Which set of methods is supported with the REST API?",
    options: [
    "GET, PUT, ERASE, CHANGE",
    "GET, POST, MOD, ERASE",
    "GET, PUT, POST, DELETE",
    "GET, POST, ERASE, CHANGE"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0765",
    question: "Which technology is appropriate for communication between an SDN controller end applications running over the network?",
    options: [
    "Southbound API",
    "REST API",
    "NETCONF",
    "OpenFlow"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0767",
    question: "What is the function of `off-the-shelf` switches in a controller-based network?",
    options: [
    "setting packet-handling policies",
    "forwarding packets",
    "providing a central view of the deployed network",
    "making routing decisions"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0768",
    question: "Which REST method updates an object in the Cisco DNA Center Intent API?",
    options: [
    "CHANGE",
    "UPDATE",
    "POST",
    "PUT"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0769",
    question: "Refer to the exhibit. How many JSON objects are represented?",
    options: [
    "1 an encrypted JSON token that is used for authentication",
    "2 an encrypted JSON token that is used for authorization",
    "3 an encoded JSON token that is used to securely exchange information",
    "4 Q0770 Nachfragen Which definition describes JWT in regard to REST API security? an encoded JSON token that is used for authentication"
    ],
    correct: [0, 3],
    exhibit: true,
  },
  {
    id: "q0771",
    question: "Refer to the exhibit. What is identified by the word `switch` within line 2 of the JSON Schema?",
    options: [
    "array",
    "value",
    "object",
    "key"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0772",
    question: "Refer to the exhibit. Which type of JSON data is shown?",
    options: [
    "boolean",
    "array",
    "key",
    "object"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0774",
    question: "Which communication interaction takes place when a southbound API is used?",
    options: [
    "between the SDN controller and PCs on the network",
    "between the SDN controller and switches and routers on the network",
    "between the SDN controller and services and applications on the network",
    "between network applications and switches and routers on the network"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0775",
    question: "What are two characteristics of a public cloud implementation? (Choose two.)",
    options: [
    "It is owned and maintained by one party, but it is shared among multiple organizations",
    "It enables an organization to fully customize how it deploys network resources",
    "It provides services that are accessed over the Internet",
    "It is a data center on the public Internet that maintains cloud services for only one company",
    "It supports network resources from a centralized third-party provider and privately-owned virtual resources"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q0780",
    question: "Refer to the exhibit. How many objects keys, and JSON list values are present?",
    options: [
    "Three objects, two keys, and three JSON list values",
    "Three objects, three keys, and two JSON list values",
    "One object, three keys, and three JSON list values",
    "One object, three keys, and two JSON list values"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0781",
    question: "Which two primary drivers support the need for network automation? (Choose two.)",
    options: [
    "Increasing reliance on self-diagnostic and self-healing",
    "Eliminating training needs",
    "Policy-driven provisioning of resources",
    "Reducing hardware footprint",
    "Providing a single entry point for resource provisioning"
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0782",
    question: "What is an expected outcome when network management automation is deployed?",
    options: [
    "A distributed management plane must be used.",
    "Complexity increases when new device configurations are added.",
    "Custom applications are needed to configure network devices.",
    "Software upgrades are performed from a central controller."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0783",
    question: "Refer to the exhibit. What is represented by `R1` and `SW1` within the JSON output?",
    options: [
    "object",
    "value",
    "key",
    "array"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0785",
    question: "Which HTTP status code is returned after a successful REST API request?",
    options: [
    "200",
    "301",
    "404",
    "500"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0786",
    question: "With REST API, which standard HTTP header tells a server which media type is expected by the client?",
    options: [
    "Accept-Encoding: gzip. deflate One",
    "Accept-Patch: text/example; charset=utf-8 Four",
    "Content-Type: application/json; charset=utf-8 Seven",
    "Accept: application/json Q0787 Nachfragen Refer to the exhibit. How many objects are present in the given JSON-encoded data? Nine"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0788",
    question: "What is the purpose of the Cisco DNA Center controller?",
    options: [
    "to securely manage and deploy network devices",
    "to scan a network and generate a Layer 2 network diagram",
    "to secure physical access to a data center",
    "to provide Layer 3 services to autonomous access points"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0789",
    question: "What is the function of the controller in a software-defined network?",
    options: [
    "forwarding packets",
    "multicast replication at the hardware level",
    "setting packet-handling policies",
    "fragmenting and reassembling packets"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0790",
    question: "Refer to the exhibit. A network engineer must configure NETCONF. After creating the configuration, the engineer gets output from the command show line but not from show running-config. Which command completes the configuration?",
    options: [
    "Device(config)# netconf lock-time 500",
    "Device(config)# netconf max-message 1000",
    "Device(config)# no netconf ssh acl 1",
    "Device(config)# netconf max-sessions 100"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0791",
    question: "Which statement identifies the functionality of virtual machines?",
    options: [
    "Virtualized servers run most efficiently when they are physically connected to a switch that is separate from the hypervisor",
    "The hypervisor can virtualize physical components including CPU, memory, and storage",
    "Each hypervisor can support a single virtual machine and a single software switch",
    "The hypervisor communicates on Layer 3 without the need for additional resources"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0792",
    question: "Which network plane is centralized and manages routing decisions?",
    options: [
    "management plane",
    "data plane",
    "policy plane",
    "control plane"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0794",
    question: "Refer to the exhibit. A network engineer must provide configured IP addressing details to investigate a firewall rule issue. Which subnet and mask identify what is configured on the en0 interface?",
    options: [
    "10.8.0.0/16",
    "10.8.64.0/18",
    "10.8.128.0/19",
    "10.8.138.0/24"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0795",
    question: "What are two characteristics of a small office / home office connection environment? (Choose two.)",
    options: [
    "It requires 10Gb ports on all uplinks.",
    "It supports between 1 and 50 users.",
    "It supports between 50 and 100 users.",
    "A router port connects to a broadband connection.",
    "It requires a core, distribution, and access layer architecture."
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0796",
    question: "Which element of a virtualization solution manages virtualized services and enables connections between virtualized services and external interfaces?",
    options: [
    "software",
    "network functionality",
    "virtual machine",
    "hardware"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0798",
    question: "What is a function of Layer 3 switches?",
    options: [
    "They route traffic between devices in different VLANs.",
    "They transmit broadcast traffic when operating in Layer 3 mode exclusively.",
    "They move frames between endpoints limited to IP addresses.",
    "They forward Ethernet frames between VLANs using only MAC addresses,"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0800",
    question: "Which cable type must be used to interconnect one switch using 1000 BASE-SX GBIC modules and another switch using 1000 BASE-SX SFP modules?",
    options: [
    "LC to SC",
    "SC to SC",
    "LC to LC",
    "SC to ST"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0802",
    question: "What is a benefit of a point-to-point leased line?",
    options: [
    "low cost",
    "full-mesh capability",
    "simplicity of configuration",
    "flexibility of design"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0803",
    question: "Why is TCP desired over UDP for applications that require extensive error checking, such as HTTPS?",
    options: [
    "UDP uses sequencing data for packets to arrive in order, and TCP offers the capability to receive packets in random order.",
    "UDP uses flow control mechanisms for the delivery of packets, and TCP uses congestion control for efficient packet delivery.",
    "UDP reliably guarantees delivery of all packets, and TCP drops packets under heavy load.",
    "UDP operates without acknowledgments, and TCP sends an acknowledgment for every packet received."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0804",
    question: "Which component controls and distributes physical resources for each virtual machine?",
    options: [
    "hypervisor",
    "OS",
    "CPU",
    "physical enclosure"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0805",
    question: "What is the role of nonoverlapping channels in a wireless environment?",
    options: [
    "to increase bandwidth",
    "to stabilize the RF environment",
    "to allow for channel bonding",
    "to reduce interference"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0806",
    question: "What are two advantages of implementing a controller-based architecture instead of traditional network architecture? (Choose two.)",
    options: [
    "It allows for seamless connectivity to virtual machines.",
    "It increases security against denial-of-service attacks.",
    "It supports complex and high-scale IP addressing schemes.",
    "It enables configuration task automation.",
    "It provides increased scalability and management options."
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0807",
    question: "What is the purpose of the service-set identifier?",
    options: [
    "It identifies the wireless network to which an application must connect.",
    "It identifies the wired network to which a network device is connected.",
    "It identifies the wired network to which a user device is connected.",
    "It identifies a wireless network for a mobile device to connect."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0809",
    question: "How do UTP and STP cables compare?",
    options: [
    "UTP cables provide faster and more reliable data transfer rates and STP cables are slower and less reliable.",
    "STP cables are shielded and protect against electromagnetic interference and UTP lacks the same protection against electromagnetic interference.",
    "STP cables are cheaper to procure and easier to install and UTP cables are more expensive and harder to install.",
    "UTP cables are less prone to crosstalk and interference and STP cables are more prone to crosstalk and interference."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0810",
    question: "What are two disadvantages of a full-mesh topology? (Choose two.)",
    options: [
    "It requires complex configuration.",
    "It needs a high MTU between sites.",
    "It works only with BGP between sites.",
    "It has a high implementation cost.",
    "It must have point-to-point communication."
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0812",
    question: "Which technology allows for multiple operating systems to be run on a single host computer?",
    options: [
    "virtual routing and forwarding",
    "virtual device contexts",
    "network port ID virtualization",
    "server virtualization"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0813",
    question: "Why would an administrator choose to implement an automated network management solution?",
    options: [
    "to reduce operational costs",
    "to support simpler password policies",
    "to enable “box by box” configuration and deployment",
    "to limit recurrent management costs"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0814",
    question: "What is a function of the core and distribution layers in a collapsed-core architecture?",
    options: [
    "The router can support HSRP for Layer 2 redundancy in an IPv6 network.",
    "The core and distribution layers are deployed on two different devices to enable failover.",
    "The router operates on a single device or a redundant pair.",
    "The router must use IPv4 and IPv6 addresses at Layer 3."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0815",
    question: "What must be considered before deploying virtual machines?",
    options: [
    "resource limitations, such as the number of CPU cores and the amount of memory",
    "support for physical peripherals, such as monitors, keyboards, and mice",
    "whether to leverage VSM to map multiple virtual processors to two or more virtual machines",
    "location of the virtual machines within the data center environment"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0816",
    question: "What are two facts that differentiate optical-fiber cabling from copper cabling? (Choose two.)",
    options: [
    "It is less expensive when purchasing patch cables.",
    "It carries electrical current further distances for PoE devices.",
    "It provides greater throughput options.",
    "It has a greater sensitivity to changes in temperature and moisture.",
    "It carries signals for longer distances."
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0817",
    question: "What are two behaviors of a point-to-point WAN topology? (Choose two.)",
    options: [
    "It leverages a dedicated connection.",
    "It provides direct connections betwaen each router in the topology.",
    "It delivers redundancy between the central office and branch offices.",
    "It uses a single router to route traffic between sites.",
    "It connects remote networks through a single line."
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q0818",
    question: "What is a link-local all-nodes IPv6 multicast address?",
    options: [
    "ff02:0:0:0:0:0:0:1",
    "2004:33c:94d9:431e:255::",
    "fffe:034:0dd:45d6:789e::",
    "fe80:4433:034:0dd::2"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0819",
    question: "Which is a reason to implement IPv4 private addressing?",
    options: [
    "Comply with PCI regulations.",
    "Reduce the size of the forwarding table on network routers.",
    "Reduce the risk of a network security breach.",
    "Comply with local law."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0820",
    question: "Which signal frequency appears 60 times per minute?",
    options: [
    "1 Hz signal",
    "1 GHz signal",
    "60 Hz signal",
    "60 GHz signal"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0821",
    question: "What is a function of spine-and-leaf architecture?",
    options: [
    "offers predictable latency of the traffic path between end devices",
    "mitigates oversubscription by adding a layer of leaf switches",
    "exclusively sends multicast traffic between servers that are directly connected to the spine",
    "limits payload size of traffic within the leaf layer"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0822",
    question: "What is a function of an endpoint?",
    options: [
    "It passes unicast communication between hosts in a network.",
    "It transmits broadcast traffic between devices in the same VLAN.",
    "It provides security between trusted and untrusted sections of the network.",
    "It is used directly by an individual user to access network services."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0823",
    question: "What is a function of MAC address learning?",
    options: [
    "It is disabled by default on all interfaces connected to trunks.",
    "It increases security on the management VLAN.",
    "It is enabled by default on all VLANs and interfaces.",
    "It increases the potential for MAC address flooding."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0824",
    question: "Which IPv6 address range is suitable for anycast addresses for distributed services such as DHCP or DNS?",
    options: [
    "FF00:1/12",
    "2001:db8:0234:ca3e::1/128",
    "FE80::1/10",
    "2002:db84:3f30:ca84:be76:2/64"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0825",
    question: "What is a similarity between OM3 and OM4 fiber optic cable?",
    options: [
    "Both have a 62.5 micron core diameter.",
    "Both have a 100 micron core diameter.",
    "Both have a 50 micron core diameter.",
    "Both have a 9 micron core diameter. https://www.fs.com/de/blog/om3-vs-om4-multimode-fiber-which-one-to-choose-5861.html"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0827",
    question: "What is the primary purpose of private address space?",
    options: [
    "limit the number of nodes reachable via the Internet",
    "simplify the addressing in the network",
    "conserve globally unique address space",
    "reduce network complexity"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0828",
    question: "What is a characteristic of a collapsed-core network topology?",
    options: [
    "It enables all workstations in a SOHO environment to connect on a single switch with internet access.",
    "It enables the core and access layers to connect to one logical distribution device over an EtherChannel.",
    "It allows wireless devices to connect directly to the core layer, which enables faster data transmission.",
    "It allows the core and distribution layers to run as a single combined layer."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0829",
    question: "A technician receives a report of network slowness and the issue has been isolated to the interface FastEthemet0/13. What is the root cause of the issue? FastEthernet0/13 is up, line protocol is up Hardware is Fast Ethernet, address is 0001.4d27.66cd (bia 0001.4d27.66cd) MTU 1500 bytes, BW 100000 Kbit, DLY 100 usec, reliability 250/255, txload 1/255, rxload 1/255 Encapsulation ARPA, loopback not set Keepalive not set - Auto-duplex (Full) Auto Speed (100), 100BaseTX/FX ARP type: ARPA, ARP Timeout 04:00:00 Last input 18:52:43, output 00:00:01, output hang never Last clearing of “show interface” counters never Queueing strategy: fifo - Output queue 0/40, 0 drops; input queue 0/75, 0 drops 5 minute input rate 12000 bits/sec, 6 packets/sec 5 minute output rate 24000 bits/sec, 6 packets/sec 14488019 packets input, 2434163609 bytes Received 345348 broadcasts, 0 runts, 0 giants, 0 throttles 261028 input errors, 259429 CRC, 1599 frame, 0 overrun, 0 ignored 0 watchdog, 84207 multicast 0 input packets with dribble condition detected 19658279 packets output, 3529106068 bytes, 0 underruns 0 output errors, 0 collisions, 1 interface resets 0 babbles, 0 late collision, 0 deferred 0 lost carrier, 0 no carrier 0 output buffer failures, 0 output buffers swapped out",
    options: [
    "local buffer overload",
    "err-disabled port on the far end",
    "physical errors",
    "duplicate IP addressing"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0830",
    question: "What occurs when overlapping Wi-Fi channels are implemented?",
    options: [
    "Users experience poor wireless network performance.",
    "Wireless devices are unable to distinguish between different SSIDs.",
    "The wireless network becomes vulnerable to unauthorized access.",
    "Network communications are open to eavesdropping."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0831",
    question: "Refer to the exhibit. An administrator received a call from a branch office regarding poor application performance hosted at the headquarters. Ethernet 1 is connected between Router1 and the LAN switch. What identifies the issue?",
    options: [
    "The MTU is not set to the default value.",
    "There is a duplex mismatch.",
    "The QoS policy is dropping traffic.",
    "The link is over utilized."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0833",
    question: "What is the functionality of the Cisco DNA Center?",
    options: [
    "IP address pool distribution scheduler",
    "data center network policy controller",
    "console server that permits secure access to all network devices",
    "software-defined controller for automation of devices and services"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0834",
    question: "Refer to the exhibit. Which configuration enables an EtherChannel to form dynamically between SW1 and SW2 by using an industry-standard protocol, and to support full IP connectivity between all PCs?",
    options: [
    "SW1# interface Gi0/1 switchport switchport mode access channel-group 1 mode active ! interface Gi0/2 switchport switchport mode access channel-group 1 mode active SW2# interface Gi0/1 switchport switchport mode access channel-group 1 mode desirable ! interface Gi0/2 switchport switchport mode access channel-group 1 mode desirable",
    "SW1# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode on ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode auto SW2# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode auto ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode on interface port-channel 1 switchport switchport mode trunk",
    "SW1# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode active ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode active SW2# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode passive ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode passive",
    "SW1# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode auto ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode auto SW2# interface Gi0/1 switchport switchport mode trunk channel-group 1 mode desirable ! interface Gi0/2 switchport switchport mode trunk channel-group 1 mode desirable"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0835",
    question: "Which functionality is provided by the console connection on a Cisco WLC?",
    options: [
    "HTTP-based GUI connectivity",
    "secure in-band connectivity for device administration",
    "out-of-band management",
    "unencrypted in-band connectivity for file transfers"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0836",
    question: "Refer to the exhibit. Host A switch interface is configured in VLAN 2. Host D sends a unicast packet destined for the IP address of host A. What does the switch do when it receives the frame from host D?",
    options: [
    "It floods the frame out of every ports except the source port.",
    "It creates a broadcast storm.",
    "It shuts down the source port and places it in err-disable mode.",
    "It drops the frame from the MAC table of the switch."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0837",
    question: "Refer to the exhibit. A Cisco engineer creates a new WLAN called lantest. Which two actions must be performed so that only high-speed 2.4-Ghz clients connect? (Choose two.)",
    options: [
    "Enable the Status option.",
    "Set the Radio Policy option to 802.11g Only.",
    "Set the Radio Policy option to 802.11a Only.",
    "Set the Interface/Interface Group(G) to an interface other than guest.",
    "Enable the Broadcast SSID option."
    ],
    correct: [0, 1],
    exhibit: true,
  },
  {
    id: "q0838",
    question: "How does Rapid PVST+ create a fast loop-free network topology?",
    options: [
    "It uses multiple active paths between end stations.",
    "It requires multiple links between core switches.",
    "It maps multiple VLANs into the same spanning-tree instance.",
    "It generates one spanning-tree instance for each VLAN."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0839",
    question: "Which two functions does a WLC perform in the lightweight access-point architecture that an AP performs independently in an autonomous architecture? (Choose two.)",
    options: [
    "managing RF channels, including transmission power",
    "handling the association, authentication, and roaming of wireless clients",
    "sending and processing beacon frames",
    "encrypting and decrypting traffic that uses the WAP protocol family",
    "preventing collisions between wireless clients on the same RF channel"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0840",
    question: "Refer to the exhibit. A network engineer is configuring a wireless LAN with Web Passthrough Layer 3 Web Policy. Which action must the engineer take to complete the configuration?",
    options: [
    "Set the Layer 2 Security to 802.1X. radio policy",
    "Enable TKIP and CCMP256 WPA2 Encryption. profile name",
    "Enable the WPA Policy. NAS-ID configuration",
    "Set the Layer 2 Security to None. Q0841 Nachfragen A network administrator plans an update to the WI-FI networks in multiple branch offices. Each location is configured with an SSID called “Office”. The administrator wants every user who connects to the SSID at any location to have the same access level. What must be set the same on each network to meet the requirement? security policies"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0842",
    question: "Refer to the exhibit. The P2P Blocking Action option is disabled on the WLC. The security team has a new requirement for each client to retain their assigned IP addressing as the clients move between locations in the campus network. Which action completes this configuration?",
    options: [
    "Enable the Static IP Tunneling option.",
    "Disable the Coverage Hole Detection option.",
    "Set the P2P Blocking Action option to Forward-UpStream.",
    "Check the DHCP Addr. Assignment check box."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0843",
    question: "Refer to the exhibit. A multivendor network exists and the company is implementing VoIP over the network for the first time. Which configuration is needed to implement the neighbor discovery protocol on the interface and allow it to remain off for the remaining interfaces?",
    options: [
    "SW1(config)#lldp run - SW1(config)#interface gigabitethernet1/0/1 SW1(config-if)#lldp enable",
    "SW1(config)#no cdp run - SW1(config)#interface gigabitethernet1/0/1 SW1(config-if)#lldp transmit - SW1(config-if)#lldp receive",
    "SW1(contig)#lldp enable - SW1(config)#interface gigabitethernet1/0/1 SW1(config-if)#lldp run",
    "SW1(config)#no cdp enable - SW1(config)#interface gigabitethernet1/0/1 SW1(config-if)#cdp run"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0844",
    question: "Refer to the exhibit. Routers R1, R2, and R3 use a protocol to identify the neighbors’ IP addresses, hardware platforms, and software versions. A network engineer must configure R2 to avoid sharing any neighbor information with R3, and maintain its relationship with R1. What action meets this requirement?",
    options: [
    "Configure the no lldp receive command on g0/1.",
    "Configure the no cdp run command globally.",
    "Configure the no cdp enable command on g0/2.",
    "Configure the no lldp run command globally."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0845",
    question: "SIP-based Call Admission Control must be configured in the Cisco WLC GUI. SIP call-snooping ports are configured. Which two actions must be completed next? (Choose two.)",
    options: [
    "Set the QoS level to silver or greater for voice traffic. switchport mode trunk",
    "Configure two different QoS roles for data and voice traffic. switchport mode dynamic desirable",
    "Enable Media Session Snooping on the WLAN. switchport trunk encapsulation dot1q",
    "Set the QoS level to platinum for voice traffic. switchport nonegotiate",
    "Enable traffic shaping for the LAN interface of the WLC. Q0846 Nachfragen Refer to the exhibit. A network administrator configures an interface on a new switch so that it connects to interface Gi1/0/1 on switch Cat9300-1. Which configuration must be applied to the new interface? switchport trunk native vlan 321 switchport trunk allowed vlan 100,200,300 switchport trunk native vlan 321 switchport trunk allowed vian 100,200,300 switchport trunk native vlan 321 switchport trunk allowed vlan 100-300 switchport access vlan 321 switchport trunk allowed vlan except 2-1001"
    ],
    correct: [2, 3, 0],
    exhibit: true,
  },
  {
    id: "q0847",
    question: "Which command enables HTTP access to the Cisco WLC?",
    options: [
    "config network telnet enable",
    "config network secureweb enable",
    "config certificate generate webadmin",
    "config network webmode enable"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0848",
    question: "Which port state processes BPDUs, but does not forward packets or update the address database in Rapid PVST+?",
    options: [
    "blocking",
    "learning",
    "listening",
    "disabled"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0850",
    question: "Refer to the exhibit. Rapid PVST+ mode is on the same VLAN on each switch. Which switch becomes the root bridge and why?",
    options: [
    "SW4, because its priority is highest and its MAC address is lower",
    "SW1, because its priority is the lowest and its MAC address is higher",
    "SW2, because its MAC address is the highest",
    "SW3, because its priority is the highest"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0851",
    question: "Which EtherChannel mode must be configured when using LAG on a WLC?",
    options: [
    "on",
    "passive",
    "active",
    "auto"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0853",
    question: "Which switch concept is used to create separate broadcast domains?",
    options: [
    "STP",
    "VTP",
    "VLAN",
    "CSMA/CD"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0854",
    question: "How must a switch interface be configured when an AP is in FlexConnect mode?",
    options: [
    "access port",
    "EtherChannel",
    "PoE port",
    "trunk port"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0855",
    question: "What are two features of PortFast? (Choose two.)",
    options: [
    "Convergence is fast after a link failure.",
    "STP loops are mitigated for uplinks to other switches.",
    "Ports transition directly from the blocking state to the forwarding state.",
    "Ports operate normally without receiving BPDUs.",
    "Ports that connect to the backbone automatically detect indirect link failures."
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0856",
    question: "What is the root port in STP?",
    options: [
    "It is the port with the highest priority toward the root bridge.",
    "It is the port on the root switch that leads to the designated port on another switch.",
    "It is the port that is elected only when the root bridge has precisely one port on a single LAN segment.",
    "It is the port on a switch with the lowest cost to reach the root bridge."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0857",
    question: "When a switch receives a frame from an unknown source MAC address, which action does the switch take with the frame?",
    options: [
    "It sends the frame to ports within the CAM table identified with an unknown source MAC address.",
    "It floods the frame out all interfaces, including the interface it was received on.",
    "It associates the source MAC address with the LAN port on which it was received and saves it to the MAC address table.",
    "It attempts to send the frame back to the source to ensure that the source MAC address is still available for transmissions."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0858",
    question: "When the LAG configuration is updated on a Cisco WLC, which additional task must be performed when changes are complete?",
    options: [
    "Reboot the WLC.",
    "Flush all MAC addresses from the WLC.",
    "Re-enable the WLC interfaces.",
    "Re-associate the WLC with the access point."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0859",
    question: "Refer to the exhibit. An engineer ts building a new Layer 2 LACP EtherChannel between SW1 and SW2, and they executed the given show commands to verify the work. Which additional task must be performed so that the switches successfully bundle the second member in the LACP port-channel?",
    options: [
    "Configure the switchport trunk allowed vlan 300 command on SW1 port-channel 1.",
    "Configure the switchport trunk allowed vlan add 300 command on interface Fa0/2 on SW2.",
    "Configure the switchport trunk allowed vlan add 300 command on SW1 port-channel 1.",
    "Configure the switchport trunk allowed vlan 300 command on interface Fa0/2 on SW1."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0860",
    question: "Refer to the exhibit. VLAN 23 is being implemented between SW1 and SW2. The command show interface ethernet0/0 switchport has been issued on SW1. Ethernet0/0 on SW1 is the uplink to SW2. Which command when entered on the uplink interface allows PC 1 and PC 2 to communicate without impact to the communication between PC 11 and PC 12?",
    options: [
    "switchport trunk allowed vlan 2-1001",
    "switchport trunk allowed vlan 23",
    "switchport trunk allowed vlan add 23",
    "switchport trunk allowed vian 22-23"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0861",
    question: "A network engineer starts to implement a new wireless LAN by configuring the authentication server and creating the dynamic interface. What must be performed next to complete the basic configuration?",
    options: [
    "Create the new WLAN and bind the dynamic interface to it.",
    "Configure high availability and redundancy for the access points.",
    "Enable Telnet and RADIUS access on the managoment interface.",
    "Install the management interface and add the management IP."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0862",
    question: "Refer to the exhibit. An architect is managing a wireless network with APs from several branch offices connecting to the WLC in the data center. There is a new requirement for a single WLAN to process the client data traffic without sending it to the WLC. Which action must be taken to complete the request?",
    options: [
    "Enable local HTTP profiling.",
    "Enable FlexConnect Local Switching.",
    "Enable local DHCP Profiling.",
    "Enable Disassociation Imminent."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0863",
    question: "What must be considered for a locally switched FlexConnect AP if the VLANs that are used by the AP and client access are different?",
    options: [
    "The APs must be connected to the switch with multiple links in LAG mode.",
    "The native VLAN must match the management VLAN of the AP.",
    "The switch port mode must be set to trunk.",
    "IEEE 802.1Q trunking must be disabled on the switch port."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0864",
    question: "Which command configures the Cisco WLC to prevent a serial session with the WLC CLI from being automatically logged out?",
    options: [
    "config sessions maxsessions 0",
    "config serial timeout 9600",
    "config serial timeout 0",
    "config sessions timeout 0"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0865",
    question: "A Cisco engineer at a new branch office is configuring a wireless network with access points that connect to a controller that is based at corporate headquarters. Wireless client traffic must terminate at the branch office and access-point survivability is required in the event of a WAN outage. Which access point mode must be selected?",
    options: [
    "Lightweight with local switching disabled",
    "FlexConnect with local switching enabled",
    "OfficeExtend with high availability disabled",
    "Local with AP fallback enabled"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0866",
    question: "What is an advantage of using auto mode versus static mode for power allocation when an access point is connected to a PoE switch port?",
    options: [
    "Power policing is enabled at the same time.",
    "The default level is used for the access point.",
    "All four pairs of the cable are used.",
    "It detects the device is a powered device."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0867",
    question: "Refer to the exhibit. Wireless LAN access must be set up to force all clients from the NA WLAN to authenticate against the local database. The WLAN is configured for local EAP authentication. The time that users access the network must not be limited. Which action completes this configuration?",
    options: [
    "Check the Guest User Role check box.",
    "Uncheck the Guest User check box.",
    "Set the Lifetime (seconds) value to 0.",
    "Clear the Lifetime (seconds) value."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0869",
    question: "What is a specification for SSIDs?",
    options: [
    "They must include one number and one letter.",
    "They are a Cisco proprietary security feature.",
    "They are case sensitive.",
    "They define the VLAN on a switch"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0870",
    question: "What is a reason to configure a trunk port that connects to a WLC distribution port?",
    options: [
    "Provide redundancy if there is a link failure for out-of-band management.",
    "Allow multiple VLANs to be used in the data path.",
    "Permit multiple VLANs to provide out-of-band management.",
    "Eliminate redundancy with a link failure in the data path."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0872",
    question: "Refer to the exhibit. A Cisco WLC administrator is creating a new wireless network with enhanced SSID security. The new network must operate at 2.4 Ghz with 54 Mbps of throughput. Which set of tasks must the administrator perform to complete the configuration?",
    options: [
    "Uncheck the Broadcast SSID check box and set the Radio Policy to 802.11a/g only.",
    "Check the Broadcast SSID check box and set the Radio Policy to 802.11g only.",
    "Uncheck the Broadcast SSID check box and set the Radio Policy to 802.11g only.",
    "Check the Broadcast SSID check box and set the Radio Policy to 802.11a only."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0873",
    question: "Which switching feature removes unused MAC addresses from the MAC address table, which allows new MAC addresses to be added?",
    options: [
    "MAC address aging",
    "MAC move",
    "MAC address auto purge",
    "dynamic MAC address learning"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0874",
    question: "Refer to the exhibit. A network engineer configures the CCNA WLAN so that clients must reauthenticate hourly and to limit the number of simultaneous connections to the WLAN to 10. Which two actions complete this configuration? (Choose two.)",
    options: [
    "Enable the Wi-Fi Direct Clients Policy option",
    "Enable the Enable Session Timeout option and set the value to 3600.",
    "Enable the Client Exclusion option and set the value to 3600.",
    "Set the Maximum Allowed Clients value to 10.",
    "Set the Maximum Allowed Clients Per AP Radio value to 10."
    ],
    correct: [1, 3],
    exhibit: true,
  },
  {
    id: "q0875",
    question: "Refer to the exhibit. The SW1 and SW2 Gi0/0 ports have been preconfigured. An engineer is given these requirements: • Allow all PCs to communicate with each other at Layer 3. • Configure untagged traffic to use VLAN 5. • Disable VLAN 1 from being used. Which configuration set meets these requirements?",
    options: [
    "SW1# interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 switchport trunk native vlan 5 interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 SW2# interface Gi0/1 switchport mode access switchport access vlan 7 interface Gi0/7 switchport mode trunk switchport trunk allowed vlan 7,9,108",
    "SW1# interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 switchport trunk native vlan 5 interface Gi0/2 switchport mode access switchport trunk allowed vlan 7,9,108 SW2# interface Gi0/1 switchport mode access no switchport access vlan 1 switchport access vlan 7 interface Gi0/7 switchport mode trunk switchport trunk allowed vlan 7,9,108 switchport trunk native vlan 5",
    "SW#1 - interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 switchport trunk native vlan 5 interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 SW2# interface Gi0/1 switchport mode access switchport access vlan 7 interface Gi0/7 switchport mode trunk switchport trunk allowed vlan 5,7,9,108 switchport trunk native vlan 5",
    "SW1# interface Gi0/1 switchport mode trunk switchport trunk allowed vian 5,7,9,108 interface Gi0/2 switchport mode trunk switchport trunk allowed vlan 7,9,108 SW2# interface Gi0/1 switchport mode trunk switchport trunk allowed vlan 7 interface Gi0/7 switchport mode trunk switchport trunk allowed vlan 5,7,9,108"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0876",
    question: "Refer to the exhibit. How must router A be configured so that it only sends Cisco Discovery Protocol information to router C?",
    options: [
    "#config t Router A (config)#no cdp run - Router A (config)#interface gi0/0/1 Router A (config-if)#cdp enable -",
    "#config t Router A (config)#cdp run - Router A (config)#interface gi0/0/0 Router A (config-if)#no cdp enable",
    "#config t - Router A (config)#cdp run - Router A (config)#interface gi0/0/1 Router A (config-if)#cdp enable -",
    "#config t Router A (config)#cdp run - Router A (config)#interface gi0/0/0 Router A (config-if)#cdp enable"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0877",
    question: "Refer to the exhibit. An administrator must turn off the Cisco Discovery Protocol on the port configured with address last usable address in the 10.0.0.0/30 subnet. Which command set meets the requirement?",
    options: [
    "interface gi0/1 no cdp enable",
    "interface gi0/0 no cdp run",
    "interface gi0/0 no cdp advertise-v2",
    "interface gi0/1 clear cdp table"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0878",
    question: "Which WLC port connects to a switch to pass normal access-point traffic?",
    options: [
    "redundancy",
    "service",
    "console",
    "distribution system"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0879",
    question: "Which default condition must be considered when an encrypted mobility tunnel is used between two Cisco WLCs?",
    options: [
    "The tunnel uses the IPses protocol for encapsulation.",
    "Control and data traffic encryption are enabled.",
    "The tunnel uses the EoIP protocol to transmit data traffic.",
    "TCP port 443 and UDP 21 are used."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0880",
    question: "Refer to the exhibit. After a recent internal security audit, the network administrator decided to block all P2P-capable devices from the selected SSID. Which configuration setting must the administrator apply?",
    options: [
    "Set the Wi-Fi Direct Client Policy to Not-Allow.",
    "Select a correctly configured Layer 2 ACL.",
    "Set the MFP Client Protection to Required.",
    "Set the P2P Block Action to Drop."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0881",
    question: "What is the primary purpose of a console port on a Cisco WLC?",
    options: [
    "in-band management via an asynchronous transport",
    "in-band management via an IP transport",
    "out-of-band management via an asynchronous transport",
    "out-of-band management via an IP transport"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0882",
    question: "Which port type does a lightweight AP use to connect to the wired network when it is configured in local mode?",
    options: [
    "EtherChannel",
    "access",
    "LAG",
    "trunk"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0883",
    question: "Which step immediately follows receipt of the EAP success message when session resumption is disabled for an EAP-TLS connection?",
    options: [
    "PMKID caching",
    "four-way handshake",
    "802.1X authentication",
    "EAPOL-key frame"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0884",
    question: "Refer to the exhibit. All interfaces are in the same VLAN. All switches are configured with the default STP priorities. During the STP elections, which switch becomes the root bridge?",
    options: [
    "MDF-DC-1: 08:E0:43:42:70:13",
    "MDF-DC-2: 08:0E:18:22:05:97",
    "MDF-DC-4: 08:E0:19:A1:B3:19",
    "MDF-DC-3: 08:0E:18:1A:3C:9D"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0885",
    question: "What are two port types used by a Cisco WLC for out-of-band management? (Choose two.)",
    options: [
    "service",
    "console",
    "management",
    "distribution system",
    "redundant"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0886",
    question: "What is a reason to implement LAG on a Cisco WLC?",
    options: [
    "Allow for stateful failover between WLCs.",
    "Increase security by encrypting management frames.",
    "Increase the available throughput on the link.",
    "Enable the connected switch ports to use different Layer 2 configurations."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0887",
    question: "A wireless access point is needed and must meet these requirements: • “zero-touch” deployed and managed by a WLC • process only real-time MAC functionality • used in a split-MAC architecture Which access point type must be used?",
    options: [
    "mesh",
    "autonomous",
    "lightweight",
    "cloud-based"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0888",
    question: "Which interface is used for out-of-band management on a WLC?",
    options: [
    "management",
    "virtual",
    "dynamic",
    "service port"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0889",
    question: "Refer to the exhibit. How does SW2 interact with other switches in this VTP domain?",
    options: [
    "It transmits and processes VTP updates from any VTP clients on the network on its trunk ports.",
    "It processes VTP updates from any VTP clients on the network on its access ports.",
    "It receives updates from all VTP servers and forwards all locally configured VLANs out all trunk ports.",
    "It forwards only the VTP advertisements that it receives on its trunk ports."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0890",
    question: "A network engineer is upgrading a small data center to host several new applications, including server backups that are expected to account for up to 90% of the bandwidth during peak times. The data center connects to the MPLS network provider via a primary circuit and a secondary circuit. How does the engineer inexpensively update the data center to avoid saturation of the primary circuit by traffic associated with the backups?",
    options: [
    "Assign traffic from the backup servers to a dedicated switch.",
    "Place the backup servers in a dedicated VLAN.",
    "Advertise a more specific route for the backup traffic via the secondary circuit.",
    "Configure a dedicated circuit for the backup traffic."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0891",
    question: "Refer to the exhibit. A network engineer started to configure two directly-connected routers as shown. Which command sequence must the engineer configure on R2 so that the two routers become OSPF neighbors?",
    options: [
    "interface GigabitEthernet0/1 ip ospf 1 area 1",
    "router ospf 1 network 192.168.12.1 0.0.0.0 area 1",
    "interface GigabitEthernet0/1 ip ospf 1 area 0",
    "router ospf 1 network 192.168.12.0 0.0.0.127 area 0"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0893",
    question: "Refer to the exhibit. Router R14 is in the process of being configured. Which configuration must be used to establish a host route to a PC 10?",
    options: [
    "ip route 10.80.65.10 255.255.255.254 10.80.65.1",
    "ip route 10.80.65.10 255.255.255.255 10.73.65.66",
    "ip route 10.73.65.66 0.0.0.255 10.80.65.10",
    "ip route 10.73.65.66 255.0.0.0 10.80.65.10"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0894",
    question: "Refer to the exhibit. Which next-hop IP address has the least desirable metric when sourced from R1?",
    options: [
    "10.10.10.4",
    "10.10.10.5",
    "10.10.10.3",
    "10.10.10.2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0895",
    question: "Refer to the exhibit. The New York router must be configured so that traffic to 2000::1 is sent primarily via the Atlanta site, with a secondary path via Washington that has an administrative distance of 2. Which two commands must be configured on the New York router? (Choose two.)",
    options: [
    "ipv6 route 2000::1/128 2012::1",
    "ipv6 route 2000::1/128 2012::1 5",
    "ipv6 route 2000::1/128 2012::2",
    "ipv6 route 2000::1/128 2023::2 5",
    "ipv6 route 2000::1/128 2023::3 2"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0896",
    question: "Refer to the exhibit. The primary route across Gi0/0 is configured on both routers. A secondary route must be configured to establish connectivity between the workstation networks. Which command set must be configured to complete this task?",
    options: [
    "R1 - ip route 172.16.2.0 255.255.255.248 172.16.0.5 110 R2 - ip route 172.16.1.0 255.255.255.0 172.16.0.6 110",
    "R1 - ip route 172.16.2.0 255.255.255.240 172.16.0.2 113 R2 - ip route 172.16.1.0 255.255.255.0 172.16.0.1 114",
    "R1 - ip route 172.16.2.0 255.255.255.224 172.16.0.6 111 R2 - ip route 172.16.1.0 255.255.255.0 172.16.0.5 112",
    "R1 - ip route 172.16.2.0 255.255.255.240 172.16.0.5 89 R2 - ip route 172.16.1.0 255.255.255.0 172.16.0.6 89"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0898",
    question: "Refer to the exhibit. Which two values does router R1 use to determine the best path to reach destinations in network 1.0.0.0/8? (Choose two.)",
    options: [
    "lowest cost to reach the next hop",
    "highest administrative distance",
    "lowest metric",
    "highest metric",
    "longest prefix match"
    ],
    correct: [2, 4],
    exhibit: true,
  },
  {
    id: "q0899",
    question: "Refer to the exhibit. A public IPv6 address must be configured for internet access. Which command must be configured on the R2 WAN interface to the service provider?",
    options: [
    "ipv6 address fe80::/10",
    "ipv6 address 2001:db8:433:37:7710:ffff:ffff:ffff/64 anycast",
    "ipv6 address 2001:db8:123:45::4/64",
    "ipv6 address fe80::260:3EFF:FE11:6770 link-local"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0901",
    question: "Refer to the exhibit. A network engineer must configure router R1 with a host route to the server. Which command must the engineer configure?",
    options: [
    "R1(config)#ip route 10.10.10.10 255.255.255.255 192.168.0.2",
    "R1(config)#ip route 10.10.10.0 255.255.255.0 192.168.0.2",
    "R1(config)#ip route 0.0.0.0 0.0.0.0 192.168.0.2",
    "R1(config)#ip route 192.168.0.2 255.255.255.255 10.10.10.10"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0902",
    question: "Refer to the exhibit. IPv6 is being implemented within the enterprise. The command ipv6 unicast- routing is configured. Interface Gig0/0 on R1 must be configured to provide a dynamic assignment using the assigned IPv6 block. Which command accomplishes this task?",
    options: [
    "ipv6 address 2001:DB8:FFFF:FCF3::64 link-local",
    "ipv6 address 2001:DB8:FFFF:FCF3::1/64",
    "ipv6 address 2001:DB8:FFFF:FCF3::64 eui-64",
    "ipv6 address autoconfig 2001:DB8:FFFF:FCF2::/64"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0903",
    question: "Refer to the exhibit. With which metric does router R1 learn the route to host 172.16.0.202?",
    options: [
    "90",
    "110",
    "32445",
    "3184439"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0904",
    question: "Refer to the exhibit. A network engineer must configure the link with these requirements: • Consume as few IP addresses as possible. • Leave at least two additional useable IP addresses for future growth. Which set of configurations must be applied?",
    options: [
    "R1(config-if)#ip address 10.10.10.1 255.255.255.252 R2(config-if)#ip address 10.10.10.2 255.255.255.252",
    "R1(config-if)#ip address 10.10.10.1 255.255.255.240 R2(config-if)#ip address 10.10.10.12 255.255.255.240",
    "R1(config-if)#ip address 10.10.10.1 255.255.255.248 R2(config-if)#ip address 10.10.10.4 255.255.255.248",
    "R1(config-if)#ip address 10.10.10.1 255.255.255.0 R2(config-if)#ip address 10.10.10.5 255.255.255.0"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0906",
    question: "Refer to the exhibit. A static route must be configured on R86 to forward traffic for the 172.16.34.0/29 network, which resides on R14. Which command must be used to fulfill the request?",
    options: [
    "ip route 10.73.65.65 255.255.255.248 172.16.34.0",
    "ip route 172.16.34.0 255.255.255.248 10.73.65.65",
    "ip route 172.16.34.0 0.0.0.7 10.73.65.64",
    "ip route 172.16.34.0 255.255.224.0 10.73.65.66"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0907",
    question: "Refer to the exhibit. An engineer must configure a floating static route on an external EIGRP network. The destination subnet is the /29 on the LAN interface of R86. Which command must be executed on R14?",
    options: [
    "ip route 10.80.65.0 255.255.248.0 10.73.65.66 1",
    "ip route 10.80.65.0 255.255.255.240 fa0/1 89",
    "ip route 10.80.65.0 255.255.255.248 10.73.65.66 171",
    "ip route 10.73.65.66 0.0.0.224 10.80.65.0 255"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0908",
    question: "Refer to the exhibit. What is the next-hop IP address for R2 so that PC2 reaches the application server via EIGRP?",
    options: [
    "192.168.30.1",
    "10.10.10.6",
    "10.10.10.5",
    "192.168.20.1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0910",
    question: "Refer to the exhibit. An IPv6 address must be obtained automatically on the LAN interface on R1. Which command must be implemented to accomplish the task?",
    options: [
    "ipv6 address autocontig",
    "ipv6 address dhcp",
    "ipv6 address fe80::/10",
    "ipv6 address 2001:db8:d8d2:1008:4332:45:0570::/64"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0911",
    question: "Refer to the exhibit. A network engineer is updating the configuration on router R1 to connect a new branch office to the company network. R2 has been configured correctly. Which command must the engineer configure so that devices at the new site communicate with the main office?",
    options: [
    "ip route 172.25.25.1 255.255.255.255 g0/2",
    "ip route 172.25.25.0 255.255.255.0 192.168.2.2",
    "ip route 172.25.25.0 255.255.255.0 192.168.2.1",
    "ip route 172.25.25.1 255.255.255.255 g0/1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0912",
    question: "A network engineer must migrate a router loopback interface to the IPv6 address space. If the current IPv4 address of the interface is 10.54.73.1/32, and the engineer configures IPv6 address 0:0:0:0:0:ffff:a36:4901, which prefix length must be used?",
    options: [
    "/64",
    "/96",
    "/124",
    "/128"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0913",
    question: "A Cisco engineer notices that two OSPF neighbors are connected using a crossover Ethernet cable. The neighbors are taking too long to become fully adjacent. Which command must be issued under the interface configuration on each router to reduce the time required for the adjacency to reach the FULL state?",
    options: [
    "ip ospf dead-interval 40",
    "ip ospf network broadcast",
    "ip ospf priority 0",
    "ip ospf network point-to-point"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0914",
    question: "Refer to the exhibit. PC A is communicating with another device at IP address 10.227.225.255. Through which router does router Y route the traffic?",
    options: [
    "router A",
    "router B",
    "router C",
    "router D"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0915",
    question: "Refer to the exhibit. A packet sourced from 10.10.10.32 is destined for the Internet. What is the administrative distance for the destination route?",
    options: [
    "0",
    "1",
    "2",
    "32"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0916",
    question: "Refer to the exhibit. Which format matches the Modified EUI-64 IPv6 interface address for the network 2001:db8::/64?",
    options: [
    "2001:db8::5000:00ff:fe04:0000/64",
    "2001:db8::4332:5800:41ff:fe06:/64",
    "2001:db8::5000:0004:5678:0090/64",
    "2001:db8::5200:00ff:fe04:0000/64"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0917",
    question: "What is the benefit of using FHRP?",
    options: [
    "reduced ARP traffic on the network",
    "balancing traffic across multiple gateways in proportion to their loads",
    "higher degree of availability",
    "reduced management overhead on network routers"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0918",
    question: "Why is a first-hop redundancy protocol implemented?",
    options: [
    "to enable multiple switches to operate as a single unit",
    "to provide load-sharing for a multilink segment",
    "to prevent loops in a network",
    "to protect against default gateway failures"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0919",
    question: "Refer to the exhibit. A network engineer executes the show ip route command on router D. What is the next hop to network 192.168.1.0/24 and why?",
    options: [
    "The next hop is 10.0.2.1 because it uses distance vector routing.",
    "The next hop is 10.0.0.1 because it has a higher metric.",
    "The next hop is 10.0.2.1 because it is a link-state routing protocol.",
    "The next hop is 10.0.0.1 because it has a better administrative distance."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0920",
    question: "What is a similarity between global and unique local IPv6 addresses?",
    options: [
    "They use the same process for subnetting.",
    "They are part of the multicast IPv6 group type.",
    "They are routable on the global internet.",
    "They are allocated by the same organization."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0922",
    question: "Refer to the exhibit. A packet that is sourced from 172.16.3.254 is destined for the IP address of GigabitEthernet0/0/0. What is the subnet mask of the destination route?",
    options: [
    "0.0.0.0",
    "255.255.254.0",
    "255.255.255.0",
    "255.255.255.255"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0923",
    question: "Refer to the exhibit. The iPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. Which address must be used?",
    options: [
    "ipv6 address 2001:DB8:D8D2:1009:10A0:ABFF:FECC:1 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:1230:ABFF:FECC:1 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:4331:89FF:FF23:9 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:12A0:AB34:FFCC:1 eui-64"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0924",
    question: "Refer to the exhibit. According to the output, which parameter set is validated using the routing table of R7?",
    options: [
    "R7 is missing a gateway of last resort. R7 is receiving routes that were redistributed in EIGRP. R7 will forward traffic destined to 10.90.8.0/24.",
    "R7 has a gateway of last resort available. R7 is receiving routes that were redistributed from BGP. R7 will drop traffic destined to 10.90.8.0/24.",
    "R7 is missing a gateway of last resort. R7 is receiving routes that were redistributed from BGP. R7 will forward traffic destined to 10.90.8.0/24.",
    "R7 has a gateway of last resort available. R7 is receiving routes that were redistributed in EIGRP. R7 will drop traffic destined to 10.90.8.0/24."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0925",
    question: "Which type of IPv4 address type helps to conserve the globally unique address classes?",
    options: [
    "loopback",
    "multicast",
    "private",
    "public"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0926",
    question: "What are two purposes of HSRP? (Choose two.)",
    options: [
    "It provides a mechanism for diskless clients to autoconfigure their IP parameters during boot.",
    "It improves network availability by providing redundant gateways.",
    "It groups two or more routers to operate as one virtual router.",
    "It passes configuration information to hosts in a TCP/IP network.",
    "It helps hosts on the network to reach remote subnets without a default gateway."
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0927",
    question: "What are two benefits for using private IPv4 addressing? (Choose two.)",
    options: [
    "They allow for Internet access from IoT devices.",
    "They alleviate the shortage of public IPv4 addresses.",
    "They provide a layer of security from internet threats.",
    "They supply redundancy in the case of failure.",
    "They offer Internet connectivity to endpoints on private networks."
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0929",
    question: "Refer to the exhibit. Routers R1 and R2 are configured with RIP as the dynamic routing protocol. A network engineer must configure R1 with a floating static route to service as a backup route to network 192.168.23.0 which command must the engineer configure on R1?",
    options: [
    "ip route 192.168.23.0 255.255.255.0 192.168,13.3 100",
    "ip route 192.168.23.0 255.255.255.255 192.168.13.3 121",
    "ip route 192.168.23.0 255.255.255.0 192.168.13.3 121",
    "ip route 192.168.23.0 255.255.255.0 192.168.13.3"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0930",
    question: "When deploying a new network that includes both Cisco and third-party network devices, which redundancy protocol avoids the interruption of network traffic if the default gateway router fails?",
    options: [
    "VRRP",
    "FHRP",
    "GLBP",
    "HSRP"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0931",
    question: "What are two benefits of private IPv4 addressing? (Choose two.)",
    options: [
    "propagates routing information to WAN links",
    "provides unlimited address ranges",
    "reuses addresses at multiple sites",
    "conserves globally unique address space",
    "provides external internet network connectivity"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0932",
    question: "Which Cisco proprietary protocol ensures traffic recovers immediately, transparently, and automatically when edge devices or access circuits fail?",
    options: [
    "FHRP",
    "VRRP",
    "HSRP",
    "SLB"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0933",
    question: "Refer to the exhibit. Which entry is the longest prefix match for host IP address 192.168.10.5?",
    options: [
    "1",
    "2",
    "3",
    "4"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0935",
    question: "Which two IPv6 addresses are used to provide connectivity between two routers on a shared link? (Choose two.)",
    options: [
    "FF02::0001:FF00:0000/104",
    "ff06:bb43:cc13:dd16:1bb:ff14:7545:234d",
    "2002::512:1204b:1111::1/64",
    "2001:701:104b:1111::1/64",
    "::ffff:10.14.101.1/96"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0937",
    question: "Refer to the exhibit. Which action is taken by the router when a packet is sourced from 10.10.10.2 and destined for 10.10.10.16?",
    options: [
    "It floods packets to all learned next hops.",
    "It uses a route that is similar to the destination address.",
    "It queues the packets waiting for the route to be learned.",
    "It discards the packets."
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0939",
    question: "An engineer must configure a core router with a floating static default route to the backup router at 10.200.0.2. Which command meets the requirements?",
    options: [
    "ip route 0.0.0.0 0.0.0.0 10.200.0.2 1",
    "ip route 0.0.0.0 0.0.0.0 10.200.0.2 10",
    "ip route 0.0.0.0 0.0.0.0 10.200.0.2",
    "ip route 0.0.0.0 0.0.0.0 10.200.0.2 floating"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0940",
    question: "Refer to the exhibit. After configuring a new static route on the CPE, the engineer entered this series of commands to verify that the new configuration is operating normally. When is the static default route installed into the routing table?",
    options: [
    "when a route to 203.0.113.1 is learned via BGP",
    "when 203.0.113.1 is no longer reachable as a next hop",
    "when the default route learned over external BGP becomes invalid",
    "when the default route learned over external BGP changes its next hop"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0941",
    question: "Refer to the exhibit. Packets are flowing from 192.168.10.1 to the destination at IP address 192.168.20.75. Which next hop will the router select for the packet?",
    options: [
    "10.10.10.1",
    "10.10.10.11",
    "10.10.10.12",
    "10.10.10.14"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0942",
    question: "A router received three destination prefixes: 10.0.0.0/8, 10.0.0.0/16, and 10.0.0.0/24. When the show ip route command is executed, which output does it return?",
    options: [
    "Gateway of last resort is 172.16.1.1 to network 0.0.0.0 o E2 10.0.0.0/8 [110/5] via 192.168.1.1, 0:01:00, Ethernet0 o E2 10.0.0.0/16[110/5] via 192.168.2.1, 0:01:00, Ethernet1 o E2 10.0.0.0/24[110/5] via 192.168.3.1, 0:01:00, Ethernet2",
    "Gateway of last resort is 172.16.1.1 to network 0.0.0.0 o E2 10.0.0.0/8 [110/5] via 192.168.1.1, 0:01:00, Ethernet0",
    "Gateway of last resort is 172.16.1.1 to network 0.0.0.0 o E2 10.0.0.0/24[110/5] via 192.168.3.1, 0:01:00, Ethernet2",
    "Gateway of last resort is 172.16.1.1 to network 0.0.0.0 o E2 10.0.0.0/16[110/5] via 192.168.2.1, 0:01:00, Ethernet1 o E2 10.0.0.0/24[110/5] via 192.168.3.1, 0:01:00, Ethernet2"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0943",
    question: "Refer to the exhibit. User traffic originating within site B is failing to reach an application hosted on IP address 192.168.0.10, which is located within site A. What is determined by the routing table?",
    options: [
    "The traffic is blocked by an implicit deny in an ACL on router2.",
    "The lack of a default route prevents delivery of the traffic.",
    "The traffic to 192.168.0.10 requires a static route to be configured in router1.",
    "The default gateway for site B is configured incorrectly."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0944",
    question: "Refer to the exhibit. Which two values does router R1 use to identify valid routes for the R3 loopback address 1.1.1.3/32? (Choose two.)",
    options: [
    "lowest cost to reach the next hop",
    "highest administrative distance",
    "lowest metric",
    "highest metric",
    "lowest administrative distance"
    ],
    correct: [2, 4],
    exhibit: true,
  },
  {
    id: "q0945",
    question: "What is the role of community strings in SNMP operations?",
    options: [
    "It translates alphanumeric MIB output values to numeric values.",
    "It passes the Active Directory username and password that are required for device access.",
    "It serves as a sequence tag on SNMP traffic messages.",
    "It serves as a password to protect access to MIB objects."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0946",
    question: "Which syslog severity level is considered the most severe and results in the system being considered unusable?",
    options: [
    "Error",
    "Emergency",
    "Alert",
    "Critical"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0947",
    question: "The clients and DHCP server reside on different subnets. Which command must be used to forward requests and replies between clients on the 10.10.0.1/24 subnet and the DHCP server at 192.168.10.1?",
    options: [
    "ip route 192.168.10.1",
    "ip dhcp address 192.168.10.1",
    "ip default-gateway 192.168.10.1",
    "ip helper-address 192.168.10.1"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0948",
    question: "Refer to the exhibit. Which command set configures ROUTER-1 to allow Internet access for users on the 192.168.1.0/24 subnet while using 209.165.202.129 for Port Address Translation?",
    options: [
    "ip nat pool CCNA 192.168.0.0 192.168.1.255 netmask 255.255.255.0 access-list 10 permit 192.168.0.0 0.0.0.255 ip nat inside source list 10 pool CCNA overload",
    "ip nat pool CCNA 209.165.202.129 209.165.202.129 netmask 255.255.255.255 access-list 10 permit 192.168.1.0 255.255.255.0 ip nat inside source list 10 pool CCNA overload",
    "ip nat pool CCNA 192.168.0.0 192.168.1.255 netmask 255.255.255.0 access-list 10 permit 192.168.0.0 255.255.255.0 ip nat inside source list 10 pool CCNA overload",
    "ip nat pool CCNA 209.165.202.129 209.165.202.129 netmask 255.255.255.255 access-list 10 permit 192.168.1.0 0.0.0.255 ip nat inside source list 10 pool CCNA overload"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q0949",
    question: "Which IP header field is changed by a Cisco device when QoS marking is enabled?",
    options: [
    "ECN",
    "Header Checksum",
    "Type of Service",
    "DSCP"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0951",
    question: "Which DSCP per-hop forwarding behavior is divided into subclasses based on drop probability?",
    options: [
    "expedited",
    "default",
    "assured",
    "class-selector"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0952",
    question: "What are two features of the DHCP relay agent? (Choose two.)",
    options: [
    "assigns DNS locally and then forwards request to DHCP server",
    "minimizes the necessary number of DHCP servers",
    "permits one IP helper command under an individual Layer 3 interface",
    "is configured under the Layer 3 interface of a router on the client subnet",
    "allows only MAC-to-IP reservations to determine the local subnet of a client"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q0953",
    question: "A DHCP pool has been created with the name CONTROL. The pool uses the next to last usable IP address as the default gateway for the DHCP clients. The server is located at 172.16.32.15. What is the next step in the process for clients on the 192.168.52.0/24 subnet to reach the DHCP server?",
    options: [
    "ip helper-address 172.16.32.15",
    "ip default-gateway 192.168.52.253",
    "ip forward-protocol udp 137",
    "ip detault-network 192.168.52.253"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0954",
    question: "Which two transport layer protocols carry syslog messages? (Choose two.)",
    options: [
    "IP",
    "RTP",
    "TCP",
    "UDP",
    "ARP"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0955",
    question: "What is the purpose of classifying network traffic in QoS?",
    options: [
    "configures traffic-matching rules on network devices",
    "services traffic according to its class",
    "identifies the type of traffic that will receive a particular treatment",
    "writes the class identifier of a packet to a dedicated field in the packet header"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q0957",
    question: "Refer to the exhibit. Which configuration enables DHCP addressing for hosts connected to interface FastEthernet0/1 on router R3?",
    options: [
    "interface FastEthernet0/1 ip helper-address 10.0.1.1 ! access-list 100 permit tcp host 10.0.1.1 eq 67 host 10.148.2.1",
    "interface FastEthernet0/1 ip helper-address 10.0.1.1 ! access-list 100 permit udp host 10.0.1.1 eq 67 host 10.148.2.1",
    "interface FastEthernet0/0 ip helper-address 10.0.1.1 ! access-list 100 permit host 10.0.1.1 host 10.148.2.1 eq bootps",
    "interface FastEthernet0/1 ip helper-address 10.0.1.1 ! access-list 100 permit udp host 10.0.1.1 eq bootps host 10.148.2.1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0959",
    question: "Which two features introduced in SNMPv2 provide the ability to retrieve large amounts of data in one request and acknowledge a trap using PDUs? (Choose two.)",
    options: [
    "Get",
    "GetNext",
    "Set",
    "GetBulk",
    "Inform"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q0961",
    question: "What is the purpose of configuring different levels of syslog for different devices on the network?",
    options: [
    "to set the severity of syslog messages from each device",
    "to control the number of syslog messages from different devices that are stored locally",
    "to identify the source from which each syslog message originated",
    "to rate-limit messages for different severity levels from each device"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0962",
    question: "Refer to the exhibit. The DHCP server is configured with a DHCP pool for each of the subnets represented. Which command must be configured on switch SW1 to allow DHCP clients on VLAN 10 to receive dynamic IP addresses from the DHCP server?",
    options: [
    "SW1(config-if)#ip helper-address 192.168.10.1",
    "SW1(config-if)#ip helper-address 192.168.20.1",
    "SW1(config-if)#ip helper-address 192.168.20.2",
    "SW1(config-if)#ip helper-address 192.168.10.2"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0964",
    question: "Refer to the exhibit. Which minimum configuration items are needed to enable Secure Shell version 2 access to R15?",
    options: [
    "Router(config)#hostname R15 - R15(config)#ip domain-name cisco.com R15(config)#crypto key generate rsa general-keys modulus 1024 R15(config)#ip ssh version 2 - R15(config-line)#line vty 0 15 - R15(config-line)# transport input ssh",
    "Router(config)#crypto key generate rsa general-keys modulus 1024 Router(config)#ip ssh version 2 - Router(config-line)#line vty 015 Router(config-line)# transport input ssh Router(contig)#ip ssh logging events R15(config)#ip ssh stricthostkeycheck",
    "Router(config)#hostname R15 - R15(config)#crypto key generate rsa general-keys modulus 1024 R15(config-line)#line vty 0 15 - R15(config-line)# transport input ssh R15(config)#ip ssh source-interface Fa0/0 R15(config)#ip ssh stricthostkeycheck",
    "Router(config)#ip domain-name cisco.com Router(config)#crypto key generate rsa general-keys modulus 1024 Router(contig)#ip ssh version 2 - Router(config-line)#line vty 0 15 Router(config-line)# transport input all Router(config)#ip ssh logging events"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0965",
    question: "hostname CPE service password-encryption ip domain name ccna.cisco.com ip name-server 198.51.100.210 crypto key generate rsa modulus 1024 username admin privilege 15 secret s0m3s3cr3t line vty 0 4 transport input ssh login local Refer to the exhibit. An engineer executed the script and added commands that were not necessary for SSH and now must remove the commands. Which two commands must be executed to correct the configuration? (Choose two.)",
    options: [
    "no ip name-serveer 198.51.100.210",
    "no login local",
    "no service password-encryption",
    "no ip domain mame ccna.cisco.com",
    "no hostname CPE"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q0966",
    question: "Which two actions are taken as the result of traffic policing? (Choose two.)",
    options: [
    "bursting",
    "dropping",
    "remarking",
    "fragmentation",
    "buffering"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q0967",
    question: "Which two server types support domain name to IP address resolution? (Choose two.)",
    options: [
    "authoritative",
    "web",
    "file transfer",
    "resolver",
    "ESX host"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q0968",
    question: "What is a purpose of traffic shaping?",
    options: [
    "It enables policy-based routing.",
    "It enables dynamic flow identification.",
    "It provides best-effort service.",
    "It limits bandwidth usage."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0969",
    question: "An engineering team asks an implementer to configure syslog for warning conditions and error conditions. Which command does the implementer configure to achieve the desired result?",
    options: [
    "logging trap 5",
    "logging trap 2",
    "logging trap 3",
    "logging trap 4"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0971",
    question: "Which WLC management connection type is vulnerable to man-in-the-middle attacks?",
    options: [
    "console",
    "Telnet",
    "SSH",
    "HTTPS"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0972",
    question: "Refer to the exhibit. An engineer booted a new switch and applied this configuration via the console port. Which additional configuration must be applied to allow administrators to authenticate directly to global configuration mode via Telnet using a local username and password?",
    options: [
    "R1(config)#username admin - R1(config-if)#line vty 0 4 - R1(config-line)#password p@ss1234 R1(config-line)#transport input telnet",
    "R1(config)#username admin privilege 15 secret p@ss1234 R1(config-if)#line vty 0 4 - R1(config-line)#login local",
    "R1(config)#username admin secret p@ss1234 R1(config-if)#line vty 0 4 - R1(config-line)#login local - R1(config)#enable secret p@ss1234",
    "R1(config)#username admin - R1(config-if)#line vty 0 4 - R1(config-line)#password p@ss1234"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0973",
    question: "Which type of encryption does WPA1 use for data protection?",
    options: [
    "PEAP",
    "TKIP",
    "AES",
    "EAP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0974",
    question: "Refer to the exhibit. A network administrator must permit traffic from the 10.10.0.0/24 subnet to the WAN on interface Serial0. What is the effect of the configuration as the administrator applies the command?",
    options: [
    "The router accepts all incoming traffic to Serial0 with the last octet of the source IP set to 0.",
    "The permit command fails and returns an error code.",
    "The router fails to apply the access list to the interface.",
    "The sourced traffic from IP range 10.0.0.0 - 10.0.0.255 is allowed on Serial0."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q0976",
    question: "A network engineer must configure an access list on a new Cisco IOS router. The access list must deny HTTP traffic to network 10.125.128.32/27 from the 192.168.240.0/20 network, but it must allow the 192.168.240.0/20 network to reach the rest of the 10.0.0.0/8 network. Which configuration must the engineer apply?",
    options: [
    "ip access-list extended deny_outbound 10 permit ip 192.168.240.0 255.255.240.0 10.0.0.0 255.0.0.0 20 deny tcp 192.168.240.0 255.255.240.0 10.125.128.32 255.255.255.224 eq 443 30 permit ip any any",
    "ip access-list extended deny_outbound 10 deny tcp 192.168.240.0 0.0.15.255 10.125.128.32 0.0.0.31 eq 80 20 permit ip 192.168.240.0 0.0.15.255 10.0.0.0 0.255.255.255 30 deny ip any any log",
    "ip access-list extended deny_outbound 10 deny tcp 10.125.128.32 255.255.255.224 192.168.240.0 255.255.240.0 eq 443 20 deny tcp 192.168.240.0 255.255.240.0 10.125.128.32 255.255.255.224 eq 443 30 permit ip 192.168.240.0 255.255.240.0 10.0.0.0 255.0.0.0",
    "ip access-list extended deny_outbound 10 deny tcp 192.168.240.0 0.0.15.255 any eq 80 20 deny tcp 192.168.240.0 0.0.15.255 10.125.128.32 0.0.0.31 eq 80 30 permit ip 192.168.240.0 0.0.15.255 10.0.0.0 0.255.255.255"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0977",
    question: "What is the definition of backdoor malware?",
    options: [
    "malicious code that is installed onto a computer to allow access by an unauthorized user",
    "malicious program that is used to launch other malicious programs",
    "malicious code that infects a user machine and then uses that machine to send spam",
    "malicious code with the main purpose of downloading other malicious code"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0978",
    question: "What does WPA3 provide in wireless networking?",
    options: [
    "backward compatibility with WPA and WPA2",
    "safeguards against brute force attacks with SAE",
    "increased security and requirement of a complex configuration",
    "optional Protected Management Frame negotiation"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0979",
    question: "Which global command encrypts all passwords in the running configuration?",
    options: [
    "service password-encryption",
    "enable password-encryption",
    "enable secret",
    "password-encrypt"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0980",
    question: "Refer to the exhibit. A network administrator is configuring a router for user access via SSH. The service-password encryption command has been issued. The configuration must meet these requirements: • Create the username as CCUser. • Create the password as NA!2$cc. • Encrypt the user password. What must be configured to meet the requirements?",
    options: [
    "username CCUser privilege 10 password NA!2$cc",
    "username CCUser privilege 15 password NA!2$cc enable secret 0 NA!2$cc",
    "username CCUser secret NA!2Sce",
    "username CCUser password NA!2$cc enable password level 5 NA!2$cc"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0981",
    question: "Refer to the exhibit. A network engineer started to configure port security on a new switch. These requirements must be met: • MAC addresses must be learned dynamically. • Log messages must be generated without disabling the interface when unwanted traffic is seen. Which two commands must be configured to complete this task? (Choose two.)",
    options: [
    "SW(config-if)#switchport port-security violation restrict",
    "SW(config-if)#switchport port-security mac-address 0010.7B84.45E6",
    "SW(config-if)#switchport port-security maximum 2",
    "SW(config-if)#switchport port-security violation shutdown",
    "SW(config-if)#switchport port-security mac-address sticky"
    ],
    correct: [0, 4],
    exhibit: true,
  },
  {
    id: "q0982",
    question: "Which type of security program is violated when a group of employees enters a building using the ID badge of only one person?",
    options: [
    "intrusion detection",
    "network authorization",
    "physical access control",
    "user awareness"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0983",
    question: "What are two protocols within the IPsec suite? (Choose two.)",
    options: [
    "3DES",
    "AES",
    "ESP",
    "TLS",
    "AH"
    ],
    correct: [2, 4],
    exhibit: false,
  },
  {
    id: "q0984",
    question: "Refer to the exhibit. Local access for R4 must be established and these requirements must be met: • Only Telnet access is allowed. • The enable password must be stored securely. • The enable password must be applied in plain text. • Full access to R4 must be permitted upon successful login. Which configuration script meets the requirements?",
    options: [
    "! conf t ! username test1 password testpass1 enable secret level 15 0 Test123 ! line vty 0 15 login local transport input telnet",
    "! config t ! username test1 password testpass1 enable password level 15 0 Test123 ! line vty 0 15 login local transport input all",
    "! config t ! username test1 password testpass1 enable password level 1 7 Test123 ! line vty 0 15 accounting exec default transport input all",
    "! config t ! username test1 password testpass1 enable secret level 1 0 Test123 ! line vty 0 15 login authentication password Test123 transport input telnet"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q0985",
    question: "What is a characteristic of RSA?",
    options: [
    "It uses preshared keys for encryption.",
    "It is an asymmetric encryption algorithm.",
    "It is a symmetric decryption algorithm.",
    "It requires both sides to have identical keys for encryption."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0986",
    question: "What are two differences between WPA2 and WPA3 wireless security? (Choose two.)",
    options: [
    "WPA2 uses 192-bit key encryption, and WPA3 requires 256-bit key encryption.",
    "WPA3 uses AES for stronger protection than WPA2, which uses SAE.",
    "WPA2 uses 128-bit key encryption, and WPA3 supports 128-bit and 192-bit key encryption.",
    "WPA3 uses SAE for stronger protection than WPA2, which uses AES.",
    "WPA3 uses AES for stronger protection than WPA2, which uses TKIP."
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q0987",
    question: "What is an enhancement implemented in WPA3?",
    options: [
    "applies 802.1x authentication and AES-128 encryption",
    "employs PKI and RADIUS to identify access points",
    "uses TKIP and per-packet keying",
    "defends against deauthentication and disassociation attacks"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q0988",
    question: "Which action must be taken when password protection is implemented?",
    options: [
    "Use less than eight characters in length when passwords are complex.",
    "Include special characters and make passwords as long as allowed.",
    "Share passwords with senior IT management to ensure proper oversight.",
    "Store passwords as contacts on a mobile device with single-factor authentication."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0990",
    question: "An engineer must configure R1 for a new user account. The account must meet these requirements: • It must be configured in the local database. • The username is engineer2. • It must use the strongest password configurable. Which command must the engineer configure on the router?",
    options: [
    "R1(config)# username engineer2 privilege 1 password 7 test2021",
    "R1(config)# username engineer2 secret 4 $1$b1Ju$kZbBS1Pyh4QzwXyZ",
    "R1(config)# username engineer2 algorithm-type scrypt secret test2021",
    "R1(config)# username engineer2 secret 5 password $1$b1Ju$kZbBS1Pyh4QzwXyZ"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0991",
    question: "Which two VPN technologies are recommended by Cisco for multiple branch offices and large-scale deployments? (Choose two.)",
    options: [
    "GETVPN",
    "DMVPN",
    "site-to-site VPN",
    "clientless VPN",
    "IPsec remote access"
    ],
    correct: [0, 1],
    exhibit: false,
  },
  {
    id: "q0993",
    question: "What is a characteristic of RSA?",
    options: [
    "It uses preshared keys for encryption.",
    "It is a public-key cryptosystem.",
    "It is a private-key encryption algorithm.",
    "It requires both sides to have identical keys."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0994",
    question: "What is used as a solution for protecting an individual network endpoint from attack?",
    options: [
    "antivirus software",
    "wireless controller",
    "router",
    "Cisco DNA Center"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0995",
    question: "Which security method is used to prevent man-in-the-middle attacks?",
    options: [
    "authentication",
    "anti-replay",
    "authorization",
    "accounting"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q0996",
    question: "Which cipher is supported for wireless encryption only with the WPA2 standard?",
    options: [
    "RC4",
    "AES",
    "SHA",
    "AES256"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0997",
    question: "Refer to the exhibit. This ACL is configured to allow client access only to HTTP, HTTPS, and DNS services via UDP. The new administrator wants to add TCP access to the ONS service. Which configuration updates the ACL efficiently?",
    options: [
    "no ip access-list extended Services ip access-list extended Services 30 permit tcp 10.0.0.0 0.255.255.255 host 198.51.100.11 eq domain",
    "ip access-list extended Services 35 permit tcp 10.0.0.0 0.255.255.255 host 198.51.100.11 eq domain",
    "ip access-list extended Services permit tcp 10.0.0.0 0.255.255.255 host 198.51.100.11 eq domain",
    "no ip access-list extended Services ip access-list extended Services permit udp 10.0.0.0 0.255.255.255 any eq 53 permit tcp 10.0.0.0 0.255.255.255 host 198.51.100.11 eq domain deny ip any any log"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q0998",
    question: "Which WPA mode uses PSK authenticaton?",
    options: [
    "Local",
    "Personal",
    "Enterprise",
    "Client"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q0999",
    question: "An engineer is configuring remote access to a router from IP subnet 10.139.58.0/28. The domain name, crypto keys, and SSH have been configured. Which configuration enables the traffic on the destination router?",
    options: [
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.252 ip access-group 110 in ip access-list extended 110 permit tcp 10.139.58.0 0.0.0.15 host 10.122.49.1 eq 22",
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.240 access-group 120 in ip access-list extended 120 permit tcp 10.139.58.0 255.255.255.248 any eq 22",
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.252 ip access-group 105 in ip access-list standard 105 permit tcp 10.139.58.0 0.0.0.7 eq 22 host 10.122.49.1",
    "interface FastEthernet0/0 ip address 10.122.49.1 255.255.255.248 ip access-group 10 in ip access-list standard 10 permit udp 10.139.58.0 0.0.0.7 host 10.122.49.1 eq 22"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1002",
    question: "Which benefit does Cisco DNA Center provide over traditional campus management?",
    options: [
    "Cisco DNA Center automates HTTPS for secure web access, and traditional campus management uses HTTP.",
    "Cisco DNA Center leverages SNMPv3 for encrypted management, and traditional campus management uses SNMPv2.",
    "Cisco DNA Center leverages APIs, and traditional campus management requires manual data gathering.",
    "Cisco DNA Center automates SSH access for encrypted entry, and SSH is absent from traditional campus management."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1003",
    question: "How does Chef configuration management enforce a required device configuration?",
    options: [
    "The Chef Infra Server uses its configured cookbook to push the required configuration to the remote device requesting updates.",
    "The installed agent on the device connects to the Chef Infra Server and pulls its required configuration from the cookbook.",
    "The Chef Infra Server uses its configured cookbook to alert each remote device when it is time for the device to pull a new configuration.",
    "The installed agent on the device queries the Chef Infra Server and the server responds by pushing the configuration from the cookbook."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1004",
    question: "What is the PUT method within HTTP?",
    options: [
    "It replaces data at the destination.",
    "It is a nonidempotent operation.",
    "It is a read-only operation.",
    "It displays a web site."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1006",
    question: "Which advantage does the network assurance capability of Cisco DNA Center provide over traditional campus management?",
    options: [
    "Cisco DNA Center leverages YANG and NETCONF to assess the status of fabric and nonfabric devices, and traditional campus management uses CLI exclusively.",
    "Cisco DNA Center handles management tasks at the controller to reduce the load on infrastructure devices, and traditional campus management uses the data backbone.",
    "Cisco DNA Center automatically compares security postures among network devices, and traditional campus management needs manual comparisons.",
    "Cisco DNA Center correlates information from different management protocols to obtain insights, and traditional campus management requires manual analysis."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1006",
    question: "Refer to the exhibit. In which structure does the word “warning” directly reside?",
    options: [
    "array",
    "object",
    "Boolean",
    "string"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1007",
    question: "What is the purpose of a southbound API in a controller-based networking architecture?",
    options: [
    "facilitates communication between the controller and the applications",
    "allows application developers to interact with the network",
    "integrates a controller with other automation and orchestration tools",
    "facilitates communication between the controller and the networking hardware"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1009",
    question: "Which two northbound APIs are found in a software-defined network? (Choose two.)",
    options: [
    "REST",
    "OpenFlow",
    "SOAP",
    "NETCONF",
    "OpFlex"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q1010",
    question: "Which function generally performed by a traditional network device is replaced by a software-defined controller?",
    options: [
    "building route tables and updating the forwarding table",
    "encapsulation and decapsulation of packets in a data-link frame",
    "changing the source or destination address during NAT operations",
    "encryption and decryption for VPN link processing"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1011",
    question: "What describes a northbound REST API for SDN?",
    options: [
    "network-element-facing interface for GET, POST, PUT, and DELETE methods",
    "application-facing interface for SNMP GET requests",
    "application-facing interface for GET, POST, PUT, and DELETE methods",
    "network-element-facing interface for the control and data planes"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1012",
    question: "When is the PUT method used within HTTP?",
    options: [
    "to update a DNS server",
    "when a nonidempotent operation is needed",
    "to display a web site",
    "when a read-only operation is required"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1013",
    question: "Which two HTTP methods are suitable for actions performed by REST-based APIs? (Choose two.)",
    options: [
    "REMOVE",
    "REDIRECT",
    "POST",
    "GET",
    "POP"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q1014",
    question: "What is the advantage of separating the control plane from the data plane within an SDN network?",
    options: [
    "limits data queries to the control plane double quotes (\" \") around the \"Cisco Devices\" string",
    "reduces cost exclamation point (!) at the beginning of each line",
    "decreases overall network complexity square bracket ( [ ) at the beginning",
    "offloads the creation of virtual machines to the data plane • Q1015 Refer to the exhibit. What is missing from this output for it to be executed? curly braket ( } ) at the end"
    ],
    correct: [2, 3],
    exhibit: true,
  },
  {
    id: "q1016",
    question: "What is a function of a northbound API in an SDN environment?",
    options: [
    "It relies on global provisioning and configuration.",
    "It upgrades software and restores files.",
    "It supports distributed processing for configuration.",
    "It provides orchestration and network automation services."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1017",
    question: "What is an Ansible inventory?",
    options: [
    "unit of Python code to be executed within Ansible",
    "file that defines the target devices upon which commands and tasks are executed",
    "device with Ansible installed that manages target devices",
    "collection of actions to perform on target devices, expressed in YAML format"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1019",
    question: "What is a function of a northbound API?",
    options: [
    "It relies on global provisioning and configuration.",
    "It upgrades software and restores files.",
    "It supports distributed processing for configuration.",
    "It provides a path between an SDN controller and network applications."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1020",
    question: "Refer to the exhibit. What does apple represent within the JSON data?",
    options: [
    "array",
    "object",
    "number",
    "string"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1022",
    question: "Under the CRUD model, which two HTTP methods support the UPDATE operation? (Choose two.)",
    options: [
    "PATCH",
    "DELETE",
    "GET",
    "POST",
    "PUT"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q1023",
    question: "A network architect is considering whether to implement Cisco DNA Center to deploy devices on a new network. The organization is focused on reducing the time it currently takes to deploy devices in a traditional campus design. For which reason would Cisco DNA Center be more appropriate than traditional management options?",
    options: [
    "Cisco DNA Center supports deployment with a single pane of glass.",
    "Cisco DNA Center provides zero-touch provisioning to third-party devices.",
    "Cisco DNA Center reduces the need for analytics on third-party access points and devices.",
    "Cisco DNA Center minimizes the level of syslog output when reporting on Cisco devices."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1025",
    question: "In a cloud-computing environment, what is rapid elasticity?",
    options: [
    "control and monitoring or resource consumption by the tenant",
    "automatic adjustment of capacity based on need",
    "pooling resources in a multitenant model based on need",
    "self-service of computing resources by the tenant"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1026",
    question: "Which interface enables communication between a program on the controller and a program on the networking device?",
    options: [
    "software virtual interface",
    "tunnel interface",
    "northbound interface",
    "southbound interface"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1027",
    question: "Refer to the exhibit. How many arrays are present in the JSON data?",
    options: [
    "one",
    "three",
    "six",
    "nine"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1029",
    question: "Which interface type enables an application running on a client to send data over an IP network to a server?",
    options: [
    "northbound interface",
    "application programming interface",
    "southbound interface",
    "Representational State Transfer application programming interface"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1030",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:9aa6:6aa9:C801:A6FF:FEA4:1",
    "2001:db8:9aa6:6aa9:C081:A6FF:FF4A:1",
    "2001:db8:9aa6:6aa9:C001:6AFE:FF00:1",
    "2001:db8:9aa6:6aa9:4642:823F:FE47:1"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1031",
    question: "Which QoS feature drops traffic that exceeds the committed access rate?",
    options: [
    "policing",
    "FIFO",
    "shaping",
    "weighted fair queuing"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1032",
    question: "What does traffic shaping do?",
    options: [
    "It queues excess traffic",
    "It sets QoS attributes within a packet",
    "It organizes traffic into classes",
    "It modifies the QoS attributes of a packet"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1033",
    question: "Refer to the exhibit. A Cisco engineer is asked to update the configuration on switch 1 so that the EtherChannel stays up when one of the links fails. Which configuration meets this requirement?",
    options: [
    "Switch1(config) # interface Fa0/0 Switch1(config-if) # lacp port-priority 100 Switch1(config) # interface Fa0/1 Switch1(config-if) # lacp port-priority 200",
    "Switch1(config) # interface port-channel 1 Switch1(config-if) # port-channel min-links 1",
    "Switch1(config) # interface Fa0/0 Switch1(config-if) # lacp port-priority 200 Switch1(config) # interface Fa0/1 Switch1(config-if) # lacp port-priority 100",
    "Switch1(config) # interface port-channel 1 Switch1(config-if) # lacp max-bundle 1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1034",
    question: "Which two protocols are supported on service-port interfaces? (Choose two.)",
    options: [
    "Telnet",
    "SCP",
    "TACACS+",
    "SSH",
    "RADIUS"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q1035",
    question: "What is the benefit of using private IPv4 addressing?",
    options: [
    "to enable secure connectivity over the Internet",
    "to shield internal network devices from external access",
    "to provide reliable connectivity between like devices",
    "to be routable over an external network"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1036",
    question: "Two switches have been implemented and all interfaces are at the default configuration level. A trunk link must be implemented between two switches with these requirements: • using an industry-standard trunking protocol • permitting VLANs 1-10 and denying other VLANs How must the interconnecting ports be configured?",
    options: [
    "switchport mode dynamic channel-protocol lacp switchport trunk allowed vlans 1-10",
    "switchport mode trunk switchport trunk allowed vlans 1-10 switchport trunk native vlan 11",
    "switchport mode trunk switchport trunk encapsulation dot1q switchport trunk allowed vlans 1-10",
    "switchport mode dynamic desirable channel-group 1 mode desirable switchport trunk encapsulation isl switchport trunk allowed vlan except 11-4094"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1037",
    question: "Refer to the exhibit. Traffic that is flowing over interface TenGigabitEthemet0/0/0 experiences slow transfer speeds. What is the cause of this issue?",
    options: [
    "speed conflict",
    "queuing drops",
    "duplex incompatibility",
    "heavy traffic congestion"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1038",
    question: "Which two host addresses are reserved for private use within an enterprise network? (Choose two.)",
    options: [
    "10.172.76.200",
    "12.17.1.20",
    "172.15.2.250",
    "172.31.255.100",
    "192.169.32.10"
    ],
    correct: [0, 3],
    exhibit: false,
  },
  {
    id: "q1039",
    question: "Refer to the exhibit. The iPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. Which address must be used?",
    options: [
    "ipv6 address 2001:DB8:D8D2:1009:10A0:ABFF:FECC:1 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:1230:ABFF:FECC:1 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:4347:31FF:FF47:0 eui-64",
    "ipv6 address 2001:DB8:D8D2:1009:12A0:AB34:FFCC:1 eui-64"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1040",
    question: "What are two reasons to configure PortFast on a switch port attached to an end host? (Choose two.)",
    options: [
    "to block another switch or host from communicating through the port",
    "to enable the port to enter the forwarding state immediately when the host boots up",
    "to prevent the port from participating in Spanning Tree Protocol operations",
    "to protect the operation of the port from topology change processes",
    "to limit the number of MAC addresses learned on the port to 1"
    ],
    correct: [1, 3],
    exhibit: false,
  },
  {
    id: "q1042",
    question: "A network administrator wants the syslog server to filter incoming messages into different files based on their importance. Which filtering criteria must be used?",
    options: [
    "message body",
    "level",
    "facility",
    "process ID"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1044",
    question: "Which interface or port on the WLC is the default for in-band device administration and communications between the controller and access points?",
    options: [
    "console port",
    "management interface",
    "virtual interface",
    "service port"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1045",
    question: "Refer to the exhibit. A network administrator configures the CPE to provide internet access to the company headquarters. Traffic must be load-balanced via ISP1 and ISP2 to ensure redundancy. Which two command sets must be configured on the CPE router? (Choose two.)",
    options: [
    "ip route 0.0.0.0 0.0.0.0 198.51.100.1 255 ip route 0.0.0.0 0.0.0.0 203.0.113.1 255 ip route 128.0.0.0 128.0.0.0 203.0.113.1",
    "ip route 0.0.0.0 128.0.0.0 198.51.100.1 ip route 128.0.0.0 128.0.0.0 203.0.113.1 ip route 0.0.0.0 0.0.0.0 198.51.100.1 ip route 0.0.0.0 0.0.0.0 203.0.113.1",
    "ip route 0.0.0.0 0.0.0.0 198.51.100.1 ip route 0.0.0.0 0.0.0.0 203.0.113.1",
    "ip route 0.0.0.0 128.0.0.0 198.51.100.1 ip route 128.0.0.0 128.0.0.0 203.0.113.1",
    "ip route 0.0.0.0 0.0.0.0 198.51.100.1 ip route 0.0.0.0 0.0.0.0 203.0.113.1 2"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1046",
    question: "Refer to the exhibit. A network engineer updates the existing configuration on interface fastethernet1/1 switch SW1. It must establish an EtherChannel by using the same group designation with another vendor switch. Which configuration must be performed to complete the process?",
    options: [
    "interface port-channel 2 channel-group 2 mode desirable",
    "interface fastethernet 1/1 channel-group 2 mode on",
    "interface fastethernet 1/1 channel-group 2 mode active",
    "interface port-channel 2 channel-group 2 mode auto"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1047",
    question: "Which two characteristics are representative of virtual machines (VMs)? (Choose two.)",
    options: [
    "multiple VMs operate on the same underlying hardware",
    "Each VMs operating system depends on its hypervisor",
    "A VM on a hypervisor is automatically interconnected to other VMs",
    "A VM on an individual hypervisor shares resources equally",
    "Each VM runs independently of any other VM in the same hypervisor"
    ],
    correct: [0, 4],
    exhibit: false,
  },
  {
    id: "q1048",
    question: "What is the recommended switch load-balancing mode for Cisco WLCs?",
    options: [
    "source-destination IP address",
    "destination IP address",
    "destination MAC address",
    "source-destination MAC address"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1049",
    question: "What must be considered when using 802.11a?",
    options: [
    "It is chosen over 802.11b when a lower-cost solution is necessary",
    "It is susceptible to interference from 2.4 GHz devices such as microwave ovens",
    "It is compatible with 802.11b- and 802 11g-compliant wireless devices",
    "It is used in place of 802.11b/g when many nonoverlapping channels are required"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1050",
    question: "Refer to the exhibit. An engineer configures interface fa0/1 on SW1 and SW2 to pass traffic from two different VLANs. For security reasons, company policy requires the native VLAN to be set to a nondefault value. Which configuration meets this requirement?",
    options: [
    "Switch(config-if)#switchport mode trunk Switch(config-if)#switchport trunk encapsulation dot1q Switch(config-if)#switchport trunk allowed vlan 100,105 Switch(config-if)#switchport trunk native vlan 3",
    "Switch(config-if)#switchport mode trunk Switch(config-if)#switchport trunk encapsulation isl Switch(config-if)#switchport trunk allowed vlan 100,105 Switch(config-if)#switchport trunk native vlan 1",
    "Switch(config-if)#switchport mode dynamic Switch(config-if)#switchport access vlan 100,105 Switch(config-if)#switchport trunk native vlan 1",
    "Switch(config-if)#switchport mode access Switch(config-if)#switchport trunk encapsulation dot1q Switch(config-if)#switchport access vlan 100,105 Switch(config-if)#switchport trunk native vlan 3"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1051",
    question: "Refer to the exhibit A new VLAN and switch are added to the network. A remote engineer configures OldSwitch and must ensure that the configuration meets these requirements: • accommodates current configured VLANs • expands the range to include VLAN 20 • allows for IEEE standard support for virtual LANs Which configuration on the NewSwitch side of the link meets these requirements?",
    options: [
    "switch port mode dynamic channel group 1 mode active switchport trunk allowed vlan 5,10,15, 20",
    "no switchport mode trunk switchport trunk encapsulation isl switchport mode access vlan 20",
    "switchport nonegotiate no switchport trunk allowed vlan 5,10 switchport trunk allowed vlan 5,10,15,20",
    "no switchport trunk encapsulation isl switchport trunk encapsulation dot1q switchport trunk allowed vlan add 20"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1053",
    question: "Refer to the exhibit. A network engineer is adding another physical interface as a new member to the existing Port-Channel1 bundle. Which command set must be configured on the new interface to complete the process?",
    options: [
    "no switchport channel group 1 mode active",
    "no switchport channel-group 1 mode on",
    "switchport mode trunk channel-group 1 mode active",
    "switchport switchport mode trunk"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1055",
    question: "Refer to the exhibit. What is occurring on this switch?",
    options: [
    "Frames are dropped after 16 failed transmission attempts",
    "The internal transmit buffer is overloaded",
    "A high number of frames smaller than 64 bytes are received",
    "An excessive number of frames greater than 1518 bytes are received"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1056",
    question: "Refer to the exhibit SW_1 and SW_12 represent two companies that are merging. They use separate network vendors. The VLANs on both sides have been migrated to share IP subnets. Which command sequence must be issued on both sides to join the two companies and pass all VLANs between the companies?",
    options: [
    "switchport mode trunk switchport trunk encapsulation dot1q",
    "switchport mode trunk switchport trunk allowed vlan all switchport dot1q ethertype 0800",
    "switchport mode dynamic desirable switchport trunk allowed vlan all switchport trunk native vlan 7",
    "switchport dynamic auto switchport nonegotiate"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1057",
    question: "An engineer is configuring a switch port that is connected to a VoIP handset. Which command must the engineer configure to enable port security with a manually assigned MAC address of abcd.abcd.abcd on voice VLAN 4?",
    options: [
    "switchport port-security mac-address abcd.abcd.abcd vlan 4",
    "switchport port-security mac-address abcd.abcd.abcd vlan voice",
    "switchport port-security mac-address abcd.abcd.abcd",
    "switchport port-security mac-address sticky abcd.abcd.abcd vlan 4"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1062",
    question: "What is represented by the word \"LB20\" within this JSON schema?",
    options: [
    "value",
    "array",
    "object",
    "key"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1063",
    question: "What is represented beginning with line 1 and ending with line 5 within this JSON schema?",
    options: [
    "key",
    "object",
    "array",
    "value"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1064",
    question: "What is represented by the word \"IDS\" within this JSON schema?",
    options: [
    "object",
    "value",
    "array",
    "key"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1065",
    question: "What is represented in line 4 within this JSON schema?",
    options: [
    "object",
    "array",
    "key",
    "value"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1066",
    question: "What is represented by the word \"port\" within this JSON schema?",
    options: [
    "key",
    "value",
    "array",
    "object"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1067",
    question: "What provides connection redundancy, increased bandwidth, and load sharing between a wireless LAN controller and a Layer 2 switch?",
    options: [
    "first hop redundancy",
    "VLAN trunking",
    "tunneling",
    "link aggregation"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1069",
    question: "Which interface is used to send traffic to the destination network?",
    options: [
    "F0/5",
    "F0/6",
    "F0/12",
    "F0/9"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1070",
    question: "What is the purpose of an SSID?",
    options: [
    "It identifies an individual access point on a WLAN.",
    "It differentiates traffic entering access points.",
    "It provides network security.",
    "It identifies a WLAN."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1071",
    question: "Which two types of attack are categorized as social engineering? (Choose two.)",
    options: [
    "phoning",
    "malvertising",
    "probing",
    "pharming",
    "phishing"
    ],
    correct: [3, 4],
    exhibit: false,
  },
  {
    id: "q1073",
    question: "What describes the functionality of southbound APIs?",
    options: [
    "They enable communication between the controller and the network device.",
    "They communicate with the management plane.",
    "They use HTTP messages to communicate.",
    "They convey information from the controller to the SDN applications."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1074",
    question: "Refer to the exhibit. A network engineer is verifying the settings on a new OSPF network. All OSPF configurations use the default values unless otherwise indicated. Which router does the engineer expect will be elected as the DR when all devices boot up simultaneously?",
    options: [
    "R1",
    "R2",
    "R3",
    "R4"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1075",
    question: "Which command must be entered so that the default gateway is automatically distributed when DHCP is configured on a router?",
    options: [
    "dns-server",
    "default-router",
    "ip helper-address",
    "default-gateway"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1076",
    question: "What are two functions of a firewall within an enterprise? (Choose two.)",
    options: [
    "It enables traffic filtering based on URLs.",
    "It serves as an endpoint for a site-to-site VPN in standalone mode.",
    "It provides support as an endpoint for a remote access VPN in multiple context mode.",
    "It offers Layer 2 services between hosts.",
    "It enables wireless devices to connect to the network."
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q1077",
    question: "What is the maximum number of concurrent Telnet sessions that a Cisco WLC supports?",
    options: [
    "3",
    "5",
    "6",
    "15"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1078",
    question: "Which 802.11 management frame type is sent when a client roams between access points on the same SSID?",
    options: [
    "Reassociation Request",
    "Authentication Request",
    "Association Request",
    "Probe Request"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1079",
    question: "What is a functionality of the control plane in the network?",
    options: [
    "It looks up an egress interface in the forwarding information base.",
    "It forwards traffic to the next hop.",
    "It exchanges topology information with other routers.",
    "It provides CLI access to the network device."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1080",
    question: "Refer to the exhibit. All switches are configured with the default STP priorities. During the STP elections, which switch becomes the root bridge if all interfaces are in the same VLAN?",
    options: [
    "MDF-DC-1: 0d:E0:43:96:02:30",
    "MDF-DC-2: 0d:0E:18:1B:05:97",
    "MDF-DC-4: 0d:E0:19:A1:B3:19",
    "MDF-DC-3: 0d:0E:18:2A:3C:9D"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1082",
    question: "What is represented by the word \"VPN11\" within this JSON schema?",
    options: [
    "key",
    "array",
    "object",
    "value"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1083",
    question: "Which port type supports the spanning-tree portfast command without additional configuration?",
    options: [
    "Layer 3 main interfaces",
    "Layer 3 subinterfaces",
    "trunk ports",
    "access ports"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1084",
    question: "What is represented by the word \"R29\" within this JSON schema?",
    options: [
    "array",
    "key",
    "object",
    "value"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1085",
    question: "What is represented in line 2 within this JSON schema?",
    options: [
    "object",
    "value",
    "key",
    "array"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1094",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "is used without allocation from a regional internet authority",
    "is used when traffic on the subnet must traverse a site-to-site VPN to an outside organization",
    "reduces the forwarding table on network routers",
    "provides unlimited address ranges"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1095",
    question: "Which interface condition is occurring in this output?",
    options: [
    "bad NIC",
    "high throughput",
    "queueing",
    "broadcast storm"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1096",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "is used when the ISP requires the new subnet to be advertised to the internet for web services",
    "provides unlimited address ranges",
    "is used when the network has multiple endpoint listeners",
    "alleviates the shortage of IPv4 addresses"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1097",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "is used when traffic on the subnet must traverse a site-to-site VPN to an outside organization",
    "allows endpoints to communicate across public network boundaries",
    "is used on hosts that communicate only with other internal hosts",
    "reduces network complexity"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1098",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "traverses the internet when an outbound ACL is applied",
    "alleviates the shortage of IPv4 addresses",
    "is used when the ISP requires the new subnet to be advertised to the internet for web services",
    "enables secure connectivity over the internet"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1099",
    question: "Which interface condition is occurring in this output?",
    options: [
    "broadcast storm",
    "duplex mismatch",
    "high throughput",
    "queueing"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1100",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "is used when the ISP requires the new subnet to be advertised to the internet for web services",
    "allows multiple companies to use the same addresses without conflict",
    "is used on the external interface of a firewall",
    "allows endpoints to communicate across public network boundaries"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1104",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "identifies an access point on a WLAN",
    "uses the password to connect to an access point",
    "uses policies to prevent unauthorized users",
    "uses a case-sensitive text string"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1105",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "reduces network complexity",
    "is used on hosts that communicate only with other internal hosts",
    "simplifies the addressing in the network",
    "reduces network maintenance costs"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1106",
    question: "What is a characteristic of encryption in wireless networks?",
    options: [
    "identifies an access point on a WLAN",
    "uses the password to connect to an access point",
    "uses integrity checks to identify forgery attacks in the frame",
    "uses authentication protocols to secure a network"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1107",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "simplifies the addressing in the network",
    "complies with PCI regulations",
    "reduces the forwarding table on network routers",
    "is used on hosts that communicate only with other internal hosts"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1108",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "eliminates network piggybacking",
    "prompts a user for a login ID",
    "broadcasts a beacon signal to announce its presence by default",
    "must include a combination of letters and numbers"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1109",
    question: "What is a characteristic of encryption in wireless networks?",
    options: [
    "provides increased protection against spyware",
    "prompts a user for a login ID",
    "uses ciphers to detect and prevent zero-day network attacks",
    "prevents the interception of data as it transits a network"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1110",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "intercepts data threats before they attack a network",
    "encodes connections at the sending and receiving ends",
    "broadcasts a beacon signal to announce its presence by default",
    "identifies an access point on a WLAN"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1111",
    question: "Refer to the exhibit. SW2 is replaced because of a hardware failure. A network engineer starts to configure SW2 by copying the fa0/1 interface configuration from SW1. Which command must be configured on the fa0/1 interface of SW2 to enable PC1 to connect to PC2?",
    options: [
    "switchport mode trunk",
    "switchport trunk native vlan 10",
    "switchport mode access",
    "switchport trunk allowed remove 10"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1113",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "composed of up to 65,536 available addresses",
    "issued by IANA in conjunction with an autonomous system number",
    "used without tracking or registration",
    "traverse the Internet when an outbound ACL is applied"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1116",
    question: "How does MAC learning function on a switch?",
    options: [
    "broadcasts frames to all ports without queueing",
    "sends an ARP request to locate unknown destinations",
    "adds unknown source MAC addresses to the address table",
    "sends a retransmission request when a new frame is received"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1117",
    question: "Which interface condition is occurring in this output?",
    options: [
    "broadcast storm",
    "collisions",
    "high throughput",
    "duplex mismatch"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1118",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "converts electrical current to radio waves",
    "uses policies to prevent unauthorized users",
    "broadcasts a beacon signal to announce its presence by default",
    "prompts a user for a login ID"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1120",
    question: "Refer to the exhibit. Which switch becomes the root bridge?",
    options: [
    "SW3 - Bridge Priority - 57344 - mac-address 0b:bb:e0:96:a3:86",
    "SW2 - Bridge Priority - 57344 - mac-address 00:b6:c5:17:8e:89",
    "SW1 - Bridge Priority - 28672 - mac-address 0c:d4:e9:1d:3c:24",
    "SW4 - Bridge Priority - 28672 - mac-address 0b:09:23:33:b8:91"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1121",
    question: "Which interface is used to send traffic to the destination network?",
    options: [
    "G0/9",
    "G0/20",
    "G0/16",
    "G0/11"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1122",
    question: "What is represented by the word \"fe5/42\" within this JSON schema?",
    options: [
    "array",
    "object",
    "value",
    "key"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1123",
    question: "Refer to the exhibit. Which switch becomes the root bridge?",
    options: [
    "SW 1 - Bridge Priority - 32768 - mac-address 0f:d7:9e:13:ab:82",
    "SW 2 - Bridge Priority - 40960 - mac-address 05:d8:33:09:8f:89",
    "SW 3 - Bridge Priority - 32768 - mac-address 01:1c:6c:66:b7:70",
    "SW 4 - Bridge Priority - 40960 - mac-address 04:44:97:51:63:17"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1124",
    question: "Refer to the exhibit. A newly configured PC fails to connect to the internet by using TCP port 80 to www.cisco.com. Which setting must be modified for the connection to work?",
    options: [
    "Subnet Mask",
    "DNS Servers",
    "Default Gateway",
    "DHCP Servers"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1126",
    question: "How does frame switching function on a switch?",
    options: [
    "rewrites the source and destination MAC address",
    "forwards frames to a neighbor port using CDP",
    "forwards known destinations to the destination port",
    "is disabled by default on all interfaces and VLANs \\ •"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1128",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "uses policies to prevent unauthorized users",
    "identifies an access point on a WLAN",
    "prompts a user for a login ID",
    "associates a name to a WLAN"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1129",
    question: "What is represented by the word \"port\" within this JSON schema?",
    options: [
    "value",
    "array",
    "key",
    "object"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1131",
    question: "Which interface condition is occurring in this output?",
    options: [
    "collisions",
    "broadcast storm",
    "duplex mismatch",
    "queueing"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1133",
    question: "Refer to the exhibit. An engineer is configuring a new router on the network and applied this configuration. Which additional configuration allows the PC to obtain its IP address from a DHCP server?",
    options: [
    "Configure the ip helper-address 172.16.2.2 command under interface Gi0/0.",
    "Configure the ip dhcp relay information command under interface Gi0/1",
    "Configure the ip address dhcp command under interface Gi0/0",
    "Configure the ip dhcp smart-relay command globally on the router."
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1140",
    question: "Which IPsec encryption mode is appropriate when the destination of a packet differs from the security termination point?",
    options: [
    "transport",
    "main",
    "aggressive",
    "tunnel"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1141",
    question: "A network administrator is evaluating network security in the aftermath of an attempted ARP spoofing attack. If Port-channel1 is the uplink interface of the access-layer switch toward the distribution-layer switch, which two configurations must the administrator configure on the access-layer switch to provide adequate protection? (Choose two.)",
    options: [
    "ip dhcp snooping vlan 1-4094 ! interface Port-channel1 switchport protected switchport port-security maximum 1",
    "ip dhcp snooping vlan 1-4094 ip dhcp snooping ! interface Port-channel1 ip dhcp snooping trust",
    "ip dhcp snooping ! interface Port-channel1 switchport port-security maximum 1 switchport port-security",
    "ip arp inspection trust ! interface Port-channel1 switchport port-security maximum 4094 switchport port-security ip verify source mac-check",
    "ip arp inspection vlan 1-4094 ! interface Port-channel1 ip arp inspection trust"
    ],
    correct: [1, 4],
    exhibit: false,
  },
  {
    id: "q1142",
    question: "Which type of hypervisor operates without an underlying OS to host virtual machines?",
    options: [
    "Type 1",
    "Type 2",
    "Type 3",
    "Type 12"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1143",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "converts electrical current to radio waves",
    "associates a name to a WLAN",
    "uses a 4-way handshake for authentication",
    "provides increased protection against spyware"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1145",
    question: "Which interface is used to send traffic to the destination network?",
    options: [
    "G0/10",
    "G0/24",
    "G0/5",
    "G0/1"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1146",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "enables secure connectivity over the internet",
    "complies with PCI regulations",
    "provides an added level of protection against internet threats",
    "is used on internal hosts that stream data solely to external resources"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1149",
    question: "Refer to the exhibit. The engineer configured the VLANs on the new AccSw2 switch. A router-on-a- stick is connected to both switches. How must the ports be configured on AccSw2 to establish full connectivity between the two switches and for Server1?",
    options: [
    "interface GigabitEthernet1/1 switchport access vlan 11 ! interface GigabitEthernet1/24 switchport mode trunk switchport trunk allowed vlan 10,11",
    "interface GigabitEthernet1/3 switchport mode access switchport access vlan 10 ! interface GigabitEthernet1/24 switchport mode trunk switchport trunk allowed vlan 2,10",
    "interface GigabitEthernet1/3 switchport mode access switchport access vlan 10 ! interface GigabitEthernet1/24 switchport mode trunk",
    "interface GigabitEthernet1/1 switchport mode access switchport access vlan 11 ! interface GigabitEthernet1/24 switchport mode trunk"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1150",
    question: "How does frame switching function on a switch?",
    options: [
    "floods unknown destinations to all ports except the receiving port",
    "modifies frames that contain a known source VLAN",
    "rewrites the source and destination MAC address",
    "buffers and forwards frames with less than 5 CRCs"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1151",
    question: "Refer to the exhibit. Which address will the client contact to renew their IP address when the current lease expires?",
    options: [
    "192.168.25.103 SW4 -",
    "192.168.25.1 SW2 -",
    "192.168.25.100 SW3 -",
    "192.168.25.254 Refer to the exhibit. Which switch becomes the root bridge? Bridge Priority - 8192 - mac-address 05:0f:e8:ed:b2:98 Bridge Priority - 8192 - mac-address 00:ac:f0:9b:dc:72 Bridge Priority - 16384 - mac-address 0e:6c:e4:b1:8a:57 SW4 - Bridge Priority - 16384 - mac-address 0a:45:22:26:29:77"
    ],
    correct: [2, 1],
    exhibit: true,
  },
  {
    id: "q1154",
    question: "How is a configuration change made to a wireless AP in lightweight mode?",
    options: [
    "SSH connection to the management IP of the AP",
    "CAPWAP/LWAPP connection via the parent WLC",
    "EoIP connection via the parent WLC",
    "HTTPS connection directly to the out-of-band address of the AP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1157",
    question: "Which plane is centralized in software-defined networking?",
    options: [
    "application",
    "services",
    "data",
    "control"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1157",
    question: "What is a service that is provided by a wireless controller?",
    options: [
    "It mitigates threats from the internet.",
    "It manages interference in a dense network.",
    "It provides Layer 3 routing between wired and wireless devices.",
    "It issues IP addresses to wired devices."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1158",
    question: "When more than one AP-Manager interface is provisioned on a wireless LAN controller, how is the request handled by the AP?",
    options: [
    "The discovery response from the AP to the AP-Manager interface disables the WLAN port.",
    "The AP join request fails and must be configured statically on the AP-Manager interface.",
    "The AP-Manager with the fewest number of APs is used by the AP to join.",
    "The first AP-Manager interface to respond is chosen by the AP."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1162",
    question: "Which SNMP message type is reliable and precedes an acknowledgment response from the SNMP manager?",
    options: [
    "Get",
    "Inform",
    "Traps",
    "Set"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1163",
    question: "What is a characteristic of private IPv4 addressing?",
    options: [
    "provides unlimited address ranges collisions",
    "is used when the network has multiple endpoint listeners bad NIC",
    "reduces network complexity duplex mismatch",
    "alleviates the shortage of IPv4 addresses Q1164 Nachfragen Which interface condition is occurring in this output? broadcast storm"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1168",
    question: "What is a characteristic of encryption in wireless networks?",
    options: [
    "intercepts data threats before they attack a network",
    "uses policies to prevent unauthorized users",
    "must include a combination of letters and numbers",
    "encodes and decodes data for authorized use"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1173",
    question: "What is a reason why a company would choose to use network automation in an enterprise?",
    options: [
    "Provide data services faster.",
    "Enable network segmentation.",
    "Mitigate spanning-tree loop avoidance.",
    "Implement granular QoS."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1174",
    question: "Refer to the exhibit. A packet sourced from 172.16.32.254 is destined for 172.16.32.8. What is the subnet mask of the preferred destination route?",
    options: [
    "255.255.224.0",
    "255.255.255.0",
    "255.255.255.192",
    "255.255.255.252"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1176",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R1 must be configured using the EUI-64 format. When configured which Ipv6 address Is produced by the router?",
    options: [
    "2001:db8:1006:1968:4564:877F:FE99:1",
    "2001:db8:1006:1968:1119:BEFF:FE67:1",
    "2001:db8:1006:1968:1130:ABFF:FECC:1",
    "2001:db8:1006:1968:12D8:BAFE:FF01:1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1177",
    question: "Refer to the exhibit. Users at a branch office are experiencing application performance issues, poor VoIP audio quality, and slow downloads. What is the cause of the issues?",
    options: [
    "QoS queuing",
    "interface configuration",
    "broadcast storm",
    "overutilization"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1179",
    question: "An engineer needs to configure an access point to forward all client traffic through a wireless controller. Which mode must be enabled to accomplish this task?",
    options: [
    "local",
    "monitor",
    "autonomous",
    "rogue detector"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1180",
    question: "An Ethernet frame arrived at switch interface G0/1, but the destination MAC address is missing from the MAC address table. How does the switch process the frame?",
    options: [
    "It sends an ARP request to attempt to locate the destination",
    "It updates the destination to FFFF.FFFF.FFFF.",
    "It drops the frame and notifies the sending host.",
    "It floods the frame out of the remaining switch interfaces."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1181",
    question: "In which circumstance would a network architect decide to implement a global unicast subnet instead of a unique local unicast subnet?",
    options: [
    "when the subnet must be available only within an organization",
    "when the subnet does not need to be routable",
    "when the addresses on the subnet must be equivalent to private IPv4 addresses",
    "when the subnet must be routable over the internet"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1184",
    question: "Which interface is used to send traffic to the destination network?",
    options: [
    "G0/21",
    "G0/4",
    "G0/5",
    "G0/16"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1189",
    question: "Which interface condition is occurring in this output?",
    options: [
    "duplex mismatch",
    "high throughput",
    "bad NIC",
    "broadcast storm"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1192",
    question: "What are two functions of DHCP servers? (Choose two.)",
    options: [
    "issue DHCPDISCOVER messages when added to the network",
    "respond to client DHCPOFFER requests by Issuing an IP address",
    "support centralized IP management",
    "assign dynamic IP configurations to hosts in a network",
    "prevent users from assigning their own IP addresses to hosts"
    ],
    correct: [2, 3],
    exhibit: false,
  },
  {
    id: "q1193",
    question: "What is the operating mode and role of a backup port on a shared LAN segment in Rapid PVST+?",
    options: [
    "learning mode and provides the shortest path toward the root bridge handling traffic away from the LAN",
    "blocking mode and provides an alternate path toward the designated bridge",
    "forwarding mode and provides the lowest-cost path to the root bridge for each VLAN",
    "listening mode and provides an alternate path toward the root bridge"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1194",
    question: "A network architect is deciding whether to implement Cisco autonomous access points or lightweight access points. Which fact about firmware updates must the architect consider?",
    options: [
    "Unlike lightweight access points, which require redundant WLCs to support firmware upgrades, autonomous access points require only one WLC.",
    "Unlike autonomous access points, lightweight access points require a WLC to implement remote firmware updates.",
    "Unlike lightweight access points, autonomous access points can recover automatically from a corrupt firmware update.",
    "Unlike autonomous access points, lightweight access points store a complete copy of the current firmware for backup."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1195",
    question: "What is the role of SNMP in the network?",
    options: [
    "to monitor and manage network devices using a UDP underlay that operates on the application layer",
    "to collect data directly from network devices using an SSL underlay that operates on the transport layer",
    "to monitor network devices and functions using a TCP underlay that operates on the presentation layer",
    "to collect telemetry and critical information from network devices using an SSH underlay that operates on the network layer"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1197",
    question: "Refer to the exhibit. What is the issue with the interface GigabitEthernet0/0/1?",
    options: [
    "port security",
    "cable disconnect",
    "high throughput",
    "duplex mismatch <- JK"
    ],
    correct: [1, 3],
    exhibit: true,
  },
  {
    id: "q1198",
    question: "Refer to the exhibit. Router R1 receives static routing updates from routers A, B, C, and D. The network engineer wants R1 to advertise static routes in OSPF area 1. Which summary address must be advertised in OSPF?",
    options: [
    "10.1.41.0/25",
    "10.1.40.0/24",
    "10.1.40.0/25",
    "10.1.40.0/23"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1200",
    question: "Which type of IPv4 address must be assigned to a server to protect it from external access and allow only internal users access while restricting internet access?",
    options: [
    "private",
    "public",
    "global unicast",
    "multicast"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1201",
    question: "What differentiates the Cisco OfficeExtend AP mode from the Cisco FlexConnect AP mode?",
    options: [
    "FlexConnect allows a personal SSID to be configured on the AP, and personal SSIDs are not supported with OfficeExtend.",
    "OfficeExtend does not support DTLS tunneling of traffic to the WLC, and FlexConnect tunnels traffic to the WLC with DTLS.",
    "FlexConnect must be deployed behind a router that NATs the client traffic, and OfficeExtend uses public IP sources.",
    "OfficeExtend mode requires indoor APs with internal antennas, and indoor and outdoor APs use FlexConnect mode."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1202",
    question: "Refer to the exhibit. A network engineer is configuring a WLAN to connect with the 172.16.10.0/24 network on VLAN 20. The engineer wants to limit the number of devices that connect to the WLAN on the USERWL SSID to 125. Which configuration must the engineer perform on the WLC?",
    options: [
    "In the Controller IPv6 configuration, set the Throttle value to 125.",
    "In the WLAN configuration, set the Maximum Allowed Clients value to 125.",
    "In the Management Software activation configuration, set the Clients value to 125.",
    "In the Advanced configuration, set the DTIM value to 125."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1203",
    question: "Refer to the exhibit. An LACP EtherChannel between two directly connected switches is in the configuration process. Which command must be configured on switch SW2s Gi0/1-2 interfaces to establish the channel to SW1?",
    options: [
    "channel-group 1 mode on",
    "channel-group 1 mode desirable",
    "channel-group 1 mode active",
    "channel-group 1 mode auto"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1204",
    question: "Refer to the exhibit. An administrator must connect SW_1 and the printer to the network. SW_2 requires DTP to be used for the connection to SW_1. The printer is configured as an access port with VLAN 5. Which set of commands completes the connectivity?",
    options: [
    "switchport mode dynamic auto switchport private-vlan association host 5",
    "switchport mode trunk switchport trunk pruning vlan add 5",
    "switchport mode dynamic desirable switchport trunk allowed vlan add 5",
    "switchport mode dynamic auto switchport trunk encapsulation negotiate"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1205",
    question: "Refer to the exhibit. Which per-hop QoS behavior is R1 applying to incoming packets?",
    options: [
    "marking",
    "shaping",
    "queuing",
    "policing"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1206",
    question: "What is the role of the root port in a switched network?",
    options: [
    "It replaces the designated port when the designated port fails.",
    "It replaces the designated port when the root port fails.",
    "It is the best path to the root from a nonroot switch.",
    "It is administratively disabled until a failover occurs."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1207",
    question: "What is the temporary state that switch ports always enter immediately after the boot process when Rapid PVST+ is used?",
    options: [
    "forwarding",
    "listening",
    "learning",
    "discarding"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1208",
    question: "What is used to identify spurious DHCP servers?",
    options: [
    "DHCPACK",
    "DHCPREQUEST",
    "DHCPOFFER",
    "DHCPDISCOVER"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1209",
    question: "Refer to the exhibit. A packet sourced from 10.10.10.1 is destined for 172.16.3.254. What is the subnet mask of the destination route?",
    options: [
    "0.0.0.0",
    "255.255.254.0",
    "255.255.255.0",
    "255.255.255.255"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1210",
    question: "Refer to the exhibit. IPv6 must be implemented on R1 to the ISP. The uplink between R1 and the ISP must be configured with a manual assignment, and the LAN interface must be self-provisioned. Both connections must use the applicable IPv6 networks. Which two configurations must be applied to R1? (Choose two.)",
    options: [
    "interface Gi0/0 ipv6 address 2001:db8:0F1B:FCCB:ACCE:FCED:ABCD:FA03:/127",
    "interface Gi0/0 ipv6 address 2001:db8:0:AFFF::/64 eui-64",
    "interface Gi0/1 ipv6 address 2001:db8:0F1B:FCCB:ACCE:FCED:ABCD:FA02:/127",
    "interface Gi0/0 ipv6 address 2001:db8:1:AFFF::/64 eui-64",
    "interface Gi0/1 ipv6 address 2001:db8:0F1B:FCCB:ACCE:FCED:ABCD:FA00:/127"
    ],
    correct: [1, 4],
    exhibit: true,
  },
  {
    id: "q1211",
    question: "Refer to the exhibit. What does the host do when using the IPv4 Preferred function?",
    options: [
    "It forces the DNS server to provide the same IPv4 address at each renewal.",
    "It requests the same IPv4 address when it renews its lease with the DHCP server.",
    "It prefers a pool of addresses when renewing the IPv4 host IP address.",
    "It continues to use a statically assigned IPv4 address."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1212",
    question: "Refer to the exhibit. What is preventing host A from reaching the internet?",
    options: [
    "LAN and WAN network segments are different.",
    "The domain name server is unreachable.",
    "The default gateway should be the first usable IP address.",
    "IP address assignment is incorrect."
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1213",
    question: "What are two capabilities provided by VRRP within a LAN network? (Choose two.)",
    options: [
    "redundancy",
    "granular QoS",
    "load sharing",
    "dynamic routing updates",
    "bandwidth optimization"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q1214",
    question: "Which AP mode is used for capturing wireless traffic and forwarding that traffic to a PC that is running a packet analyzer?",
    options: [
    "bridge",
    "monitor",
    "rouge detector",
    "sniffer"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1215",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:d955:1008:12D8:BAFE:FF01:1",
    "2001:db8:d955:1008:4598:785F:FE25:1",
    "2001:db8:d955:1008:1030:ABFF:FECC:1",
    "2001:db8:d955:1008:10D8:BAFF:FEC2:1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1217",
    question: "Which components are contained within a virtual machine?",
    options: [
    "physical resources, including the NIC, RAM, disk, and CPU",
    "configuration files backed by physical resources from the Hypervisor",
    "applications running on the Hypervisor",
    "processes running on the Hypervisor and a guest OS"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1218",
    question: "Which interface IP address serves as the tunnel source for CAPWAP packets from the WLC to an AP?",
    options: [
    "service",
    "trunk",
    "AP-manager",
    "virtual AP connection"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1219",
    question: "What does a switch search for in the CAM table when forwarding a frame?",
    options: [
    "source MAC address and aging time",
    "destination MAC address and flush time",
    "source MAC address and source port",
    "destination MAC address and destination port"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1220",
    question: "Which port type does a lightweight AP use to connect to the wired network when configured in FlexConnect mode with local switching and VLAN tagging?",
    options: [
    "trunk",
    "LAG",
    "EtherChannel",
    "access"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1221",
    question: "Refer to the exhibit. PC A is communicating with another device at IP address 10.227.151.255. Through which router does router Y route the traffic?",
    options: [
    "router A",
    "router B",
    "router C",
    "router D"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1222",
    question: "Refer to the exhibit. VoIP is being implemented in the network using VLAN ID 73 and named \"VoIP\". Each user needs a Cisco IP phone at their desk. Switchport e0/0 has been configured as an access port in the data VLAN. Cisco Discovery Protocol is enabled globally. Which command sequence completed the configuration?",
    options: [
    "vlan73 name VoIP e0/0 switchport voice vlan dot1p",
    "vlan 73 name VoIP e0/0 switchport trunk allowed vlan 72,73 switchport voice vlan 73",
    "vlan 73 name VoIP e0/0 switchport mode trunk channel-group 73 mode active",
    "vlan 73 name VoIP e0/0 switchport voice vlan 73"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1223",
    question: "Refer to the exhibit. Which IP route command created the best path for a packet destined for 10.10.10.3?",
    options: [
    "ip route 10.10.0.0 255.255.252.0 g0/0 crossover",
    "ip route 10.10.10.0 255.255.255.240 g0/0 rollover",
    "ip route 10.0.0.0 255.0.0.0 g0/0 console",
    "ip route 10.10.10.1 255.255.255.255 g0/0 Q1224 Nachfragen Which cable type must be used when connecting a router and switch together using these criteria? • Pins 1 and 2 are receivers and pins 3 and 6 are transmitters. • Auto detection MDI-X is unavailable. straight-through"
    ],
    correct: [1, 0],
    exhibit: true,
  },
  {
    id: "q1226",
    question: "Which interface on the WLC is limited to one when LAG is in use?",
    options: [
    "service",
    "virtual",
    "trunk",
    "AP-manager"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1227",
    question: "Refer to the exhibit. A newly configured PC fails to connect to the internet by using TCP port 80 to www.cisco.com. Which setting must be modified for the connection to work?",
    options: [
    "Subnet Mask",
    "DNS Servers",
    "Default Gateway",
    "DHCP Servers •"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1229",
    question: "In what way does a network supervisor reduce maintenance costs while maintaining network integrity on a traditionally managed network?",
    options: [
    "They install an automated network-monitoring system to provide early warning of network issues.",
    "They employ additional network administrators to proactively manage the network.",
    "They use automation to centralize network-management tasks.",
    "They automate change-management processes that verify issue resolution."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1230",
    question: "Which type of wired port is required when an AP offers one unique SSID, passes client data and management traffic, and is in autonomous mode?",
    options: [
    "trunk",
    "default",
    "access",
    "LAG"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1231",
    question: "Refer to the exhibit. A network engineer must configure the WLC to allow only DHCP and DNS packets for User1 and User2. Which configuration must be used?",
    options: [
    "Enable Web Authentication for 802.1X standard in the Layer 2 Security configuration",
    "Enable Fallback Policy with MAC filtering under the Layer 3 Security configuration",
    "Enable Web policy and Authentication in the Layer 3 Security configuration.",
    "Enable Web Authentication under the AAA Server configuration on the WLAN."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1232",
    question: "Which connection type is used when an engineer connects to an AP without a configured IP address or dial-up number to manage the device?",
    options: [
    "AUX",
    "Ethernet",
    "VIY",
    "console"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1233",
    question: "What is a function of a firewall on an enterprise network?",
    options: [
    "It allows and denies ingress and egress traffic.",
    "It serves as a default gateway to hosts on the internet.",
    "It processes traffic based on stateless inspection.",
    "It acts as the intermediary device between the enterprise and its ISP."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1235",
    question: "What is a difference between an IPv6 multicast address and an IPv6 anycast address?",
    options: [
    "An IPv6 multicast address uses the prefix 2002::/15 and forwards to one destination, and an IPv6 anycast address uses the prefix ff00:/8 and forwards to any destination in a group.",
    "A packet sent to an IPv6 multicast address is delivered to one or more destinations at once, but a packet sent to an IPv6 anycast address is routed to the closest interface with that address.",
    "IPV6 multicast addresses are used to transition from IPv4 to IPv6, and IPv6 anycast addresses are used for address aggregation in an IPv6-only environment.",
    "An IPV6 multicast address is assigned to numerous interfaces within a subnet, but an IPv6 anycast address is used for a predefined group of nodes in an all-IPv6 routers group."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1236",
    question: "Which syslog message logging level displays interface line protocol up/down events?",
    options: [
    "informational",
    "alerts",
    "debugging",
    "notifications"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1237",
    question: "Which device protects an internal network from the Internet?",
    options: [
    "router",
    "firewall",
    "access point",
    "Layer 2 switch"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1238",
    question: "Which encryption mode is used when a packet is sent from a site-to-site VPN connection where the source and destination IP address portion of a packet is unencrypted?",
    options: [
    "PPTP",
    "Secure Shell",
    "Transport",
    "PPPoE"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1239",
    question: "What is a reason why an administrator would choose to implement an automated network management approach?",
    options: [
    "Enable \"box by box\" configuration and deployment.",
    "Decipher simple password policies.",
    "Reduce inconsistencies in the network configuration.",
    "Increase recurrent management costs."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1240",
    question: "Refer to the exhibit. The router R1 is in the process of being configured. Routers R2 and R3 are configured correctly for the new environment. Which two commands must be configured on R1 for PC1 to communicate to all PCs on the 10.10.10.0/24 network? (Choose two.)",
    options: [
    "ip route 10.10.10.0 255.255.255.0 192.168.2.3 ip route 10.10.10.10 255.255.255.255 192.168.2.2",
    "ip route 10.10.10.0 255.255.255.0 192.168.2.2 ip route 10.10.2.2 255.255.255.255 10.10.10.10",
    "ip route 10.10.10.0 255.255.255.0 192.168.2.3 ip route 10.10.10.8 255.255.255.252 g0/0",
    "ip route 10.10.10.0 255.255.255.248 192.168.2.2 ip route 10.10.2.8 255.255.255.252 g0/1"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1241",
    question: "Refer to the exhibit. A packet sourced from 172.18.33.2 is destined for 172.18.32.38. Where does the router forward the packet?",
    options: [
    "10.1.1.1",
    "10.1.1.3",
    "Loopback0",
    "GigabitEthernet0/0"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1242",
    question: "Refer to the exhibit. An administrator is configuring a new WLAN for a wireless network that has these requirements: • Dual-band clients that connect to the WLAN must be directed to the 5-GHz spectrum. • Wireless clients on this WLAN must be able to apply VLAN settings on the returned RADIUS attributes. Which two actions meet these requirements? (Choose two.)",
    options: [
    "Enable the Client Band Select option.",
    "Enable the Coverage Hole Detection option.",
    "Enable the Allow AAA Override option.",
    "Set the MFP Client Protection option to Required.",
    "Enable the Aironet IE option"
    ],
    correct: [0, 2],
    exhibit: true,
  },
  {
    id: "q1244",
    question: "Which type of protocol is VRRP?",
    options: [
    "allows two or more routers to act as a default gateway",
    "uses Cisco-proprietary First Hop Redundancy Protocol",
    "uses a destination IP address 224.0.0.102 for router-to-router communication",
    "uses dynamic IP address assignment"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1245",
    question: "Refer to the exhibit. The switch cat9k-acc-1 connects users to the campus LAN. Printing services are inaccessible through the network. Which interface issue is causing the connectivity problems?",
    options: [
    "A bad checksum is causing Ethernet frames to drop.",
    "Excessive collisions are causing dropped frames.",
    "A large number of broadcast packets are resulting in a port reset.",
    "The interface output queue cannot process the Ethernet frames."
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1246",
    question: "Which standard is required when more than one distribution system port and only one IP address are configured for a Cisco WLC?",
    options: [
    "802.3ad",
    "802.1q",
    "802.1d",
    "802.1af"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1247",
    question: "Which capability does TFTP provide?",
    options: [
    "loads configuration files on systems without data storage devices",
    "provides authentication for data communications over a private data network",
    "provides encryption mechanisms for file transfer across a WAN",
    "provides secure file access within the LAN"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1248",
    question: "Which action protects a network from VLAN hopping attacks?",
    options: [
    "Implement port security on internet-facing VLANs.",
    "Change the native VLAN to an unused VLAN ID.",
    "Enable dynamic ARP inspection.",
    "Configure an ACL to prevent traffic from changing VLANs."
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1249",
    question: "What should a network administrator consider when deciding to implement automation?",
    options: [
    "Automated systems may have difficulty expanding network changes at scale.",
    "Network automation typically is limited to the configuration and management of virtual devices within a network.",
    "Network automation typically increases enterprise management operating costs.",
    "Manual changes frequently lead to configuration errors and inconsistencies."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1250",
    question: "Company has decided to require multifactor authentication for all systems. Which set of parameters meets the requirement?",
    options: [
    "personal 10-digit PIN and RSA certificate",
    "complex password and personal 10-digit PIN",
    "password of 8 to 15 characters and personal 12-digit PIN",
    "fingerprint scanning and facial recognition"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1251",
    question: "How does IPsec provide secure networking for applications within an organization?",
    options: [
    "It takes advantage of FTP to secure file transfers between nodes on the network.",
    "It provides GRE tunnels to transmit traffic securely between network nodes.",
    "It enables sets of security associations between peers.",
    "It leverages TFTP providing secure file transfers among peers on the network."
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1253",
    question: "What is a characteristic of frame switching?",
    options: [
    "populates the ARP table with the egress port",
    "drops received MAC addresses not listed in the address table",
    "stores and forwards frames in a buffer and uses error checking",
    "rewrites the source and destination MAC address"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1254",
    question: "",
    options: [
    "value",
    "array",
    "object",
    "key"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1259",
    question: "Which interface condition is occurring in this output?",
    options: [
    "broadcast storm",
    "queueing",
    "bad NIC",
    "duplex mismatch"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1261",
    question: "What is represented in line 3 within this JSON schema?",
    options: [
    "object",
    "key",
    "value",
    "array"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1262",
    question: "How does MAC learning function?",
    options: [
    "restricts ports to a maximum of 10 dynamically-learned addresses",
    "increases security on the management VLAN",
    "drops received MAC addresses not listed in the address table",
    "associates the MAC address with the port on which it is received"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1264",
    question: "How does MAC learning function?",
    options: [
    "enabled by default on all VLANs and interfaces",
    "increases security on the management VLAN",
    "sends frames with unknown destinations to a multicast group",
    "inspects and drops frames from unknown destinations"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1265",
    question: "What is a characteristic of a Layer 2 switch?",
    options: [
    "provides a single broadcast domain for all connected devices",
    "tracks the number of active TCP connections",
    "offers one collision domain for all connected devices",
    "makes forwarding decisions based on MAC addresses"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1268",
    question: "Which two tasks support the physical access control element of a security program? (Choose two.)",
    options: [
    "Deploy a video surveillance system",
    "Run a workshop on corporate security policies",
    "Implement badge access to critical locations",
    "Develop slideshows about new security regulations",
    "Disperse information about how to protect the organization's confidential data"
    ],
    correct: [0, 2],
    exhibit: false,
  },
  {
    id: "q1269",
    question: "Refer to the exhibit The IPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:bd69:1469:12D8:BAFE:FF01:1",
    "2001:db8:bd69:1469:1130:ABFF:FECC:1",
    "2001:db8:bd69:1469:4628:255F:FE32:1",
    "2001:db8:bd69:1469:11BE:BFFF:FEB9:1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1270",
    question: "What is a characteristic of encryption in wireless networks?",
    options: [
    "used to ensure data integrity",
    "uses 802.1x as the standard encoding method",
    "uses protocols such as TKIP and CCMP to secure data",
    "only works with the 5Ghz frequency"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1273",
    question: "Refer to the exhibit. Which switch becomes the root bridge?",
    options: [
    "SW 1 - Bridge Priority - 61440 - mac-address 00:10:a1:69:c9:28",
    "SW2 - Bndge Priority - 61440 - mac address 00:10:a1:27:81:6c",
    "SW 3 - Bridge Priority - 53248 - mac-address 00:10:a1:35:d9:86",
    "SW 4 - Bridge Priority 53248 - mac-address 00:10:a1:22:11:63"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1274",
    question: "Refer to the exhibit. PC A is communicating with another device at IP address 10.225.34.225. Through which router does router Y route the traffic?",
    options: [
    "router A",
    "router B",
    "router C",
    "router D"
    ],
    correct: 2,
    exhibit: true,
  },
  {
    id: "q1276",
    question: "Which interface is used to send traffic to the destination network?",
    options: [
    "G0/6",
    "G0/3",
    "G0/16",
    "G0/23"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1278",
    question: "Which is a fact related to FTP?",
    options: [
    "It uses two separate connections for control and data traffic.",
    "It uses block numbers to identify and mitigate data-transfer errors.",
    "It always operates without user authentication.",
    "It relies on the well-known UDP port 69."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1279",
    question: "Refer to the exhibit. What is the cause of the issue?",
    options: [
    "shutdown command",
    "wrong cable type",
    "STP",
    "port security"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1280",
    question: "PC1 tries to send traffic to newly installed PC2. The PC2 MAC address is not listed in the MAC address table of the switch, so the switch sends the packet to all ports in the same VLAN. Which switching concept does this describe?",
    options: [
    "frame flooding",
    "MAC address table",
    "spanning-tree protocol",
    "MAC address aging"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1281",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R1 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:3bb8:3bb1:C810:B3FF:FF8B:1",
    "2001:db8:3bb8:3bb1:C001:3BFE:FF81:1",
    "2001:db8:3bb8:3bb4:6363:93FF:EF66:1",
    "2001:db8:3bb8:3bb1:C801:B3FF:FEB8:1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1283",
    question: "What is a characteristic of a Layer 2 switch?",
    options: [
    "transfers all frames received to every connected device",
    "offers one collision domain for all connected devices",
    "transmits exclusively at half duplex",
    "supports segmentation using tagging protocols"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1287",
    question: "Which cable type must be used when connecting two like devices together using these criteria? • Pins 1 to 3 and 2 to 6 are required. • Auto detection MDI-X is unavailable.",
    options: [
    "straight-through",
    "console",
    "crossover",
    "rollover"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1288",
    question: "What is a characteristic of an SSID in wireless networks?",
    options: [
    "allows easy file sharing between endpoints",
    "provides protection against spyware",
    "associates a name to a wireless network",
    "eliminates network piggybacking"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1288",
    question: "Which selections must be used on the WLC when implementing a RADIUS server for wireless authentication?",
    options: [
    "Client Exclusion and SSH",
    "Network Access Control State and SSH",
    "AAA Override and the IP address of the server",
    "802.1x and the MAC address of the server"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1290",
    question: "Which port-security violation mode drops traffic from unknown MAC addresses and forwards an SNMP trap?",
    options: [
    "shutdown VLAN",
    "protect",
    "restrict",
    "shutdown"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1291",
    question: "What is the purpose of an ESSID?",
    options: [
    "It allows multiple access points to provide a common network for client connections.",
    "It supports fast roaming features such as 802.11 r, 802.11k, and 802.11v.",
    "It serves as the wireless MAC address of the access point.",
    "It provides greater security than a standard SSID."
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1294",
    question: "Refer to the exhibit. Which switch becomes the root bridge?",
    options: [
    "SW 1 - Bridge Priority - 20480 - mac-address 00:10:a1:71 :e3:35",
    "SW 2 - Bridge Priority - 20480 - mac-address 00:10:a1:54:4e:50",
    "SW 3 - Bridge Priority - 57344 - mac-address 00:10:a1:93:09:2d",
    "SW 4 - Bridge Priority - 57344 - mac-address 00:10:a1:57:61:80"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1296",
    question: "Which interface condition is occurring in this output?",
    options: [
    "bad NIC",
    "broadcast storm",
    "duplex mismatch",
    "high throughput"
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1315",
    question: "A DHCP pool has been created with the name NOCC. The pool is using 192.168.20.0/24 and must use the next to last usable IP address as the default gateway for the DHCP clients. What is the next step in the process?",
    options: [
    "next-server 192.168.20.254",
    "network 192.168.20.254 255.255.255.0 secondary",
    "default-router 192.168.20.253",
    "ip default-gateway 0.0.0.0 0.0.0.0 192.168.20.253"
    ],
    correct: 2,
    exhibit: false,
  },
  {
    id: "q1320",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R1 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:1a44:41a4:C081:BFFF:FE4A:1",
    "2001:db8:1a44:41a4:C801:BEFF:FE4A:1",
    "2001:db8:1a44:41a4:4660:592F:FE65:1",
    "2001:db8:1a44:41a4:C800:BAFE:FF00:1"
    ],
    correct: 1,
    exhibit: true,
  },
  {
    id: "q1321",
    question: "What does a router do when it is configured with the default DNS lookup settings, and a URL is entered on the CLI?",
    options: [
    "It continuously attempts to resolve the URL until the command is cancelled.",
    "It initiates a ping request to the URL.",
    "It prompts the user to specify the desired IP address.",
    "It attempts to query a DNS server on the network."
    ],
    correct: 3,
    exhibit: false,
  },
  {
    id: "q1322",
    question: "How does MAC learning function?",
    options: [
    "overwrites the known source MAC address in the address table",
    "enabled by default on all VLANs and interfaces",
    "protects against denial of service attacks",
    "forwards frames to a neighbor port using CDP"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1324",
    question: "How does MAC learning function?",
    options: [
    "sends a retransmission request when a new frame is received",
    "enabled by default on all VLANs and interfaces",
    "populates the ARP table with the egress port",
    "protects against denial of service attacks"
    ],
    correct: 1,
    exhibit: false,
  },
  {
    id: "q1326",
    question: "What is a characteristic of frame switching?",
    options: [
    "performs a lookup to learn the destination interface",
    "disabled by default on all interfaces and VLANs",
    "buffers and forwards frames with less than 5 CRCs",
    "protects against denial of service attacks"
    ],
    correct: 0,
    exhibit: false,
  },
  {
    id: "q1330",
    question: "Refer to the exhibit. The IPv6 address for the LAN segment on router R2 must be configured using the EUI-64 format. When configured which ipv6 address is produced by the router?",
    options: [
    "2001:db8:9bb6:6bb9:C081:B6FF:FF4B:1",
    "2001:db8:9bb6:6bb9:C001:6BFE:FF01:1",
    "2001:db8:9bb6:6bb9:4679:824F:FE88:1",
    "2001:db8:9bb6:6bb9:C801:B6FF:FEB8:1"
    ],
    correct: 3,
    exhibit: true,
  },
  {
    id: "q1339",
    question: "Refer to the exhibit. PC1 regularly sends 1800 Mbps of traffic to the server. A network engineer needs to configure the EtherChannel to disable Port Channel 1 between SW1 and SW2 when the Ge0/0 and Ge0/1 ports on SW2 go down. Which configuration must the engineer apply to the switch?",
    options: [
    "SW2# configure terminal - SW2(config)# interface port-channel 4 SW2(config-if)# port-channel min-links 2",
    "SW2# configure terminal - SW2(config)# interface port-channel 4 SW2(config-if)# lacp port-priority 32000",
    "SW2# configure terminal - SW2(config)# interface port-channel 4 SW2(config-if)# lacp max-bundle 2",
    "SW2# configure terminal - SW2(config)# lacp system-priority 32000"
    ],
    correct: 0,
    exhibit: true,
  },
  {
    id: "q1340",
    question: "An administrator is configuring a Cisco Catalyst switch so that it will accept management connections only from hosts in the 203.0.113.0/24 network. Other traffic passing through the switch must transit without interruption. Which two configurations must the engineer apply to the router? (Choose two.)",
    options: [
    "interface range vlan 1 - 4094 ip access-group Management out",
    "line vty 0 15 access-class Management in",
    "ip access-list standard Management permit 203.0.113.0 0.0.0.255",
    "ip access-list standard Management permit 203.0.113.0 255.255.255.0",
    "ip access-list extended Management permit tcp any range 22 23 203.0.113.0 0.0.0.255"
    ],
    correct: [1, 2],
    exhibit: false,
  },
  {
    id: "q1349",
    question: "What are two reasons to implement DHCP in a network? (Choose two.)",
    options: [
    "manually control and configure IP addresses on network devices",
    "control the length of time an IP address is used by a network device",
    "reduce administration time in managing IP address ranges for clients",
    "dynamic control over the best path to reach an IP address",
    "access a website by name instead of by IP address"
    ],
    correct: [1, 2],
    exhibit: false,
  }
];

// Hilfsfunktionen
export const getTextOnlyQuestions = () =>
  ccnaQuestions.filter(q => !q.exhibit);

export const getExhibitQuestions = () =>
  ccnaQuestions.filter(q => q.exhibit);

export const getChooseTwoQuestions = () =>
  ccnaQuestions.filter(q => Array.isArray(q.correct));