
const SUPABASE_URL = "https://cpahudvkfpeqzizsrrbn.supabase.co";
const SUPABASE_KEY = "sb_publishable_khnFozFe93qlkrW6lj4-9g_RedpxoOQ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const params = new URLSearchParams(window.location.search);
const subjectParam = params.get("predmet");
const subject = subjectParam ? subjectParam.trim() : null;
const isSubjectCalendar = Boolean(subject);

const monthTitle = document.getElementById("month-title");
const calendarGrid = document.getElementById("calendar-grid");
const calendarHeading = document.getElementById("calendar-heading");
const calendarDescription = document.getElementById("calendar-description");
const selectedDateTitle = document.getElementById("selected-date-title");
const eventsList = document.getElementById("events-list");

const eventFormPanel = document.getElementById("event-form-panel");
const eventForm = document.getElementById("event-form");
const eventDateInput = document.getElementById("event-date");
const eventTitleInput = document.getElementById("event-title");
const eventWhoInput = document.getElementById("event-who");
const eventSubjectNote = document.getElementById("event-subject-note");
const eventFormHeading = document.getElementById("event-form-heading");
const saveEventButton = document.getElementById("save-event");
const cancelEditButton = document.getElementById("cancel-edit");
const formMessage = document.getElementById("form-message");

const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");

const monthNames = [
  "január",
  "február",
  "marec",
  "apríl",
  "máj",
  "jún",
  "júl",
  "august",
  "september",
  "október",
  "november",
  "december"
];

const weekdayNames = [
  "nedeľa",
  "pondelok",
  "utorok",
  "streda",
  "štvrtok",
  "piatok",
  "sobota"
];

const whoLabels = {
  shared: "Spoločný termín",
  zuzana: "Zuzana only",
  nelka: "Nelka only"
};

let currentMonth = new Date();
currentMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth(),
  1
);

let selectedDate = getLocalDateString(new Date());
let events = [];
let editingEventId = null;
let isSaving = false;

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatLongDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return `${weekdayNames[date.getDay()]}, ${day}. ${monthNames[month - 1]} ${year}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function getEventsForDate(dateString) {
  return events.filter(function (event) {
    return event.event_date === dateString;
  });
}

function getVisibleEventsForDate(dateString) {
  const dayEvents = getEventsForDate(dateString);

  if (isSubjectCalendar) {
    return dayEvents.filter(function (event) {
      return event.subject === subject;
    });
  }

  return dayEvents;
}

function getVisibleEventsForMonth() {
  if (isSubjectCalendar) {
    return events.filter(function (event) {
      return event.subject === subject;
    });
  }

  return events;
}

function updatePageHeading() {
  if (isSubjectCalendar) {
    calendarHeading.textContent = `Termíny · ${subject}`;
    calendarDescription.textContent =
      "Termíny a úlohy pre tento predmet.";
    eventSubjectNote.textContent = `Predmet: ${subject}`;
    eventFormPanel.hidden = false;
  } else {
    calendarHeading.textContent = "Všetky termíny";
    calendarDescription.textContent =
      "Spoločný prehľad dôležitých termínov zo všetkých predmetov.";
    eventSubjectNote.textContent = "";
    eventFormPanel.hidden = true;
  }
}

async function loadEvents() {
  calendarGrid.innerHTML =
    '<p class="loading-message">Načítavam termíny…</p>';

  const { data, error } = await supabaseClient
    .from("calendar_events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Chyba pri načítaní termínov:", error);

    calendarGrid.innerHTML =
      '<p class="empty-message">Termíny sa nepodarilo načítať. Skús obnoviť stránku.</p>';

    return;
  }

  events = data || [];

  renderCalendar();
  renderSelectedDate();
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  const firstWeekday = new Date(year, month, 1).getDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const todayString = getLocalDateString(new Date());
  const visibleEvents = getVisibleEventsForMonth();

  let html = "";

  for (let cell = 0; cell < totalCells; cell++) {
    const dayNumber = cell - mondayOffset + 1;
    const date = new Date(year, month, dayNumber);
    const dateString = getLocalDateString(date);
    const isCurrentMonth = date.getMonth() === month;
    const dayEvents = visibleEvents.filter(function (event) {
      return event.event_date === dateString;
    });

    const classes = ["calendar-day"];

    if (!isCurrentMonth) classes.push("outside-month");
    if (dateString === todayString) classes.push("today");
    if (dateString === selectedDate) classes.push("selected");

    const uniqueTypes = [...new Set(
      dayEvents.map(function (event) {
        return event.who;
      })
    )];

    const indicators = uniqueTypes.map(function (type) {
      const count = dayEvents.filter(function (event) {
        return event.who === type;
      }).length;

      return `<span class="event-dot ${escapeHTML(type)}" title="${escapeHTML(whoLabels[type] || type)}: ${count}"></span>`;
    }).join("");

    html += `
      <button
        type="button"
        class="${classes.join(" ")}"
        data-date="${dateString}"
        aria-label="${dateString}${dayEvents.length ? `, ${dayEvents.length} termínov` : ""}"
        aria-pressed="${dateString === selectedDate}"
      >
        <span class="day-number">${date.getDate()}</span>
        <span class="day-indicators">${indicators}</span>
      </button>
    `;
  }

  calendarGrid.innerHTML = html;

  calendarGrid.querySelectorAll(".calendar-day").forEach(function (button) {
    button.addEventListener("click", function () {
      selectedDate = button.dataset.date;

      const clickedDate = new Date(
        Number(selectedDate.slice(0, 4)),
        Number(selectedDate.slice(5, 7)) - 1,
        Number(selectedDate.slice(8, 10))
      );

      currentMonth = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        1
      );

      renderCalendar();
      renderSelectedDate();
    });
  });
}

function renderSelectedDate() {
  selectedDateTitle.textContent = formatLongDate(selectedDate);

  const dayEvents = getVisibleEventsForDate(selectedDate);

  if (dayEvents.length === 0) {
    eventsList.innerHTML =
      '<p class="empty-message">Na tento deň zatiaľ nie sú naplánované žiadne termíny.</p>';

    return;
  }

  eventsList.innerHTML = dayEvents.map(function (event) {
    const eventSubject = escapeHTML(event.subject);
    const eventTitle = escapeHTML(event.title);
    const eventWho = escapeHTML(whoLabels[event.who] || event.who);
    const eventType = ["shared", "zuzana", "nelka"].includes(event.who)
      ? event.who
      : "shared";

    const title = isSubjectCalendar
      ? eventTitle
      : `${eventSubject} – ${eventTitle}`;

    const subjectLine = isSubjectCalendar
      ? eventWho
      : `${eventSubject} · ${eventWho}`;

    const actions = isSubjectCalendar
      ? `
        <div class="event-card-actions">
          <button type="button" data-edit="${event.id}">Upraviť</button>
          <button type="button" class="delete-event" data-delete="${event.id}">Odstrániť</button>
        </div>
      `
      : "";

    return `
      <article class="event-card">
        <span class="event-card-color ${eventType}"></span>
        <div class="event-card-content">
          <h3 class="event-card-title">${title}</h3>
          <p class="event-card-subtitle">${subjectLine}</p>
          ${actions}
        </div>
      </article>
    `;
  }).join("");

  if (isSubjectCalendar) {
    eventsList.querySelectorAll("[data-edit]").forEach(function (button) {
      button.addEventListener("click", function () {
        startEditingEvent(button.dataset.edit);
      });
    });

    eventsList.querySelectorAll("[data-delete]").forEach(function (button) {
      button.addEventListener("click", function () {
        deleteEvent(button.dataset.delete);
      });
    });
  }
}

function resetEventForm() {
  editingEventId = null;
  eventForm.reset();
  eventDateInput.value = selectedDate;
  eventFormHeading.textContent = "Nový termín";
  saveEventButton.textContent = "Uložiť termín";
  formMessage.textContent = "";
}

function startEditingEvent(id) {
  const event = events.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!event || !isSubjectCalendar || event.subject !== subject) {
    return;
  }

  editingEventId = event.id;
  eventDateInput.value = event.event_date;
  eventTitleInput.value = event.title;
  eventWhoInput.value = event.who;

  eventFormHeading.textContent = "Upraviť termín";
  saveEventButton.textContent = "Uložiť zmeny";
  formMessage.textContent = "";

  eventFormPanel.hidden = false;
  eventFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  eventTitleInput.focus();
}

async function saveEvent(event) {
  event.preventDefault();

  if (isSaving || !isSubjectCalendar || !subject) {
    return;
  }

  const title = eventTitleInput.value.trim();
  const eventDate = eventDateInput.value;
  const who = eventWhoInput.value;

  if (!title || !eventDate || !["shared", "zuzana", "nelka"].includes(who)) {
    formMessage.textContent = "Vyplň všetky povinné údaje.";
    return;
  }

  const eventData = {
    subject: subject,
    title: title,
    event_date: eventDate,
    who: who
  };

  isSaving = true;
  saveEventButton.disabled = true;
  formMessage.textContent = "Ukladám termín…";

  try {
    let result;

    if (editingEventId !== null) {
      result = await supabaseClient
        .from("calendar_events")
        .update(eventData)
        .eq("id", editingEventId)
        .eq("subject", subject);
    } else {
      result = await supabaseClient
        .from("calendar_events")
        .insert(eventData);
    }

    if (result.error) {
      throw result.error;
    }

    selectedDate = eventDate;

    const parsedDate = new Date(
      Number(eventDate.slice(0, 4)),
      Number(eventDate.slice(5, 7)) - 1,
      Number(eventDate.slice(8, 10))
    );

    currentMonth = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      1
    );

    resetEventForm();
    await loadEvents();

    formMessage.textContent = "Termín bol úspešne uložený.";
  } catch (error) {
    console.error("Chyba pri ukladaní termínu:", error);
    formMessage.textContent =
      "Termín sa nepodarilo uložiť. Skontroluj pripojenie a skús to znova.";
  } finally {
    isSaving = false;
    saveEventButton.disabled = false;
  }
}

async function deleteEvent(id) {
  if (!isSubjectCalendar) {
    return;
  }

  const event = events.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!event || event.subject !== subject) {
    return;
  }

  const confirmed = window.confirm(
    `Naozaj chceš odstrániť termín „${event.title}“?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("calendar_events")
      .delete()
      .eq("id", event.id)
      .eq("subject", subject);

    if (error) {
      throw error;
    }

    await loadEvents();
  } catch (error) {
    console.error("Chyba pri mazaní termínu:", error);
    window.alert("Termín sa nepodarilo odstrániť. Skús to znova.");
  }
}

prevMonthButton.addEventListener("click", function () {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );

  renderCalendar();
});

nextMonthButton.addEventListener("click", function () {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );

  renderCalendar();
});

eventForm.addEventListener("submit", saveEvent);

cancelEditButton.addEventListener("click", function () {
  resetEventForm();
});

updatePageHeading();
resetEventForm();
loadEvents();

