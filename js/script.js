const paytableConfig = {
    combinations: [
        {
            condition: s => s.every(img => img.includes('diamond.png')),
            display: ['diamond', 'diamond', 'diamond'],
            multiplier: 40,
            description: "Три пидара"
        },
        {
            condition: s => 
                s.some(img => img.includes('loh.png')) &&
                s.some(img => img.includes('lemon.png')) &&
                s.some(img => img.includes('clover.png')),
            display: ['loh', 'lemon', 'clover'],
            multiplier: 100,
            description: "Комбо Три пидора"
        },
        {
            condition: s => s.every(img => img.includes('7.png')),
            display: ['7', '7', '7'],
            multiplier: 30,
            description: "Три дулі"
        },
        {
            condition: s => s.every(img => img.includes('clover.png')),
            display: ['clover', 'clover', 'clover'],
            multiplier: 30,
            description: "Три Алона"
        },
        {
            condition: s => s.every(img => img.includes('bar.png')),
            display: ['bar', 'bar', 'bar'],
            multiplier: 30,
            description: "Три лукашиста"
        },
        {
            condition: s => s[0] === s[1] && s[1] === s[2],
            display: ['any', 'any', 'any'],
            multiplier: 10,
            description: "х10 Три в ряд"
        },
        {
            condition: s => s.filter(img => img.includes('clover.png')).length >= 2,
            display: ['clover', 'clover'],
            multiplier: 15,
            description: "Два пидара"
        },
        {
            condition: s => s.filter(img => img.includes('bar.png')).length >= 2,
            display: ['bar', 'bar'],
            multiplier: 15,
            description: "Два лукашиста"
        },
        {
            condition: s => s.filter(img => img.includes('loh.png')).length >= 2,
            display: ['loh', 'loh'],
            multiplier: 15,
            description: "Два долбойоба"
        },
        
    ]
};

const symbols = [
    '<img src="img/diamond.png">',
    '<img src="img/lemon.png">',
    '<img src="img/loh.png">',
    '<img src="img/7.png">',
    '<img src="img/cherry.png">',
    '<img src="img/clov.png">',
    '<img src="img/clover.png">',
    '<img src="img/bar.png">'
];

let balance = 1000;
let isSpinning = false;
let currentBet = 10;
let isAutoSpin = false;
let autoSpinInterval = null;
const AUTO_SPIN_DELAY = 1000;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    generatePaytable();
    initEventListeners();
});

function generatePaytable() {
    const table = document.getElementById('paytable');
    table.innerHTML = `
        <tr><th>Комбинация</th><th>Выплата</th></tr>
        ${paytableConfig.combinations.map(comb => `
            <tr>
                <td>
                    <div class="paytable-symbols">
                        ${comb.display.map(symbol => 
                            symbol === 'any' 
                            ? '<div class="any-symbol">🔄</div>' 
                            : `<img src="img/${symbol}.png" alt="${symbol}">`
                        ).join('')}
                    </div>
                    <div class="paytable-description">${comb.description}</div>
                </td>
                <td>${comb.multiplier}x</td>
            </tr>
        `).join('')}
    `;
}

function initEventListeners() {
    document.getElementById('betAmount').addEventListener('input', function(e) {
        currentBet = Math.min(Math.max(1, parseInt(e.target.value) || 1), balance, 1000);
        e.target.value = currentBet;
        document.getElementById('currentBet').textContent = currentBet;
    });

    document.querySelector('.spin-btn').addEventListener('click', spin);
    document.querySelector('.auto-spin-btn').addEventListener('click', toggleAutoSpin);
    document.querySelector('.stop-spin-btn').addEventListener('click', toggleAutoSpin);
}

function toggleAutoSpin() {
    isAutoSpin = !isAutoSpin;
    document.querySelector('.auto-spin-btn').style.display = isAutoSpin ? 'none' : 'block';
    document.querySelector('.stop-spin-btn').style.display = isAutoSpin ? 'block' : 'none';
    
    if (isAutoSpin) {
        autoSpinInterval = setInterval(() => {
            if (!isSpinning && balance >= currentBet) spin();
            else if (balance < currentBet) toggleAutoSpin();
        }, AUTO_SPIN_DELAY);
    } else {
        clearInterval(autoSpinInterval);
    }
}

function spin() {
    if (isSpinning || balance < currentBet) return;
    
    isSpinning = true;
    balance -= currentBet;
    document.getElementById('balance').textContent = balance;
    document.getElementById('spinSound').play();

    const reels = document.querySelectorAll('.reel');
    let results = [];

    reels.forEach((reel, index) => {
        let spins = 0;
        const spinInterval = setInterval(() => {
            reel.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            spins++;
            
            if (spins > 10 + index * 5) {
                clearInterval(spinInterval);
                results.push(reel.innerHTML);
                
                if (results.length === 3) {
                    isSpinning = false;
                    checkWin(results);
                    document.getElementById('balance').textContent = balance;
                }
            }
        }, 50);
    });
}

function checkWin(results) {
    let winAmount = 0;
    let comboName = '';
    
    for (const comb of paytableConfig.combinations) {
        if (comb.condition(results)) {
            winAmount = currentBet * comb.multiplier;
            comboName = comb.description;
            break;
        }
    }

    if (winAmount > 0) {
        balance += winAmount;
        document.getElementById('balance').textContent = balance;
        document.getElementById('winSound').play();
        showWinAnimation();
        showWinCombination(comboName);
    }
}

function showWinAnimation() {
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => {
        reel.style.background = '#00b4d8';
        setTimeout(() => reel.style.background = '#0f3460', 300);
    });
}

function showWinCombination(name) {
    const comboElement = document.getElementById('winCombo');
    comboElement.textContent = name + '!';
    comboElement.style.display = 'block';
    setTimeout(() => {
        comboElement.style.display = 'none';
    }, 3000);
}
