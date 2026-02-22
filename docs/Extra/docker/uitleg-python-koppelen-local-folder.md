# Folder met python code koppelen aan lokale host folder
## Doel
Soms is het nodig om een folder op je lokale host machine te koppelen aan een folder in een Docker container, zodat je gemakkelijk bestanden zoals python scripts kan aanpassen zonder dat je elke keer de container opnieuw hoeft te bouwen. Dit kan handig zijn wanneer je bezig bent in de development en test fase van je porject. Dit wordt afgeraden om te doen in een productieomgeving. Als je de bestanden dan aanpast in de lokale folder, worden deze automatische aangepast in de container na een herstart van de container. In deze uitleg wordt beschreven hoe dit gedaan kan worden.
## Omgeving
Dit wordt aangetoond voor docker containers die draaien op een Linux host machine zoals Ubuntu, maar dit kan ook gedaan worden op andere besturingssystemen zoals Windows of MacOS, maar de stappen kunnen iets verschillen afhankelijk van het besturingssysteem dat je gebruikt.
Dit wordt ingesteld via de docker compose yaml file, maar het kan ook gedaan worden via de command line interface van docker, maar de yaml file is makkelijker te beheren en aan te passen.
## Stappen
1. Maak een folder aan op je lokale host machine, bijvoorbeeld `local-folder`
2. Plaats hier je python scripts in die je wilt koppelen aan de container, bijvoorbeeld `script.py`
3. Open de docker compose yaml file van je container, bijvoorbeeld `docker-compose.yaml`
4. Voeg in de yaml file onder het gedeelte van je container de volgende regels toe om de lokale folder te koppelen aan een folder in de container:
```yaml
version: '3'
services:
  my-container:
    image: my-image
    volumes:
      - ./local-folder:/app/local-folder
```
5. De regel `- ./local-folder:/app/local-folder` geeft aan dat de folder `local-folder` op je lokale host machine gekoppeld wordt aan de folder `/app/local-folder` in de container. Je kan deze paden aanpassen naar jouw voorkeur.
6. Start je container met `docker-compose up -d` en de lokale folder zal nu gekoppeld zijn aan de container.
