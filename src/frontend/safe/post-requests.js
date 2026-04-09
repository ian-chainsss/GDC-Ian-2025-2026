/**
 * Maakt een nieuwe post aan op basis van het formulier.
 *
 * Wanneer gebruikt:
 * - bij submit van het post-aanmaakformulier
 *
 * Hoe werkt het:
 * - leest titel en inhoud uit de DOM
 * - vraagt indien nodig een CSRF-token op
 * - verstuurt URL-encoded data naar POST /posts
 * - toont een samenvatting in het succes- of foutmodal
 */
async function create_post(event) {
    // Stap 1: voorkom dat het formulier de pagina herlaadt.
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    // Stap 2: lees de velden uit het formulier en normaliseer input.
    const form = document.getElementById('post-create-form');
    const titleInput = form.querySelector('input[type="text"]');
    const contentInput = form.querySelector('#post-create-content');

    const title_input = titleInput ? titleInput.value.trim() : '';
    const content_input = contentInput ? contentInput.value.trim() : '';

    const url = website + "posts";

    try {
        // Stap 3: verzeker eerst CSRF-bescherming voordat we een POST doen.
        await ensure_csrf_token();

        // Stap 4: stuur URL-encoded formulierdata naar de API.
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                [CSRF_HEADER_NAME]: get_csrf_token()
            },
            credentials: 'include',
            body: new URLSearchParams({
                title: title_input,
                content: content_input
            })
        });

        // Stap 5: verwerk API-resultaat en toon gebruikersfeedback.
        const result = await response.json();
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail || result.message || JSON.stringify(result)}`);
            return;
        }

        succes_modal(`${response.status}`, `${
            "Post ID: " + result.id
            + "<br>Author User Id: " + result.author_id
            + "<br>Title: " + result.title
            + "<br>Created At: " + new Date(result.created_at).toLocaleString()
        }`);
        return;
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
    }
}

/**
 * Laadt de meest recente posts en rendert ze in de pagina.
 *
 * Wanneer gebruikt:
 * - bij expliciete laadactie vanuit de interface
 *
 * Hoe werkt het:
 * - haalt data op via GET /posts
 * - valideert de response
 * - bouwt per post dynamisch artikel-elementen op
 */
async function load_latest_posts() {
    // Stap 1: referentie naar de doelcontainer en endpoint opbouwen.
    const container = document.getElementById('latest-posts');
    const url = website + "posts";

    // Zonder container kunnen we niets renderen.
    if (!container) return;

    try {
        // Stap 2: haal de actuele lijst posts op.
        const response = await fetch(url, {
            method: 'GET'
        });

        // Stap 3: behandel niet-succes antwoorden met een nette foutmelding.
        if (!response.ok) {
            let result = null;
            try { result = await response.json(); } catch (_) { result = null; }
            const message = result?.detail || result?.message || response.statusText || JSON.stringify(result);
            error_modal(`${response.status}`, message);
            container.classList.add('hidden');
            return;
        }

        // Stap 4: parse de payload als lijst posts.
        const posts = await response.json();

        // Stap 5: als er niets is, toon melding en verberg lijstgebied.
        if (!Array.isArray(posts) || posts.length === 0) {
            error_modal('No posts', 'No posts found');
            container.classList.add('hidden');
            return;
        }

        // Start met een lege container zodat oude resultaten niet blijven staan.
        container.innerHTML = '';

        // Render elke post als een apart article-blok met metadata en inhoud.
        posts.forEach(post => {
            // Stap 6: maak alle DOM-elementen voor deze post.
            const article = document.createElement('article');
            article.className = 'border-base-300 border w-2/3 border-gray-300 rounded-md outline-solid outline-gray-300 outline-1 mt-2 mb-6';

            const inner = document.createElement('div');
            inner.className = 'bg-base-100 p-4';

            const author = document.createElement('p');
            author.className = 'block text-xs text-gray-500';
            author.textContent = post.author || (`Author ${post.author_id || ''}`);

            const timeEl = document.createElement('time');
            timeEl.className = 'block text-xs text-gray-500';
            try { timeEl.textContent = new Date(post.created_at).toLocaleString(); } catch (_) { timeEl.textContent = '' }

            const br = document.createElement('br');

            const title = document.createElement('h2');
            title.className = 'card-title';
            title.textContent = post.title || '';

            const content = document.createElement('p');
            content.className = 'mt-2 text-sm/relaxed text-gray-800';
            // De API-inhoud kan HTML bevatten; in dit demo-project tonen we die direct.
            content.innerHTML = post.content;

            // Stap 7: bouw de hiërarchie op en voeg toe aan de container.
            inner.appendChild(author);
            inner.appendChild(timeEl);
            inner.appendChild(br);
            inner.appendChild(title);
            inner.appendChild(content);

            article.appendChild(inner);
            container.appendChild(article);
        });

        // Stap 8: maak resultaat zichtbaar en meld hoeveel posts geladen zijn.
        container.classList.remove('hidden');
        succes_modal(`${response.status}`, `${posts.length} post(s) loaded!`);
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
        container.classList.add('hidden');
    }
}

/**
 * Zoekt posts op basis van de zoekterm in het zoekformulier.
 *
 * Wanneer gebruikt:
 * - bij submit van het zoekformulier
 * - automatisch bij paginalading als URL-parameter q aanwezig is
 *
 * Hoe werkt het:
 * - leest de query uit de input
 * - roept GET /posts/search?q=... op
 * - toont query en resultaten in de daarvoor voorziene container
 */
async function search_posts(event) {
    // Stap 1: voorkom standaard form-submit en paginareload.
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    // Stap 2: lees query en bouw endpoint met veilige URL-encoding.
    const form = document.getElementById('post-search-form');
    const input = form ? form.querySelector('input[type="search"]') : null;
    const q = input ? input.value.trim() : '';

    const container = document.getElementById('latest-posts-search');
    const url = website + "posts/search?q=" + encodeURIComponent(q);

    if (!container) return;

    // Stap 3: reset vorige resultaten vóór de nieuwe zoekrequest.
    container.classList.add('hidden');
    container.innerHTML = '';

    try {
        // Stap 4: zoekrequest uitvoeren en payload verwerken.
        const response = await fetch(url, { method: 'GET'});
        const data = await response.json();

        // Toon de query zoals de API ze heeft verwerkt.
        const queryEl = document.getElementById('post-search-query');
        const queryContentEl = document.getElementById('post-search-query-content');
        const apiQuery = data.query;
        queryContentEl.innerHTML = apiQuery;

        if (queryEl) {
            queryEl.classList.remove('hidden');
        }

        // Stap 5: foutstatus afvangen en direct stoppen.
        if (!response.ok) {
            const message = data?.detail || data?.message || response.statusText || JSON.stringify(data);
            error_modal(`${response.status}`, message);
            container.classList.add('hidden');
            return;
        }

        const results = Array.isArray(data?.results) ? data.results : [];

        // Stap 6: lege resultset melden.
        if (!results.length) {
            error_modal('No posts', 'No posts found');
            container.classList.add('hidden');
            return;
        }

        // Stap 7: render alle gevonden posts één voor één.
        results.forEach(post => {
            const article = document.createElement('article');
            article.className = 'border-base-300 border w-2/3 border-gray-300 rounded-md outline-solid outline-gray-300 outline-1 mb-4';

            const inner = document.createElement('div');
            inner.className = 'bg-base-100 p-4';

            const author = document.createElement('p');
            author.className = 'block text-xs text-gray-500';
            author.textContent = post.author || (`Author ${post.author_id || ''}`);

            const timeEl = document.createElement('time');
            timeEl.className = 'block text-xs text-gray-500';
            try { timeEl.textContent = new Date(post.created_at).toLocaleString(); } catch (_) { timeEl.textContent = '' }

            const br = document.createElement('br');

            const title = document.createElement('h2');
            title.className = 'card-title';
            title.textContent = post.title || '';

            const content = document.createElement('p');
            content.className = 'mt-2 text-sm/relaxed text-gray-800';
            // De API-inhoud kan HTML bevatten; in dit demo-project tonen we die direct.
            content.innerHTML = post.content;

            inner.appendChild(author);
            inner.appendChild(timeEl);
            inner.appendChild(br);
            inner.appendChild(title);
            inner.appendChild(content);
            
            article.appendChild(inner);
            container.appendChild(article);
        });

        // Stap 8: toon resultaten en meld aantal hits.
        container.classList.remove('hidden');
        succes_modal(`${response.status}`, `${results.length} result(s) for "${q}"`);
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
        container.classList.add('hidden');
    }
}

// Pagina-initialisatie: bij een q-parameter vullen we de zoekinput en voeren we direct een zoekopdracht uit.
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Stap 1: lees de querystring van de huidige URL.
        const params = new URLSearchParams(window.location.search);
        const qParam = params.get('q');
        if (qParam) {
            // Stap 2: vul de zoekinput vooraf met de q-parameter.
            const form = document.getElementById('post-search-form');
            const input = form ? form.querySelector('input[type="search"]') : null;
            if (input) {
                input.value = qParam;
            }
            // Start de zoekflow zonder submit-event; de functie leest de query uit de input.
            try { search_posts(); } catch (e) { console.error('search_posts auto-run failed', e); }
        }
    } catch (e) {
        console.error('Error parsing URL search params', e);
    }
});