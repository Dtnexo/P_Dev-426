document.addEventListener("DOMContentLoaded", () => {
  const pieCanvas = document.getElementById("pieCanvas");
  const data = window.chartDataFromServer;

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
  });
});
