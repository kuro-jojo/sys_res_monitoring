// charts.js
// Initialize CPU Chart
const MAX_LABELS = 20;
const TIME_INTERVAL = 5000;

const cpuCtx = document.getElementById('cpuChart').getContext('2d');
const cpuChart = createChart(cpuCtx, 'CPU Usage (%)', [], 'rgba(54, 162, 235, 1)');

// Initialize Memory Chart
const memoryCtx = document.getElementById('memoryChart').getContext('2d');
const memoryChart = createChart(memoryCtx, 'Memory Usage (%)', [], 'rgba(255, 99, 132, 1)');

// Initialize Disk Chart
const diskCtx = document.getElementById('diskChart').getContext('2d');
const diskChart = createPieChart(diskCtx, [], ["Total", "Used", "Free"]);

let fetchCount = 0;

function fetchMetrics() {
    fetch('/metrics')
        .then(response => response.json())
        .then(data => {
            // Update the chart
            updateCPUChart(cpuChart, data.cpu_usage);
            updateMemoryChart(memoryChart, data.memory_usage);

            if (fetchCount % 5 === 0) {
                updateDiskChart(diskChart, data.disk_usage);
                console.log("Data: ", data);
            }
            fetchCount++;
            setTimeout(fetchMetrics, TIME_INTERVAL);

        }).catch(error => {
            console.error('Error fetching metrics:', error);
        });
}

fetchMetrics();

fetch('/info')
    .then(response => response.json())
    .then(data => {
        updateCPUChartLabels(cpuChart, data.cpus);
        document.getElementById("maxMemory").innerText = data.memory
    });

function updateCPUChartLabels(chart, cpus) {
    for (let index = 1; index <= cpus; index++) {
        chart.data.labels.push('CPU ' + index);
    }
    chart.update()
}

function updateCPUChart(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}


function updateMemoryChart(chart, data) {
    if (chart.data.labels.length > MAX_LABELS && chart.data.datasets[0].data.length > MAX_LABELS) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.datasets[0].data.push(data);
    chart.data.labels.push(new Date().toLocaleTimeString());

    if (chart.data.datasets[0].data.length > 2) {
        chart.update();
    }
}

function updateDiskChart(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

function createChart(ctx, label, data, borderColor) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            // labels: labels, // Replace with dynamic labels (e.g., timestamps)
            datasets: [{
                label: label,
                data: data, // Replace with dynamic data
                borderColor: borderColor,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            // maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    // max: 100
                }
            },
            // plugins: {
            //     legend: {
            //         display: true
            //     }
            // }
        }
    });
}

function createPieChart(ctx, data, labels) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            // maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}