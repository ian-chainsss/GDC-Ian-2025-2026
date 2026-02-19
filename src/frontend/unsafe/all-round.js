const website = "https://unsafe-api.ian-chains.be/";

async function error_modal(title, content) {
    document.getElementById("error-subtitle").innerHTML = title;
    document.getElementById("error-content").innerHTML = content;
    document.getElementById("error").showModal();
}

async function succes_modal(title, content) {
    document.getElementById("succes-subtitle").innerHTML = title;
    document.getElementById("succes-content").innerHTML = content;
    document.getElementById("succes").showModal();
}

async function test_connection() {
    const url = website

    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (!response.ok) {
            error_modal(`${response.status}`, `${result.detail}`);
            return;
        }

        succes_modal(`${response.status}`, `${result.detail}`);
        return;

    } catch (error) {
        console.error(error.message);
    }
}

async function reset_database() {
    const url = website + "reset"
    
    try {
        const response = await fetch(url, { method: "POST", credentials: "include" });
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