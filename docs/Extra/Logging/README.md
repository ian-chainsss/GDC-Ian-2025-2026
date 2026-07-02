# Logging Onderzoek
Deze folder bevat documentatie over het correct en efficiënt loggen bij een REST-API. Logging is een belangrijk onderdeel van het monitoren en debuggen van applicaties, en het helpt bij het identificeren van problemen en het verbeteren van de prestaties. Zo kunnen ook verdachte activiteiten worden opgespoord en kan er een audit trail worden opgebouwd. Om abuse te voorkomen is het belangrijk dat er een goede logging strategie wordt gevolgd.

## Hoofdonderdelen van Logging
- Metrics logs: Loopt er iets mis/fout? (What?)
- Traces: Waar loopt er iets mis/fout? (Where?)
- Logs: Waarom loopt er iets mis/fout? (Why?)

## Subonderdelen van Logging
- Rate limiting logs:  
Deze logs bevatten informatie over het aantal verzoeken dat een gebruiker of client heeft gedaan binnen een bepaalde tijdsperiode. Dit helpt bij het identificeren van misbruik of overmatig gebruik van de API.
- Error logs:  
Deze logs bevatten informatie over fouten die optreden tijdens het verwerken van verzoeken. Dit kan helpen bij het identificeren van bugs en het verbeteren van de stabiliteit van de API.
- Access logs:  
Deze logs bevatten informatie over alle verzoeken die naar de API zijn gedaan, inclusief de tijd, het IP-adres van de client, de HTTP-methode en de statuscode van het antwoord. Dit kan helpen bij het analyseren van het gebruik van de API en het identificeren van trends.
- Security logs:  
Deze logs bevatten informatie over beveiligingsgerelateerde gebeurtenissen, zoals mislukte inlogpogingen, verdachte activiteiten of pogingen tot ongeautoriseerde toegang. Dit kan helpen bij het detecteren van beveiligingsproblemen en het verbeteren van de beveiliging van de API.
- Metrics logs:  
Deze logs bevatten informatie over de prestaties van de API, zoals responstijden, foutpercentages en resourcegebruik. Dit kan helpen bij het optimaliseren van de prestaties van de API en het identificeren van knelpunten.
- Audit logs:  
Deze logs bevatten informatie over belangrijke acties die door gebruikers of beheerders zijn uitgevoerd, zoals het wijzigen van instellingen of het verwijderen van gegevens. Dit kan helpen bij het opbouwen van een audit trail en het waarborgen van de integriteit van de API.
- Traces:  
Deze logs bevatten gedetailleerde informatie over de uitvoering van verzoeken, inclusief de volgorde van methoden en functies die zijn aangeroepen. Dit kan helpen bij het debuggen van complexe problemen en het begrijpen van de interne werking van de API.

## Gestructureerde logging
Gestructureerde logging is een manier van loggen waarbij logberichten worden opgeslagen in een gestructureerd formaat, zoals JSON. Dit maakt het gemakkelijker om loggegevens te analyseren en te doorzoeken, omdat de gegevens in een consistente structuur worden opgeslagen. Gestructureerde logging kan ook helpen bij het integreren van loggegevens met andere systemen, zoals monitoring- en analysetools.
### Voorbeelden van gestructureerde logging:
```json
{
  "timestamp": "2024-06-01T12:34:56Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "service": "user-service",
  "context": {
    "userId": 12345,
    "endpoint": "/api/v1/resource",
    "method": "GET",
    "statusCode": 500
  }
}
```

```json
{
  "timestamp": "2024-06-01T12:35:00Z",
  "level": "INFO",
  "message": "User login successful",
  "service": "auth-service",
  "context": {
    "userId": 67890,
    "endpoint": "/api/v1/login",
    "method": "POST",
    "statusCode": 200
  }
}
```

```json

{
  "timestamp": "2024-06-01T12:36:00Z",
  "level": "WARN",
  "message": "Rate limit exceeded",
  "service": "api-gateway",
  "context": {
    "userId": 12345,
    "endpoint": "/api/v1/resource",
    "method": "GET",
    "statusCode": 429,
    "rateLimit": {
      "limit": 100,
      "remaining": 0,
      "resetTime": "2024-06-01T12:37:00Z"
    }
  }
}
```
