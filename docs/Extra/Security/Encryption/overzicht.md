# Encryptie-algoritmes: overzicht
Hieronder een gestructureerd overzicht in 3 hoofdcategorieën: symmetrische encryptie, asymmetrische encryptie en hashing algoritmes. Daarna verder opgedeeld in subcategorieën op basis van hun werkingsmechanisme en gebruik.
Bij elk algoritme staan nu ook drie korte metadataregels: type, huidige standaard in productie en quantumveiligheid.

## Symmetrische encryptie
### Block ciphers
(werken op vaste blokken data, bv. 128 bit)  

Block ciphers zijn algoritmes die data in vaste blokken verwerken. Ze gebruiken dezelfde sleutel voor zowel encryptie als decryptie. Hieronder enkele bekende block ciphers:

#### AES (Advanced Encryption Standard)
Ontwerpers: Vincent Rijmen en Joan Daemen
- Type: data encryptie
- Standaard in productie: ja, de de-facto standaard voor symmetrische encryptie
- Quantumveilig: nee in strikte zin, maar nog steeds sterk bij voldoende sleutelgrootte
- huidige standaard voor symmetrische encryptie
- gebasseerd op Rijndael algoritme
- gebasseerd op een substitution-permutation netwerk
- sleutellengtes: 128, 192, 256 bits
- Het wordt gebruikt in veel protocollen zoals TLS, IPsec, en WPA2.

#### DES (Data Encryption Standard)
Ontwerper: IBM
- Type: data encryptie
- Standaard in productie: nee, vervangen door AES
- Quantumveilig: nee
- voorganger van AES
- sluetellengte: 56 bits
- werd vervangen door AES vanwege kwetsbaarheden en korte sleutellengte
- aanwezig in legacy systemen en protocollen

#### 3DES (Triple DES)
Ontwerper: IBM
- Type: data encryptie
- Standaard in productie: nee, enkel legacy
- Quantumveilig: nee
- uitbreiding van DES
- past DES drie keer toe met verschillende sleutels
- tussenoplossing voor de korte sleutellengte van DES
- erg traag en wordt niet meer aanbevolen voor nieuwe toepassingen
- terug te vinden in oudere betaalsystemen (bijv. EMV) en legacy software

#### Blowfish
Ontwerper: Bruce Schneier
- Type: data encryptie
- Standaard in productie: nee, vooral legacy
- Quantumveilig: nee
- vrij beschikbaar block cipher
- variabele sleutellengte van 32 tot 448 bits
- Gebruikt in oudere tools en protocollen, zoals OpenSSH en bcrypt (voor wachtwoord hashing)

#### Twofish
Ontwerper: Bruce Schneier
- Type: data encryptie
- Standaard in productie: nee, weinig gebruikt in moderne productie
- Quantumveilig: nee
- opvolger van Blowfish
- sleutellengtes: 128, 192, 256 bits
- ontworpen voor hoge prestaties en veiligheid
- verloor in de AES-competitie

#### Serpent
Ontwerpers: Ross Anderson, Eli Biham, Lars Knudsen
- Type: data encryptie
- Standaard in productie: nee, niche en zelden standaardkeuze
- Quantumveilig: nee
- finalist in de AES-competitie
- sleutellengtes: 128, 192, 256 bits
- ontworpen voor maximale veiligheid, maar minder efficiënt dan AES

### Stream ciphers
(versleutelen data bit-voor-bit of byte-voor-byte)  

Stream ciphers zijn algoritmes die data bit-voor-bit of byte-voor-byte verwerken. Ze gebruiken dezelfde sleutel voor zowel encryptie als decryptie. Hieronder enkele bekende stream ciphers:

#### ChaCha20
Ontwerper: Daniel J. Bernstein
- Type: data encryptie
- Standaard in productie: ja, vaak samen met Poly1305 als ChaCha20-Poly1305
- Quantumveilig: nee in strikte zin, maar momenteel een sterke keuze
- moderne stream cipher
- vaak gecombineerd met Poly1305 voor authenticatie (ChaCha20-Poly1305)
- sneller dan AES op hardware zonder AES-versneling
- wordt gebruikt in TLS 1.3, Wireguard en Google in Android

#### RC4
Ontwerper: Ron Rivest
- Type: data encryptie
- Standaard in productie: nee, onveilig en uitgefaseerd
- Quantumveilig: nee
- verouderde stream cipher
- werd veel gebruikt in SSL/TLS en WEP, maar is nu als onveilig beschouwd

#### Salsa20
Ontwerper: Daniel J. Bernstein
- Type: data encryptie
- Standaard in productie: nee, eerder niche dan standaard
- Quantumveilig: nee in strikte zin, maar niet fundamenteel gebroken
- stream cipher, voorganger van ChaCha20
- minder gangbaar in productie
- belangrijk als basis voor moderne stream ciphers zoals ChaCha20

## Asymmetrische encryptie
### Gebaseerd op integer factorisatie
#### RSA (Rivest-Shamir-Adleman)
Ontwerpers: Ron Rivest, Adi Shamir, Leonard Adleman
- Type: asymmetrische encryptie en digitale handtekeningen
- Standaard in productie: ja, vooral voor certificaten en compatibiliteit; minder de voorkeurskeuze voor nieuwe systemen
- Quantumveilig: nee
- gebasseerd op het probleem van integer factorisatie
- gebasseerd op de moeilijkheid om grote getallen te factoriseren in priemfactoren
- gebruikt voor encryptie, digitale handtekeningen, certificaten, sleuteluitwisseling en JWT's
- sleutellengtes: 1024, 2048, 4096 bits

### Gebaseerd op discrete logaritmes
#### Diffie-Hellman
Ontwerpers: Whitfield Diffie en Martin Hellman
- Type: sleuteluitwisseling
- Standaard in productie: ja, maar meestal als ECDH in moderne protocollen
- Quantumveilig: nee
- geen **versleutelalgoritme**, maar een **sleuteluitwisselingsprotocol**
- laat 2 partijen toe om een gedeelde geheime sleutel te genereren over een onveilig openbaar kanaal, zonder die geheime sleutel ooit te verzenden
- ze spreken een sleutel af zonder dat ze elkaar ooit hebben ontmoet
- basis van veel TLS-handshakes

#### ElGamal
Ontwerper: Taher Elgamal
- Type: data encryptie, handtekeningen en sleuteluitwisseling
- Standaard in productie: nee, vooral niche en PGP/GPG-context
- Quantumveilig: nee
- gebaseerd op het Diffie-Hellman probleem
- gebruikt voor versleuteling, handtekeningen en sleuteluitwisseling
- onder meer in GPG/PGP-implementaties

#### DSA (Digital Signature Algorithm)
Ontwerpers: David Diffie, IEEE
- Type: digitale handtekeningen
- Standaard in productie: nee, vervangen door ECDSA en Ed25519
- Quantumveilig: nee
- ontworpen voor digitale handtekeningen, niet voor encryptie
- lange tijd de standaard voor digitale handtekeningen in de VS
- sleutellengtes: 1024, 2048, 3072 bits
- vervangen door ECDSA in moderne toepassingen

### Gebaseerd op elliptische krommen (Elliptic Curve Cryptography, ECC)
#### ECDSA (Elliptic Curve Digital Signature Algorithm)
Ontwerpers: Scott Vanstone, Certicom
- Type: digitale handtekeningen
- Standaard in productie: ja, veelgebruikt in certificaten en cryptosystemen
- Quantumveilig: nee
- biedt dezelfde veiligheid als RSA, maar met kortere sleutels
- 256 bit ECC  ≈ 3072 bit RSA
- dit maakt het sneller, lichter en efficiënter, vooral op mobiele apparaten
- sleutellengtes: 256, 384, 521 bits
- gebruikt in moderne TLS-certificaten, SSH, Bitcoin en andere blockchain-technologieën

#### Ed25519
Ontwerpers: Daniel J. Bernstein, Tanja Lange, Peter Schwabe
- Type: digitale handtekeningen
- Standaard in productie: ja, moderne voorkeurskeuze voor veel nieuwe systemen
- Quantumveilig: nee
- gebaseerd op de Curve25519 elliptische kromme
- moderne, snelle en veilige variant in van EdDSA-familie
- wordt populairder voor SSH-sluetels en handtekeningen
- minder gevoelig voor implementatiefouten dan ECDSA
- sleutellengtes: 256 bits

#### ECDH (Elliptic Curve Diffie-Hellman)
Ontwerpers: Scott Vanstone, Certicom
- Type: sleuteluitwisseling
- Standaard in productie: ja, veel gebruikt in moderne TLS-handshakes
- Quantumveilig: nee
- elliptische kromme variant van het Diffie-Hellman sleuteluitwisselingsprotocol
- gebruikt in moderne TLS-handshakes voor efficiënte en veilige sleuteluitwisseling

### Post-quantum cryptography (PQC)
#### Kyber (ML-KEM)
Ontwerpers: CRYSTALS-team
- Type: sleuteluitwisseling
- Standaard in productie: ja, opkomende post-quantum standaard
- Quantumveilig: ja
- sleuteluitwisselingsalgoritme dat bestand is tegen aanvallen door kwantumcomputers
- gebasseerd op het lattice-probleem, specifiek het Learning With Errors (LWE) probleem
- Begint uitgerold te worden in TLS-implementaties als hybride sleuteluitwisseling, naast traditionele algoritmes zoals ECDH

#### Dilithium (ML-DSA)
Ontwerper: CRYSTALS-team
- Type: digitale handtekeningen
- Standaard in productie: ja, opkomende post-quantum standaard
- Quantumveilig: ja
- digitale handtekeningalgoritme dat bestand is tegen aanvallen door kwantumcomputers

## Hashing algoritmes
### Cryptografische hashfuncties (algemeen doel: integriteit, handtekeningen)
#### MD5 (Message Digest 5)
Ontwerper: Ronald Rivest
- Type: cryptografische hashfunctie
- Standaard in productie: nee, onveilig voor cryptografisch gebruik
- Quantumveilig: nee
- produceert een 128-bit hashwaarde
- cryptografisch gebroken: botsingen (collisions)
- nog steeds gebruikt voor checksums en niet-cryptografische doeleinden
- nooit voor wachtwoordopslag of digitale handtekeningen gebruiken

#### SHA-1 (Secure Hash Algorithm 1)
Ontwerper: NSA
- Type: cryptografische hashfunctie
- Standaard in productie: nee, vervangen door SHA-2/SHA-3
- Quantumveilig: nee
- produceert een 160-bit hashwaarde
- cryptografisch gebroken: botsingen (collisions)
- nog steeds gebruikt in oudere systemen en certificaten, maar wordt niet meer aanbevolen

#### SHA-2 (Secure Hash Algorithm 2)
Ontwerper: NSA
- Type: cryptografische hashfunctie
- Standaard in productie: ja, huidige brede standaard
- Quantumveilig: gedeeltelijk; niet post-quantum, maar nog bruikbaar met voldoende outputlengte
- familie van hashfuncties: SHA-224, SHA-256, SHA-384, SHA-512
- produceert hashwaarden van 224, 256, 384 of 512 bits
- wordt veel gebruikt in moderne toepassingen, zoals TLS, digitale handtekeningen en blockchain-technologieën
- basis voor HMAC (Hash-based Message Authentication Code) voor integriteit en authenticatie
- SHA-256 en SHA-512 zijn de meest gebruikte varianten vandaag (2026)

#### SHA-3 (Secure Hash Algorithm 3)
Ontwerpers: Guido Bertoni, Joan Daemen, Michaël Peeters, Gilles Van Assche
- Type: cryptografische hashfunctie
- Standaard in productie: ja, gestandaardiseerd maar minder wijdverspreid dan SHA-2
- Quantumveilig: gedeeltelijk; niet post-quantum, maar wel sterk ontwerp
- nieuwere standaard met een ander fundamenteel ontwerp dan SHA-2
- Keccak, spongeconstructie in plaats van Merkle-Damgård
- produceert hashwaarden van 224, 256, 384 of 512 bits
- bedoeld als alternatief voor SHA-2, mocht er ooit een zwakte in SHA-2 ontdekt worden
- nog niet zo wijdverspreid in gebruik
- wel gestandaardiseerd in NIST FIPS 202 en ISO/IEC 10118-3

#### BLAKE2/BLAKE3
Ontwerpers: Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O'Hearn, Christian Winnerlein
- Type: cryptografische hashfunctie
- Standaard in productie: ja, in specifieke tools en moderne implementaties
- Quantumveilig: gedeeltelijk; niet post-quantum, maar sterk genoeg voor veel toepassingen
- zeer snelle hashfuncties, veiligheid vergelijkbaar met SHA-3
- BLAKE3 wordt gebruikt in tools zoals Git (als optie) en bepaalde checksum-implementaties
- BLAKE2 is een verbeterde versie van BLAKE, die werd genomineerd voor SHA-3
- BLAKE3 is een verdere verbetering, met focus op snelheid en parallelisatie

### Wachtwoord-hashing algoritmes (algemeen doel: veilige opslag van wachtwoorden)
#### bcrypt
Ontwerper: Niels Provos en David Mazières
- Type: wachtwoord-hashing
- Standaard in productie: ja, nog steeds veelgebruikt maar niet de modernste keuze
- Quantumveilig: nee
- gebaseerd op Blowfish block cipher
- bevat een ingebouwde salt en een work factor (cost) om brute-force aanvallen te vertragen
- één van de meest gebruikte wachtwoord-hashing algoritmes in webapplicaties en frameworks
- langzaam genoeg om brute-force aanvallen te bemoeilijken, maar snel genoeg voor legitiem gebruik

#### scrypt
Ontwerper: Colin Percival
- Type: wachtwoord-hashing
- Standaard in productie: ja, gebruikt maar minder vaak dan Argon2
- Quantumveilig: nee
- memory-hard wachtwoord-hashing algoritme, ontworpen om brute-force aanvallen te bemoeilijken
- vereist veel geheugen, waardoor het moeilijker is om te implementeren op gespecialiseerde hardware zoals ASICs
- GPU/ASIC-aanvallen veel duurder
- gebruikt in wachtwoordopslag en sommige cryptocurrency wallets (bijv. Litecoin)

#### Argon2
Ontwerpers: Alex Biryukov, Daniel Dinu, Dmitry Khovratovich
- Type: wachtwoord-hashing
- Standaard in productie: ja, huidige state-of-the-art en voorkeurskeuze
- Quantumveilig: nee
- winnaar van de Password Hashing Competition (PHC) in 2015
- memory-hard en tijdsintensief, ontworpen om brute-force aanvallen te bemoe
- nu beschouwd als de huidige state-of-the-art voor wachtwoord-hashing
- meerdere varianten: Argon2d (data-dependent), Argon2i (data-independent), Argon2id (hybride)
- OWASP raadt Argon2 aan als de beste keuze voor nieuwe toepassingen

### Keyed hashing & authenticatie algoritmes
#### HMAC (Hash-based Message Authentication Code)
Ontwerpers: Mihir Bellare, Ran Canetti, Hugo Krawczyk
- Type: keyed hashing / authenticatie
- Standaard in productie: ja, zeer breed gebruikt
- Quantumveilig: gedeeltelijk; de veiligheid hangt af van de onderliggende hashfunctie
- gebruikt een cryptografische hashfunctie in combinatie met een geheime sleutel
- combineert een hashfunctie (meestal SHA-256) met een geheime sleutel om een MAC (Message Authentication Code) te genereren
- wordt gebruikt voor integriteit en authenticatie van berichten in veel protocollen, zoals TLS, IPsec en JWT's
- HMAC is bestand tegen length extension attacks, een zwakte die sommige hashfuncties hebben
