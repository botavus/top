const GAME_CONFIG = {
    REEL_SPIN_DELAY: 100,
    SYMBOL_CHANGE_DELAY: 75,
    WIN_MESSAGE_DURATION: 5000,
    AUTO_SPIN_DELAY: 2000,
    MAJOR_WIN_DELAY: 1500,
    REGULAR_WIN_DELAY: 500,
    MAJOR_ANIMATION_DURATION: 7000,
    SYMBOL_SCALE_FACTOR: 1.3
};

const paytableConfig = {
    combinations: [
        {
            condition: s => 
                s.some(img => img.includes('loh.png')) &&
                s.some(img => img.includes('lemon.png')) &&
                s.some(img => img.includes('clover.png')),
            display: ['loh', 'lemon', 'clover'],
            multiplier: 20,
            description: "Комбо Три пидора"
        },
        {
            condition: s => s.every(img => img.includes('diamond.png')),
            display: ['diamond', 'diamond', 'diamond'],
            multiplier: 15,
            description: "x15 Три пидара"
        },
        {
            condition: s => s.every(img => img.includes('7.png')),
            display: ['7', '7', '7'],
            multiplier: 10,
            description: "х10 Три дулі"
        },
        {
            condition: s => s.every(img => img.includes('clover.png')),
            display: ['clover', 'clover', 'clover'],
            multiplier: 7,
            description: "x7 Три Алона-гандона"
        },
        {
            condition: s => s.every(img => img.includes('bar.png')),
            display: ['bar', 'bar', 'bar'],
            multiplier: 7,
            description: "x7 Три лукашиста"
        },
        {
            condition: s => s[0] === s[1] && s[1] === s[2],
            display: ['any', 'any', 'any'],
            multiplier: 5,
            description: "х5 Три в ряд"
        },
        {
            condition: s => s.filter(img => img.includes('clover.png')).length >= 2,
            display: ['clover', 'clover'],
            multiplier: 5,
            description: "х5 Два пидара"
        },
        {
            condition: s => s.filter(img => img.includes('bar.png')).length >= 2,
            display: ['bar', 'bar'],
            multiplier: 5,
            description: "х5 Два лукашиста"
        },
        {
            condition: s => s.filter(img => img.includes('loh.png')).length >= 2,
            display: ['loh', 'loh'],
            multiplier: 3,
            description: "х3 Два долбойоба"
        },
        {
            condition: s => s.filter(img => img.includes('diamond.png')).length >= 2,
            display: ['diamond', 'diamond'],
            multiplier: 3,
            description: "х3 Два Кима "
        }
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
let isMajorWin = false;

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
        }, GAME_CONFIG.AUTO_SPIN_DELAY);
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
        reel.classList.add('slow-spin');
        let spins = 0;
        const spinInterval = setInterval(() => {
            reel.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            spins++;
            
            if (spins > 10 + index * 5) {
                clearInterval(spinInterval);
                results.push(reel.innerHTML);
                
                const delay = GAME_CONFIG.REGULAR_WIN_DELAY;
                
                if (results.length === 3) {
                    setTimeout(() => {
                        reel.classList.remove('slow-spin');
                        isSpinning = false;
                        checkWin(results);
                        document.getElementById('balance').textContent = balance;
                    }, delay);
                }
            }
        }, 75);
    });
}

function checkWin(results) {
    let winAmount = 0;
    let comboName = '';
    let isMajorWin = false;
    
    for (const comb of paytableConfig.combinations) {
        if (comb.condition(results)) {
            winAmount = currentBet * comb.multiplier;
            comboName = comb.description;
            isMajorWin = comb.isMajor || false;
            break;
        }
    }

    if (winAmount > 0) {
        balance += winAmount;
        document.getElementById('balance').textContent = balance;
        document.getElementById('winSound').play();
        showWinAnimation(isMajorWin);
        showWinCombination(comboName, isMajorWin);
    }
}

function showWinAnimation(isMajor) {
    const reels = document.querySelectorAll('.reel');
    
    if(isMajor) {
        reels.forEach(reel => {
            reel.style.animation = 'major-win 2s ease-in-out';
            reel.style.transform = 'scale(1.2)';
        });
        
        document.body.style.backgroundColor = '#2a0d2e';
        setTimeout(() => {
            document.body.style.backgroundColor = '#1a1a2e';
        }, 2000);
    } else {
        reels.forEach(reel => {
            reel.style.background = '#00b4d8';
            setTimeout(() => reel.style.background = '#0f3460', 300);
        });
    }
}

function showWinCombination(name, isMajor) {
    const comboElement = document.getElementById('winCombo');
    comboElement.textContent = name + '!';
    comboElement.className = 'win-combination';
    
    if(isMajor) {
        comboElement.classList.add('major-win');
        document.body.style.animation = 'majorWinBackground 3s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 3000);
    }
    
    comboElement.style.display = 'block';
    setTimeout(() => {
        comboElement.style.display = 'none';
    }, isMajor ? 5000 : 3000);
}
