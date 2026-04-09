/**
 * Basisconfiguratie voor alle request-bestanden in de veilige frontend.
 * Deze constanten bepalen naar welke API wordt gestuurd en welke CSRF-velden worden gebruikt.
 */
const website = "https://safe-api.ian-chains.be/";
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Leest het CSRF-token uit de browsercookie.
 *
 * Wanneer gebruikt:
 * - vlak voor elke muterende request (POST/PUT/DELETE)
 *
 * Hoe werkt het:
 * - zoekt met een regex naar de cookie-naam
 * - decodeert de cookiewaarde indien gevonden
 */
function get_csrf_token() {
    // Stap 1: zoek in document.cookie naar de exacte csrf-cookie.
    const match = document.cookie.match(new RegExp('(?:^|; )' + CSRF_COOKIE_NAME + '=([^;]*)'));

    // Stap 2: decodeer de waarde zodat speciale tekens correct terugkomen.
    // Als de cookie ontbreekt, geven we null terug zodat callers dit kunnen opvangen.
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Zorgt dat de browser een CSRF-cookie heeft voordat formulieren requests sturen.
 *
 * Wanneer gebruikt:
 * - op paginalading
 * - vlak voor beveiligde requests als extra zekerheid
 *
 * Hoe werkt het:
 * - controleert eerst lokaal of een token al aanwezig is
 * - haalt anders een token op via het csrf-token endpoint
 */
async function ensure_csrf_token() {
    // Stap 1: snelle short-circuit; token is al aanwezig, dus geen netwerkcall nodig.
    if (!get_csrf_token()) {
        try {
            // Stap 2: vraag de API expliciet om een CSRF-cookie te zetten op de browser.
            const response = await fetch(website + "csrf-token", { credentials: 'include' });

            // Stap 3: enkel statuscontrole; de response body is hier niet nodig.
            if (!response.ok) {
                console.error("Failed to fetch CSRF token:", response.status);
            }
        } catch (error) {
            console.error("Error fetching CSRF token:", error.message);
        }
    }
}

// Initialisatie: haal bij het laden direct een CSRF-cookie op voor volgende acties.
window.addEventListener('DOMContentLoaded', async () => {
    // Zorg dat gebruikers meteen kunnen starten zonder eerst handmatig een token te moeten ophalen.
    await ensure_csrf_token();
});

/**
 * Toont een foutmelding in het error-modalvenster.
 *
 * Wanneer gebruikt:
 * - door alle request-functies bij HTTP-fouten of validatiefouten
 */
async function error_modal(title, content) {
    // Vul de titel en inhoud dynamisch zodat alle request-functies dezelfde modal kunnen hergebruiken.
    document.getElementById("error-subtitle").innerHTML = title;
    document.getElementById("error-content").innerHTML = content;

    // Open daarna de dialoog in de browser.
    document.getElementById("error").showModal();
}

/**
 * Toont een succesmelding in het succes-modalvenster.
 *
 * Wanneer gebruikt:
 * - door alle request-functies nadat een API-call is gelukt
 */
async function succes_modal(title, content) {
    // Zelfde patroon als error_modal, maar dan voor positieve feedback aan de gebruiker.
    document.getElementById("succes-subtitle").innerHTML = title;
    document.getElementById("succes-content").innerHTML = content;

    // Open het succesvenster zodra de tekst is ingevuld.
    document.getElementById("succes").showModal();
}

/**
 * Test of de API bereikbaar is en correct antwoordt.
 *
 * Wanneer gebruikt:
 * - handmatige testactie vanuit de interface
 *
 * Hoe werkt het:
 * - stuurt een GET naar de basis-URL
 * - toont response detail in fout- of succesmodal
 */
async function test_connection() {
    // Stap 1: gebruik de basis-URL als health-check endpoint.
    const url = website

    try {
        // Stap 2: voer de request uit.
        const response = await fetch(url);

        // Stap 3: parse de JSON-body voor detailboodschappen van de API.
        const result = await response.json();
        
        // Stap 4: niet-2xx => foutmodal tonen en stoppen.
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }

        // Stap 5: 2xx => succesmodal tonen met serverdetail.
        succes_modal(`${response.status}`, `${result.detail}`);
        return;

    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Herstelt de database naar de standaardtoestand via de API.
 *
 * Wanneer gebruikt:
 * - expliciete resetactie vanuit de interface
 *
 * Hoe werkt het:
 * - verzekert eerst CSRF-bescherming
 * - stuurt daarna een beveiligde POST naar /reset
 */
async function reset_database() {
    // Stap 1: endpoint bouwen.
    const url = website + "reset"
    
    try {
        // Stap 2: CSRF-cookie en token-header verzekeren voor deze muterende actie.
        await ensure_csrf_token();

        // Stap 3: reset-request verzenden met sessiecookie en CSRF-header.
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { [CSRF_HEADER_NAME]: get_csrf_token() }
        });

        // Stap 4: response verwerken en feedback tonen.
        const result = await response.json();

        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }
        succes_modal(`${response.status}`, `${result.detail}`);
    } catch (error) {
        console.error(error.message);
    }
}