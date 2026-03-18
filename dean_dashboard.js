document.addEventListener("DOMContentLoaded", function () {
  // Тоггл для динамики среднего балла (график)
  var toggles = document.querySelectorAll(".link-toggle[data-toggle-target]");
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-toggle-target");
      var panel = document.getElementById(targetId);
      if (!panel) return;

      var isOpen = panel.classList.contains("collapsible-open");
      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        requestAnimationFrame(function () {
          panel.classList.remove("collapsible-open");
          panel.style.maxHeight = "0px";
          panel.setAttribute("aria-hidden", "true");
          btn.textContent = "Показать динамику в виде графика";
        });
      } else {
        panel.classList.add("collapsible-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.setAttribute("aria-hidden", "false");
        btn.textContent = "Скрыть динамику";
      }
    });
  });

  // Заметки в календаре событий
  var calendarPanel = document.querySelector(".calendar-panel");
  if (!calendarPanel) {
    return;
  }

  var dayNodes = calendarPanel.querySelectorAll(".calendar-day[data-date]");
  var notesContainer = calendarPanel.querySelector(".calendar-notes");
  var emptyState = notesContainer.querySelector(".calendar-notes-empty");
  var form = notesContainer.querySelector(".calendar-notes-form");
  var dateLabel = notesContainer.querySelector(".calendar-notes-date");
  var textarea = notesContainer.querySelector(".calendar-notes-text");
  var saveBtn = notesContainer.querySelector(".calendar-notes-save");
  var cancelBtn = notesContainer.querySelector(".calendar-notes-cancel");

  var notesStore = {};
  var currentDate = null;

  dayNodes.forEach(function (day) {
    day.addEventListener("click", function () {
      var date = day.getAttribute("data-date");
      if (!date) return;

      currentDate = date;
      var humanDate = day.querySelector(".calendar-date")
        ? day.querySelector(".calendar-date").textContent + " марта 2026"
        : date;

      dateLabel.textContent = "Заметка для даты: " + humanDate;
      textarea.value = notesStore[date] || "";

      emptyState.hidden = true;
      form.hidden = false;
      textarea.focus();
    });
  });

  saveBtn.addEventListener("click", function () {
    if (!currentDate) return;
    var text = textarea.value.trim();
    var day = calendarPanel.querySelector(
      '.calendar-day[data-date="' + currentDate + '"]'
    );
    if (!day) return;

    if (text) {
      notesStore[currentDate] = text;
      day.classList.add("calendar-day-has-note");
    } else {
      delete notesStore[currentDate];
      day.classList.remove("calendar-day-has-note");
    }

    form.hidden = true;
    emptyState.hidden = false;
    currentDate = null;
  });

  cancelBtn.addEventListener("click", function () {
    form.hidden = true;
    emptyState.hidden = false;
    currentDate = null;
  });
});

