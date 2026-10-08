console.log("MATROS SCRIPT FUNGUJE");
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


// ==========================================
// NAHRAŤ MATERIÁL
// ==========================================

const uploadButton =
    document.getElementById("upload-button");

if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        function () {

            const input =
                document.createElement("input");

            input.type = "file";

            input.addEventListener(
                "change",
                async function () {

                    const file =
                        input.files[0];

                    if (!file) {
                        return;
                    }

                    // Matroš má vlastný priestor
                    // Matroš má vlastný priestor
const safePredmet =
    predmet
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\/\\#?%*:|"<>]/g, "-");

const filePath =
    "matros/" +
    safePredmet +
    "/" +
    file.name;
                    const { error } =
                        await supabaseClient
                            .storage
                            .from("rozvrhor")
                            .upload(
                                filePath,
                                file
                            );

                    if (error) {

                        console.error(
                            "Chyba pri nahrávaní:",
                            error
                        );

                        alert(
                            "Súbor sa nepodarilo nahrať."
                        );

                        return;
                    }

                    alert(
                        "Súbor bol úspešne nahraný."
                    );
                }
            );

            input.click();
        }
    );
}
