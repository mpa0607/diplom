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
  var listEl = notesContainer.querySelector(".calendar-notes-list");
  var emptyState = notesContainer.querySelector(".calendar-notes-empty");
  var form = notesContainer.querySelector(".calendar-notes-form");
  var dateLabel = notesContainer.querySelector(".calendar-notes-date");
  var textarea = notesContainer.querySelector(".calendar-notes-text");
  var saveBtn = notesContainer.querySelector(".calendar-notes-save");
  var cancelBtn = notesContainer.querySelector(".calendar-notes-cancel");

  var notesStore = {};
  var currentDate = null;
  var currentEditingNoteId = null;
  var defaultNotePlaceholder = "Добавить заметку";

  function noteTitleForPlaceholder(text) {
    var t = (text || "").trim();
    if (t.length > 50) {
      return t.slice(0, 50) + "…";
    }
    return t || "…";
  }

  function ensureNotesArray(date) {
    if (!notesStore[date]) {
      notesStore[date] = [];
    }
    return notesStore[date];
  }

  function renderNotesForDate(date) {
    var notes = notesStore[date] || [];
    listEl.innerHTML = "";

    notes.forEach(function (note) {
      var item = document.createElement("div");
      item.className = "calendar-note";
      item.dataset.noteId = String(note.id);

      var dot = document.createElement("span");
      dot.className = "calendar-note-dot";

      var text = document.createElement("span");
      text.className = "calendar-note-text";
      text.textContent = note.text;

      var menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.className = "calendar-note-menu";
      menuBtn.textContent = "⋯";

      var menuPopup = document.createElement("div");
      menuPopup.className = "calendar-note-menu-popup";

      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "calendar-note-menu-item";
      editBtn.dataset.action = "edit";
      editBtn.textContent = "Изменить";

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "calendar-note-menu-item";
      deleteBtn.dataset.action = "delete";
      deleteBtn.textContent = "Удалить";

      menuPopup.appendChild(editBtn);
      menuPopup.appendChild(deleteBtn);

      item.appendChild(dot);
      item.appendChild(text);
      item.appendChild(menuBtn);
      item.appendChild(menuPopup);

      listEl.appendChild(item);
    });
  }

  function updateDayHasNoteFlag(date) {
    var day = calendarPanel.querySelector(
      '.calendar-day[data-date="' + date + '"]'
    );
    if (!day) return;

    var notes = notesStore[date] || [];
    if (notes.length) {
      day.classList.add("calendar-day-has-note");
    } else {
      day.classList.remove("calendar-day-has-note");
    }
  }

  dayNodes.forEach(function (day) {
    day.addEventListener("click", function () {
      var date = day.getAttribute("data-date");
      if (!date) return;

      currentDate = date;
      currentEditingNoteId = null;
      var humanDate = day.querySelector(".calendar-date")
        ? day.querySelector(".calendar-date").textContent + " марта 2026"
        : date;

      dateLabel.textContent = "Заметка для даты: " + humanDate;
      textarea.value = "";
      textarea.placeholder = defaultNotePlaceholder;

      renderNotesForDate(currentDate);
      updateDayHasNoteFlag(currentDate);
      emptyState.hidden = true;
      form.hidden = false;
      textarea.focus();
    });
  });

  saveBtn.addEventListener("click", function () {
    if (!currentDate) return;
    var text = textarea.value.trim();
    if (!text) return;

    var notes = ensureNotesArray(currentDate);

    if (currentEditingNoteId != null) {
      var existing = notes.find(function (n) {
        return n.id === currentEditingNoteId;
      });
      if (existing) {
        existing.text = text;
      }
    } else {
      notes.push({
        id: Date.now() + Math.random(),
        text: text,
      });
    }

    renderNotesForDate(currentDate);
    updateDayHasNoteFlag(currentDate);

    textarea.value = "";
    textarea.placeholder = defaultNotePlaceholder;
    currentEditingNoteId = null;

    form.hidden = true;
    emptyState.hidden = notesStore[currentDate] && notesStore[currentDate].length;
  });

  cancelBtn.addEventListener("click", function () {
    form.hidden = true;
    emptyState.hidden = !(currentDate && notesStore[currentDate] && notesStore[currentDate].length);
    currentDate = null;
    currentEditingNoteId = null;
    textarea.value = "";
    textarea.placeholder = defaultNotePlaceholder;
  });

  // Обработка контекстного меню заметок
  calendarPanel.addEventListener("click", function (event) {
    var menuBtn = event.target.closest(".calendar-note-menu");
    if (menuBtn) {
      var noteEl = menuBtn.closest(".calendar-note");
      if (!noteEl) return;
      var popup = noteEl.querySelector(".calendar-note-menu-popup");
      if (!popup) return;

      // закрыть другие меню
      calendarPanel
        .querySelectorAll(".calendar-note-menu-popup.open")
        .forEach(function (el) {
          if (el !== popup) {
            el.classList.remove("open");
          }
        });

      popup.classList.toggle("open");
      return;
    }

    var menuItem = event.target.closest(".calendar-note-menu-item");
    if (menuItem) {
      var action = menuItem.dataset.action;
      var noteEl = menuItem.closest(".calendar-note");
      if (!noteEl) return;
      var date = currentDate;
      if (!date) return;
      var noteId = noteEl.dataset.noteId
        ? Number(noteEl.dataset.noteId)
        : null;
      var notes = ensureNotesArray(date);

      if (action === "delete" && noteId != null) {
        notesStore[date] = notes.filter(function (n) {
          return n.id !== noteId;
        });
        renderNotesForDate(date);
        updateDayHasNoteFlag(date);
      }

      if (action === "edit" && noteId != null) {
        var note = notes.find(function (n) {
          return n.id === noteId;
        });
        if (!note) return;

        currentDate = date;
        currentEditingNoteId = noteId;
        var dayEl = calendarPanel.querySelector(
          '.calendar-day[data-date="' + date + '"]'
        );
        var humanDate = dayEl && dayEl.querySelector(".calendar-date")
          ? dayEl.querySelector(".calendar-date").textContent + " марта 2026"
          : date;

        dateLabel.textContent = "Заметка для даты: " + humanDate;
        textarea.value = "";
        textarea.placeholder =
          "Изменение заметки «" + noteTitleForPlaceholder(note.text) + "»";

        emptyState.hidden = true;
        form.hidden = false;
        textarea.focus();
      }

      var popup = noteEl.querySelector(".calendar-note-menu-popup");
      if (popup) {
        popup.classList.remove("open");
      }
    }
  });
});

