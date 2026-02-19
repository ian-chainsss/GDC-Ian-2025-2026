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