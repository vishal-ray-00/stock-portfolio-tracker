// Basic portfolio logic and UI updates

const portfolio = [];
let allocationChart = null;
let profitLossChart = null;


function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function getRandomCurrentPrice(base) {
    // simulate a current price within ±10%
    const variance = (Math.random() - 0.5) * 0.2;
    return parseFloat((base * (1 + variance)).toFixed(2));
}

function addStock(symbol, quantity, buyPrice) {
    const currentPrice = getRandomCurrentPrice(buyPrice);
    portfolio.push({ symbol, quantity, buyPrice, currentPrice });
    refreshUI();
}

function removeStock(index) {
    portfolio.splice(index, 1);
    refreshUI();
}

function calculateSummary() {
    let totalInvestment = 0;
    let currentValue = 0;
    portfolio.forEach(stock => {
        totalInvestment += stock.buyPrice * stock.quantity;
        currentValue += stock.currentPrice * stock.quantity;
    });
    const profitLoss = currentValue - totalInvestment;
    return { totalInvestment, currentValue, profitLoss };
}

function updateSummaryCards() {
    const { totalInvestment, currentValue, profitLoss } = calculateSummary();
    document.getElementById('total-investment').textContent = formatCurrency(totalInvestment);
    document.getElementById('current-value').textContent = formatCurrency(currentValue);
    const plEl = document.getElementById('profit-loss');
    plEl.textContent = formatCurrency(profitLoss);
    plEl.classList.toggle('profit', profitLoss >= 0);
    plEl.classList.toggle('loss', profitLoss < 0);
}

function updateTable() {
    const tbody = document.querySelector('#portfolio-table tbody');
    tbody.innerHTML = '';

    portfolio.forEach((stock, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${stock.symbol.toUpperCase()}</td>
            <td>${stock.quantity}</td>
            <td>${formatCurrency(stock.buyPrice)}</td>
            <td>${formatCurrency(stock.currentPrice)}</td>
            <td class="${stock.currentPrice * stock.quantity - stock.buyPrice * stock.quantity >= 0 ? 'profit' : 'loss'}">
                ${formatCurrency((stock.currentPrice - stock.buyPrice) * stock.quantity)}
            </td>
            <td><button class="delete-btn" data-index="${index}" title="Delete">🗑</button></td>
        `;
        tbody.appendChild(tr);
    });

    // attach delete handlers
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            removeStock(idx);
        });
    });
}

function updateCharts() {
    if (!allocationChart || !profitLossChart) {
        return;
    }
    const labels = portfolio.map(s => s.symbol.toUpperCase());
    const allocationData = portfolio.map(s => s.currentPrice * s.quantity);
    const profitLossData = portfolio.map(s => (s.currentPrice - s.buyPrice) * s.quantity);
    // update bar gradients based on profit/loss
    const barGradients = profitLossData.map((val, idx) => {
        const ctx = profitLossChart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        if (val >= 0) {
            gradient.addColorStop(0, '#00ff99');
            gradient.addColorStop(1, '#1db954');
        } else {
            gradient.addColorStop(0, '#ff4d4d');
            gradient.addColorStop(1, '#e02424');
        }
        return gradient;
    });

    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = allocationData;
    allocationChart.update();

    profitLossChart.data.labels = labels;
    profitLossChart.data.datasets[0].data = profitLossData;
    profitLossChart.data.datasets[0].backgroundColor = barGradients;
    profitLossChart.update();
    return;


}


function refreshUI() {
    updateSummaryCards();
    updateTable();
    updateCharts();
}

function initCharts() {
    const allocCtx = document.getElementById('allocation-chart').getContext('2d');
    // create gradient palette for allocation
    const allocGradient1 = allocCtx.createLinearGradient(0, 0, 0, 300);
    allocGradient1.addColorStop(0, '#00ff99');
    allocGradient1.addColorStop(1, '#00d4ff');
    const allocGradient2 = allocCtx.createLinearGradient(0, 0, 0, 300);
    allocGradient2.addColorStop(0, '#007bff');
    allocGradient2.addColorStop(1, '#6f42c1');
    const allocGradient3 = allocCtx.createLinearGradient(0, 0, 0, 300);
    allocGradient3.addColorStop(0, '#ff00d4');
    allocGradient3.addColorStop(1, '#1db954');

    allocationChart = new Chart(allocCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [allocGradient1, allocGradient2, allocGradient3],
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: { labels: { color: '#e0e0e0' } }
            },
            animation: { animateRotate: true, duration: 1000 }
        }
    });

    const plCtx = document.getElementById('profit-loss-chart').getContext('2d');
    profitLossChart = new Chart(plCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Profit / Loss',
                data: [],
                backgroundColor: [],
                borderSkipped: false,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: { color: '#444' },
                    ticks: { color: '#e0e0e0' }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#444' },
                    ticks: { color: '#e0e0e0' }
                }
            },
            animation: { duration: 800 }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-stock-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const symbol = document.getElementById('symbol').value.trim();
        const quantity = parseFloat(document.getElementById('quantity').value);
        const buyPrice = parseFloat(document.getElementById('buy-price').value);

        if (!symbol || quantity <= 0 || buyPrice <= 0) {
            alert('Please enter valid stock data.');
            return;
        }

        addStock(symbol, quantity, buyPrice);
        form.reset();
    });

    initCharts();
    refreshUI();
});
