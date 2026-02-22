## Docker verbinden aan bestaand virtual network via yaml bestand
### Doel
Soms is het nodig om een Docker container te verbinden aan een ander reeds bestaand docker virtual network en geen nieuw netwerk aan te maken bij het opzetten van een container. In deze uitleg wordt beschreven hoe dit gedaan kan worden.  
Dit kan nodig zijn wanneer er al een netwerk is opgezet waarin bepaalde andere containers draaien waar je nieuwe container toegang tot moet hebben, zoals een API systeem met FastAPI die toegang nodig heeft tot de PostgreSQL database container.
### Reden
Als containers zich in andere subnets of netwerken bevinden, dan kunnzen ze elkaar niet vrij bereiken omdat dit verkeer tussen de containers langs de firewall van het host systeem gaat, zoals UFW. Hierdoor kunnen containers die zich in verschillende netwerken bevinden elkaar niet bereiken, tenzij er specifieke regels worden ingesteld in de firewall van het host systeem. Maar je wilt niet meteen altijd je firewall regels aanpassen, omdat dit een beveiligingsrisico kan vormen. Daarom is het beter om containers die met elkaar moeten communiceren in hetzelfde netwerk te plaatsen, zodat ze elkaar direct kunnen bereiken zonder dat er firewall regels nodig zijn.
### Stappen
1. Controleer welke netwerken er al bestaan met `docker network ls`
2. Kies het netwerk waar je container aan verbonden moet worden, bijvoorbeeld `gdc-network`
3. Maak een yaml bestand aan voor je container, bijvoorbeeld `docker-compose.yaml`
4. Voeg in het yaml bestand de volgende regels toe om je container te verbinden aan het bestaande netwerk:
```yaml
version: '3'
services:
  my-container:
    image: my-image
    networks:
      - gdc-network

networks:
    gdc-network:
        external: true
```
5. De regel `external: true` geeft aan dat het netwerk al bestaat en dat Docker geen nieuw netwerk hoeft aan te maken, maar in plaats daarvan het bestaande netwerk moet gebruiken.
6. Start je container met `docker-compose up -d` en deze zal nu verbonden zijn aan het bestaande netwerk `gdc-network` en kan communiceren met andere containers die zich in dat netwerk bevinden.
