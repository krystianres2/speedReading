$(document).ready(function () {
    $.getJSON("/get_wpm_data", function (data) {
        // Get the date 7 days ago
        let sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter the data to include only the records from the last 7 days
        data = data.filter(function (item) {
            let date = new Date(item.timestamp.split(' ')[0]);  // Get the date part of the timestamp
            return date >= sevenDaysAgo;
        });

        // Create an object where each key is a date and each value is an array of WPM values for that date
        let wpmByDate = data.reduce(function (acc, item) {
            let date = item.timestamp.split(' ')[0];  // Get the date part of the timestamp
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item.wpm);
            return acc;
        }, {});

        // Create an array of dates and an array of average WPM values
        let labels = Object.keys(wpmByDate);
        let wpmData = labels.map(function (date) {
            let wpmValues = wpmByDate[date];
            let sum = wpmValues.reduce(function (a, b) { return a + b; }, 0);
            return sum / wpmValues.length;  // Calculate the average
        });

        let ctx = document.getElementById('Wpm_chart').getElementsByTagName('canvas')[0].getContext('2d');

        let myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'WPM',
                    data: wpmData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
});