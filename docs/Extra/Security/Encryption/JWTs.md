# Verschillende signatuur- & encryptie-algoritmes voor JWTs
In dit bestand wordt een overzicht gegeven van de verschillende signatuur- en encryptie-algoritmes die gebruikt kunnen worden voor JSON Web Tokens (JWTs). JWTs zijn een populaire methode voor het veilig overdragen van claims tussen partijen, en het is belangrijk om de juiste algoritmes te kiezen op basis van de beveiligingsbehoeften en prestatie-eisen van de toepassing.

## JWS Algoritmes
JSON Web Signature (JWS) is een specificatie die beschrijft hoe JSON-objecten digitaal ondertekend kunnen worden. Hieronder staan de verschillende algoritmes die gebruikt kunnen worden voor het ondertekenen van JWTs.

### 1. Symmetrische algoritmen (HMAC)
Deze algoritmen gebruiken één gedeelde geheime sleutel (secret) voor zowel het ondertekenen als het verifiëren.
- HS256: HMAC met SHA-256
- HS384: HMAC met SHA-384
- HS512: HMAC met SHA-512

### 2. Asymmetrische algoritmen (RSA en ECDSA)
Deze algoritmen werken met een sleutelpaar: een private sleutel om het bericht te ondertekenen en een publieke sleutel om de handtekening te verifiëren.
- RS256: RSA met SHA-256
- RS384: RSA met SHA-384
- RS512: RSA met SHA-512
- PS256: RSASSA-PSS met SHA-256
- PS384: RSASSA-PSS met SHA-384
- PS512: RSASSA-PSS met SHA-512
- ES256: ECDSA met P-256 en SHA-256
- ES384: ECDSA met P-384 en SHA-384
- ES512: ECDSA met P-521 en SHA-512

### 3. Geavanceerde ECC-algoritmen
In nieuwere standaarden zijn ook moderne curves opgenomen:
- Ed25519: Edwards-curve Digital Signature Algorithm (EdDSA)
- Ed448: EdDSA gebaseerd op de Edwards-curve 448

## JWE Algoritmes
JSON Web Encryption (JWE) is een specificatie die beschrijft hoe JSON-objecten versleuteld kunnen worden. Hieronder staan de verschillende algoritmes die gebruikt kunnen worden voor het versleutelen van JWTs.

### 1. Sleutelbeheer-algoritmes (alg header)
Deze algoritmes bepalen hoe de Content Encryption Key (CEK) – de sleutel waarmee jouw data versleuteld is – veilig wordt verstuurd naar de ontvanger.

#### Asymmetrisch (Publieke/Private sleutels)
Hierbij wordt de sleutel versleuteld met de publieke sleutel van de ontvanger.  
Populaire algoritmes zijn onder andere RSAES-OAEP (met specifieke hashing zoals SHA-1 of SHA-256) en Elliptic Curve (ECDH-ES).

#### Symmetrisch (Gedeelde geheime sleutel)
Hierbij wordt een gedeeld wachtwoord gebruikt, zoals dir (Direct Encryption, waarbij de sleutel zelf de inhoud versleutelt) of A128KW (AES Key Wrap).

### 2. Inhouds-encryptie (enc header)
Nadat de sleutel is ingepakt, worden de eigenlijke data (de payload of claims) versleuteld.  
Dit gebeurt altijd met symmetrische encryptie. De standaard gebruikt hier zogenaamde Authenticated Encryption with Associated Data (AEAD) algoritmes voor, die de data zowel versleutelen als controleren op integriteit:
- AES-GCM (Galois/Counter Mode): Dit is de meest gangbare en efficiënte standaard (bijvoorbeeld A128GCM, A192GCM of A256GCM). Het combineert encryptie en integriteit in één keer.
- AES-CBC met HMAC-SHA: Een oudere maar veelgebruikte combinatie (zoals A128CBC-HS256 of A256CBC-HS512).  
Hierbij wordt gebruikgemaakt van een 'Cipher Block Chaining'-methode gekoppeld aan een HMAC-handtekening voor datavalidatie.
