$(document).ready(function () {
  class Data {
    constructor(wpm, date) {
      this.wpm = wpm;
      this.date = date;
    }
  }

  let last_week_average = 0;
  let all_time_average = 0;

  let last_week_data = [];
  let all_time_data = [];

  // Cache elements
  const $last_week_container = $("#last_week_container");
  const $last_week_mean = $("#last_week_mean");
  const $last_week_chart = $("#last_week_chart");
  const $data_container = $("#data_container");
  const $mean = $("#mean");
  const $chart = $("#chart");

  function loadData() {
    $.getJSON("/user/progress-data", function (data) {
      console.log(data);
      all_time_average = data[0].average_wpm;
      last_week_average = data[0].last_week_average_wpm;
      console.log(last_week_average);
      saveDataToList(last_week_data, data[0].last_week_wpm);
      saveDataToList(all_time_data, data[0].monthly_wpm);
      renderData();
    });
  }

  function saveDataToList(list, data) {
    data.forEach((element) => {
      list.push(new Data(element.wpm, element.date));
    });
  }

  function renderData() {
    $last_week_mean.text("Średnie WPM: " + Math.round(last_week_average));
    $mean.text("Średnie WPM: " + Math.round(all_time_average));
    renderLastWeekChart();
    renderChart();
  }

  function renderLastWeekChart() {
    const ctx = $last_week_chart.get(0).getContext("2d");
    const labels = last_week_data.map((element) => element.date);
    const data = last_week_data.map((element) => element.wpm);
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Średnia prędkość czytania w słowach na minutę",
            data: data,
            borderWith: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function renderChart(){
    const ctx = $chart.get(0).getContext("2d");
    const labels = all_time_data.map((element) => element.date);
    const data = all_time_data.map((element) => element.wpm);
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Średnia prędkość czytania w słowach na minutę",
            data: data,
            borderWith: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
    
  

  loadData();
});
