# Onderzoek naar belangrijke encryptie-algoritmes
In dit bestand wordt er onderzoek gedaan naar enkele belangrijke encryptie-algoritmes, met een focus op het beter begrijpen van hun werking, veiligheid, prestaties en gebruik in de praktijk.  
De zaken die besproken worden over elk algoritme zijn onder andere:
- Werking van het algoritme
- Prestaties en efficiëntie
- Toepassingen in de praktijk

- Veiligheid
    - Veiligheid en mogelijke kwetsbaarheden
    - Veiligheid op vlak van benodigde resources voor een brute-force aanval
        - Is het algoritme bewust belastend gemaakt om brute-force aanvallen te bemoeilijken?
    - Veiligheid naar de toekomst toe op vlak van quantum computers

- Wiskunde
    - Wiskundige werking van het algoritme, in detail uitgelegd
    - Wiskundige principes en voorbeelden van het algoritme

- Vergelijken
    - Vergelijking met andere encryptie-algoritmes die hetzelfde doel hebben
    - Voordelen en nadelen van het algoritme
    - Welk algoritme is meer geschikt om te gebruiken in moderne toepassingen, en waarom

## AES (Advanced Encryption Standard)
Ontwerpers: Vincent Rijmen en Joan Daemen  
Type: data encryptie, symmetrische encryptie, block cipher

### Werking van het algoritme
AES is een symmetrisch blokcijfer dat werkt met een vaste blokgrootte van 128 bits (16 bytes). Het algoritme ondersteunt sleutellengtes van 128, 192 of 256 bits. AES is gebaseerd op een substitutie-permutatienetwerk (SPN) en voert meerdere opeenvolgende ronden (rounds) uit op de data. Het aantal ronden is afhankelijk van de sleutellengte:
- 10 ronden voor AES-128
- 12 ronden voor AES-192
- 14 ronden voor AES-256

Elke ronde (behalve de laatste) bestaat uit vier opeenvolgende transformationele stappen die worden uitgevoerd op een tweedimensionale matrix van bytes, de zogenaamde *State*:
1. **SubBytes**: Een niet-lineaire substitutiestap waarbij elke byte onafhankelijk wordt vervangen door een andere byte met behulp van een vaste opzoektabel (de S-Box).
2. **ShiftRows**: Een permutatiestap waarbij de rijen van de State cyclisch naar links worden verschoven met verschillende offsets (rij 0 niet, rij 1 met 1 byte, rij 2 met 2 bytes, rij 3 met 3 bytes).
3. **MixColumns**: Een lineaire transformatiestap waarbij de kolommen van de State worden vermenigvuldigd met een vaste matrix, waardoor de bytes binnen elke kolom met elkaar worden vermengd.
4. **AddRoundKey**: Een stap waarbij de State via een bitsgewijze XOR-operatie wordt gecombineerd met de subkey voor die specifieke ronde (afgeleid van de hoofdsleutel via het AES Key Schedule).

In de allerlaatste ronde wordt de stap **MixColumns** overgeslagen om de symmetrie met de decryptie-operatie te bewaren.

### Prestaties en efficiëntie
AES is ontworpen om uiterst efficiënt te zijn in zowel hardware als software. Op moderne processoren die beschikken over **AES-NI (AES New Instructions)** hardware-versnelling, kan AES extreem snel en in constante tijd (constant-time) worden uitgevoerd. Dit minimaliseert het processorgebruik aanzienlijk. 
In pure software-implementaties (zonder hardware-ondersteuning) kan AES echter langzamer zijn en is het kwetsbaar voor timing-side-channelaanvallen als er gebruik wordt gemaakt van opzoektabellen (T-tables) om de berekeningen te versnellen.

### Toepassingen in de praktijk
AES is de wereldwijde industriestandaard en wordt overal ingezet:
- **Netwerkbeveiliging**: HTTPS (TLS 1.2 en TLS 1.3), VPN's (IPsec, OpenVPN, WireGuard gebruikt het niet maar SSH wel), en WPA3 Wi-Fi-beveiliging.
- **Bestands- en schijfencryptie**: BitLocker (Windows), FileVault (macOS), en VeraCrypt.
- **Database-encryptie**: Transparent Data Encryption (TDE) in SQL Server, Oracle en PostgreSQL.
- **Wachtwoordmanagers**: Opslaan van de gecodeerde kluis (bijv. Bitwarden, KeePass).

### Veiligheid
- **Veiligheid en mogelijke kwetsbaarheden**: AES is mathematisch zeer robuust. Er zijn geen praktische cryptanalytische aanvallen bekend die AES kunnen breken bij een correcte implementatie. De bekende aanvallen (zoals biclique-aanvallen) zijn puur theoretisch en verminderen de effectieve sleutelruimte van AES-256 slechts marginaal (tot ongeveer 254 bits), wat nog steeds onbereikbaar groot is. Kwetsbaarheden ontstaan vrijwel uitsluitend door slechte implementaties (bijv. side-channel timing-aanvallen of hergebruik van Initialisatie Vectoren/nonces in zwakke modi zoals AES-GCM of AES-CBC).
- **Benodigde resources voor een brute-force aanval**: AES is ontworpen om zo snel mogelijk te zijn, dus het is **niet** bewust belastend gemaakt om brute-force tegen te gaan (in tegenstelling tot wachtwoord-hashfuncties). Desondanks is een brute-force aanval op AES-128 of AES-256 fysiek onmogelijk met de huidige en voorzienbare computerkracht. De energie die nodig is om alle mogelijke $2^{256}$ sleutels van AES-256 af te lopen is groter dan de totale hoeveelheid energie in het bekende universum.
- **Quantum computers**: Grover's algoritme kan de effectieve sleutelsterkte van symmetrische encryptie halveren. Dit betekent dat AES-128 na de komst van een schaalbare quantumcomputer nog een effectieve beveiliging van 64 bits biedt (wat theoretisch kwetsbaar is). AES-256 biedt echter 128 bits aan effectieve quantumbeveiliging, wat ruim voldoende is om volledig quantum-resistent te zijn.

### Wiskunde
AES maakt intensief gebruik van de algebraïsche structuren van eindige velden (Finite Fields), specifiek het Galoisveld $\text{GF}(2^8)$. 
- **Wiskundige werking in detail**: Bytes in de State worden behandeld als polynomen van de graad $7$ over het veld $\text{GF}(2)$ met coëfficiënten in $\{0, 1\}$. Vermenigvuldigingen binnen de stappen (met name in MixColumns en SubBytes) worden uitgevoerd modulo een vast onherleidbaar (irreducibel) polynoom:
  $$P(x) = x^8 + x^4 + x^3 + x + 1$$
  Dit komt overeen met de hexadecimale waarde `0x11B`.
- **Wiskundige principes en voorbeelden**: De SubBytes-stap berekent eerst de multiplicatieve inverse $A^{-1}$ van een byte $A$ in $\text{GF}(2^8)$ (waarbij $0^{-1}$ gedefinieerd is als $0$). Daarna wordt er een affiene transformatie over $\text{GF}(2)$ op toegepast. Dit zorgt voor een uitstekende non-lineariteit (verwarring of *confusion*). De MixColumns-stap vermenigvuldigt elke kolom (gezien als een polynoom met coëfficiënten in $\text{GF}(2^8)$) met een vaste matrix modulo $x^4 + 1$. Dit zorgt voor een snelle diffusie (*diffusion*) van bits over het blok.

### Vergelijken
- **Vergelijking met andere algoritmes**: AES verving de verouderde Data Encryption Standard (DES) en Triple DES (3DES), die veel trager en onveilig waren door kleine sleutel- en blokgroottes. AES concurreert direct met moderne stream ciphers zoals ChaCha20.
- **Voordelen**:
  - Wereldwijde standaard en extensief geanalyseerd.
  - Extreem snel door hardware-ondersteuning (AES-NI).
  - Zeer breed ondersteund in alle programmeertalen en besturingssystemen.
- **Nadelen**:
  - Gevoelig voor timing side-channelaanvallen in software-implementaties die geen gebruik maken van constante-tijd instructies.
  - Complexer om correct en veilig te implementeren dan modernere alternatieven zoals ChaCha20.
- **Geschiktheid voor moderne toepassingen**: AES-256 (bij voorkeur in AEAD-modus zoals AES-GCM) is de gouden standaard voor servers, desktops en alle apparaten met hardware-versnelling. Het is bij uitstek geschikt voor enterprise-toepassingen en gereguleerde sectoren.

---

## ChaCha20
Ontwerper: Daniel J. Bernstein  
Type: data encryptie, symmetrische encryptie, stream cipher

### Werking van het algoritme
ChaCha20 is een symmetrische stream cipher die een pseudotoevallige sleutelstroom (keystream) genereert die bitsgewijs via een XOR-operatie met de plaintext wordt gecombineerd om de ciphertext te produceren (en vice versa voor decryptie). 
Het algoritme werkt met een interne status (state) van 512 bits (64 bytes), georganiseerd als een matrix van $4 \times 4$ elementen van elk 32 bits. Deze 16 woorden worden als volgt geïnitialiseerd:
- 4 constante woorden (meestal het ASCII-equivalent van `"expand 32-byte k"`) om symmetrie-breking te garanderen.
- 8 woorden voor de 256-bit sleutel.
- 1 woord voor de block counter (teller).
- 3 woorden voor de 96-bit nonce (uniek nummer per bericht).

Het algoritme voert 20 ronden (rounds) uit. In elke ronde wordt de interne status bewerkt met een basistransformatie genaamd de **Quarter Round** (kwartronde). De ronden wisselen elkaar af: oneven ronden bewerken de kolommen van de matrix (Column Rounds) en even ronden bewerken de diagonalen (Diagonal Rounds). Na 20 ronden wordt de resulterende matrix opgeteld bij de originele beginmatrix om de uiteindelijke 64-byte keystream-blok te produceren.

### Prestaties en efficiëntie
ChaCha20 blinkt uit in software-efficiëntie. Omdat het algoritme alleen gebruikmaakt van eenvoudige 32-bit operaties — optellen (Addition), roteren (Rotation), en XOR-en, gezamenlijk bekend als het **ARX**-ontwerp — presteert het buitengewoon goed op CPU's zonder specifieke cryptografische hardware-versnelling. Dit maakt het aanzienlijk sneller dan AES in pure software-implementaties. Bovendien is ChaCha20 inherent immuun voor cache-timing side-channelaanvallen omdat het geen opzoektabellen (S-Boxes) in het geheugen gebruikt.

### Toepassingen in de praktijk
- **Mobiele apparatuur**: Veelgebruikt door Google voor HTTPS-verkeer naar mobiele Android-apparaten die geen hardware-versnelde AES ondersteunen om de batterij te sparen.
- **VPN's**: De kern van het uiterst efficiënte **WireGuard** VPN-protocol.
- **Netwerkprotocollen**: Ondersteund in TLS 1.3, SSH en IPsec.
- **Besturingssystemen**: Gebruikt voor de interne cryptografisch veilige pseudorandom number generators (CSPRNG) van Linux (`/dev/urandom`) en OpenBSD.

### Veiligheid
- **Veiligheid en mogelijke kwetsbaarheden**: ChaCha20 is uiterst veilig. Sinds de publicatie in 2008 zijn er geen succesvolle cryptanalytische aanvallen tegen de volledige 20-ronden variant gevonden. De beste theoretische aanvallen kunnen slechts tot rond de 7 ronden breken, wat een zeer comfortabele veiligheidsmarge oplevert.
- **Benodigde resources voor een brute-force aanval**: ChaCha20 is ontworpen om snel te zijn in software en is **niet** bewust belastend gemaakt. Door de 256-bit sleutelruimte is een brute-force aanval met klassieke computers echter volkomen onmogelijk ($2^{256}$ pogingen nodig).
- **Quantum computers**: Net als bij AES-256 zorgt Grover's algoritme voor een halvering van de effectieve sleutelsterkte tot 128 bits. Dit is nog steeds astronomisch veilig, waardoor ChaCha20 volledig quantum-resistent is.

### Wiskunde
- **Wiskundige werking in detail**: De Quarter Round functie van ChaCha20 werkt op vier 32-bit unsigned integers $a, b, c, d$ en gebruikt uitsluitend ARX-operaties:
  1. $a \leftarrow a + b \pmod{2^{32}}; \quad d \leftarrow (d \oplus a) \lll 16$
  2. $c \leftarrow c + d \pmod{2^{32}}; \quad b \leftarrow (b \oplus c) \lll 12$
  3. $a \leftarrow a + b \pmod{2^{32}}; \quad d \leftarrow (d \oplus a) \lll 8$
  4. $c \leftarrow c + d \pmod{2^{32}}; \quad b \leftarrow (b \oplus c) \lll 7$
  Hierbij is $+$ optelling modulo $2^{32}$, $\oplus$ bitsgewijze XOR, en $\lll$ een bitsgewijze rotatie naar links.
- **Wiskundige principes en voorbeelden**: De algebraïsche eenvoud zorgt ervoor dat bits zeer snel over de gehele statusmatrix diffunderen. De constante woorden zorgen ervoor dat een aanvaller de initiële toestand van de matrix nooit volledig kan manipuleren, wat slide-aanvallen voorkomt.

### Vergelijken
- **Vergelijking met andere algoritmes**: ChaCha20 is de directe opvolger van Salsa20 (ook ontworpen door Bernstein) en presteert beter op het gebied van diffusie per ronde. Het concurreert voornamelijk met AES.
- **Voordelen**:
  - Inherent veilig tegen timing-side-channelaanvallen (geen opzoektabellen).
  - Extreem snel op CPU's zonder hardware-versnelling (zoals goedkope smartphones, IoT-apparaten en microcontrollers).
  - Eenvoudiger te implementeren zonder fouten dan AES.
- **Nadelen**:
  - Op systemen met specifieke hardware-ondersteuning (AES-NI) is AES sneller en energiezuiniger dan ChaCha20.
  - Biedt van zichzelf geen authenticiteit of integriteitscontrole (vereist een MAC).
- **Geschiktheid voor moderne toepassingen**: Uitstekend geschikt voor software-gebaseerde encryptie, embedded systemen, mobiele apps en moderne VPN-tunnels (WireGuard).

---

## ChaCha20-Poly1305
Ontwerper: Daniel J. Bernstein  
Type: data encryptie, symmetrische encryptie, stream cipher, AEAD (Authenticated Encryption with Associated Data)

### Werking van het algoritme
ChaCha20-Poly1305 is een geauthenticeerd encryptie-algoritme (AEAD) dat de **ChaCha20** stream cipher combineert met de **Poly1305** Message Authentication Code (MAC). Het lost het fundamentele probleem op van "encrypt-then-MAC" door zowel vertrouwelijkheid, integriteit als authenticiteit te bieden in één enkele workflow.
Het proces verloopt als volgt:
1. De eerste 64 bytes van de keystream geproduceerd door ChaCha20 (met block counter op $0$) worden gebruikt om een unieke, eenmalige 256-bit Poly1305 sleutel (een *one-time key*) te genereren. De rest van de keystream (vanaf block counter $1$) wordt gebruikt om de plaintext te versleutelen via XOR.
2. Er wordt een Poly1305-tag berekend over de optionele geassocieerde data (AAD - *Associated Additional Data*, zoals netwerkheaders die niet versleuteld mogen worden maar wel geauthenticeerd), de geproduceerde ciphertext en de respectievelijke lengtes van beide.
3. De resulterende 16-byte (128-bit) authenticatietag wordt aan de ciphertext toegevoegd. Bij de decryptie wordt deze tag opnieuw berekend en vergeleken; als er ook maar één bit is aangepast, weigert het algoritme de data te ontcijferen.

### Prestaties en efficiëntie
Omdat zowel ChaCha20 als Poly1305 ontworpen zijn voor snelle software-berekeningen op basis van simpele ARX- en modulaire rekeninstructies, levert ChaCha20-Poly1305 uitstekende prestaties in software. Het is vaak de snelste AEAD-optie op systemen zonder AES-NI (zoals oudere mobiele telefoons of smart home IoT-chips). Het vereist zeer weinig geheugen en de berekeningen kunnen makkelijk geparalleliseerd worden.

### Toepassingen in de praktijk
- **Webverkeer**: Gestandaardiseerd in RFC 7905 en veelvuldig gebruikt in TLS 1.3 en TLS 1.2.
- **VPN's**: Het standaard encryptieschema voor **WireGuard**.
- **Protocollen**: Gebruikt in SSH en het Signal-protocol (voor end-to-end versleuteling in apps zoals Signal en WhatsApp).

### Veiligheid
- **Veiligheid en mogelijke kwetsbaarheden**: Mathematisch gezien is de constructie uiterst veilig. Er zijn geen bekende praktische kwetsbaarheden bij correct gebruik. De grootste kwetsbaarheid in de praktijk is het **hergebruik van een nonce (Number used ONCE)** met dezelfde sleutel. Als een nonce tweemaal wordt gebruikt met dezelfde sleutel, kan een aanvaller de Poly1305-sleutel achterhalen, de authenticiteit breken en de plaintext van beide berichten reconstrueren. Dit staat bekend als de *nonce-reuse catastrophe*.
- **Benodigde resources voor een brute-force aanval**: Net als ChaCha20 heeft het een 256-bit sleutel. Het is niet bewust belastend gemaakt, maar de sleutelruimte is te groot om met brute-force aan te vallen.
- **Quantum computers**: Volledig quantum-resistent dankzij de 256-bit sleutel (effectief 128-bit sterk onder Grover's algoritme).

### Wiskunde
- **Wiskundige werking in detail**: Poly1305 werkt modulo de priem $2^{130}-5$ (een Mersenne-achtige priem). De eenmalige Poly1305-sleutel bestaat uit twee delen van 128 bits: $r$ en $s$. De invoerdata (AAD en ciphertext) wordt opgedeeld in blokken van 16 bytes. Elk blok wordt gezien als een coëfficiënt van een polynoom. De MAC wordt berekend door dit polynoom te evalueren op het punt $r$ in het eindige veld $\mathbb{F}_{p}$ (waar $p = 2^{130}-5$), en vervolgens $s$ erbij op te tellen modulo $2^{130}-5$:
  $$\text{Tag} = \left( \sum_{i=1}^{q} c_i \cdot r^{q-i+1} \pmod{2^{130}-5} \right) + s \pmod{2^{128}}$$
- **Wiskundige principes en voorbeelden**: De priem $2^{130}-5$ is strategisch gekozen omdat modulaire reductie hiermee uiterst snel kan worden uitgevoerd met eenvoudige bit-shifts en optellingen op standaard registers, zonder dure delingen.

### Vergelijken
- **Vergelijking met andere algoritmes**: De belangrijkste concurrent is AES-GCM (Galois/Counter Mode).
- **Voordelen**:
  - Inherent immuun voor timing-side-channels in software.
  - Snelste AEAD-optie op platformen zonder hardware-versnelling.
  - De cryptografie is eenvoudiger te begrijpen en veiliger te implementeren dan de complexe Galois-veldvermenigvuldiging van GCM.
- **Nadelen**:
  - AES-GCM is sneller op hardware met AES-NI.
  - Nonce-hergebruik is catastrofaal (hoewel dit bij AES-GCM ook het geval is; AES-GCM-SIV lost dit op, maar ChaCha20 heeft ook een variant genaamd XChaCha20-Poly1305 die een 192-bit nonce gebruikt en daardoor immuun is voor toevallig nonce-hergebruik).
- **Geschiktheid voor moderne toepassingen**: Uitstekende keuze voor mobiele applicaties, IoT-apparaten en netwerkcommunicatie (zoals WireGuard) waarbij maximale softwareprestaties en side-channel-resistentie belangrijk zijn.

---

## RSA (Rivest-Shamir-Adleman)
Ontwerpers: Ron Rivest, Adi Shamir en Leonard Adleman  
Type: data encryptie, asymmetrische encryptie, public-key cryptography

### Werking van het algoritme
RSA is een asymmetrisch cryptografisch algoritme dat gebruikmaakt van een sleutelpaar: een **publieke sleutel** (voor encryptie of handtekeningverificatie) en een **privésleutel** (voor decryptie of handtekeningcreatie). 
De werking berust op de wiskundige moeilijkheid van het factoriseren van het product van twee zeer grote priemgetallen (integer factorization). 
- **Encryptie**: Een zender zet een plaintext bericht om in een getal $m$. De ciphertext $c$ wordt berekend door $m$ tot de macht van de publieke exponent $e$ te verheffen, modulo de gemeenschappelijke modulus $n$.
- **Decryptie**: De ontvanger herstelt het originele getal $m$ door de ciphertext $c$ tot de macht van de private exponent $d$ te verheffen, eveneens modulo $n$.

Om bruikbaar en veilig te zijn in de praktijk, moet RSA altijd gecombineerd worden met een padding-schema (zoals OAEP voor encryptie en PSS voor handtekeningen). Zonder padding is RSA deterministisch (dezelfde plaintext geeft altijd dezelfde ciphertext) en wiskundig kwetsbaar voor diverse structurele aanvallen.

### Prestaties en efficiëntie
In vergelijking met symmetrische algoritmes zoals AES is RSA extreem traag en computationeel belastend. Het genereren van sleutels is erg zwaar omdat er gezocht moet worden naar extreem grote priemgetallen. 
De prestaties van RSA zijn asymmetrisch: 
- Encryptie en handtekeningverificatie zijn relatief snel omdat de publieke exponent $e$ meestal klein wordt gekozen (meestal de waarde $65537$ of $2^{16}+1$).
- Decryptie en ondertekenen zijn erg traag omdat de private exponent $d$ een gigantisch getal is dat vergelijkbaar is met de modulus $n$, wat zware modulaire exponentiële berekeningen vereist.
Om veilig te blijven, moeten moderne RSA-sleutels minimaal 2048 of bij voorkeur 3072 tot 4096 bits lang zijn, wat de prestaties verder drukt.

### Toepassingen in de praktijk
- **Digitale handtekeningen**: Ondertekenen van TLS/SSL-certificaten door Certificate Authorities (CA's), authenticatie bij SSH-verbindingen, en code-signing (het verifiëren van software-integriteit).
- **E-mailversleuteling**: Veelgebruikt in PGP/GPG en S/MIME.
- **Sleuteltransport (Key Transport)**: In oudere TLS-versies (TLS 1.2 en lager) werd RSA gebruikt om een symmetrische AES-sessiesleutel van de client naar de server te sturen. (In TLS 1.3 is dit vervangen door Diffie-Hellman om Perfect Forward Secrecy te garanderen).

### Veiligheid
- **Veiligheid en mogelijke kwetsbaarheden**: Mathematisch is RSA veilig mits de sleutelgrootte voldoende is (minstens 2048 bits, bij voorkeur 3072+ bits). Echter, RSA is zeer gevoelig voor implementatiefouten. Het gebruik van verouderde padding-schema's zoals PKCS#1 v1.5 stelt systemen bloot aan actieve aanvallen (zoals de Bleichenbacher-aanval). Daarnaast is RSA in software kwetsbaar voor timing-aanvallen en hardware-side-channels (zoals power analysis) als er geen technieken zoals *cryptographic blinding* worden toegepast.
- **Benodigde resources voor een brute-force aanval**: RSA is niet bewust zwaar gemaakt om brute-force te bemoeilijken. De complexiteit komt puur voort uit de wiskunde van het ontbinden in factoren. Het factoriseren van een 2048-bit modulus vereist onvoorstelbare hoeveelheden rekenkracht en is met klassieke computers onhaalbaar.
- **Quantum computers**: **RSA is niet quantum-resistent**. Met behulp van **Shor's algoritme** kan een schaalbare quantumcomputer de modulus $n$ in polynomiale tijd factoriseren in de priemgetallen $p$ en $q$. Zodra er betrouwbare quantumcomputers met enkele duizenden logische qubits bestaan, zal RSA volledig gebroken zijn.

### Wiskunde
- **Wiskundige werking in detail**: 
  1. Kies twee zeer grote, willekeurige priemgetallen $p$ en $q$.
  2. Bereken de modulus $n = p \cdot q$. Dit getal wordt openbaar gemaakt.
  3. Bereken de Euler totiëntfunctie $\phi(n) = (p-1)(q-1)$.
  4. Kies een publieke exponent $e$ waarvoor geldt dat $1 < e < \phi(n)$ en $\gcd(e, \phi(n)) = 1$ (de grootste gemene deler is 1).
  5. Bereken de private exponent $d$ als de modulaire multiplicatieve inverse van $e$ modulo $\phi(n)$: 
     $$d \cdot e \equiv 1 \pmod{\phi(n)}$$
  6. De publieke sleutel bestaat uit $(e, n)$, de privésleutel uit $(d, n)$.
  7. Encryptie: $c = m^e \pmod n$.
  8. Decryptie: $m = c^d \pmod n$.
- **Wiskundige principes en voorbeelden**: 
  *Voorbeeld met kleine getallen:*
  1. Neem $p = 61$ en $q = 53$.
  2. $n = 61 \cdot 53 = 3233$.
  3. $\phi(n) = 60 \cdot 52 = 3120$.
  4. Kies $e = 17$ (omdat $\gcd(17, 3120) = 1$).
  5. Bereken $d$ via de Uitgebreide Algoritme van Euclides: $d = 2753$ (want $17 \cdot 2753 = 46801 = 15 \cdot 3120 + 1$).
  6. Publiek: $(17, 3233)$, Privé: $(2753, 3233)$.
  7. Versleutel $m = 65$: $c = 65^{17} \pmod{3233} = 2790$.
  8. Ontsleutel $c = 2790$: $m = 2790^{2753} \pmod{3233} = 65$.

### Vergelijken
- **Vergelijking met andere algoritmes**: RSA wordt tegenwoordig grotendeels verdrongen door ECC (Elliptic Curve Cryptography), zoals ECDSA en Ed25519 voor handtekeningen, en ECDH voor sleuteluitwisseling.
- **Voordelen**:
  - Zeer eenvoudig te begrijpen en te implementeren (conceptueel).
  - Al decennia de industriestandaard en universeel ondersteund.
  - Zeer snelle handtekeningverificatie en encryptie.
- **Nadelen**:
  - Enorme sleutelgrootte (3072+ bits versus 256 bits voor ECC) wat leidt tot grotere netwerkpakketten en opslag.
  - Extreem trage decryptie en handtekeninggeneratie.
  - Niet quantum-resistent.
- **Geschiktheid voor moderne toepassingen**: RSA is langzaam aan het uitfaseren. Hoewel het nog veel gebruikt wordt voor backward compatibility in TLS-certificaten, geven moderne systemen de voorkeur aan ECC vanwege de snelheid en kleinere sleutels.

---

## Diffie-Hellman (DH)
Ontwerpers: Whitfield Diffie en Martin Hellman  
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography

### Werking van het algoritme
Het Diffie-Hellman (DH) protocol is een methode waarmee twee partijen (traditioneel Alice en Bob) over een onveilig en openbaar communicatiekanaal een gedeeld geheim (shared secret) kunnen afspreken. Dit gedeelde geheim kan vervolgens worden gebruikt als de symmetrische sleutel (bijvoorbeeld voor AES) om hun verdere communicatie te versleutelen.
De werking is als volgt:
1. Beide partijen komen publiekelijk een groot priemgetal $p$ en een generator $g$ overeen.
2. Alice kiest een geheim getal $a$ (haar privésleutel) en berekent haar publieke waarde $A = g^a \pmod p$.
3. Bob kiest een geheim getal $b$ (zijn privésleutel) en berekent zijn publieke waarde $B = g^b \pmod p$.
4. Ze wisselen hun publieke waarden $A$ en $B$ uit over het openbare netwerk.
5. Alice berekent het gedeelde geheim via $S = B^a \pmod p$.
6. Bob berekent het gedeelde geheim via $S = A^a \pmod p$.
Wiskundig gezien komen beide berekeningen uit op hetzelfde resultaat: $g^{ab} \pmod p$. Een meeluisteraar (Eve) die alleen $p$, $g$, $A$ en $B$ kent, kan het geheim $S$ niet efficiënt berekenen.

### Prestaties en efficiëntie
Klassieke Diffie-Hellman vereist zeer grote modulus-groottes (minimaal 2048-bit prime, bij voorkeur 3072-bit of hoger) om veilig te zijn tegen moderne aanvalsmethoden. De modulaire exponentiaties met zulke gigantische getallen zijn rekenintensief. Dit maakt de klassieke DH relatief traag en belastend voor servers die duizenden verbindingen per seconde moeten afhandelen.

### Toepassingen in de praktijk
- **Perfect Forward Secrecy (PFS)**: Diffie-Hellman in tijdelijke modus (DHE - *Ephemeral Diffie-Hellman*) genereert voor elke sessie een nieuw, eenmalig sleutelpaar. Als de master-privésleutel van de server in de toekomst wordt gestolen, kunnen eerdere opgenomen sessies nog steeds niet worden ontcijferd.
- **Netwerkprotocollen**: Veelgebruikt in SSH, IPsec VPN's en oudere TLS (TLS 1.2) configuraties.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: DH is van zichzelf niet geauthenticeerd en is daardoor kwetsbaar voor **Man-in-the-Middle (MitM)** aanvallen. Een aanvaller kan zich tussen Alice en Bob nestelen en met beiden een apart geheim afspreken. Daarom moet DH in de praktijk altijd gecombineerd worden met een authenticatiemethode (zoals RSA- of ECDSA-handtekeningen). In 2015 toonde de *Logjam-aanval* aan dat veel servers zwakke 1024-bit of vaste priemgetallen gebruikten, wat precomputatie-aanvallen door overheidsinstanties mogelijk maakte.
- **Benodigde resources voor een brute-force aanval**: Gebaseerd op de moeilijkheid van het discrete logaritme probleem (DLP) in de multiplicatieve groep van gehele getallen modulo een priemgetal. Het is niet bewust belastend ontworpen, maar het wiskundige probleem vereist astronomische rekenkracht om te kraken bij voldoende grote priemgetallen ($ \ge 2048 $ bits).
- **Quantum computers**: **Diffie-Hellman is niet quantum-resistent**. Shor's algoritme lost het discrete logaritme probleem in polynomiale tijd op, waardoor quantumcomputers in staat zullen zijn om elke klassieke DH-sleuteluitwisseling onmiddellijk te kraken.

### Wiskunde
- **Wiskundige werking in detail**: Het protocol berust op de commutatieve eigenschap van exponentiatie:
  $$(g^b)^a \equiv (g^a)^b \equiv g^{ab} \pmod p$$
  Terwijl het berekenen van $g^a \pmod p$ heel eenvoudig is (zelfs voor gigantische getallen, met behulp van *square-and-multiply* algoritmes), is het omgekeerde proces — het vinden van $a$ uit $A = g^a \pmod p$ — uiterst moeilijk. Dit staat bekend als het discrete logaritme probleem.
- **Wiskundige principes en voorbeelden**:
  *Voorbeeld met kleine getallen:*
  1. Neem priemgetal $p = 23$ en generator $g = 5$.
  2. Alice kiest geheim $a = 6$. Ze berekent $A = 5^6 \pmod{23} = 15625 \pmod{23} = 8$.
  3. Bob kiest geheim $b = 15$. Hij berekent $B = 5^{15} \pmod{23} = 19$.
  4. Alice stuurt $A = 8$ naar Bob, Bob stuurt $B = 19$ naar Alice.
  5. Alice berekent $S = 19^6 \pmod{23} = 2$.
  6. Bob berekent $S = 8^{15} \pmod{23} = 2$.
  7. Het gedeelde geheim is $2$.

### Vergelijken
- **Vergelijking met andere algoritmes**: Klassieke DH is vrijwel volledig vervangen door ECDH (Elliptic Curve Diffie-Hellman).
- **Voordelen**:
  - Maakt veilige sleutelafspraak mogelijk over een volledig onbeveiligd kanaal.
  - Biedt Forward Secrecy mits ephemeral (DHE) gebruikt.
- **Nadelen**:
  - Zeer grote parameters nodig voor goede veiligheid.
  - Computationeel zwaar en trager dan ECDH.
  - Niet inherent beschermd tegen MitM-aanvallen.
  - Niet quantum-resistent.
- **Geschiktheid voor moderne toepassingen**: Klassieke DH is verouderd. Moderne systemen gebruiken nagenoeg uitsluitend ECDH vanwege de veel hogere snelheid en kleinere sleutelgrootte.

---

## ECDH (Elliptic Curve Diffie-Hellman)
Ontwerpers: Neal Koblitz en Victor S. Miller  
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography, elliptische krommen

### Werking van het algoritme
ECDH is een variant van het klassieke Diffie-Hellman protocol die gebruikmaakt van de wiskunde van **elliptische krommen (Elliptic Curve Cryptography - ECC)** in plaats van modulaire exponentiële berekeningen over grote priemgetallen. 
De werking is als volgt:
1. Beide partijen spreken een specifieke elliptische kromme $E$ en een vast basispunt $G$ op die curve af.
2. Alice kiest een geheim getal $d_A$ (haar privé scalar) en berekent haar publieke sleutel $Q_A$ door het basispunt $G$ wiskundig te vermenigvuldigen met haar geheim: $Q_A = d_A \times G$ (dit resulteert in een nieuw punt op de curve).
3. Bob kiest zijn geheim $d_B$ en berekent zijn publieke sleutel: $Q_B = d_B \times G$.
4. Ze wisselen hun publieke punten $Q_A$ en $Q_B$ uit.
5. Alice berekent het gedeelde geheim door haar privé scalar te vermenigvuldigen met Bob's publieke punt: $S = d_A \times Q_B = d_A \times (d_B \times G)$.
6. Bob berekent het gedeelde geheim analoog: $S = d_B \times Q_A = d_B \times (d_A \times G)$.
Door de commutatieve eigenschap van scalaire vermenigvuldiging op elliptische krommen komen beide berekeningen uit op exact hetzelfde punt op de curve: $(d_A \cdot d_B) \times G$. De x-coördinaat van dit resulterende punt wordt vervolgens als symmetrische sleutel gebruikt.

### Prestaties en efficiëntie
ECDH is extreem snel en efficiënt. Omdat het wiskundige probleem achter ECC veel moeilijker op te lossen is met bekende klassieke algoritmes, kan ECC veel kleinere sleutellengtes gebruiken voor dezelfde mate van veiligheid. 
Bijvoorbeeld: een **256-bit ECDH-sleutel** (zoals gebruikt bij Curve25519) biedt dezelfde veiligheid als een **3072-bit klassieke DH-sleutel** of RSA-sleutel. Dit resulteert in een enorme reductie van bandbreedte (kleinere sleutels in TLS-handshakes) en aanzienlijk snellere rekentijden op zowel mobiele apparaten als servers.

### Toepassingen in de praktijk
- **Modern Webverkeer (HTTPS)**: ECDHE (de Ephemeral variant van ECDH) is de absolute standaard voor sleuteluitwisseling in **TLS 1.3** en het meest gebruikte mechanisme in TLS 1.2.
- **VPN's**: WireGuard gebruikt ECDH (via Curve25519) voor de initiële sleutelafspraak.
- **End-to-End Encrypted Messaging**: WhatsApp, Signal en iMessage gebruiken ECDH als onderdeel van hun cryptografische protocollen (zoals het Signal Double Ratchet-protocol) om voortdurend nieuwe sessiesleutels af te spreken.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: ECDH is mathematisch uiterst robuust bij gebruik van veilige curves. Er zijn twee veelgebruikte families van curves:
  - **NIST-curves** (zoals secp256r1/P-256): Gestandaardiseerd door de Amerikaanse overheid. Sommige cryptografen wantrouwen deze curves vanwege onduidelijke keuzes in de parameters, hoewel er nooit achterdeurtjes in zijn aangetoond.
  - **Bernstein-curves** (zoals Curve25519): Worden algemeen beschouwd als de veiligste en best ontworpen curves ter wereld. Ze zijn ontworpen om inherent immuun te zijn voor timing-aanvallen en specifieke implementatiefouten (zoals *invalid curve attacks*).
- **Benodigde resources voor een brute-force aanval**: Gebaseerd op het Elliptic Curve Discrete Logarithm Problem (ECDLP). Niet bewust belastend gemaakt, maar wegens de extreme complexiteit van het wiskundige probleem is brute-force op een 256-bit curve met klassieke computers volkomen uitgesloten.
- **Quantum computers**: **ECDH is niet quantum-resistent**. Shor's algoritme is eveneens in staat om het discrete logaritme probleem op elliptische krommen in polynomiale tijd op te lossen. ECC zal door zijn kleinere sleutelgrootte zelfs nog sneller breken op een quantumcomputer dan RSA of klassieke DH.

### Wiskunde
- **Wiskundige werking in detail**: Een elliptische kromme over een eindig veld $\mathbb{F}_p$ wordt gedefinieerd door een vergelijking van de vorm (Weierstrass-vorm):
  $$y^2 = x^3 + ax + b \pmod p$$
  De "vermenigvuldiging" van een punt met een scalar is geen traditionele vermenigvuldiging, maar een herhaalde toepassing van een speciaal gedefinieerde groepsoperatie genaamd **punt-optelling (Point Addition)** en **punt-verdubbeling (Point Doubling)**. Geometrisch gezien trek je een lijn door twee punten op de curve; het derde snijpunt met de curve wordt gespiegeld over de x-as om het resultaat van de optelling te verkrijgen.
- **Wiskundige principes en voorbeelden**: Curve25519 gebruikt een Montgomery-curve gedefinieerd door:
  $$y^2 = x^3 + 486662x^2 + x \pmod{2^{255}-19}$$
  Het voordeel van de Montgomery-vorm is dat scalaire vermenigvuldiging uiterst efficiënt kan worden uitgevoerd met een algoritme genaamd de *Montgomery Ladder*, dat uitsluitend gebruikmaakt van de x-coördinaat van de punten en gegarandeerd in constante tijd draait.

### Vergelijken
- **Vergelijking met andere algoritmes**: Directe en superieure opvolger van klassieke DH.
- **Voordelen**:
  - Veel kleinere sleutelgrootte (256 bits ECC $\approx$ 3072 bits DH/RSA).
  - Zeer snelle berekeningen en lage netwerk- en geheugenoverhead.
  - Curve25519 biedt uitstekende bescherming tegen side-channel timing-aanvallen.
- **Nadelen**:
  - Wiskundig en qua implementatie complexer dan RSA of klassieke DH.
  - Niet quantum-resistent.
- **Geschiktheid voor moderne toepassingen**: Uitstekend geschikt en momenteals de absolute standaard voor alle moderne netwerkbeveiliging en end-to-end versleuteling.

---

## ECDSA (Elliptic Curve Digital Signature Algorithm)
Ontwerpers: Neal Koblitz en Victor S. Miller  
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, elliptische krommen

### Werking van het algoritme
ECDSA is de elliptische-kromme-variant van het klassieke DSA (Digital Signature Algorithm). Het wordt uitsluitend gebruikt voor het genereren en verifiëren van **digitale handtekeningen** om de integriteit en authenticiteit van een bericht of bestand te garanderen. 
De werking verloopt als volgt:
1. De ondertekenaar berekent de cryptografische hash van het bericht.
2. Er wordt een tijdelijke, willekeurige waarde $k$ (de *ephemeral key* of *nonce*) gegenereerd.
3. Met behulp van $k$ en het basispunt $G$ op de curve wordt een tijdelijk punt berekend. De x-coördinaat van dit punt vormt het eerste deel van de handtekening: $r$.
4. De privésleutel $d_A$, de hash van het bericht, de nonce $k$ en de waarde $r$ worden gecombineerd om het tweede deel van de handtekening te berekenen: $s$.
5. De uiteindelijke handtekening bestaat uit het getallenpaar $(r, s)$. De ontvanger kan met de publieke sleutel van de zender en de hash van het bericht verifiëren of de handtekening geldig is.

### Prestaties en efficiëntie
ECDSA is computationeel zeer efficiënt in vergelijking met klassieke RSA-handtekeningen. Omdat het gebaseerd is op elliptische krommen, biedt het een extreem hoge mate van veiligheid met zeer kleine sleutels (bijvoorbeeld 256 bits). Het genereren van handtekeningen is erg snel. Verificatie is iets complexer en trager dan het genereren van de handtekening, maar nog steeds aanzienlijk sneller dan bij veel andere asymmetrische methoden op zwakkere hardware. De resulterende handtekening $(r, s)$ is zeer compact (slechts 64 bytes voor een 256-bit curve).

### Toepassingen in de praktijk
- **Blockchains en Cryptocurrencies**: De secp256k1-curve van ECDSA is het fundament voor transactie-ondertekening in **Bitcoin** en **Ethereum**.
- **Webbeveiliging**: Veelgebruikt in TLS/SSL-certificaten (meestal met de NIST P-256 curve) als alternatief voor RSA.
- **Protocollen**: Ondersteund in SSH voor gebruikersauthenticatie en in DNSSEC voor het beveiligen van DNS-records.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: ECDSA is mathematisch uiterst veilig, maar heeft een **historisch beruchte en catastrofale kwetsbaarheid**: de absolute afhankelijkheid van een perfecte willekeurige getallenserie voor de nonce $k$. Als een ondertekenaar tweemaal dezelfde nonce $k$ gebruikt voor verschillende berichten onder dezelfde privésleutel, of als de Random Number Generator (RNG) ook maar een klein beetje voorspelbaar is, kan een aanvaller de privésleutel van de ondertekenaar **onmiddellijk berekenen**. 
  Dit lek leidde in de praktijk tot grote hacks (zoals de PlayStation 3-beveiligingskraak en miljoenenverliezen bij Bitcoin-wallets). Om dit op te lossen, schrijft de moderne standaard **RFC 6979** voor om $k$ deterministisch af te leiden uit het bericht en de privésleutel, wat dit risico volledig elimineert.
- **Benodigde resources voor een brute-force aanval**: Gebaseerd op de moeilijkheid van het Elliptic Curve Discrete Logarithm Problem (ECDLP). Niet bewust belastend ontworpen. Een brute-force aanval op een correct geïmplementeerde 256-bit ECDSA-sleutel is met klassieke computers onmogelijk.
- **Quantum computers**: **ECDSA is niet quantum-resistent**. Net als ECDH en RSA kan ECDSA eenvoudig worden gebroken door Shor's algoritme op een voldoende krachtige quantumcomputer, omdat de privésleutel direct uit de publieke sleutel kan worden afgeleid.

### Wiskunde
- **Wiskundige werking in detail**: 
  *Ondertekenen van bericht $M$:*
  1. Bereken $e = \text{Hash}(M)$. Laat $z$ de meest linkse bits van $e$ zijn, gelijk aan de bitlengte van de groepsorde $n$.
  2. Kies een cryptografisch veilige, willekeurige integer $k$ in het interval $[1, n-1]$.
  3. Bereken het curvepunt $(x_1, y_1) = k \times G$.
  4. Bereken $r = x_1 \pmod n$. Als $r = 0$, ga terug naar stap 2.
  5. Bereken $s = k^{-1}(z + r \cdot d_A) \pmod n$ (waarbij $d_A$ de privésleutel is). Als $s = 0$, ga terug naar stap 2.
  6. De handtekening is het paar $(r, s)$.
- **Wiskundige principes en voorbeelden**: De verificatie controleert of het punt $U = (z \cdot s^{-1}) \times G + (r \cdot s^{-1}) \times Q_A$ (waarbij $Q_A$ de publieke sleutel is) een x-coördinaat heeft die modulo $n$ gelijk is aan $r$. De wiskundige consistentie berust op het feit dat $k \times G \equiv U$ als de handtekening correct is gezet.

### Vergelijken
- **Vergelijking met andere algoritmes**: Concurreert met RSA-PSS en Ed25519.
- **Voordelen**:
  - Zeer compacte handtekeningen (64 bytes) en sleutels (32 bytes).
  - Brede industriële acceptatie en uitstekende ondersteuning in legacy-systemen.
- **Nadelen**:
  - Extreem kwetsbaar voor slechte RNG's (tenzij RFC 6979 expliciet wordt gebruikt).
  - Wiskundig kwetsbaar voor side-channel- en timingaanvallen bij onzorgvuldige implementaties.
  - Niet quantum-resistent.
- **Geschiktheid voor moderne toepassingen**: Hoewel nog steeds dominant in de blockchainwereld en veel TLS-certificaten, heeft het modernere en veiligere Ed25519 in nieuwe systemen de voorkeur.

---

## Ed25519
Ontwerper: Daniel J. Bernstein  
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, elliptische krommen

### Werking van het algoritme
Ed25519 is een digitaal handtekening-algoritme dat gebruikmaakt van het **EdDSA (Edwards-curve Digital Signature Algorithm)** schema op de speciaal ontworpen gedraaide Edwards-curve genaamd **Curve25519** (in deze context vaak aangeduid als Ed25519). 
Het is ontworpen met een "security-first" filosofie om de praktische implementatie-kwetsbaarheden van ECDSA en RSA volledig op te lossen.
De werking is fundamenteel deterministisch:
1. De privésleutel is een 32-byte willekeurige waarde, die wordt gehasht met SHA-512 om een scalaire waarde en een geheime sleutel voor het hashen af te leiden.
2. In plaats van een willekeurige nonce $k$ te genereren via de systeem-RNG, genereert Ed25519 de nonce $r$ door de geheime hashsleutel samen met het bericht te hashen met SHA-512.
3. Dit resulteert in een volledig deterministisch ondertekeningsproces: hetzelfde bericht ondertekenen met dezelfde sleutel levert altijd exact dezelfde handtekening op, zonder enig risico op nonce-lekken.

### Prestaties en efficiëntie
Ed25519 is een van de snelste digitale handtekening-algoritmes die er bestaan. Het is ontworpen om maximale prestaties te leveren op 64-bit processoren. Handtekeninggeneratie en handtekeningverificatie zijn vele malen sneller dan bij RSA en aanzienlijk sneller dan bij de meeste ECDSA-curves. Sleutels zijn uiterst compact (32 bytes voor publiek en privé) en handtekeningen zijn slechts 64 bytes groot, wat ideaal is voor netwerkcommunicatie.

### Toepassingen in de praktijk
- **Secure Shell (SSH)**: De aanbevolen standaard voor SSH-sleutels (`ssh-ed25519`).
- **Protocollen**: Kernonderdeel van TLS 1.3, het Noise Protocol Framework en het Signal-protocol.
- **Privacy en netwerken**: Tor hidden services (versie 3 uienadressen zijn direct gebaseerd op Ed25519 publieke sleutels).
- **Cryptocurrencies**: Veelgebruikt in moderne blockchains zoals Solana, Cardano en Monero vanwege de extreem snelle verificatiesnelheid per seconde.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: Ed25519 wordt algemeen beschouwd als de veiligst mogelijke implementatie van digitale handtekeningen. Omdat de nonce $r$ deterministisch wordt berekend, is het algoritme **volledig immuun voor de nonce-reuse kwetsbaarheid** die ECDSA vaak fataal wordt. Bovendien zijn alle wiskundige operaties ontworpen om in constante tijd te draaien, waardoor timing-side-channelaanvallen onmogelijk zijn. Er zijn geen praktische of theoretische kwetsbaarheden bekend bij dit algoritme.
- **Benodigde resources voor een brute-force aanval**: Sleutelruimte van $2^{256}$. Een brute-force aanval op een Ed25519-sleutel is met klassieke computers onmogelijk.
- **Quantum computers**: **Ed25519 is niet quantum-resistent**. Net als alle andere ECC- en RSA-systemen kan Ed25519 volledig worden gebroken met Shor's algoritme op een quantumcomputer.

### Wiskunde
- **Wiskundige werking in detail**: Ed25519 maakt gebruik van een gedraaide Edwards-curve (twisted Edwards curve) over het eindige veld $\mathbb{F}_p$ met de priem $p = 2^{255}-19$, gedefinieerd door de vergelijking:
  $$-x^2 + y^2 = 1 - \frac{121665}{121666}x^2y^2$$
- **Wiskundige principes en voorbeelden**: Edwards-curves hebben een unieke wiskundige eigenschap: de formules voor punt-optelling zijn *compleet*. Dit betekent dat dezelfde algebraïsche formule werkt voor alle paren van invoerpunten op de curve, inclusief het identiteitspunt en inverse punten. Dit elimineert de noodzaak voor conditionele vertakkingen (`if`-statements) in de software-code, wat de bron is van de meeste timing-aanvallen in traditionele Weierstrass-curves van ECDSA.

### Vergelijken
- **Vergelijking met andere algoritmes**: Vergeleken met ECDSA (NIST P-256) en RSA.
- **Voordelen**:
  - Inherent immuun voor catastrofale nonce-lekken (volledig deterministisch).
  - Volledig beschermd tegen timing-side-channelaanvallen door constante-tijd code.
  - Extreem hoge doorvoersnelheid (throughput) bij verificatie.
  - Compacte sleutel- (32 bytes) en handtekeninggrootte (64 bytes).
- **Nadelen**:
  - Niet quantum-resistent.
  - Sommige verouderde legacy-systemen of hardware security modules (HSM's) ondersteunen het nog niet (hoewel dit snel verandert).
- **Geschiktheid voor moderne toepassingen**: De absolute eerste keuze voor alle nieuwe software-ontwerpen, netwerkprotocollen, authenticatiesystemen en blockchains die geen post-quantumbeveiliging vereisen.

---

## Kyber (ML-KEM)
Ontwerpers: Joppe W. Bos, Léo Ducas, Eike Kiltz, Tancrède Lepoint, Vadim Lyubashevsky, John M. Schanck, Peter Schwabe, Gregor Seiler en Damien Stehlé  
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography, post-quantum cryptography

### Werking van het algoritme
Kyber is een asymmetrisch **Key Encapsulation Mechanism (KEM)**. Het is ontworpen om klassieke asymmetrische sleuteluitwisselingen (zoals ECDH of RSA key transport) te vervangen in het post-quantumtijdperk. Kyber is door het Amerikaanse National Institute of Standards and Technology (NIST) geselecteerd als de primaire standaard voor post-quantum sleutelbeveiliging en officieel gepubliceerd onder de naam **ML-KEM (Module-Lattice-Based Key Encapsulation Mechanism)**.
In plaats van een directe sleutelafspraak zoals DH, werkt een KEM via "inkapseling":
1. Bob genereert een sleutelpaar en publiceert zijn publieke sleutel.
2. Alice gebruikt Bob's publieke sleutel om een willekeurig symmetrisch geheim (de *shared secret*) te genereren en "kapselt" dit in (encapsulation) in een ciphertext.
3. Alice stuurt de ciphertext naar Bob.
4. Bob gebruikt zijn privésleutel om de ciphertext te "ontkapselen" (decapsulation) en het gedeelde geheim te herstellen.
De wiskunde van Kyber is gebaseerd op het **Module Learning With Errors (M-LWE)** probleem, een variant van rooster-gebaseerde cryptografie (lattice-based cryptography).

### Prestaties en efficiëntie
Kyber is computationeel verbluffend snel; de berekeningen voor sleutelgeneratie, inkapseling en ontkapseling zijn vaak sneller dan die van ECDH en vele malen sneller dan RSA. 
Echter, de **sleutelgrootte en de ciphertext zijn aanzienlijk groter** dan bij klassieke ECC. Waar een ECDH-sleutel 32 bytes is, varieert een Kyber publieke sleutel van 800 tot 1568 bytes, en de ciphertext van 768 tot 1568 bytes (afhankelijk van de beveiligingsvariant: Kyber-512, Kyber-768 of Kyber-1024). Dit zorgt voor een merkbare toename van de netwerkoverhead en kan leiden tot fragmentatie van netwerkpakketten (IP-fragmentatie) in protocollen zoals TLS.

### Toepassingen in de praktijk
- **Modern HTTPS (Webbrowsers)**: Google Chrome, Cloudflare en Firefox ondersteunen Kyber al in een "hybride modus" (zoals X25519Kyber768), waarbij ECDH en Kyber worden gecombineerd. Als de cryptografie van Kyber onverhoopt een zwakte blijkt te hebben, beschermt het klassieke ECDH de verbinding nog steeds tegen klassieke aanvallers.
- **Messaging-apps**: Signal gebruikt Kyber in zijn PQXDH (Post-Quantum Extended Triple Diffie-Hellman) protocol. Apple gebruikt het in iMessage (PQ3-beveiliging) om chatberichten te beschermen tegen toekomstige quantum-decryptie.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: Kyber is ontworpen om volledig bestand te zijn tegen aanvallen van zowel klassieke supercomputers als quantumcomputers. Er zijn momenteel geen wiskundige algoritmes bekend (noch klassiek, noch quantum) die roosterproblemen zoals LWE in polynomiale tijd kunnen oplossen. Eventuele kwetsbaarheden in de praktijk kunnen optreden door side-channelaanvallen op specifieke software-implementaties, maar de theoretische wiskunde is door jaren van intensieve peer-review als uitermate robuust beoordeeld.
- **Benodigde resources voor een brute-force aanval**: Kyber is beschikbaar in drie beveiligingsniveaus die direct corresponderen met AES-beveiligingsniveaus:
  - Kyber-512 (NIST Niveau 1, vergelijkbaar met AES-128)
  - Kyber-768 (NIST Niveau 3, vergelijkbaar met AES-192) - de meest aanbevolen variant voor algemeen gebruik.
  - Kyber-1024 (NIST Niveau 5, vergelijkbaar met AES-256)
  Klassieke of quantum brute-force is onhaalbaar.
- **Quantum computers**: **Volledig quantum-resistent**. Dit is de primaire reden voor het bestaan van het algoritme. Het is bestand tegen Shor's algoritme en andere quantum-algoritmes.

### Wiskunde
- **Wiskundige werking in detail**: Kyber maakt gebruik van module-roosters over een polynomiale ring:
  $$R_q = \mathbb{Z}_q[X] / (X^n + 1)$$
  waarbij de polynomiale graad $n = 256$ is en de modulus $q = 3329$.
  Bij M-LWE wordt een matrix $A$ van polynomen vermenigvuldigd met een geheime vector $s$ van kleine polynomen, waarna een kleine foutvector (ruis) $e$ wordt opgeteld:
  $$t = A \cdot s + e \pmod q$$
  Zonder de foutvector $e$ zou dit een simpel stelsel van lineaire vergelijkingen zijn dat eenvoudig kan worden opgelost met Gauss-eliminatie. Door de toevoeging van de ruis $e$ wordt het probleem echter extreem moeilijk om op te lossen zonder kennis van $s$ (dit staat bekend als het Learning With Errors probleem).
- **Wiskundige principes en voorbeelden**: De vermenigvuldiging van deze polynomen kan dankzij de slimme keuze van $q = 3329$ en $n = 256$ uiterst snel worden berekend met behulp van de **Number Theoretic Transform (NTT)**, een discrete Fourier-transformatie voor eindige velden. Dit verklaart de uitzonderlijk hoge rekensnelheid van het algoritme.

### Vergelijken
- **Vergeligking met andere algoritmes**: Concurreert met klassieke ECDH en andere PQC-voorstellen (zoals NTRU of Classic McEliece).
- **Voordelen**:
  - Volledig quantum-resistent.
  - Extreem snelle berekeningen dankzij NTT.
  - Gestandaardiseerd door NIST als de wereldwijde post-quantum standaard (ML-KEM).
- **Nadelen**:
  - Sleutels en ciphertexts zijn veel groter dan bij ECC (kilobytes in plaats van bytes).
  - Grotere impact op netwerkbandbreedte en protocol-ontwerp.
- **Geschiktheid voor moderne toepassingen**: Absoluut noodzakelijk voor systemen die "Store Now, Decrypt Later" aanvallen willen voorkomen (waarbij aanvallers nu gecodeerd netwerkverkeer opslaan om het over 10-15 jaar met een quantumcomputer te kraken). Momenteel de beste en meest gedragen standaard voor post-quantum sleuteluitwisseling.

---

## Dilithium (ML-DSA)
Ontwerpers: Joppe W. Bos, Léo Ducas, Eike Kiltz, Tancrède Lepoint, Vadim Lyubashevsky, John M. Schanck, Peter Schwabe, Gregor Seiler en Damien Stehlé  
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, post-quantum cryptography

### Werking van het algoritme
Dilithium is een digitaal handtekening-algoritme dat specifiek is ontworpen om resistent te zijn tegen aanvallen van quantumcomputers. Het is door NIST geselecteerd als de primaire post-quantum handtekeningstandaard en officieel gepubliceerd onder de naam **ML-DSA (Module-Lattice-Based Digital Signature Algorithm)**.
De werking is gebaseerd op het principe van **Fiat-Shamir met Aborts** (Fiat-Shamir with Aborts) over module-roosters (module lattices):
1. Om een bericht te ondertekenen, genereert de ondertekenaar een tijdelijke vector van kleine polynomen (de maskeervector).
2. Deze vector wordt vermenigvuldigd met de publieke matrix van de sleutel.
3. Er wordt een hash berekend van deze vermenigvuldiging samen met het bericht.
4. Er wordt een handtekening-kandidaat berekend die de privésleutel en de maskeervector combineert.
5. Om te voorkomen dat de handtekening geheime informatie over de privésleutel lekt, voert het algoritme een kritieke controle uit (de *rejection step*). Als de kandidaat-handtekening bepaalde grenzen overschrijdt, wordt deze "afgewezen" (*aborted*), wordt er een nieuwe maskeervector gekozen en begint het proces opnieuw. Dit herhaalt zich totdat er een handtekening is die gegarandeerd geen geheimen lekt.

### Prestaties en efficiëntie
Dilithium is computationeel zeer snel voor zowel het zetten als het verifiëren van handtekeningen, en vereist geen ingewikkelde zwevende-kommagetal-berekeningen. 
Echter, net als bij Kyber, zijn de **sleutels en de handtekeningen erg groot**. Een Dilithium publieke sleutel varieert van 1312 tot 2592 bytes, en de handtekening varieert van 2420 tot 4595 bytes (afhankelijk van het beveiligingsniveau). Dit is vele malen groter dan de 64 bytes van Ed25519, wat een grote uitdaging vormt voor netwerkprotocollen zoals TLS-handshakes en DNSSEC.

### Toepassingen in de praktijk
- **Post-Quantum PKI (Public Key Infrastructure)**: Het is de primaire kandidaat om RSA en ECDSA te vervangen in TLS-certificaten voor websites.
- **Software- en Firmware-ondertekening**: Uitstekend geschikt voor het ondertekenen van updates en besturingssystemen, waarbij de iets grotere handtekeninggrootte minder problematisch is dan in real-time netwerkverbindingen.
- **Overheids- en defensiesystemen**: Toepassingen die nu al moeten voldoen en migreren naar post-quantum standaarden (CNSA 2.0 richtlijnen).

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: Biedt volledige post-quantumveiligheid gebaseerd op de wiskundige hardheid van roosterproblemen zoals LWE en SIS (Short Integer Solution) over module-roosters. Er zijn geen bekende wiskundige zwakheden. Wel moeten implementaties zorgvuldig worden beschermd tegen side-channel timing-aanvallen en foutinjectie-aanvallen (fault injection attacks) tijdens de rejection-stap.
- **Benodigde resources voor een brute-force aanval**: Beschikbaar in drie beveiligingsniveaus:
  - ML-DSA-44 (NIST Niveau 2, vergelijkbaar met AES-128)
  - ML-DSA-65 (NIST Niveau 3, vergelijkbaar met AES-192) - de meest aanbevolen variant.
  - ML-DSA-87 (NIST Niveau 5, vergelijkbaar met AES-256)
  Klassieke of quantum brute-force is wiskundig onmogelijk.
- **Quantum computers**: **Volledig quantum-resistent**. Ontworpen om bestand te zijn tegen Shor's en Grover's algoritmes.

### Wiskunde
- **Wiskundige werking in detail**: Dilithium maakt gebruik van de polynomiale ring:
  $$R_q = \mathbb{Z}_q[X] / (X^{256} + 1)$$
  waarbij $q = 8380417$ (een priemgetal dat specifiek is gekozen om NTT-berekeningen te vergemakkelijken).
  De veiligheid is direct gekoppeld aan de moeilijkheid om korte vectoren te vinden in een hoog-dimensionaal rooster (Module-SIS en Module-LWE problemen). De cruciale "Fiat-Shamir met Aborts" techniek zorgt ervoor dat de ruisverdeling van de handtekening volledig onafhankelijk is van de geheime privésleutel, wat voorkomt dat een aanvaller door het analyseren van veel handtekeningen de privésleutel kan reconstrueren.

### Vergelijken
- **Vergelijking met andere algoritmes**: Concurreert met klassieke ECDSA/Ed25519 en andere PQC-handtekeningvoorstellen zoals Falcon en SPHINCS+.
- **Voordelen**:
  - Volledig quantum-resistent.
  - Zeer snelle berekeningen dankzij de Number Theoretic Transform (NTT).
  - Makkelijker en veiliger te implementeren in software dan Falcon (dat complexe zwevende-kommagetal rekenkunde vereist).
- **Nadelen**:
  - Zeer grote publieke sleutels en handtekeningen vergeleken met ECC.
  - Verhoogde netwerklatency door grotere certificaten.
- **Geschiktheid voor moderne toepassingen**: Dilithium (ML-DSA) is de absolute eerste keuze voor de overgang naar post-quantum digitale handtekeningen en wordt de nieuwe industriële standaard voor de komende decennia.

---

## SHA-2 familie (Secure Hash Algorithm 2)
Ontwerpers: National Security Agency (NSA)  
Type: cryptografische hashfunctie, hashing-algoritme
Betrekking tot: SHA-256, SHA-512, etc.

### Werking van het algoritme
De SHA-2 familie bestaat uit een set van cryptografische hashfuncties (waaronder SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224 en SHA-512/256). Een hashfunctie is een eenrichtingsfunctie (one-way function) die invoer van een willekeurige lengte omzet in een unieke hexadecimale string van een vaste lengte (bijvoorbeeld 256 bits voor SHA-256).
SHA-2 maakt gebruik van de **Merkle-Damgård constructie**:
1. De invoerdata wordt aangevuld (padded) zodat de lengte een veelvoud is van 512 bits (voor SHA-256) of 1024 bits (voor SHA-512).
2. De data wordt opgedeeld in blokken van vaste grootte.
3. Elk blok wordt opeenvolgend verwerkt door een compressiefunctie die de huidige invoer combineert met de tussentijdse hashwaarde (de interne status) van het vorige blok.
4. De uiteindelijke interne status na het laatste blok vormt de output-hash.

### Prestaties en efficiëntie
SHA-2 is ontworpen om snel te zijn in software en hardware. Moderne CPU's (zowel x86_64 als ARM) bevatten vaak specifieke instructiessets voor hardware-versnelling van SHA-256. Hierdoor kan SHA-256 met minimale CPU-overhead worden berekend. 
Interessant is dat **SHA-512 op 64-bit processoren vaak sneller is dan SHA-256**. Dit komt doordat SHA-512 intern werkt met 64-bit woorden en registers, terwijl SHA-256 werkt met 32-bit woorden. Op 64-bit systemen kan SHA-512 dus meer data per CPU-cyclus verwerken.

### Toepassingen in de praktijk
- **Integriteitscontrole**: Verifiëren of gedownloade bestanden of software-updates niet zijn aangepast (bijvoorbeeld d.m.v. een SHA-256 checksum).
- **SSL/TLS-certificaten**: Handtekeningen op certificaten worden berekend over de SHA-256 of SHA-384 hash van het certificaat.
- **Blockchains**: Bitcoin gebruikt dubbele SHA-256 (`SHA256(SHA256(data))`) voor Proof-of-Work mining en het genereren van transactie-adressen.
- **Berichtauthenticatie**: Gebruikt als basis voor HMAC-constructies (zoals HMAC-SHA256).

### Veiligheid
- **Veiligheid en mogelijke kwetsbaarheden**: SHA-2 is uiterst veilig. Er zijn tot op heden geen succesvolle botsingsaanvallen (collision attacks) of preimage-aanvallen tegen de SHA-2 familie gerapporteerd. 
  Echter, door de Merkle-Damgård constructie is SHA-2 inherent kwetsbaar voor **lengte-uitbreidingsaanvallen (length extension attacks)**. Als een aanvaller de hash van een geheim bericht $H(\text{secret} \mathbin{\Vert} \text{message})$ kent, kan hij de hash van $H(\text{secret} \mathbin{\Vert} \text{message} \mathbin{\Vert} \text{extra\_data})$ berekenen zonder de inhoud van de `secret` te kennen. Dit maakt SHA-2 onveilig voor directe, naïeve berichtauthenticatie (waarvoor men daarom altijd HMAC moet gebruiken).
- **Benodigde resources voor een brute-force aanval**: SHA-2 is ontworpen om zo snel en efficiënt mogelijk te zijn. Het is **niet** bewust belastend gemaakt. Desondanks is de output-ruimte van $2^{256}$ of $2^{512}$ bits zo onvoorstelbaar groot dat een brute-force aanval om een botsing of origineel bericht te vinden met klassieke computers volstrekt onmogelijk is.
- **Quantum computers**: Grover's algoritme vermindert de preimage-resistentie van hashfuncties tot de helft. Dit betekent dat SHA-256 effectief 128 bits aan quantumbeveiliging biedt, en SHA-512 maar liefst 256 bits. Beide zijn hiermee volledig quantum-resistent.

### Wiskunde
- **Wiskundige werking in detail**: SHA-256 werkt met een interne status van acht 32-bit registers (A t/m H) die worden geïnitialiseerd met de fractionele delen van de vierkantswortels van de eerste 8 priemgetallen. De compressiefunctie voert 64 ronden uit. In elke ronde worden logische bitsgewijze bewerkingen uitgevoerd:
  - **AND** ($\wedge$), **XOR** ($\oplus$), **OR** ($\vee$), **NOT** ($\neg$).
  - **Bitwise rotation** (rotatie naar rechts) en **bitwise shift** (verschuiving naar rechts).
  - De functies **Ch** (Choose) en **Maj** (Majority):
    $$\text{Ch}(x, y, z) = (x \wedge y) \oplus (\neg x \wedge z)$$
    $$\text{Maj}(x, y, z) = (x \wedge y) \oplus (x \wedge z) \oplus (y \wedge z)$$
- **Wiskundige principes en voorbeelden**: De ronde-constanten van SHA-256 zijn afgeleid van de fractionele delen van de derdemachtswortels van de eerste 64 priemgetallen. Dit garandeert dat de constanten geen verborgen wiskundige structuren bezitten ("nothing-up-my-sleeve numbers"). De combinatie van lineaire operaties (zoals optelling modulo $2^{32}$) met niet-lineaire logische functies zorgt voor een snelle diffusie, waardoor na enkele ronden elk bit in de invoer invloed heeft op elk bit in de uitvoer (avalanche-effect).

### Vergelijken
- **Vergelijking met andere algoritmes**: SHA-2 verving SHA-1 en MD5, die beide volledig onveilig zijn wegens succesvolle botsingsaanvallen. Het concurreert met SHA-3 en BLAKE3.
- **Voordelen**:
  - Wereldwijde standaard en universeel ondersteund.
  - Zeer snel op moderne CPU's dankzij ingebouwde hardware-instructies.
- **Nadelen**:
  - Kwetsbaar voor lengte-uitbreidingsaanvallen (vereist HMAC voor berichtauthenticatie).
  - Trager in software op systemen zonder hardware-versnelling vergeleken met BLAKE2/BLAKE3.
- **Geschiktheid voor moderne toepassingen**: Uitstekend geschikt voor alle algemene integriteitscontroles, digitale handtekeningen en toepassingen waar NIST-compliantie verplicht is.

---

## SHA-3 (Secure Hash Algorithm 3)
Ontwerpers: Guido Bertoni, Joan Daemen, Michaël Peeters en Gilles Van Assche (Keccak-team)  
Type: cryptografische hashfunctie, hashing-algoritme

### Werking van het algoritme
SHA-3 is de nieuwste cryptografische hash-standaard van NIST, gebaseerd op het **Keccak**-algoritme. Het is niet ontworpen om SHA-2 te vervangen (omdat SHA-2 nog niet gebroken is), maar om te dienen als een fundamenteel ander alternatief mocht er ooit een aanval op SHA-2 worden ontdekt.
In tegenstelling tot de Merkle-Damgård-constructie van SHA-2, maakt SHA-3 gebruik van een **sponsconstructie (sponge construction)**:
1. **Absorberen (Absorbing)**: De invoerdata wordt opgedeeld in blokken en stap voor stap in de interne status van 1600 bits "geabsorbeerd" met behulp van XOR-operaties.
2. **Permuteren (Permuting)**: Na elk geabsorbeerd blok wordt de interne status grondig door elkaar geschud via een complexe permutatiefunctie (Keccak-f) bestaande uit 24 ronden.
3. **Uitpersen (Squeezing)**: Zodra alle data is verwerkt, wordt de gewenste hash-lengte in stappen uit de interne status "geperst".

### Prestaties en efficiëntie
SHA-3 is ontworpen om uiterst efficiënt te zijn in hardware-implementaties (zoals ASIC's en FPGA's), waar het aanzienlijk minder poorten en energie verbruikt dan SHA-2. 
In software op standaard CPU's (zonder specifieke hardware-ondersteuning) is SHA-3 echter **merkbaar trager dan SHA-2**. Hoewel nieuwere processoren steeds vaker SHA-3 hardware-extensies bevatten, is de software-implementatie op oudere hardware relatief zwaar.

### Toepassingen in de praktijk
- **Ethereum**: De blockchain van Ethereum maakt intensief gebruik van **Keccak-256** (een directe voorloper en nagenoeg identieke variant van de officiële SHA3-256) voor transactie-adressen, smart contracts en state validation.
- **Beveiligde systemen**: Gebruikt in moderne cryptografische bibliotheken en overheidssystemen die een alternatief zoeken voor SHA-2 dat immuun is voor specifieke klasse-aanvallen.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: SHA-3 is mathematisch uiterst robuust en er zijn geen bruikbare cryptanalytische aanvallen op bekend. Dankzij de sponsconstructie is SHA-3 **volledig immuun voor lengte-uitbreidingsaanvallen**. Dit betekent dat men direct een veilige Message Authentication Code (MAC) kan bouwen door simpelweg de sleutel voor het bericht te plaatsen: $H(\text{key} \mathbin{\Vert} \text{message})$, zonder de noodzaak voor de complexere HMAC-constructie.
- **Benodigde resources voor een brute-force aanval**: Net als SHA-2 is het ontworpen voor snelheid in hardware en is het niet bewust belastend gemaakt. Brute-force is onmogelijk wegens de enorme output-ruimtes.
- **Quantum computers**: Volledig quantum-resistent onder Grover's algoritme.

### Wiskunde
- **Wiskundige werking in detail**: De interne toestand van 1600 bits is georganiseerd als een driedimensionale matrix van $5 \times 5$ kolommen van elk 64 bits (een *lane*). De Keccak-f[1600] permutatie voert 24 ronden uit, waarbij elke ronde bestaat uit vijf opeenvolgende stappen:
  - $\theta$ (theta): Een lineaire stap die zorgt voor diffusie tussen de kolommen.
  - $\rho$ (rho): Roteert de bits binnen elke lane met een specifieke constante offset.
  - $\pi$ (pi): Permuteert de posities van de lanes binnen de matrix.
  - $\chi$ (chi): De enige niet-lineaire stap in het algoritme, die fungeert als een algebraïsche S-Box op basis van bitsgewijze logische operaties.
  - $\iota$ (iota): Voegt een ronde-constante toe aan de status om symmetrie te breken.
- **Wiskundige principes en voorbeelden**: De niet-lineaire stap $\chi$ berekent de nieuwe waarde van een bit door deze te XOR-en met de AND-combinatie van naburige bits:
  $$A[x] \leftarrow A[x] \oplus (\neg A[x+1] \wedge A[x+2])$$
  Deze vergelijking is uiterst eenvoudig maar zorgt voor een uitmuntende cryptografische verwarring (confusion).

### Vergelijken
- **Vergelijking met andere algoritmes**: Directe concurrent van SHA-2 en BLAKE2/BLAKE3.
- **Voordelen**:
  - Inherent immuun voor lengte-uitbreidingsaanvallen.
  - Uiterst elegant, flexibel en robuust wiskundig ontwerp (sponsconstructie).
  - Zeer efficiënt en snel in hardware (silicium).
- **Nadelen**:
  - Trager in software op de meeste standaard CPU's in vergelijking met SHA-2 en BLAKE2/BLAKE3.
- **Geschiktheid voor moderne toepassingen**: Uitstekende keuze voor blockchain-systemen, hardware-encryptie, en toepassingen waar resistentie tegen lengte-uitbreidingsaanvallen cruciaal is zonder HMAC-overhead.

---

## BLAKE2
Ontwerpers: Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O'Hearn en Christian Winnerlein  
Type: cryptografische hashfunctie, hashing-algoritme

### Werking van het algoritme
BLAKE2 is een snelle en veilige cryptografische hashfunctie die is voortgekomen uit BLAKE (een van de finalisten van de SHA-3 competitie). Het is specifiek ontworpen om extreem snel te presteren in software op standaard CPU's, terwijl het minstens zo veilig is als SHA-3. 
BLAKE2 is beschikbaar in twee hoofdvarianten:
- **BLAKE2b**: Geoptimaliseerd voor 64-bit platformen (inclusief ARM64 en x86-64). Produceert hashes tot 512 bits.
- **BLAKE2s**: Geoptimaliseerd voor 8-, 16- en 32-bit platformen (zoals microcontrollers). Produceert hashes tot 256 bits.

Het algoritme maakt gebruik van een compressiefunctie die is gebaseerd op het ChaCha stream cipher-ontwerp (met een intern ARX-ontwerp), gecombineerd met een HAIFA-achtige structuur om lengte-uitbreidingsaanvallen tegen te gaan.

### Prestaties en efficiëntie
BLAKE2b is een van de allersnelste cryptografische hashfuncties in software. Op moderne 64-bit CPU's is BLAKE2b **sneller dan SHA-256, SHA-512 en SHA-3**. Het vereist geen specifieke hardware-instructies om deze hoge snelheid te halen, omdat het optimaal gebruikmaakt van de natuurlijke 64-bit registers en SIMD-pijplijnen van de processor.

### Toepassingen in de praktijk
- **Wachtwoord-hashing**: Het geavanceerde wachtwoord-hashalgoritme **Argon2** maakt intern intensief gebruik van BLAKE2b voor zijn snelle hash-operaties.
- **Bestandssystemen**: Veelgebruikt voor het berekenen van snelle en veilige checksums in moderne bestandssystemen zoals **Btrfs** en **ZFS**.
- **Cryptocurrencies**: Gebruikt in diverse privacy-muntprotocollen zoals Monero en Zcash voor netwerkbeveiliging en adresberekeningen.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: BLAKE2 is uiterst veilig en heeft een zeer brede peer-review ondergaan. Er zijn geen praktische of theoretische zwakheden bekend. Net als SHA-3 is BLAKE2 **volledig immuun voor lengte-uitbreidingsaanvallen**. Daarnaast biedt BLAKE2 ingebouwde ondersteuning voor *keyed hashing* (berichten authenticeren met een geheime sleutel), waardoor het direct als een uiterst snelle en veilige MAC kan worden ingezet zonder de complexiteit en overhead van HMAC.
- **Benodigde resources voor een brute-force aanval**: Ontworpen voor maximale softwareprestaties en is **niet** bewust belastend gemaakt. Brute-force is wegens de enorme output-grootte wiskundig onmogelijk.
- **Quantum computers**: Volledig quantum-resistent onder Grover's algoritme.

### Wiskunde
- **Wiskundige werking in detail**: De interne compressiefunctie van BLAKE2b werkt op een status van 16 64-bit woorden, georganiseerd in een $4 \times 4$ matrix. De helft van de matrix wordt geïnitialiseerd met de huidige hash-status, de andere helft met vaste constanten en parameters (zoals het aantal verwerkte bytes). Het algoritme voert 12 ronden uit, waarbij in elke ronde een reeks van 8 Quarter Rounds (zoals in ChaCha) wordt uitgevoerd op de kolommen en diagonalen van de status.
- **Wiskundige principes en voorbeelden**: De Quarter Round functie maakt gebruik van ARX (Addition-Rotation-XOR) wiskunde modulo $2^{64}$:
  1. $a \leftarrow a + b + m_i \pmod{2^{64}}; \quad d \leftarrow (d \oplus a) \lll 32$
  2. $c \leftarrow c + d \pmod{2^{64}}; \quad b \leftarrow (b \oplus c) \lll 24$
  3. $a \leftarrow a + b + m_j \pmod{2^{64}}; \quad d \leftarrow (d \oplus a) \lll 16$
  4. $c \leftarrow c + d \pmod{2^{64}}; \quad b \leftarrow (b \oplus c) \lll 63$
  Hierbij zijn $m_i$ en $m_j$ specifieke segmenten van het invoerbericht. Dit zorgt voor een onmiddellijke vermenging van berichtdata met de interne status.

### Vergelijken
- **Vergelijking met andere algoritmes**: Concurreert direct met SHA-2, SHA-3 en BLAKE3.
- **Voordelen**:
  - Extreem snel in software op 64-bit CPU's zonder hardware-versnelling.
  - Immuun voor lengte-uitbreidingsaanvallen.
  - Ondersteunt ingebouwde *keyed hashing* (direct MAC-gebruik).
- **Nadelen**:
  - Is geen officiële FIPS- of NIST-standaard (zoals SHA-2/SHA-3), waardoor het soms niet is toegestaan in streng gereguleerde overheidsomgevingen.
- **Geschiktheid voor moderne toepassingen**: Uitstekende keuze voor softwareprojecten, bestandssystemen en applicaties die een snelle, moderne en side-channel-resistente hashfunctie vereisen.

---

## BLAKE3
Ontwerpers: Jack O'Connor, Jean-Philippe Aumasson, Samuel Neves en Zooko Wilcox-O'Hearn  
Type: cryptografische hashfunctie, hashing-algoritme

### Werking van het algoritme
BLAKE3 is een hypermoderne, revolutionaire cryptografische hashfunctie (gepubliceerd in 2020) die is voortgekomen uit BLAKE2 en het *Bao* boomhashing-ontwerp. Het is ontworpen om de absolute limiet van software- en hardwareprestaties op te zoeken, ongeacht de grootte van de invoerdata.
De fundamentele werking van BLAKE3 berust op een **binaire Merkle-boomstructuur**:
1. De invoerdata wordt opgedeeld in onafhankelijke blokken van 1024 bytes (1 kB).
2. Elk blok wordt onafhankelijk gehashed met een gereduceerde variant van de BLAKE2s-compressiefunctie.
3. De resulterende hashes vormen de bladeren van een binaire Merkle-tree.
4. Deze boom wordt niveau voor niveau omhoog gecomprimeerd door paren van hashes samen te hashen, totdat er één enkele wortelhash (the *root hash*) overblijft. Deze root hash vormt de uiteindelijke output van BLAKE3.

### Prestaties en efficiëntie
BLAKE3 is **onvoorstelbaar snel**. Het is vele malen sneller dan BLAKE2b, SHA-256, SHA-512 en SHA-3. 
Dankzij de Merkle-boomstructuur kan het hashen van een enkel bestand volledig worden **geparalleliseerd** over alle beschikbare CPU-kernen. Bovendien maakt BLAKE3 intensief gebruik van vector-instructies (SIMD) zoals SSE4.1, AVX2, AVX-512 en ARM Neon. Hoe breder de registers en hoe meer CPU-kernen, hoe sneller BLAKE3 de data kan verwerken. Zelfs op een enkele kern is het aanzienlijk sneller dan elk ander modern alternatief.

### Toepassingen in de praktijk
- **Grootschalige dataverwerking**: Berekenen van checksums voor gigantische datasets of mediabestanden.
- **Gedistribueerde systemen**: Gebruikt in protocollen zoals **IPFS** (InterPlanetary File System) voor data-addressering.
- **Compilers en build-tools**: Snelle detectie van bestandswijzigingen om incrementeel bouwen te versnellen.
- **Cryptografische protocollen**: Overal waar extreem snelle hashing, sleutelafleiding (KDF) of MAC-functionaliteit nodig is.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: BLAKE3 biedt een solide 128-bit cryptografisch beveiligingsniveau tegen botsingen (collisions) en pre-image aanvallen (vergelijkbaar met SHA-256 en BLAKE2s). Er zijn geen kwetsbaarheden bekend. Het is **volledig immuun voor lengte-uitbreidingsaanvallen**. 
  BLAKE3 is bovendien een "all-in-one" tool: het ondersteunt out-of-the-box drie modi:
  - Standaard hashing.
  - Keyed hashing (MAC-modus voor berichtauthenticatie).
  - Key derivation (KDF-modus voor het veilig afleiden van sleutels).
- **Benodigde resources voor een brute-force aanval**: Ontworpen voor maximale softwareprestaties en is **niet** bewust belastend gemaakt. Volledig resistent tegen brute-force.
- **Quantum computers**: Volledig quantum-resistent.

### Wiskunde
- **Wiskundige werking in detail**: BLAKE3 gebruikt intern de compressiefunctie van BLAKE2s (werkend op 32-bit woorden), maar reduceert het aantal ronden van 10 naar 7. Dit is veilig omdat de boomstructuur extra wiskundige garanties biedt en de diffusie over de gehele invoer veel sterker is.
- **Wiskundige principes en voorbeelden**: De binaire boomstructuur wordt beschreven door wiskundige indexering van de knopen (nodes). Bij het hashen van elk blok wordt een vlag (flag) meegegeven aan de compressiefunctie die de positie van het blok in de boom aanduidt (bijvoorbeeld of het een startblok, een tussenblok of een wortelblok is). Dit voorkomt zogeheten *second-preimage* aanvallen waarbij een aanvaller een boomstructuur probeert te vervalsen.

### Vergelijken
- **Vergelijking met andere algoritmes**: BLAKE3 presteert beter dan alle voorgaande cryptografische hashfuncties (SHA-2, SHA-3, BLAKE2) op het gebied van pure snelheid en parallelisatie.
- **Voordelen**:
  - Veruit de snelste cryptografische hashfunctie ter wereld.
  - Oneindig paralleliseerbaar over meerdere CPU-kernen en SIMD-registers.
  - Immuun voor lengte-uitbreidingsaanvallen.
  - Multifunctioneel (hash, MAC en KDF ingebouwd).
- **Nadelen**:
  - Relatief nieuw (gepubliceerd in 2020), waardoor het nog niet zo breed is gestandaardiseerd in enterprise- of overheidsrichtlijnen als SHA-2.
- **Geschiktheid voor moderne toepassingen**: De absolute aanbeveling voor alle moderne software-ontwikkeling, cloud-infrastructuur, bestandssystemen en toepassingen waar pure prestaties en integriteit gecombineerd moeten worden.

---

## bcrypt
Ontwerpers: Niels Provos en David Mazières  
Type: wachtwoord-hashing algoritme, hashing-algoritme

### Werking van het algoritme
bcrypt is een adaptief wachtwoord-hashing algoritme gebaseerd op het Blowfish symmetrische blokcijfer. Het lost het probleem op dat traditionele hashfuncties (zoals SHA-256 of MD5) te snel zijn, waardoor ze kwetsbaar zijn voor grootschalige brute-force aanvallen wanneer ze voor wachtwoorden worden gebruikt.
De werking van bcrypt is als volgt:
1. Er wordt een willekeurige 128-bit salt (zout) gegenereerd. Dit zout voorkomt het gebruik van pre-berekende tabellen (rainbow tables) en zorgt ervoor dat twee identieke wachtwoorden een volledig andere hash opleveren.
2. Het algoritme maakt gebruik van een uniek sleutelopzetschema genaamd **Eksblowfish** (Expensive Key Setup Blowfish).
3. Eksblowfish gebruikt het wachtwoord en de salt om de interne S-Boxes en subkeys van Blowfish herhaaldelijk te initialiseren en te modificeren over een groot aantal ronden (bepaald door de kostfactor).
4. Vervolgens versleutelt het algoritme herhaaldelijk de vaste tekst `"OrpheanBeholderScryDoubt"` met de resulterende Eksblowfish-sleutel.
5. De uiteindelijke bcrypt-hash bevat de kostfactor, de salt en de resulterende gecodeerde ciphertext in een gestandaardiseerd formaat (meestal beginnend met `$2a$`, `$2b$` of `$2y$`).

### Prestaties en efficiëntie
bcrypt is **bewust extreem traag gemaakt** en computationeel zwaar. De rekentijd is instelbaar met een kostfactor (work factor) van $2^{\text{cost}}$. Elke verhoging van de kostfactor met 1 verdubbelt de benodigde tijd om een hash te berekenen. Een kostfactor van 10 of 12 (wat ongeveer 100 tot 300 milliseconden duurt per hash op moderne hardware) is tegenwoordig de standaard om een goede balans te vinden tussen serverprestaties en weerstand tegen brute-force.

### Toepassingen in de praktijk
- **Wachtwoordopslag**: De de facto standaard in veel webframeworks (zoals Ruby on Rails, Django, Node.js bcrypt module, en Spring Security) voor het veilig opslaan van gebruikerswachtwoorden in databases.
- **Systeembeveiliging**: Gebruikt voor wachtwoord-hashing in Unix- en BSD-besturingssystemen.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: bcrypt is mathematisch zeer robuust en al meer dan 25 jaar uiterst betrouwbaar gebleken zonder bekende theoretische kwetsbaarheden. 
  Er zijn echter twee praktische beperkingen:
  - **72-byte limiet**: Eksblowfish negeert alle tekens na de eerste 72 bytes van het wachtwoord. Wachtwoorden die langer zijn dan 72 bytes worden dus effectief ingekort. Ontwikkelaars lossen dit soms op door het wachtwoord eerst te pre-hashen met SHA-256 en de resulterende hash naar bcrypt te sturen (dit moet wel zorgvuldig gebeuren om null-byte kwetsbaarheden te voorkomen).
  - **Gevoeligheid voor hardware-acceleratie**: bcrypt is een CPU-gebonden algoritme dat relatief weinig geheugen (RAM) gebruikt (slechts 4 kB). Hierdoor kan een aanvaller met specifieke hardware (zoals krachtige GPU's, FPGA's of ASIC's) de berekening zeer effectief paralleliseren om miljoenen bcrypt-hashes offline te testen, hoewel het nog steeds veel trager is dan SHA-256.
- **Benodigde resources voor een brute-force aanval**: **Ja, bcrypt is bewust belastend gemaakt**. Het is ontworpen om de processor maximaal te belasten door de Eksblowfish-sleutelopzet duizenden keren te herhalen. Dit maakt online brute-force aanvallen op een server onmogelijk en offline brute-force aanvaten uiterst kostbaar.
- **Quantum computers**: Volledig quantum-resistent. Omdat wachtwoorden offline kraken met Grover's algoritme nog steeds vereist dat elke bcrypt-evaluatie apart moet worden uitgevoerd, biedt de extreme traagheid van bcrypt volledige bescherming.

### Wiskunde
- **Wiskundige werking in detail**: Blowfish gebruikt een Feistel-netwerk met 16 ronden en maakt gebruik van vier 32-bit S-Boxes (elk met 256 ingangen) en een P-array van 18 elementen. De Eksblowfish-sleutelopzet verschilt van Blowfish doordat de S-Boxes en de P-array continu worden overschreven door een XOR-combinatie van het wachtwoord en de salt:
  $$\text{State} \leftarrow \text{EksblowfishKeySetup}(\text{cost}, \text{salt}, \text{password})$$
  Het algoritme voert dit proces $2^{\text{cost}}$ keer herhaaldelijk uit. De wiskundige veiligheid berust op de pseudotoevallige permutaties en de niet-lineaire interactie van de S-Boxes die continu veranderen op basis van de invoer.
- **Wiskundige principes en voorbeelden**: De herhaalde codering van de 192-bit string `"OrpheanBeholderScryDoubt"` (opgedeeld in drie 64-bit blokken) zorgt ervoor dat eventuele kleine correlaties in de Eksblowfish-subkeys volledig worden uitgewist, wat resulteert in een perfect gelijkmatig verdeelde output-hash.

### Vergelijken
- **Vergelijking met andere algoritmes**: Veel veiliger voor wachtwoorden dan SHA-256 of PBKDF2. Wordt tegenwoordig echter overtroffen door Argon2.
- **Voordelen**:
  - Uitstekende, decennia-lang geteste beveiliging.
  - Eenvoudig te configureren via de kostfactor.
  - Inherent beschermd tegen timing-aanvallen.
- **Nadelen**:
  - Harde limiet van 72 bytes op de invoerlengte.
  - Geen memory-hardness, waardoor het gevoelig is voor massale parallelle GPU/ASIC-aanvallen vergeleken met Argon2 of scrypt.
- **Geschiktheid voor moderne toepassingen**: Nog steeds een uitstekende en zeer veilige keuze voor reguliere webapplicaties. Voor nieuwe, grootschalige of high-security systemen heeft Argon2id echter de voorkeur.

---

## Argon2
Ontwerpers: Alex Biryukov, Daniel Dinu en Dmitry Khovratovich  
Type: wachtwoord-hashing algoritme, hashing-algoritme

### Werking van het algoritme
Argon2 is de winnaar van de prestigieuze **Password Hashing Competition (PHC)** in 2015 en is de absolute gouden standaard voor wachtwoord-hashing. Het is specifiek ontworpen om maximale weerstand te bieden tegen aanvallen met gespecialiseerde hardware (zoals GPU's, FPGA's en ASIC's) door gebruik te maken van **memory-hard** cryptografie.
Argon2 vult een enorme, tweedimensionale geheugenmatrix (RAM) met pseudotoevallige data en bewerkt deze in meerdere ronden. Het is beschikbaar in drie varianten:
- **Argon2d**: Maximaliseert de weerstand tegen GPU-gebaseerde kraakaanvallen door data-afhankelijke geheugentoegang. (Geschikt voor cryptocurrencies, maar gevoeliger voor side-channel timing-aanvallen).
- **Argon2i**: Maakt gebruik van data-onafhankelijke geheugentoegang om timing-side-channelaanvallen volledig te elimineren. (Geschikt voor wachtwoord-hashing en authenticatie op servers).
- **Argon2id**: Een hybride variant die het beste van beide combineert. Het gebruikt data-onafhankelijke toegang in de eerste ronde (voor bescherming tegen side-channel timing-aanvallen) en data-afhankelijke toegang in latere ronden (voor maximale GPU- en ASIC-weerstand). Dit is de wereldwijd aanbevolen variant voor wachtwoordopslag.

### Prestaties en efficiëntie
Argon2 is uiterst flexibel en kan exact worden afgestemd op de beschikbare serverhardware via drie onafhankelijke parameters:
1. **Memory ($m$)**: De hoeveelheid RAM-geheugen (in kB) die voor de berekening moet worden gebruikt (bijv. 64 MB).
2. **Time ($t$)**: Het aantal ronden (passes) dat over de geheugenmatrix moet worden uitgevoerd (bijv. 3 ronden).
3. **Parallelism ($p$)**: Het aantal parallelle CPU-threads dat gelijktijdig aan de hash moet werken (bijv. 4 threads).
Dit stelt beheerders in staat om de prestatie-overhead nauwkeurig te beheersen, terwijl aanvallers dwingend worden geconfronteerd met dezelfde zware resource-eisen.

### Toepassingen in de praktijk
- **Wachtwoordopslag**: Aanbevolen door OWASP als de primaire keuze voor gebruikerswachtwoord-hashing in alle moderne webapplicaties.
- **Sleutelafleiding (Key Derivation)**: Gebruikt in moderne database- en kluisversleutelingssoftware zoals **KeePassXC**, **Bitwarden** en **VeraCrypt** om de hoofdsleutel af te leiden van het masterwachtwoord.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: Argon2id biedt de hoogst mogelijke veiligheid tegen offline brute-force aanvallen. Omdat het algoritme vereist dat er grote hoeveelheden snel RAM-geheugen per hash-poging worden gereserveerd, stijgen de kosten voor een aanvaller die een GPU- of ASIC-farm wil bouwen om hashes te kraken exponentieel. Een GPU heeft immers beperkt snel geheugen per core, wat een enorme bottleneck vormt. Er zijn geen wiskundige of theoretische kwetsbaarheden bekend bij Argon2.
- **Benodigde resources voor een brute-force aanval**: **Ja, Argon2 is extreem en bewust belastend gemaakt**. Het is ontworpen om zowel de processor (CPU-cycli) als het werkgeheugen (RAM-bandbreedte) maximaal te belasten. Dit maakt grootschalige offline kraakcampagnes financieel en praktisch onhaalbaar.
- **Quantum computers**: Volledig quantum-resistent. De extreme geheugeneisen en traagheid maken Grover's algoritme onbruikbaar voor het offline kraken van wachtwoorden.

### Wiskunde
- **Wiskundige werking in detail**: Argon2 maakt intern gebruik van de uiterst snelle en veilige **BLAKE2b** hashfunctie om de invoer (wachtwoord, salt en parameters) te hashen en de initiële geheugenblokken te genereren. 
  De geheugenmatrix is opgebouwd uit blokken van 1024 bytes. De compressiefunctie $G$ van Argon2 bewerkt twee opeenvolgende 1024-byte blokken om het volgende blok te berekenen via een reeks bitsgewijze XOR- en vermenigvuldigingsoperaties. De exacte index van het geheugenblok dat in elke stap wordt gelezen, wordt bepaald door de BLAKE2b-output (in Argon2d) of door een vaste, pseudotoevallige generator (in Argon2i).
- **Wiskundige principes en voorbeelden**: De compressiefunctie $G$ is gebaseerd op een permutatie die werkt op 64-bit woorden en is ontworpen om geen opzoektabellen te gebruiken. Dit garandeert constante-tijd berekeningen op de CPU, wat side-channel timing-aanvallen wiskundig uitsluit.

### Vergelijken
- **Vergelijking met andere algoritmes**: Directe en superieure opvolger van bcrypt, scrypt en PBKDF2.
- **Voordelen**:
  - Ongeëvenaarde weerstand tegen parallelle GPU- en ASIC-aanvallen dankzij instelbare *memory-hardness*.
  - Geen limiet op de lengte van het wachtwoord (in tegenstelling tot bcrypt).
  - Volledig paralleliseerbaar over meerdere CPU-kernen.
  - Immuun voor timing-aanvallen (Argon2id/Argon2i).
- **Nadelen**:
  - Vereist aanzienlijk meer geheugen (RAM) op de authenticatieserver. Bij extreem veel gelijktijdige inlogpogingen (of een DDoS-aanval) kan dit leiden tot *resource exhaustion* als de parameters te hoog zijn ingesteld. Beheerders moeten de parameters daarom zorgvuldig afstemmen.
- **Geschiktheid voor moderne toepassingen**: De absolute nummer één aanbeveling voor alle moderne wachtwoord-hashing en sleutelafleidingsbehoeften.

---

## HMAC (Hash-based Message Authentication Code)
Ontwerpers: Mihir Bellare, Ran Canetti en Hugo Krawczyk  
Type: keyed hashing & authenticatie algoritme, hashing-algoritme

### Werking van het algoritme
HMAC is een constructie om een cryptografisch veilige **Message Authentication Code (MAC)** te berekenen met behulp van een willekeurige cryptografische hashfunctie (zoals SHA-256 of SHA-512, resulterend in respectievelijk HMAC-SHA256 of HMAC-SHA512) en een gedeelde geheime sleutel. 
HMAC wordt gebruikt om gelijktijdig de **integriteit** (is het bericht onderweg gewijzigd?) als de **authenticiteit** (komt het bericht daadwerkelijk van de legitieme afzender?) van een bericht te verifiëren.
De werking lost het probleem van lengte-uitbreidingsaanvallen bij Merkle-Damgård hashfuncties op door de geheime sleutel op een specifieke manier tweemaal door de hashfunctie te halen:
1. De sleutel $K$ wordt voorbereid tot een vaste blokgrootte (aangevuld met nullen of gehashed als deze te lang is).
2. De sleutel wordt via XOR gecombineerd met een vaste interne constante genaamd de *inner pad* (`ipad`, herhaalde bytes van `0x36`).
3. Dit resultaat wordt samengevoegd met het bericht en gehashed met de onderliggende hashfunctie.
4. De originele sleutel wordt via XOR gecombineerd met een externe constante genaamd de *outer pad* (`opad`, herhaalde bytes van `0x5C`).
5. Dit resultaat wordt samengevoegd met de hash uit stap 3, en voor een tweede maal gehashed om de uiteindelijke HMAC-tag te produceren.

### Prestaties en efficiëntie
HMAC is extreem snel en efficiënt. Omdat de prestaties direct gekoppeld zijn aan de onderliggende hashfunctie, profiteert HMAC onmiddellijk van hardware-versnelling (zoals SHA-256 instructies op de CPU). De extra overhead ten opzichte van een normale hashberekening is minimaal en verwaarloosbaar, wat HMAC uitermate geschikt maakt voor het real-time verifiëren van grote hoeveelheden netwerkpakketten of API-aanvragen.

### Toepassingen in de praktijk
- **API-authenticatie**: Veelgebruikt door cloud- en betalingsproviders (zoals Amazon Web Services en Stripe) om API-aanvragen te ondertekenen en te verifiëren.
- **JSON Web Tokens (JWT's)**: Het populaire `HS256` en `HS512` algoritme in JWT's is gebaseerd op respectievelijk HMAC-SHA256 en HMAC-SHA512 om te garanderen dat de client-side opgeslagen token niet is gemanipuleerd.
- **Netwerkprotocollen**: Onderdeel van IPsec, TLS en SSH om de integriteit van elk verzonden datapakket te waarborgen.

### Veiligheid
- **Veiligheid en mogelijke kwetswaardheden**: HMAC is mathematisch uiterst robuust. Zelfs wanneer de onderliggende hashfunctie theoretisch verzwakt is (zoals MD5 of SHA-1), blijft de HMAC-variant (HMAC-MD5 of HMAC-SHA1) in de praktijk verrassend goed bestand tegen aanvallen. Dit komt doordat de interne en externe sleutelkoppelingen het onmogelijk maken voor een aanvaller om de interne status van de hash te manipuleren. Uiteraard is voor nieuwe ontwerpen het gebruik van HMAC-SHA256 of HMAC-SHA512 de absolute standaard.
- **Benodigde resources voor een brute-force aanval**: HMAC is ontworpen om zo snel en efficiënt mogelijk te zijn voor real-time verkeer, dus het is **niet** bewust belastend gemaakt. De veiligheid tegen brute-force hangt volledig af van de sterkte en lengte van de gedeelde geheime sleutel. Bij gebruik van een willekeurige sleutel van minimaal 256 bits is brute-force met klassieke computers uitgesloten.
- **Quantum computers**: Volledig quantum-resistent dankzij de symmetrische structuur. Onder Grover's algoritme biedt een 256-bit sleutel een effectieve quantumbeveiliging van 128 bits, wat volkomen onkraakbaar is.

### Wiskunde
- **Wiskundige werking in detail**: De wiskundige formule voor HMAC wordt als volgt gedefinieerd:
  $$\text{HMAC}(K, m) = H\Big( (K' \oplus \text{opad}) \mathbin{\Vert} H\big( (K' \oplus \text{ipad}) \mathbin{\Vert} m \big) \Big)$$
  waarbij:
  - $H$ de onderliggende cryptografische hashfunctie is.
  - $K'$ de voorbereide sleutel is (aangevuld met nullen tot de blokgrootte van de hashfunctie).
  - $\text{ipad}$ het inner padding blok is (bestaande uit herhaalde bytes `0x36`).
  - $\text{opad}$ het outer padding blok is (bestaande uit herhaalde bytes `0x5C`).
  - $\mathbin{\Vert}$ staat voor concatenatie (samenvoegen van bytes).
- **Wiskundige principes en voorbeelden**: De specifieke constante waarden `0x36` (in binair: `00110110`) en `0x5C` (in binair: `01011100`) zijn gekozen omdat ze een grote Hamming-afstand tot elkaar hebben. Het XOR-en van de sleutel met deze twee sterk verschillende bitpatronen zorgt ervoor dat de twee resulterende subkeys cryptografisch onafhankelijk van elkaar zijn, wat wiskundige correlaties tussen de interne en externe hashes voorkomt.

### Vergelijken
- **Vergelijking met andere algoritmes**: Concurreert met asymmetrische digitale handtekeningen (zoals RSA of ECDSA) en modernere symmetrische MAC's (zoals Poly1305 of KMAC).
- **Voordelen**:
  - Symmetrisch en daardoor duizenden malen sneller dan asymmetrische handtekeningen (RSA/ECDSA).
  - Lost de lengte-uitbreidingskwetsbaarheid van traditionele hashfuncties volledig op.
  - Extreem breed ondersteund en gestandaardiseerd.
- **Nadelen**:
  - Vereist dat beide partijen vooraf veilig een identieke geheime sleutel delen.
  - Biedt geen *non-repudiation* (omdat beide partijen de sleutel bezitten, kan de ontvanger theoretisch zelf ook de HMAC-tag hebben gegenereerd, in tegenstelling tot een asymmetrische handtekening).
- **Geschiktheid voor moderne toepassingen**: De absolute standaard voor API-authenticatie, JWT-ondertekening en symmetrische berichtauthenticatie in netwerkprotocollen.

---
