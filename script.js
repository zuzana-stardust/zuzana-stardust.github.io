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
// NASTAVENIE ROZVRHU
// ==========================================

const TIMELINE_START = 7 * 60; // 07:00
const PIXELS_PER_HOUR = 110;
const HEADER_HEIGHT = 55;


// ==========================================
// PREVOD ČASU NA MINÚTY
// ==========================================

function timeToMinutes(time) {

  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;

}


// ==========================================
// NÁZOV PREDMETU
// ==========================================

function getLessonSubject(lesson) {

  const element =
    lesson.querySelector("h3");

  return element
    ? element.textContent.trim()
    : "Neznámy predmet";

}


// ==========================================
// VYUČUJÚCI
// ==========================================

function getLessonTeacher(lesson) {

  const element =
    lesson.querySelector("p");

  return element
    ? element.textContent.trim()
    : "Vyučujúci neuvedený";

}


// ==========================================
// MIESTNOSŤ
// ==========================================

function getRoomNumber(code) {

  if (!code) {
    return "";
  }


  const rooms = {

    "DRB05110": "511",
    "DRB02210": "221",
    "DRB0514A": "514",
    "DRB05180": "518",
    "DRB05150": "515",
    "DRB05190": "519",
    "DRB00150": "015"

  };


  return rooms[code] || code;

}


// ==========================================
// ZOBRAZENIE MIESTNOSTÍ
// ==========================================

function setupRooms() {

  const lessons =
    document.querySelectorAll(".lesson");


  lessons.forEach(lesson => {

    const roomElement =
      lesson.querySelector(".lesson-room");

    const roomCode =
      lesson.dataset.roomCode;


    if (!roomElement) {
      return;
    }


    if (roomCode) {

      roomElement.textContent =
        `Miestnosť ${getRoomNumber(roomCode)}`;

    } else {

      roomElement.textContent =
        "";

    }

  });

}


// ==========================================
// POZÍCIA HODÍN
// ==========================================

function positionLessons() {

  const lessons =
    document.querySelectorAll(".lesson");


  lessons.forEach(lesson => {

    const start =
      lesson.dataset.start;

    const end =
      lesson.dataset.end;


    if (!start || !end) {
      return;
    }


    const startMinutes =
      timeToMinutes(start);

    const endMinutes =
      timeToMinutes(end);


    const minutesFromStart =
      startMinutes - TIMELINE_START;


    const top =
      HEADER_HEIGHT +
      (minutesFromStart / 60) *
      PIXELS_PER_HOUR;


    const duration =
      endMinutes - startMinutes;


    const height =
      (duration / 60) *
      PIXELS_PER_HOUR;


    lesson.style.top =
      `${top}px`;

    lesson.style.height =
      `${height}px`;


    // krátke hodiny = 60 min alebo menej
    if (duration <= 60) {

      lesson.classList.add(
        "lesson-short"
      );

    } else {

      lesson.classList.remove(
        "lesson-short"
      );

    }

  });

}


// ==========================================
// DÁTUM A ČAS
// ==========================================

function updateDateTime() {

  const element =
    document.getElementById(
      "local-datetime"
    );


  if (!element) {
    return;
  }


  const now =
    new Date();


  const date =
    now.toLocaleDateString(
      "sk-SK",
      {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      }
    );


  const time =
    now.toLocaleTimeString(
      "sk-SK",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  element.textContent =
    `${date} · ${time}`;

}


// ==========================================
// PREVOD DŇA
// ==========================================

function getDayName(dayNumber) {

  const days = {

    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday"

  };


  return days[dayNumber];

}


// ==========================================
// ČÍSLO TÝŽDŇA
// ==========================================

function getISOWeek(date) {

  const tempDate =
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    );


  const dayNumber =
    tempDate.getUTCDay() || 7;


  tempDate.setUTCDate(
    tempDate.getUTCDate() +
    4 -
    dayNumber
  );


  const yearStart =
    new Date(
      Date.UTC(
        tempDate.getUTCFullYear(),
        0,
        1
      )
    );


  return Math.ceil(
    (
      (
        (tempDate - yearStart) /
        86400000
      ) + 1
    ) / 7
  );

}


// ==========================================
// AKTUÁLNA / NASLEDUJÚCA HODINA
// ==========================================

function updateCurrentLessons() {

  const now =
    new Date();


  const day =
    now.getDay();


  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();


  const currentSubject =
    document.getElementById(
      "current-subject"
    );

  const currentInfo =
    document.getElementById(
      "current-info"
    );

  const nextSubject =
    document.getElementById(
      "next-subject"
    );

  const nextInfo =
    document.getElementById(
      "next-info"
    );


  if (
    !currentSubject ||
    !currentInfo ||
    !nextSubject ||
    !nextInfo
  ) {

    return;

  }


  // ==========================================
  // VÍKEND
  // ==========================================

  if (day < 1 || day > 4) {

    currentSubject.textContent =
      "Žiadna hodina";

    currentInfo.textContent =
      "Teraz nemáš hodinu.";

    nextSubject.textContent =
      "Voľno";

    nextInfo.textContent =
      "Najbližšie hodiny sú v pondelok.";

    return;

  }


  // ==========================================
  // AKTUÁLNY TÝŽDEŇ
  // ==========================================

  const currentWeek =
    getISOWeek(now);


  const isOddWeek =
    currentWeek % 2 === 1;


  // ==========================================
  // AKTUÁLNY DEŇ
  // ==========================================

  const today =
    getDayName(day);


  // ==========================================
  // HODINY PRE AKTUÁLNY TÝŽDEŇ
  //
  // NP  = nepárny týždeň
  // PT  = párny týždeň
  // TYZ = každý týždeň
  // ==========================================

  const lessons =
    [...document.querySelectorAll(".lesson")]
      .filter(
        lesson =>
          lesson.dataset.day === today
      )
      .filter(
        lesson => {

          const frequency =
            lesson.dataset.frequency;


          if (
            frequency === "TYZ"
          ) {

            return true;

          }


          if (
            frequency === "NP"
          ) {

            return isOddWeek;

          }


          if (
            frequency === "PT"
          ) {

            return !isOddWeek;

          }


          return true;

        }
      )
      .sort(
        (a, b) =>
          timeToMinutes(
            a.dataset.start
          ) -
          timeToMinutes(
            b.dataset.start
          )
      );


  let current = null;
  let next = null;


  // ==========================================
  // HĽADANIE TERAZ / NASLEDUJE
  // ==========================================

  lessons.forEach(
    lesson => {

      const start =
        timeToMinutes(
          lesson.dataset.start
        );


      const end =
        timeToMinutes(
          lesson.dataset.end
        );


      if (
        currentMinutes >= start &&
        currentMinutes < end
      ) {

        current = lesson;

      }


      if (
        start > currentMinutes &&
        !next
      ) {

        next = lesson;

      }

    }
  );


  // ==========================================
  // TERAZ
  // ==========================================

  if (current) {

    currentSubject.textContent =
      getLessonSubject(current);


    const currentRoom =
      getRoomNumber(
        current.dataset.roomCode
      );


    currentInfo.textContent =
      `${current.dataset.start} – ${current.dataset.end} · ${getLessonTeacher(current)} · ${currentRoom}`;

  } else {

    currentSubject.textContent =
      "Momentálne nič";

    currentInfo.textContent =
      "Teraz nemáš hodinu.";

  }


  // ==========================================
  // NASLEDUJE
  // ==========================================

  if (next) {

    nextSubject.textContent =
      getLessonSubject(next);


    const nextRoom =
      getRoomNumber(
        next.dataset.roomCode
      );


    nextInfo.textContent =
      `${next.dataset.start} – ${next.dataset.end} · ${getLessonTeacher(next)} · ${nextRoom}`;

  } else {

    nextSubject.textContent =
      "Žiadna ďalšia hodina";

    nextInfo.textContent =
      "Pre dnešok máš hotovo.";

  }

}


// ==========================================
// KĽÚČ PRE ÚLOHU
// ==========================================

function getTaskKey(lesson) {

  return [
    lesson.dataset.day,
    lesson.dataset.start,
    getLessonSubject(lesson)
  ].join("_");

}


// ==========================================
// OTVORENIE DETAILU
// ==========================================

async function openLessonDetail(lesson) {

  const detail =
    document.getElementById(
      "lesson-detail"
    );

  const subject =
    document.getElementById(
      "detail-subject"
    );

  const teacher =
    document.getElementById(
      "detail-teacher"
    );

  const room =
    document.getElementById(
      "detail-room"
    );

  const task =
    document.getElementById(
      "detail-task"
    );


  if (
    !detail ||
    !subject ||
    !teacher ||
    !room ||
    !task
  ) {

    return;

  }


  // predmet
  subject.textContent =
    getLessonSubject(lesson);


  // učiteľ
  teacher.textContent =
    getLessonTeacher(lesson);


  // miestnosť
  const roomCode =
    lesson.dataset.roomCode;


  if (roomCode) {

    room.textContent =
      `Miestnosť ${getRoomNumber(roomCode)}`;

  } else {

    room.textContent =
      "Miestnosť neuvedená";

  }


  // ==========================================
  // ÚLOHA Z SUPABASE
  // ==========================================

  const lessonKey =
    getTaskKey(lesson);


  detail.dataset.lessonKey =
    lessonKey;


  task.value = "";


  const { data, error } =
    await supabaseClient
      .from("lesson_tasks")
      .select("task")
      .eq(
        "lesson_key",
        lessonKey
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Nepodarilo sa načítať úlohu:",
      error
    );

  } else if (data) {

    task.value =
      data.task || "";

  }


  // ==========================================
  // ZOBRAZENIE DETAILU
  // ==========================================

  detail.classList.remove(
    "hidden"
  );


  detail.removeAttribute(
    "hidden"
  );


  // scroll na detail
  detail.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ==========================================
// KLIKNUTIE NA PREDMET
// ==========================================

function setupLessonClicks() {

  const lessons =
    document.querySelectorAll(
      ".lesson"
    );


  lessons.forEach(
    lesson => {

      lesson.addEventListener(
        "click",
        function () {

          openLessonDetail(
            lesson
          );

        }
      );

    }
  );

}


// ==========================================
// ZATVORENIE DETAILU
// ==========================================

function setupCloseButton() {

  const closeButton =
    document.getElementById(
      "close-detail"
    );

  const detail =
    document.getElementById(
      "lesson-detail"
    );


  if (
    !closeButton ||
    !detail
  ) {

    return;

  }


  closeButton.addEventListener(
    "click",
    function () {

      detail.classList.add(
        "hidden"
      );


      detail.setAttribute(
        "hidden",
        ""
      );

    }
  );

}


// ==========================================
// ULOŽENIE ÚLOHY
// ==========================================

function setupTaskSaving() {

  const task =
    document.getElementById(
      "detail-task"
    );

  const detail =
    document.getElementById(
      "lesson-detail"
    );


  if (
    !task ||
    !detail
  ) {

    return;

  }


  task.addEventListener(
    "input",
    function () {

      const key =
        detail.dataset.lessonKey;


      if (!key) {
        return;
      }


      localStorage.setItem(
        key,
        task.value
      );

    }
  );

}


// ==========================================
// DETAILNÉ TLAČIDLÁ
// ==========================================

function setupDetailButtons() {

  const semesterButton =
    document.getElementById(
      "semester-button"
    );

  const materialButton =
    document.getElementById(
      "material-button"
    );

  const calendarButton =
    document.getElementById(
      "calendar-button"
    );

  const updatedButton =
    document.getElementById(
      "updated-button"
    );


  // ==========================================
  // CELOSEMESTROVKA
  // ==========================================

  if (semesterButton) {

    semesterButton.addEventListener(
      "click",
      function () {

        const detail =
          document.getElementById(
            "lesson-detail"
          );

        const subject =
          document.getElementById(
            "detail-subject"
          );

        const teacher =
          document.getElementById(
            "detail-teacher"
          );

        const room =
          document.getElementById(
            "detail-room"
          );


        if (
          !detail ||
          !subject ||
          !teacher ||
          !room
        ) {

          return;

        }


        const predmet =
          subject.textContent.trim();


        const ucitel =
          teacher.textContent.trim();


        const miestnost =
          room.textContent.trim();


        // Nájdeme aktuálnu hodinu
        const lessons =
          document.querySelectorAll(
            ".lesson"
          );


        let cas = "";


        lessons.forEach(
          function (lesson) {

            const lessonSubject =
              lesson.querySelector(
                "h3"
              );


            if (
              lessonSubject &&
              lessonSubject.textContent.trim() ===
                predmet
            ) {

              const time =
                lesson.querySelector(
                  ".lesson-time"
                );


              if (
                time &&
                !cas
              ) {

                cas =
                  time.textContent.trim();

              }

            }

          }
        );


        const url =
          "celosemestrovkaindex.html" +
          "?predmet=" +
          encodeURIComponent(
            predmet
          ) +
          "&cas=" +
          encodeURIComponent(
            cas
          ) +
          "&ucitel=" +
          encodeURIComponent(
            ucitel
          ) +
          "&miestnost=" +
          encodeURIComponent(
            miestnost
          );


        window.location.href =
          url;

      }
    );

  }


  // ==========================================
  // MATROŠ
  // ==========================================

  if (materialButton) {

    materialButton.addEventListener(
      "click",
      function () {

        const detail =
          document.getElementById(
            "lesson-detail"
          );

        const subject =
          document.getElementById(
            "detail-subject"
          );


        if (
          !detail ||
          !subject
        ) {

          return;

        }


        const predmet =
          subject.textContent.trim();


        const url =
          "matrosindex.html" +
          "?predmet=" +
          encodeURIComponent(
            predmet
          );


        window.location.href =
          url;

      }
    );

  }


  // ==========================================
  // KALENDÁR
  // ==========================================

  if (calendarButton) {

    calendarButton.addEventListener(
      "click",
      function () {

        alert(
          "Tu bude kalendár termínov."
        );

      }
    );

  }


  // ==========================================
  // ULOŽIŤ / AKTUALIZOVAŤ ÚLOHU
  // ==========================================

  if (updatedButton) {

    updatedButton.addEventListener(
      "click",
      async function () {

        const detail =
          document.getElementById(
            "lesson-detail"
          );

        const task =
          document.getElementById(
            "detail-task"
          );


        if (
          !detail ||
          !task
        ) {

          return;

        }


        const lessonKey =
          detail.dataset.lessonKey;


        if (!lessonKey) {

          return;

        }


        const { error } =
          await supabaseClient
            .from("lesson_tasks")
            .upsert(
              {
                lesson_key:
                  lessonKey,

                task:
                  task.value,

                updated_at:
                  new Date().toISOString()
              },
              {
                onConflict:
                  "lesson_key"
              }
            );


        if (error) {

          console.error(
            "Nepodarilo sa uložiť úlohu:",
            error
          );


          alert(
            "Úlohu sa nepodarilo uložiť."
          );


          return;

        }


        alert(
          "Úloha bola uložená."
        );

      }
    );

  }

}


// ==========================================
// SPUSTENIE
// ==========================================

function init() {

  positionLessons();

  setupRooms();

  updateDateTime();

  updateCurrentLessons();

  setupLessonClicks();

  setupCloseButton();

  setupTaskSaving();

  setupDetailButtons();

}


// ==========================================
// ŠTART
// ==========================================

init();


// ==========================================
// AKTUALIZÁCIA ČASU
// ==========================================

setInterval(
  updateDateTime,
  1000
);


// ==========================================
// AKTUALIZÁCIA AKTUÁLNEJ HODINY
// ==========================================

setInterval(
  updateCurrentLessons,
  60000
);
