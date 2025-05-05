document.addEventListener("DOMContentLoaded", () => {
  const pieCanvas = document.getElementById("pieCanvas");
  const data = window.chartDataFromServer;
  const user = window.userFromServer;

  if (!pieCanvas || !data) {
    console.error("Canvas ou données manquantes !");
    return;
  }

  const pieChart = new Chart(pieCanvas, {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    },
    options: {
      onClick: async (event, elements, chart) => {
        if (elements[0]) {
          const i = elements[0].index;
          //alert(chart.data.labels[i] + ": " + chart.data.datasets[0].data[i]);
          //modifier les données du chart
          //pieChart.data.labels = ["dsaas", "dsdfaf", "eqwewqe", "dsadasd"];
          //pieChart.data.datasets[0].data = [10, 20, 30, 40];
          let response = await fetch(
            "http://localhost:3003/api/countryWheel?user_id=" +
              user.user_id +
              "&continent=" +
              chart.data.labels[i]
          );
          const rawData = await response.json();
          console.log(rawData);
          (pieChart.data.labels = rawData.map((item) => item.states)),
            (pieChart.data.datasets[0].data = rawData.map(
              (item) => item.nombre_sites
            )),
            pieChart.update();
        }
      },
    },
  });
});
