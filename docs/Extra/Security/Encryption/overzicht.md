# Encryptie-algoritmes: overzicht
Hieronder een gestructureerd overzicht in 3 hoofdcategorieën: symmetrische encryptie, asymmetrische encryptie en hashing algoritmes. Daarna verder opgedeeld in subcategorieën op basis van hun werkingsmechanisme en gebruik.

## Symmetrische encryptie
### Block ciphers
(werken op vaste blokken data, bv. 128 bit)  

Block ciphers zijn algoritmes die data in vaste blokken verwerken. Ze gebruiken dezelfde sleutel voor zowel encryptie als decryptie. Hieronder enkele bekende block ciphers:

#### AES (Advanced Encryption Standard)
Ontwerpers: Vincent Rijmen en Joan Daemen
- huidige standaard voor symmetrische encryptie
- gebasseerd op Rijndael algoritme
- gebasseerd op een substitution-permutation netwerk
- sleutellengtes: 128, 192, 256 bits
- Het wordt gebruikt in veel protocollen zoals TLS, IPsec, en WPA2.

#### DES (Data Encryption Standard)
Ontwerper: IBM
- voorganger van AES
- sluetellengte: 56 bits
- werd vervangen door AES vanwege kwetsbaarheden en korte sleutellengte
- aanwezig in legacy systemen en protocollen

#### 3DES (Triple DES)
Ontwerper: IBM
- uitbreiding van DES
- past DES drie keer toe met verschillende sleutels
- tussenoplossing voor de korte sleutellengte van DES
- erg traag en wordt niet meer aanbevolen voor nieuwe toepassingen
- terug te vinden in oudere betaalsystemen (bijv. EMV) en legacy software

#### Blowfish
Ontwerper: Bruce Schneier
- vrij beschikbaar block cipher
- variabele sleutellengte van 32 tot 448 bits
- Gebruikt in oudere tools en protocollen, zoals OpenSSH en bcrypt (voor wachtwoord hashing)

#### Twofish
Ontwerper: Bruce Schneier
- opvolger van Blowfish
- sleutellengtes: 128, 192, 256 bits
- ontworpen voor hoge prestaties en veiligheid
- verloor in de AES-competitie

#### Serpent
Ontwerpers: Ross Anderson, Eli Biham, Lars Knudsen
- finalist in de AES-competitie
- sleutellengtes: 128, 192, 256 bits
- ontworpen voor maximale veiligheid, maar minder efficiënt dan AES

### Stream ciphers
(versleutelen data bit-voor-bit of byte-voor-byte)  

Stream ciphers zijn algoritmes die data bit-voor-bit of byte-voor-byte verwerken. Ze gebruiken dezelfde sleutel voor zowel encryptie als decryptie. Hieronder enkele bekende stream ciphers:

#### ChaCha20
Ontwerper: Daniel J. Bernstein
- moderne stream cipher
- vaak gecombineerd met Poly1305 voor authenticatie (ChaCha20-Poly1305)
- sneller dan AES op hardware zonder AES-versneling
- wordt gebruikt in TLS 1.3, Wireguard en Google in Android

#### RC4
Ontwerper: Ron Rivest
- verouderde stream cipher
- werd veel gebruikt in SSL/TLS en WEP, maar is nu als onveilig beschouwd

#### Salsa20
Ontwerper: Daniel J. Bernstein
- stream cipher, voorganger van ChaCha20
- minder gangbaar in productie
- belangrijk als basis voor moderne stream ciphers zoals ChaCha20

## Asymmetrische encryptie

## Hashing algoritmes
