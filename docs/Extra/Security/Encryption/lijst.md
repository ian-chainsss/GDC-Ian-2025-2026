# Encryptie-algoritmes: overzichts lijst
## Alle Encryptie-algoritmes
Hieronder volgt een overzicht van verschillende encryptie-algoritmes, ingedeeld op basis van hun type en gebruik. Deze lijst is bedoeld als referentie voor ontwikkelaars, beveiligingsprofessionals en iedereen die geïnteresseerd is in cryptografie.

### Symmetrische encryptie
#### Block ciphers
- AES (Advanced Encryption Standard)
- DES (Data Encryption Standard)
- 3DES (Triple DES)
- Blowfish
- Twofish
- Serpent

#### Stream ciphers
- ChaCha20
- RC4
- Salsa20

### Asymmetrische encryptie
#### Gebaseerd op integer factorisatie (priemfactorisatie)
- RSA (Rivest-Shamir-Adleman)

#### Gebaseerd op discrete logaritmes
- Diffie-Hellman (DH) - sleuteluitwisseling
- DSA (Digital Signature Algorithm) - digitale handtekeningen
- ElGamal - encryptie en digitale handtekeningen

#### Gebaseerd op elliptische krommen (Elliptic Curve Cryptography, ECC)
- ECDH - sleuteluitwisseling
- ECDSA (Elliptic Curve Digital Signature Algorithm) - digitale handtekeningen
- Ed25519 - digitale handtekeningen

#### Post-quantum cryptografie (PQCrypto)
- Kyber (ML-KEM) - sleuteluitwisseling
- Dilithium (ML-DSA) - digitale handtekeningen

### Hashing-algoritmes
#### Cryptografische hashfuncties
- MD5 (Message Digest 5)
- SHA-1 (Secure Hash Algorithm 1)
- SHA-2 familie (Secure Hash Algorithm 2) (SHA-256, SHA-512, etc.)
- SHA-3 (Secure Hash Algorithm 3)
- BLAKE2/BLAKE3

#### Warchtwoord-hashing algoritmes
- bcrypt
- scrypt
- Argon2

#### Keyed hashing & authenticatie algoritmes
- HMAC (Hash-based Message Authentication Code)



## Belangrijke Moderne Encryptie-algoritmes
Deze algoritmes worden momenteel de dag van vandaag (2026) als veilig beschouwd en worden veel gebruikt in moderne toepassingen. Het is aangeraden om deze algoritmes te gebruiken in nieuwe toepassingen, tenzij er een specifieke reden is om een ander algoritme te gebruiken.  
Deze algoritmes zullen verder onderzocht worden op basis van hun werking, veiligheid, prestaties en gebruik in de praktijk. Bekijk hiervoor het bestand [werking.md](werking.md).

### Symmetrische encryptie
#### Block ciphers
- AES (Advanced Encryption Standard)

#### Stream ciphers
- ChaCha20
- ChaCha20-Poly1305

### Asymmetrische encryptie
#### Gebaseerd op integer factorisatie
- RSA (Rivest-Shamir-Adleman)

#### Gebaseerd op discrete logaritmes
- Diffie-Hellman (DH) - sleuteluitwisseling

#### Gebaseerd op elliptische krommen (Elliptic Curve Cryptography, ECC)
- ECDH - sleuteluitwisseling
- ECDSA (Elliptic Curve Digital Signature Algorithm) - digitale handtekeningen
- Ed25519 - digitale handtekeningen

#### Post-quantum cryptography (PQC)
- Kyber (ML-KEM) - sleuteluitwisseling
- Dilithium (ML-DSA) - digitale handtekeningen

### Hashing-algoritmes
#### Cryptografische hashfuncties
- SHA-2 familie (Secure Hash Algorithm 2) (SHA-256, SHA-512, etc.)
- SHA-3 (Secure Hash Algorithm 3)
- BLAKE2
- BLAKE3

#### Warchtwoord-hashing algoritmes
- bcrypt
- argon2

#### Keyed hashing & authenticatie algoritmes
- HMAC (Hash-based Message Authentication Code)

### Toepassingen van encryptie-algoritmes
- TLS/SSL voor veilige communicatie over het internet
- JWE (JSON Web Encryption) voor veilige gegevensoverdracht in webapplicaties
- JWT (JSON Web Token) voor veilige authenticatie en autorisatie