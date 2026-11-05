document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".icon-card");

  cards.forEach((card) => {
    const select = card.querySelector(".size-select");
    const copyBtn = card.querySelector(".copy-btn");
    const downloadBtn = card.querySelector(".download-btn");

    // The <option> currently chosen in this card's size dropdown
    const chosen = () => select.options[select.selectedIndex];

    // Copy the selected size's (absolute) URL to the clipboard
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(chosen().value);
          const label = copyBtn.innerHTML; // preserve the SVG icon
          copyBtn.innerHTML = "Copied!";
          copyBtn.classList.add("btn-success");
          setTimeout(() => {
            copyBtn.innerHTML = label;
            copyBtn.classList.remove("btn-success");
          }, 1200);
        } catch (err) {
          console.error("Copy failed:", err);
        }
      });
    }

    // Download the selected size (same-origin URL so the download attribute works)
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const opt = chosen();
        const a = document.createElement("a");
        a.href = opt.dataset.dl;
        a.download = opt.dataset.fn;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }
  });

  // Live search filter
  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      cards.forEach((card) => {
        const match = card.dataset.name.toLowerCase().includes(q);
        card.closest(".col").classList.toggle("d-none", !match);
      });
    });
  }
});
