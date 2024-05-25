$(document).ready(function () {
    class Data {
      constructor(wpm, timestamp) {
        this.wpm = wpm;
        this.timestamp = timestamp;
      }
    }
  
    function loadData() {
      $.getJSON("/get_progress_data", function (data) {
        let list = [];
        let lastList = [];
        saveData(data, list, lastList);
        console.log(list);
        console.log(lastList);
        displayData(list, lastList);
      });
    }
  
    loadData();
  
    function displayData(list, lastList) {
      let mean = calculateMeanWpm(lastList);
      $("#last_mean").text(`Średnia: ${mean}`);
      let difference = calculateWpmDifference(lastList);
      $("#last_progress").text(`Różnica: ${difference}`);
      displayChart(
        $("#last_chart").get(0).getContext("2d"),
        groupDataByDay(lastList)
      );
  
      mean = calculateMeanWpm(list);
      $("#mean").text(`Średnia: ${mean}`);
      difference = calculateWpmDifference(list);
      $("#progress").text(`Różnica: ${difference}`);
      displayChart($("#chart").get(0).getContext("2d"), groupDataByMonth(list));
    }
  
    function displayChart(ctx, groupedData) {
      let labels = Object.keys(groupedData);
      let data = Object.values(groupedData);
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Średnia prędkość czytania w słowach na minutę",
              data: data,
              borderWidth: 1,
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
  
    function groupDataByDay(List) {
      let groupedData = {};
  
      let firstDate = new Date(
        Math.min(...List.map((item) => new Date(item.timestamp)))
      );
      let lastDate = new Date(
        Math.max(...List.map((item) => new Date(item.timestamp)))
      );
  
      for (
        let d = new Date(firstDate);
        d <= lastDate;
        d.setDate(d.getDate() + 1)
      ) {
        let day =
          ("0" + (d.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + d.getDate()).slice(-2);
        groupedData[day] = [];
      }
  
      List.forEach((item) => {
        let date = new Date(item.timestamp);
        let day =
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + date.getDate()).slice(-2);
        if (groupedData[day] !== undefined) {
          groupedData[day].push(item.wpm);
        }
      });
  
      for (let day in groupedData) {
        if (groupedData[day].length > 0) {
          let sum = groupedData[day].reduce((a, b) => a + b, 0);
          let avg = sum / groupedData[day].length;
          groupedData[day] = avg;
        } else {
          groupedData[day] = 0;
        }
      }
  
      return groupedData;
    }
  
    function groupDataByMonth(List) {
      let groupedData = {};
      let currentDate = new Date();
  
      let firstDate = new Date(
        Math.min(...List.map((item) => new Date(item.timestamp)))
      );
      let lastDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
  
      if (currentDate > lastDate) {
        lastDate = currentDate;
      }
  
      for (
        let d = new Date(firstDate.setHours(0, 0, 0, 0));
        d <= new Date(lastDate.setHours(0, 0, 0, 0));
        d.setMonth(d.getMonth() + 1)
      ) {
        let month = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
        groupedData[month] = [];
      }
  
      List.forEach((item) => {
        let date = new Date(item.timestamp);
        let month =
          date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2);
        if (groupedData[month] !== undefined) {
          groupedData[month].push(item.wpm);
        }
      });
  
      for (let month in groupedData) {
        if (groupedData[month].length > 0) {
          let sum = groupedData[month].reduce((a, b) => a + b, 0);
          let avg = sum / groupedData[month].length;
          groupedData[month] = avg;
        } else {
          groupedData[month] = 0;
        }
      }
      console.log(groupedData);
      return groupedData;
    }
  
    function calculateMeanWpm(lastList) {
      let sum = 0;
      for (let i = 0; i < lastList.length; i++) {
        sum += lastList[i].wpm;
      }
      let mean = sum / lastList.length;
      return Math.round(mean);
    }
  
    function calculateWpmDifference(lastList) {
      if (lastList.length > 0) {
        let difference = lastList[lastList.length - 1].wpm - lastList[0].wpm;
        return Math.round(difference);
      }
      return 0;
    }
  
    function saveData(data, list, lastList) {
      let now = new Date();
      let sevenDaysAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
  
      sevenDaysAgo.setHours(23, 59, 59, 999);
  
      data.forEach(function (item) {
        let itemDate = new Date(item.timestamp);
        let dataItem = new Data(
          item.wpm,
          new Date(
            itemDate.getFullYear(),
            itemDate.getMonth(),
            itemDate.getDate()
          )
        );
        dataItem.timestamp.setHours(0, 0, 0, 0);
        list.push(dataItem);
        if (dataItem.timestamp >= sevenDaysAgo) {
          lastList.push(dataItem);
        }
      });
    }
  });
  