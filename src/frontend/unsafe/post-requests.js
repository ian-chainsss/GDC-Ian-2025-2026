async function create_post(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const form = document.getElementById('post-create-form');
    const titleInput = form.querySelector('input[type="text"]');
    const contentInput = form.querySelector('#post-create-content');

    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';

    const url = website + "posts";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content })
        });

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

async function load_latest_posts() {
    const container = document.getElementById('latest-posts');
    const url = website + "posts";

    if (!container) return;

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            let result = null;
            try { result = await response.json(); } catch (_) { result = null; }
            const message = result?.detail || result?.message || response.statusText || JSON.stringify(result);
            error_modal(`${response.status}`, message);
            container.classList.add('hidden');
            return;
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            error_modal('No posts', 'No posts found');
            container.classList.add('hidden');
            return;
        }

        // clear existing sample/children
        container.innerHTML = '';

        posts.forEach(post => {
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
            // content may contain HTML; keep as-is
            content.innerHTML = post.content || '';

            inner.appendChild(author);
            inner.appendChild(timeEl);
            inner.appendChild(br);
            inner.appendChild(title);
            inner.appendChild(content);

            article.appendChild(inner);
            container.appendChild(article);
        });

        container.classList.remove('hidden');
        succes_modal(`${response.status}`, `${posts.length} post(s) loaded!`);
    } catch (error) {
        console.error(error);
        error_modal('Network error', error.message || String(error));
        container.classList.add('hidden');
    }
}