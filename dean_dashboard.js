document.addEventListener("DOMContentLoaded", function () {
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
});

