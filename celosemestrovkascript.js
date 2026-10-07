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


  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });


  fileInput.addEventListener("change", () => {

    const file =
      fileInput.files[0];

    if (!file) {
      return;
    }


    const fileRow =
      document.createElement("div");

    fileRow.className =
      "file-row";


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
