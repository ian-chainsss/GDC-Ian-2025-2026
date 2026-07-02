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


## Belangrijke Encryptie-algoritmes - belangrijk om te kennen
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

## Bruikbaar de dag van vandaag (2026) - veilig en aanbevolen
De volgende encryptie-algoritmes worden momenteel als veilig beschouwd en zijn geschikt voor gebruik in nieuwe toepassingen. Het is belangrijk om op de hoogte te blijven van de laatste ontwikkelingen in cryptografie, aangezien de veiligheid van algoritmes kan veranderen naarmate nieuwe aanvallen en kwetsbaarheden worden ontdekt.

### Symmetrische encryptie
#### Block ciphers
- AES (Advanced Encryption Standard)
    - Data Encryptie
    - Deels quantum resistent
    - Gebruik grotere 256 bit sleutel voor extra veiligheid
#### Stream ciphers
- ChaCha20
    - Data Encryptie
    - Deels quantum resistent

- ChaCha20-Poly1305
    - Data Encryptie & Authenticatie (AEAD)
    - Deels quantum resistent
    - vernieuwde versie: XChaCha20-Poly1305; 192 bit nonce, 256 bit sleutel, 128 bit tag

### Asymmetrische encryptie
#### Gebaseerd op elliptische krommen (Elliptic Curve Cryptography, ECC)
- ECDH
    - sleuteluitwisseling
    - Niet quantum resistent
    - Gebruik Curve25519 voor beste bescherming
    - sleutellengte: 32 bytes (256 bits)

- Ed25519 (EdDSA)
    - digitale handtekeningen
    - Niet quantum resistent
    - Sleutellengte: 32 bytes (256 bits)

#### Post-quantum cryptography (PQC)
- Kyber (ML-KEM)
    - sleuteluitwisseling
    - Quantum resistent
    - Vandaag de dag meest gebruikt in hybride modus met ECDH voor extra veiligheid: X25519Kyber768
    - Verschillende varianten: Kyber512, Kyber768, Kyber1024
    - Sleutels en ciphertexts groter dan ECC algoritmes, grotere impact op netwerkverkeer en opslag
    - Sleutellengte: 
        - Kyber512: 800 bytes (publieke sleutel), 768 bytes (ciphertext)
        - Kyber768: 1184 bytes (publieke sleutel), 1088 bytes (ciphertext)
        - Kyber1024: 1568 bytes (publieke sleutel), 1568 bytes (ciphertext)
  
- Dilithium (ML-DSA)
    - digitale handtekeningen
    - Quantum resistent
    - Verschillende varianten: Dilithium2, Dilithium3, Dilithium5
    - Sleutels en handtekeningen groter dan ECC algoritmes, grotere impact op netwerkverkeer en opslag
    - Sleutellengte: 
        - Dilithium2: 1312 bytes (publieke sleutel), 2420 bytes (handtekening)
        - Dilithium3: 1952 bytes (publieke sleutel), 3293 bytes (handtekening)
        - Dilithium5: 2592 bytes (publieke sleutel), 4595 bytes (handtekening)

### Hashing-algoritmes
#### Cryptografische hashfuncties
- SHA-2 familie (Secure Hash Algorithm 2) (SHA-256, SHA-512, etc.)
    - digitale handtekeningen, data integriteit & checksum
    - Deels quantum resistent
    - Gebruik SHA-256 of SHA-512 voor optimale veiligheid
    - length extension attacks mogelijk bij SHA-2, gebruik HMAC voor authenticatie

- SHA-3 (Secure Hash Algorithm 3)
    - digitale handtekeningen, data integriteit & checksum
    - Deels quantum resistent
    - Gebruik SHA3-256 of SHA3-512 voor optimale veiligheid
    - SHA-3 trager bij afwezigheid van hardware ondersteuning
    - Geen length extension attacks mogelijk bij SHA-3

- BLAKE2
    - digitale handtekeningen, data integriteit & checksum
    - Deels quantum resistent
    - Gebruik BLAKE2b voor 64-bit platforms en BLAKE2s voor 32-bit platforms
    - Sneller dan SHA-2 en SHA-3 bij software implementaties
    - basis voor Argon2 (wachtwoord hashing algoritme)
    - ingebouwde keyed hashing

- BLAKE3
    - digitale handtekeningen, data integriteit & checksum
    - Deels quantum resistent
    - Sneller dan BLAKE2 en SHA-2 bij software implementaties

#### Warchtwoord-hashing algoritmes
- bcrypt
    - Wachtwoord hashing
    - Deels quantum resistent
    - Gebruik bcrypt met een voldoende hoge cost factor (bijv. 12 of hoger) voor optimale veiligheid

- Argon2
    - Wachtwoord hashing
    - Deels quantum resistent
    - Gebruik Argon2id voor optimale veiligheid en bescherming tegen
    - verschilende varianten: Argon2d (bescherming tegen GPU-aanvallen), Argon2i (bescherming tegen side-channel aanvallen), Argon2id (combinatie van beide)
    - Aanbevolen door OWASP en NIST voor nieuwe toepassingen

#### Keyed hashing & authenticatie algoritmes
- HMAC (Hash-based Message Authentication Code)
    - Authenticatie en integriteit controleren
    - Deels quantum resistent
    - Gebruik HMAC met een veilige hashfunctie zoals SHA-256 of SHA-3 voor optimale veiligheid
