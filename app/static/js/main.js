const app = Vue.createApp({
  data() {
    return {
      cart: [],
      premium: true,
      imagefav: "static/image/arrow-bottom.png",
      imageHist: "static/image/arrow-bottom.png",
      imageProfile: "./static/image/userProfile.png",
      isFavOpen: false,
      isHistOpen: false,
      showFav: false,
      showHsit: false,
    };
  },
  methods: {
    changeImagefav() {
      this.isFavOpen = !this.isFavOpen; // Inverse l'état
      const favImage = document.querySelector(".fav-image");
      if (this.isFavOpen) {
        favImage.classList.add("rotated"); // Ajoute la classe pour la rotation
        showFav = true;
      } else {
        favImage.classList.remove("rotated"); // Retire la classe
        showFav = false;
      }
      const favDiv = document.querySelector(".carte-favoris");
      if (showFav) {
        favDiv.classList.add("showFav");
      } else {
        favDiv.classList.remove("showFav");
      }
    },
    changeImageHist() {
      this.isHistOpen = !this.isHistOpen; // Inverse l'état
      const histImage = document.querySelector(".hist-image");
      if (this.isHistOpen) {
        histImage.classList.add("rotated"); // Ajoute la classe pour la rotation
        showHsit = true;
      } else {
        histImage.classList.remove("rotated"); // Retire la classe
        showHsit = false;
      }
      const histDiv = document.querySelector(".carte-historique");
      if (showHsit) {
        histDiv.classList.add("showHist");
      } else {
        histDiv.classList.remove("showHist");
      }
    },
  },
});
