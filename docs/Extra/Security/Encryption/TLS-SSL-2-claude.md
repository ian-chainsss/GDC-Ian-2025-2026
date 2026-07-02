# Onderzoek naar encryptie bij TLS/SSL

In dit bestand wordt er onderzoek gedaan naar de encryptie die gebruikt wordt bij TLS/SSL. Ook de protocollen zelf worden besproken, inclusief de verschillende versies van het protocol, de gebruikte algoritmes en hun beveiligingsaspecten.

---

## Wat is TLS & SSL en hoe werkt het?

**SSL (Secure Sockets Layer)** en **TLS (Transport Layer Security)** zijn cryptografische protocollen die een beveiligde communicatielaag opzetten tussen twee partijen over een netwerk — typisch een client (browser) en een server (website).

Ze zorgen voor drie fundamentele garanties:
- **Vertrouwelijkheid** — de uitgewisselde data wordt versleuteld zodat tussenpersonen niets kunnen lezen.
- **Integriteit** — de data kan onderweg niet onopgemerkt worden gewijzigd.
- **Authenticatie** — de client kan verifiëren dat hij communiceert met de juiste server (via een digitaal certificaat).

TLS werkt als een laag bovenop transportprotocollen zoals TCP. De communicatie verloopt in twee fases:
1. **Handshake** — sleuteluitwisseling, authenticatie en onderhandeling over algoritmes.
2. **Record protocol** — het eigenlijke beveiligde datatransport met behulp van symmetrische encryptie.

---

## Waarvoor wordt TLS & SSL gebruikt en waarom is het belangrijk?

TLS wordt gebruikt overal waar veilige communicatie over een onbetrouwbaar netwerk (zoals het internet) vereist is:

- **HTTPS** — beveiligde websites (de meest bekende toepassing)
- **E-mail** (SMTP over TLS, IMAP/POP3 over TLS)
- **API-communicatie** — o.a. REST APIs, inclusief de FastAPI-applicaties in dit project
- **VPN-verbindingen**
- **Bestandsoverdracht** (FTPS, SFTP)
- **Databaseverbindingen** (bijv. PostgreSQL met TLS)

TLS is essentieel omdat het beschermt tegen:
- **Afluisteren (eavesdropping)** — passieve aanvallers op het netwerk kunnen geen plaintext lezen.
- **Man-in-the-Middle (MitM) aanvallen** — de server authenticeert zich via een certificaat, waardoor impersonatie bemoeilijkt wordt.
- **Datavervalsing** — de MAC/AEAD-constructie detecteert elke manipulatie van de data.

Zonder TLS zouden alle gevoelige gegevens (wachtwoorden, sessietokens, persoonsgegevens) in plaintext over het netwerk verstuurd worden — een triviaal aanvalsdoel.

---

## De verschillen en gelijkenissen tussen TLS en SSL

| Kenmerk | SSL | TLS |
|---|---|---|
| Opvolger van | — | SSL 3.0 |
| Eerste versie | SSL 2.0 (1995) | TLS 1.0 (1999) |
| Status (2026) | Volledig deprecated | TLS 1.2+ actief in gebruik |
| Ontwerp | Netscape | IETF (open standaard) |
| Handshake-beveiliging | Zwakker (MD5/SHA-1) | Sterker (SHA-256+) |
| AEAD-ondersteuning | Nee | Ja (TLS 1.2+) |
| 0-RTT herstelverbinding | Nee | Ja (TLS 1.3) |

**Gelijkenissen:**
- Beiden werken met een handshake gevolgd door een beveiligde datatransportfase.
- Beiden gebruiken certificaten (X.509) voor serverauthenticatie.
- Beiden combineren asymmetrische encryptie (voor sleuteluitwisseling) met symmetrische encryptie (voor data).

In de praktijk wordt de term "SSL" nog steeds informeel gebruikt (bijv. "SSL-certificaat"), maar technisch gezien is alles wat vandaag gebruikt wordt TLS.

---

## Wat hebben TLS & SSL te maken met encryptie?

TLS is in essentie een **gelaagde toepassing van cryptografie**. Het combineert verschillende soorten encryptie uit de algoritme-lijst:

### 1. Asymmetrische encryptie — voor de handshake
Tijdens de handshake wordt asymmetrische cryptografie gebruikt voor:
- **Sleuteluitwisseling** — ECDH of Diffie-Hellman om een gedeeld geheim (pre-master secret) te berekenen zonder dat dit over het netwerk verstuurd wordt. Zie `lijst.md` → ECDH / Diffie-Hellman.
- **Serverauthenticatie** — de server toont zijn identiteit via een digitaal certificaat, ondertekend met RSA, ECDSA of Ed25519. Zie `lijst.md` → RSA / ECDSA / Ed25519.

### 2. Symmetrische encryptie — voor het datatransport
Eens de handshake voltooid is, wordt alle data versleuteld met een snel symmetrisch algoritme:
- **AES-GCM** (meest gebruikt in TLS 1.2 en 1.3) — AES in AEAD-modus.
- **ChaCha20-Poly1305** — alternatief voor hardware zonder AES-versnelling. Zie `lijst.md` → ChaCha20-Poly1305.

### 3. Hashing & integriteit — voor authenticatie van data
- **HMAC** (TLS 1.2 en lager) — berekend over elk record met SHA-256 of SHA-384. Zie `lijst.md` → HMAC.
- **AEAD** (TLS 1.3) — integriteit is ingebakken in het encryptie-algoritme zelf (GCM/Poly1305), HMAC is niet meer apart nodig.

### 4. Hashing — voor certificaten en handshake-integriteit
- SHA-256 / SHA-384 worden gebruikt voor het hashen van de handshake-transcript en in certificaathandtekeningen. Zie `lijst.md` → SHA-2 familie.

---

## De verschillende versies/generaties van TLS & SSL en hun kenmerken

### SSL 2.0 (1995) — **Deprecated, onveilig**
- Eerste publieke versie, ontwikkeld door Netscape.
- Ernstige kwetsbaarheden: zwakke MAC, hergebruik van sleutels mogelijk, geen bescherming tegen protocol-downgrade.
- Verboden door RFC 6176 (2011).

### SSL 3.0 (1996) — **Deprecated, onveilig**
- Grote herziening van SSL 2.0.
- Nog steeds kwetsbaar: POODLE-aanval (2014) maakt SSL 3.0 volledig onbruikbaar.
- Verboden door RFC 7568 (2015).

### TLS 1.0 (1999) — **Deprecated (sinds 2021)**
- Gebaseerd op SSL 3.0, eerste versie onder IETF-beheer.
- Kwetsbaar voor BEAST en POODLE (CBC-mode problematiek).
- Verouderd; PCI DSS en moderne browsers weigeren TLS 1.0.

### TLS 1.1 (2006) — **Deprecated (sinds 2021)**
- Verbeterde IV-behandeling voor CBC-mode.
- Nog steeds zwakke cipher suites toegestaan.
- Deprecated door RFC 8996 (2021).

### TLS 1.2 (2008) — **Actief, veilig bij correcte configuratie**
- Introductie van AEAD-ciphers (AES-GCM).
- SHA-256 verplicht in de PRF (Pseudo-Random Function).
- Ondersteuning voor ECDH en ECDSA.
- Nog steeds de dominante versie in 2026 door brede compatibiliteit.
- Risico bij slechte configuratie: verouderde cipher suites (RC4, 3DES) kunnen nog onderhandeld worden.

### TLS 1.3 (2018) — **Actief, aanbevolen**
- Complete herontwerp: verouderde en zwakke algoritmes volledig verwijderd.
- Snellere handshake: 1-RTT (één rondreis) in plaats van 2-RTT.
- 0-RTT herstelverbinding voor terugkerende clients (met replay-risico).
- Alleen nog AEAD-ciphers toegestaan: AES-GCM en ChaCha20-Poly1305.
- Perfect Forward Secrecy (PFS) verplicht — ephemere sleutels bij elke sessie.
- RSA voor sleuteluitwisseling volledig verwijderd.

---

## De evolutie van TLS & SSL door de jaren heen

```
1995  SSL 2.0 — eerste poging, ernstige fouten
1996  SSL 3.0 — grote verbetering, maar later gebroken
1999  TLS 1.0 — IETF-standaard, gebaseerd op SSL 3.0
2006  TLS 1.1 — kleine fixes voor CBC-aanvallen
2008  TLS 1.2 — AEAD, SHA-256, ECC — de moderne baseline
2014  POODLE-aanval → SSL 3.0 definitief afgeschreven
2015  RFC 7568: SSL 3.0 verboden
2016  DROWN-aanval → SSL 2.0 servers bedreigen ook TLS-servers
2018  TLS 1.3 — radicale vereenvoudiging en versterking
2021  RFC 8996: TLS 1.0 en 1.1 deprecated
2023  Browsers en servers schakelen massaal over naar TLS 1.3
2026  TLS 1.3 is de standaard; post-quantum hybride modes in opkomst
```

De trend is duidelijk: elke versie verwijdert zwakke algoritmes en vereenvoudigt de protocolopties om de aanvalsoppervlakte te verkleinen.

---

## De gebruikte encryptie-algoritmes en hun sterkte

TLS gebruikt **cipher suites** — gestandaardiseerde combinaties van algoritmes. Elke cipher suite beschrijft: sleuteluitwisseling + authenticatie + symmetrische encryptie + hashfunctie.

### TLS 1.2 — voorbeelden

| Cipher Suite | Sleuteluitwisseling | Authenticatie | Encryptie | Hash |
|---|---|---|---|---|
| `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` | ECDHE | RSA | AES-256-GCM | SHA-384 |
| `TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256` | ECDHE | ECDSA | ChaCha20-Poly1305 | SHA-256 |
| `TLS_RSA_WITH_AES_128_CBC_SHA` | RSA (statisch) | RSA | AES-128-CBC | SHA-1 — **vermijden** |

### TLS 1.3 — toegestane cipher suites (sterk vereenvoudigd)

| Cipher Suite | Encryptie | Hash |
|---|---|---|
| `TLS_AES_256_GCM_SHA384` | AES-256-GCM | SHA-384 |
| `TLS_AES_128_GCM_SHA256` | AES-128-GCM | SHA-256 |
| `TLS_CHACHA20_POLY1305_SHA256` | ChaCha20-Poly1305 | SHA-256 |

In TLS 1.3 is de sleuteluitwisseling altijd ephemeer (ECDHE of DHE) en staat dit niet meer in de naam van de cipher suite.

### Koppeling aan `lijst.md`

| Algoritme (lijst.md) | Rol in TLS |
|---|---|
| AES | Symmetrische datacryptie (AES-GCM in TLS 1.3) |
| ChaCha20-Poly1305 | Alternatieve AEAD-cipher in TLS 1.2/1.3 |
| RSA | Serverauthenticatie (certificaat), sleuteluitwisseling (TLS 1.2 oud) |
| ECDH / ECDHE | Ephemere sleuteluitwisseling (TLS 1.2+) |
| ECDSA | Serverauthenticatie via certificaat |
| Ed25519 | Serverauthenticatie (moderne certificaten) |
| SHA-2 (SHA-256/384) | Handshake-integriteit, certificaathandtekeningen, PRF |
| HMAC + SHA-256 | Data-authenticatie in TLS 1.2 MAC-record |
| Diffie-Hellman | Sleuteluitwisseling (klassiek; vervangen door ECDHE) |
| Kyber (ML-KEM) | Post-quantum hybride sleuteluitwisseling (in opkomst, TLS 1.3) |

---

## De verschillende protocollen gebruikt bij TLS & SSL

TLS bestaat intern uit meerdere subprotocollen:

### Handshake Protocol
Verantwoordelijk voor:
- Onderhandelen van de protocol- en cipher suite-versie.
- Uitwisselen van certificaten en authenticatie.
- Genereren van gedeelde sessiesleutels via sleuteluitwisseling.

### Record Protocol
Het eigenlijke transportprotocol:
- Ontvangt data van de applicatielaag.
- Fragmenteert, comprimeert (optioneel, afgeraden wegens CRIME-aanval) en versleutelt elk record.
- Elk record bevat een header (type, versie, lengte) en de versleutelde payload.

### Alert Protocol
Verstuurt foutmeldingen en waarschuwingen:
- `close_notify` — normale afsluiting van de verbinding.
- `bad_certificate` — ongeldig certificaat.
- `decrypt_error` — decryptie mislukt.
- Fatale alerts beëindigen de verbinding onmiddellijk.

### Change Cipher Spec Protocol (TLS 1.2 en lager)
Signaleert de overgang van onbeveiligd naar beveiligd. Verwijderd in TLS 1.3.

---

## De opbouw en werking van TLS & SSL

### TLS 1.2 Handshake (vereenvoudigd, 2-RTT)

```
Client                                    Server
  |                                          |
  |--- ClientHello -----------------------> |
  |    (versie, random, cipher suites)      |
  |                                          |
  |<-- ServerHello ------------------------ |
  |    (gekozen cipher suite, random)       |
  |<-- Certificate ----------------------- |
  |    (servercertificaat + keten)          |
  |<-- ServerHelloDone ------------------- |
  |                                          |
  |--- ClientKeyExchange ----------------> |
  |    (pre-master secret, versleuteld)     |
  |--- ChangeCipherSpec ----------------> |
  |--- Finished -------------------------> |
  |    (hash van volledige handshake)       |
  |                                          |
  |<-- ChangeCipherSpec ------------------ |
  |<-- Finished -------------------------- |
  |                                          |
  |=== Beveiligde datacommunicatie ======= |
```

### TLS 1.3 Handshake (1-RTT)

```
Client                                    Server
  |                                          |
  |--- ClientHello -----------------------> |
  |    (versie, random, key_share,          |
  |     cipher suites)                      |
  |                                          |
  |<-- ServerHello ------------------------ |
  |    (key_share, gekozen cipher suite)    |
  |<-- {EncryptedExtensions} ------------- |
  |<-- {Certificate} --------------------- |
  |<-- {CertificateVerify} --------------- |
  |<-- {Finished} ------------------------ |
  |                                          |
  |--- {Finished} -----------------------> |
  |                                          |
  |=== Beveiligde datacommunicatie ======= |
```

In TLS 1.3 verloopt de handshake in **één rondreis** — de client stuurt al meteen zijn key share mee, zodat de server direct kan antwoorden met versleutelde berichten.

### Sleutelafleiding (Key Derivation)

Na de sleuteluitwisseling wordt het gedeelde geheim niet rechtstreeks als sessiesleutel gebruikt. Een **KDF (Key Derivation Function)** leidt hieruit meerdere sleutels af:
- Client write key (voor client → server encryptie)
- Server write key (voor server → client encryptie)
- IV's (initialization vectors)

In TLS 1.3 gebruikt men **HKDF** (HMAC-based Key Derivation Function) met SHA-256 of SHA-384.

### Perfect Forward Secrecy (PFS)

Bij ephemere sleuteluitwisseling (ECDHE) worden tijdelijke sleutelparen aangemaakt die na de sessie worden weggegooid. Zelfs als de privésleutel van de server later wordt gecompromitteerd, kunnen oude opgenomen sessies niet ontsleuteld worden.

TLS 1.3 verplicht PFS. TLS 1.2 ondersteunt het maar vereist het niet.

---

## De beveiligingsrisico's en kwetsbaarheden van TLS & SSL

### Aanvallen op verouderde versies

| Aanval | Getroffen versie | Beschrijving |
|---|---|---|
| **POODLE** | SSL 3.0, TLS 1.0 (CBC) | Padding oracle via downgrade naar SSL 3.0 |
| **BEAST** | TLS 1.0 | CBC-aanval via voorspelbare IV's |
| **CRIME** | TLS 1.2 (compressie) | Info-lek via compressie van versleutelde data |
| **BREACH** | HTTP-compressie | Variant op CRIME via HTTP-laag |
| **Heartbleed** | OpenSSL implementatiefout | Buffer overread in TLS heartbeat-extensie |
| **DROWN** | Servers met SSL 2.0 | Aanval op RSA-sleuteluitwisseling |
| **FREAK** | TLS met export-ciphers | Downgrade naar zwakke 512-bit RSA sleutels |
| **Logjam** | DHE met zwakke parameters | Downgrade naar 512-bit Diffie-Hellman |

### Moderne risico's (TLS 1.2/1.3)

- **Slechte cipher suite configuratie** — verouderde suites (RC4, 3DES, CBC met SHA-1) nog steeds toegestaan in TLS 1.2 als ze niet uitgesloten worden.
- **Certificaatvalidatie-fouten** — het niet verifiëren van de certificaatketen of hostname is een veelgemaakte implementatiefout.
- **0-RTT replay-aanvallen** — de 0-RTT hersteloptie in TLS 1.3 is kwetsbaar voor replay als de server geen anti-replay-mechanisme gebruikt.
- **Certificaatcompromittering** — als de CA (Certificate Authority) gecompromitteerd is, kunnen frauduleuze certificaten worden uitgegeven.
- **Post-quantum dreiging** — de sleuteluitwisseling (ECDH) en authenticatie (RSA, ECDSA) zijn niet bestand tegen een krachtige kwantumcomputer.

---

## De implementatie van TLS & SSL in verschillende software en systemen

### Veelgebruikte TLS-bibliotheken

| Bibliotheek | Taal/Platform | Gebruik |
|---|---|---|
| **OpenSSL** | C | Meest gebruikt; basis voor veel servers en tools |
| **BoringSSL** | C | Google's fork van OpenSSL |
| **LibreSSL** | C | OpenBSD-fork, veiliger geheugenmodel |
| **GnuTLS** | C | GNU-alternatief |
| **Rustls** | Rust | Moderne, memory-safe implementatie |
| **s2n-tls** | C | AWS's vereenvoudigde TLS-bibliotheek |

### In dit project (FastAPI / Nginx / Docker)

- **Nginx** handelt TLS af vóór FastAPI — de applicatieserver zelf spreekt enkel HTTP intern.
- **Certbot** (Let's Encrypt) levert gratis X.509-certificaten via het ACME-protocol.
- De Nginx-configuratie bepaalt welke TLS-versies en cipher suites worden toegestaan.

Aanbevolen Nginx-configuratie (minimaal):
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers on;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### In Python / FastAPI

- FastAPI gebruikt zelf geen TLS — dat wordt afgehandeld door Nginx of een reverse proxy.
- De `httpx`-bibliotheek (voor uitgaande requests) verifieert standaard TLS-certificaten.
- De PostgreSQL-verbinding via `asyncpg` kan TLS vereisen via `ssl='require'` in de connectieparameters.

### HTTPS in de browser

Browsers tonen TLS-status via het slotpictogram. Ze ondersteunen doorgaans:
- **Certificate Transparency (CT)** — logs van alle certificaten.
- **OCSP Stapling** — efficiënte intrekkingscontrole van certificaten.
- **HSTS (HTTP Strict Transport Security)** — dwingt HTTPS af voor toekomstige verbindingen.

---

## De toekomst van TLS & SSL en de ontwikkelingen in encryptie

### Post-Quantum Cryptografie (PQC)

De komst van krachtige kwantumcomputers bedreigt alle huidige asymmetrische algoritmes (RSA, ECDH, ECDSA). NIST heeft in 2024 de eerste post-quantum standaarden gepubliceerd:

- **ML-KEM (Kyber)** — voor sleuteluitwisseling, vervangt ECDH.
- **ML-DSA (Dilithium)** — voor digitale handtekeningen, vervangt ECDSA.

Zie `lijst.md` → Post-quantum cryptografie.

In TLS 1.3 worden momenteel hybride modi ingezet:
- **X25519Kyber768** — combineert ECDH (Curve25519) met Kyber768. Veilig zolang één van de twee niet gebroken is.
- Google Chrome, Cloudflare en grote CDN's ondersteunen dit al in 2025–2026.

De nadelen van PQC in TLS:
- Grotere sleutels en handtekeningen (zie sleutellengtes in `lijst.md`) → meer overhead per handshake.
- Kyber768 publieke sleutel: 1184 bytes vs. 32 bytes voor Ed25519.
- Impact op latentie en bandbreedte bij hoog volume van verbindingen.

### TLS 1.3 uitbreidingen

- **ECH (Encrypted Client Hello)** — versleutelt de SNI-extensie (servernaam) zodat ook de domeinnaam niet meer zichtbaar is voor tussenpersonen.
- **QUIC + TLS 1.3** — HTTP/3 gebruikt QUIC als transportprotocol, met TLS 1.3 ingebakken. Sneller en beter herstel bij pakketverlies dan TCP + TLS.

### Verwachte evolutie

| Tijdshorizon | Ontwikkeling |
|---|---|
| Nu (2026) | TLS 1.3 dominant, hybride PQC in opkomst |
| ~2027–2030 | Kyber/Dilithium worden standaard in TLS |
| ~2030+ | Klassieke asymmetrische algoritmes (RSA, ECDH) worden uitgefaseerd |
| Onbekend | Krachtige kwantumcomputer die huidige encryptie kan breken |

De transitie naar post-quantum TLS is de belangrijkste cryptografische uitdaging van het komende decennium. Systemen die vandaag versleuteld verkeer opslaan in de verwachting het later te ontcijferen ("harvest now, decrypt later") maken de urgentie extra groot.
