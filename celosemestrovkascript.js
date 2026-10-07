túto časť:
/* =========================================
   AKTUÁLNY PREDMET Z URL
   ========================================= */

const params = new URLSearchParams(
  window.location.search
);

const predmet = params.get("predmet");


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
   NAHRATIE SÚBORU
   ========================================= */

uploadButton.addEventListener("click", () => {
  fileInput.click();
});


fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (!file) {
    return;
  }


  // Vytvorenie riadku súboru
  const fileRow = document.createElement("div");

  fileRow.className = "file-row";


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


  // Vyčistenie inputu
  fileInput.value = "";


  // Zapojenie tlačidla Zmazať
  addDeleteButton(fileRow);

});


/* =========================================
   MAZANIE SÚBORU
   ========================================= */

function addDeleteButton(row) {

  const deleteButton =
    row.querySelector(".delete-button");


  deleteButton.addEventListener("click", () => {

    const confirmed = confirm(
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
