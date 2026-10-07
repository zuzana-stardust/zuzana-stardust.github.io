const SUPABASE_URL =
  "https://cpahudvkfpeqzizsrrbn.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_khnFozFe93qlkrW6lj4-9g_RedpxoOQ";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(
    window.location.search
  );

  const predmet = params.get("predmet");
  const cas = params.get("cas");
  const ucitel = params.get("ucitel");
  const miestnost = params.get("miestnost");


  /* =========================================
     ZOBRAZENIE PREDMETU
     ========================================= */

  const subjectName =
    document.getElementById("subject-name");

  if (subjectName && predmet) {

    subjectName.textContent =
      predmet;

  }


  /* =========================================
     ZOBRAZENIE INFORMÁCIÍ
     ========================================= */

  const subjectInfo =
    document.getElementById("subject-info");

  if (subjectInfo) {

    const info = [
      cas,
      ucitel,
      miestnost
    ].filter(Boolean).join(" · ");

    if (info) {
      subjectInfo.textContent = info;
    }

  }


  /* =========================================
     NAHRATIE SÚBORU
     ========================================= */

  const uploadButton =
    document.getElementById("upload-button");

  const fileInput =
    document.getElementById("file-upload");

  const fileList =
    document.getElementById("file-list");
   
  loadFiles();


  async function loadFiles() {

    const safeSubject =
      predmet || "nezaradene";

    const { data, error } =
      await supabaseClient
        .storage
        .from("rozvrhor")
        .list(safeSubject);

    if (error) {

      console.error(
        "Nepodarilo sa načítať súbory:",
        error
      );

      return;
    }

    data.forEach(file => {

      const fileRow =
        document.createElement("div");

      fileRow.className =
        "file-row";

      fileRow.dataset.filePath =
        safeSubject + "/" + file.name;

      fileRow.innerHTML = `
        <div class="file-name">
          ${file.name}
        </div>

        <div class="file-actions">

          <button
            type="button"
            class="file-action download-button"
            title="Stiahnuť">
            💾
          </button>

          <button
            type="button"
            class="file-action delete-button"
            title="Zmazať">
            🗑
          </button>

        </div>
      `;

      fileList.appendChild(fileRow);

      addDeleteButton(fileRow);

    });

  }


  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });


    fileInput.addEventListener("change", async () => {

    const file =
      fileInput.files[0];

    if (!file) {
      return;
    }

    try {

      const safeSubject =
        predmet || "nezaradene";

      const filePath =
        safeSubject + "/" +
        Date.now() + "_" +
        file.name;

      const { error } =
        await supabaseClient
          .storage
          .from("rozvrhor")
          .upload(filePath, file);

      if (error) {
        throw error;
      }

      const fileRow =
        document.createElement("div");

      fileRow.className =
        "file-row";

      fileRow.dataset.filePath =
        filePath;

      fileRow.innerHTML = `
        <div class="file-name">
          ${file.name}
        </div>

        <div class="file-actions">

          <button
            type="button"
            class="file-action download-button"
            title="Stiahnuť">
            💾
          </button>

          <button
            type="button"
            class="file-action delete-button"
            title="Zmazať">
            🗑
          </button>

        </div>
      `;

      fileList.appendChild(fileRow);

      fileInput.value = "";

      addDeleteButton(fileRow);

      alert("Súbor bol úspešne nahraný.");

    } catch (error) {

      console.error(error);

      alert(
        "Súbor sa nepodarilo nahrať."
      );

    }

  });

  /* =========================================
     MAZANIE SÚBORU
     ========================================= */

  function addDeleteButton(row) {

    const deleteButton =
      row.querySelector(".delete-button");


    deleteButton.addEventListener("click", () => {

      const confirmed =
        confirm(
          "Naozaj chceš tento súbor zmazať?"
        );


      if (confirmed) {
        row.remove();
      }

    });

  }


  /* =========================================
     MAZANIE VZOROVÝCH SÚBOROV
     ========================================= */

  document
    .querySelectorAll(".file-row")
    .forEach(row => {

      addDeleteButton(row);

    });

});
