const SUPABASE_URL =
    "https://cpahudvkfpeqzizsrrbn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_khnFozFe93qlkrW6lj4-9g_RedpxoOQ";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// PREDMET Z URL
// ==========================================

const params =
    new URLSearchParams(window.location.search);

const predmet =
    params.get("predmet") || "Neznámy predmet";


// ==========================================
// ZOBRAZENIE PREDMETU
// ==========================================

const title =
    document.getElementById("matros-title");

const info =
    document.getElementById("matros-info");

if (title) {
    title.textContent =
        predmet;
}

if (info) {
    info.textContent =
        `Materiály k predmetu ${predmet}`;
}


// ==========================================
// SPÄŤ
// ==========================================

const backButton =
    document.getElementById("back-button");

if (backButton) {
    backButton.addEventListener(
        "click",
        function () {
            window.location.href =
                "index.html";
        }
    );
}
