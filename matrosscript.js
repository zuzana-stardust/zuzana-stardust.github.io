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
// ZOZNAM MATERIÁLOV
// ==========================================

async function loadMaterials() {

    const materialsList =
        document.getElementById("materials-list");

    if (!materialsList) {
        return;
    }

    const safePredmet =
        predmet
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\/\\#?%*:|"<>]/g, "-");

    const folderPath =
        "matros/" +
        safePredmet;

    const { data, error } =
        await supabaseClient
            .storage
            .from("rozvrhor")
            .list(folderPath);

    if (error) {

        console.error(
            "Chyba pri načítaní materiálov:",
            error
        );

        return;
    }

    materialsList.innerHTML = "";

    data.forEach(function (file) {

        const row =
            document.createElement("div");

        row.className =
            "file-row";

        const name =
            document.createElement("div");

        name.className =
            "file-name";

        name.textContent =
            file.name;

        row.appendChild(name);

        materialsList.appendChild(row);
    });
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

                    await loadMaterials();
                }
            );

            input.click();
        }
    );
}


// ==========================================
// NAČÍTAŤ MATERIÁLY PRI OTVORENÍ
// ==========================================

loadMaterials();
