document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("Next").addEventListener("click", function () {
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");

    // Ajoutez les classes d'animation
    page1.classList.add("slide-out-left");
    page2.classList.add("slide-in-right");

    // Changez l'affichage après l'animation
    setTimeout(function () {
      page1.style.display = "none";
      page2.style.display = "flex";
    }, 500); // La durée de l'animation est de 0.5s
  });
});
