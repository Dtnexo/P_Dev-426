const app = Vue.createApp({
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    toggleMenu() {
      console.log(this.showMenu);
      if (this.showMenu == true) {
        this.showMenu = false;
      } else {
        this.showMenu = true;
      }
    },
  },
});
