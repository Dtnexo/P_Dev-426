document.addEventListener("DOMContentLoaded", function () {
  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");
  const nextBtn = document.getElementById("Next");
  const prevBtn = document.querySelector(".Prev");

  nextBtn.addEventListener("click", function () {
    // Enlever les anciennes animations
    page1.classList.remove("slide-in-left", "slide-out-left");
    page2.classList.remove("slide-in-right", "slide-out-right");

    // Ajouter les nouvelles animations
    page1.classList.add("slide-out-left");
    page2.classList.add("slide-in-right");

    setTimeout(() => {
      page1.style.display = "none";
      page2.style.display = "flex";
    }, 200);
  });

  prevBtn.addEventListener("click", function () {
    console.log("Bouton Précédent cliqué !");
    
    // Enlever les anciennes animations
    page1.classList.remove("slide-in-left", "slide-out-left");
    page2.classList.remove("slide-in-right", "slide-out-right");

    // Ajouter les nouvelles animations
    page1.classList.add("slide-in-left");
    page2.classList.add("slide-out-right");

    setTimeout(() => {
      page1.style.display = "flex";
      page2.style.display = "none";
    }, 200);
  });
});
