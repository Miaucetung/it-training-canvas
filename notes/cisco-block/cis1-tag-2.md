OSI-Schicht 4
TCP und UDP
Drei Wege Handshake

TCP ist Verbindungsorientiert und garantiert die Zustellung der Daten, da jedes Segment mit einem ACK bestätigt wird. Kommt ein ACK nicht innerhalb eines Zeitraumes, so wird dieses fehlende Segment erneut angefordert. TCP eignet sich deshalb zum verschicken von großen Dateien und wenn die Zustellung garantiert sein muss.

UDP
UDP verbindungslos und schickt die Daten einfach raus. Eine Bestätigung, das die Daten angekommen sind gibt es nicht. Es findet auch kein Windowing statt.

UDP ist sehr schnell und findet deswegen seine Anwendung in der Übertragung von Daten in Echtzeit. Hierbei muss die Anwendung eine gewissen Prozentsatz an Paketverlust eventuell hinnehmen.

IP
Sitzt auf OSI-Schicht 3 und hat als Nachrichtenbote das Protokoll ICMP. Dier IP-Adresse ist eine 32 Bit-Adresse die einen Host/Client im Netzwerk spezifiziert. Dabei besteht eine IPv4 Adresse aus 2 Teilen:

- Netzwerkanteil
- Hostanteil
  Um diese 2 Teile zu identifizieren nutzt man die Subnetmaske. Beispiel:
  Ip-Adresse 192.168.1.20 Subnetmaske 255.255.255.0
  2^7 2^6 2^5 2^4 2^3 2^2 2^1 2^0
  128 64 32 16 8 4 2 1
  11000000.10101000.00000001.00010100
  11111111.11111111.11111111.00000000 -> Subnetmaske
  11000000.10101000.00000001.000000000
  192.168.1.0 -> Netzwerk-ID
  11000000.10101000.00000001.11111111
  192.168.1.255 - > Broadcast
  Und alles was zwischen der Netz-ID und der Broadcast-Adresse kann ich einem Client/Host zuweisen
  192.1681.0 192.168.1.1 bis 192.168.1.254 Host 192.168.1.255 Broadcast

RFC 1918:
Klasse A 10.0.0.0 bis 10.255.255.255 private Bereich
Klasse B 172.16.0.0 bis 172.31.255.255 private Bereich
Klasse C 192.168.0.0 bis 192.168.255.255 private Bereich

Subnetmaske 255.255.255.0 in Binär 4 Ip´s
11111111.11111111.11111111.11111100
255.255.255.252

Bitte schreiben Sie die IP-Adressen in der binären Schreibweise und geben Sie an, zu welcher Klasse (A, B, C) diese gehören.
Hinweis: In der Prüfung haben Sie leider nicht die Möglichkeit einen Taschenrechner zu benutzen, deshalb sollten Sie diese Aufgaben auch ohne Hilfsmittel versuchen zu lösen.

1.  IP-Adresse 101 29 16 200
    binäre
    Klasse

2.  IP-Adresse 172 20 0 39
    binäre
    Klasse

3.  IP-Adresse 212 14 154 0
    Binäre
    Klasse

4.  IP-Adresse 25 246 133 37
    Binäre
    Klasse

5.  IP-Adresse 128 2 229 1
    Binäre
    Klasse

6.  IP-Adresse 192 168 5 254
    binäre
    Klasse

7.  IP-Adresse 185 138 123 40
    binäre
    Klasse

8.  IP-Adresse 223 255 199 80
    binäre
    Klasse

9.  IP-Adresse 203 7 224 240
    binäre
    Klasse

10. IP-Adresse 198 162 13 252
    binäre
    Klasse

11. IP-Adresse 19 249 83 75
    binäre
    Klasse

12. IP-Adresse 95 127 11 239
    binäre
    Klasse

13. IP-Adresse 224 0 0 5
    binäre
    Klasse

14. IP-Adresse 134 78 45 227
    binäre
    Klasse

15. IP-Adresse 245 72 189 160
    binäre
    Klasse

16. IP-Adresse 145 23 12 24
    binäre
    Klasse

17. IP-Adresse 42 36 53 234
    binäre
    Klasse

Ermitteln Sie zu welchem Subnetz die IP-Adresse gehört und geben Sie den gültigen
IP-Adressbereich, sowie die Broadcast-Adresse an.

1.       dezimal	binär

    Adresse 212.15.12.120 110101100.00001111.00001100.01111000
    Subnet-Mask 255.255.255.240 111111111.11111111.11111111.11110000
    Subnetz 212.15.12.112 110101100.00001111.00001100.01110000
    Broadcast 212.15.12.127 110101100.00001111.00001100.01111111
    IP-Adressbereich 212.15.12.113 bis 212.15.12.126

2.       dezimal	binär

    Adresse 199.1.7.17 11000111.00000001.00000111.00010001
    Subnet-Mask 255.255.255.248 11111111.11111111.11111111.11111000
    Subnetz 199.1.7.16 11000111.00000001.00000111.00010000
    Broadcast 199.1.7.23 11000111.00000001.00000111.00010111
    IP-Adressbereich

3.       dezimal	binär

    Adresse 172.16.32.64
    Subnet-Mask 255.255.255.224
    Subnetz
    Broadcast
    IP-Adressbereich

4.       dezimal	binär

    Adresse 130.198.3.245
    Subnet-Mask 255.255.255.192
    Subnetz
    Broadcast
    IP-Adressbereich

5.       dezimal	binär

    Adresse 45.67.123.253
    Subnet-Mask 255.255.128.0
    Subnetz
    Broadcast
    IP-Adressbereich

6.       dezimal	binär

    Adresse 192.168.11.123
    Subnet-Mask 255.255.255.252
    Subnetz
    Broadcast
    IP-Adressbereich

7.       dezimal	binär

    Adresse 178.21.45.87
    Subnet-Mask 255.255.255.224
    Subnetz
    Broadcast
    IP-Adressbereich

8.       dezimal	binär

    Adresse 222.34.98.5
    Subnet-Mask 255.255.255.240
    Subnetz
    Broadcast
    IP-Adressbereich

9.       dezimal	binär

    Adresse 10.12.2.6
    Subnet-Mask 255.248.0.0
    Subnetz
    Broadcast
    IP-Adressbereich

10.     dezimal	binär
    Adresse 155.23.83.29
    Subnet-Mask 255.255.254.0
    Subnetz
    Broadcast
    IP-Adressbereich
