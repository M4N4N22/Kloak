(function () {
  const SCRIPT_ID = "kloak-embed-script";

  function createModal(id) {
    // overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.zIndex = 9999;

    // container
    const iframe = document.createElement("iframe");
    iframe.src = `http://localhost:3000/embed/${id}`;
    iframe.style.width = "420px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "20px";
    iframe.style.position = "absolute";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.transform = "translate(-50%, -50%)";

    overlay.appendChild(iframe);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    document.body.appendChild(overlay);
  }

  function init() {
    document.querySelectorAll("[data-kloak-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-kloak-id");
        createModal(id);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();