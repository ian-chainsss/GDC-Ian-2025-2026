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

## ChaCha20
Ontwerper: Daniel J. Bernstein
Type: data encryptie, symmetrische encryptie, stream cipher

## ChaCha20-Poly1305
Ontwerper: Daniel J. Bernstein
Type: data encryptie, symmetrische encryptie, stream cipher, AEAD (Authenticated Encryption with Associated Data)

## RSA (Rivest-Shamir-Adleman)
Ontwerpers: Ron Rivest, Adi Shamir en Leonard Adleman
Type: data encryptie, asymmetrische encryptie, public-key cryptography

## Diffie-Hellman (DH)
Ontwerpers: Whitfield Diffie en Martin Hellman
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography

## ECDH (Elliptic Curve Diffie-Hellman)
Ontwerpers: Neal Koblitz en Victor S. Miller
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography, elliptische krommen

## ECDSA (Elliptic Curve Digital Signature Algorithm)
Ontwerpers: Neal Koblitz en Victor S. Miller
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, elliptische krommen

## Ed25519
Ontwerper: Daniel J. Bernstein
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, elliptische krommen

## Kyber (ML-KEM)
Ontwerpers: Joppe W. Bos, Léo Ducas, Eike K
Type: sleuteluitwisseling, asymmetrische encryptie, public-key cryptography, post-quantum cryptography

## Dilithium (ML-DSA)
Ontwerpers: Joppe W. Bos, Léo Ducas, Eike K
Type: digitale handtekeningen, asymmetrische encryptie, public-key cryptography, post-quantum cryptography

## SHA-2 familie (Secure Hash Algorithm 2)
Ontwerpers: National Security Agency (NSA)
Type: cryptografische hashfunctie, hashing-algoritme
Betrekking tot: SHA-256, SHA-512, etc.

## SHA-3 (Secure Hash Algorithm 3)
Ontwerpers: Guido Bertoni, Joan Daemen, Michaël Peeters en Gilles Van Assche
Type: cryptografische hashfunctie, hashing-algoritme

## BLAKE2
Ontwerpers: Jean-Philippe Aumasson, Samuel Neves, Zook
Type: cryptografische hashfunctie, hashing-algoritme

## BLAKE3
Ontwerpers: Jack O'Connor, Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O'Hearn
Type: cryptografische hashfunctie, hashing-algoritme

## bcrypt
Ontwerpers: Niels Provos en David Mazières
Type: wachtwoord-hashing algoritme, hashing-algoritme

## Argon2
Ontwerpers: Alex Biryukov, Daniel Dinu en Dmitry Khovrat
Type: wachtwoord-hashing algoritme, hashing-algoritme

## HMAC (Hash-based Message Authentication Code)
Ontwerpers: Mihir Bellare, Ran Canetti en Hugo Krawczyk
Type: keyed hashing & authenticatie algoritme, hashing-algoritme
