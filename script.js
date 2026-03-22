// Balayan, Batangas Configuration
const balayanCenter = [13.9380, 120.7320]; 
const balayanBrgys = [
    "Caloocan", "Lanatan", "San Roque", "Ermita", "Gumamela", 
    "Navotas", "Palikpikan", "Sampaga", "Santol", "San Pioquinto",
    "Dalig", "Langgangan", "Canda", "Pooc", "Tanggoy"
]; 
const kidsPerBrgy = 40; 
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// FILIPINO NAME GENERATOR
const firstNames = ["Juan", "Maria", "Jose", "Luz", "Pedro", "Ana", "Miguel", "Rosa", "Carlos", "Teresa", "Luis", "Carmen", "Mateo", "Sofia", "Diego", "Elena"];
const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Aquino", "Ramos", "Villanueva", "Mercado"];

function getRandomName() {
    return `${lastNames[Math.floor(Math.random() * lastNames.length)]}, ${firstNames[Math.floor(Math.random() * firstNames.length)]}`.toUpperCase();
}

// NUTRITION CALCULATION - Strictly aligned with specific BNS acronyms
function computeWFA(weight, ageMonths) {
    if (!weight) return "Pending";
    let expectedW = ageMonths * 0.2 + 3.5; 
    if (weight < expectedW - 3) return "SUW"; // Severely Underweight
    if (weight < expectedW - 1.5) return "UW"; // Underweight
    if (weight > expectedW + 3) return "OW"; // Overweight
    return "N"; // Normal
}

function computeHFA(height, ageMonths) {
    if (!height) return "Pending";
    let expectedH = ageMonths * 1.5 + 48;
    if (height < expectedH - 6) return "SST"; // Severely Stunted
    if (height < expectedH - 3) return "ST"; // Stunted
    if (height > expectedH + 5) return "T"; // Tall
    return "N"; // Normal
}

function computeWFLH(weight, height) {
    if (!weight || !height) return "Pending";
    let hM = height / 100;
    let bmi = weight / (hM * hM);
    if (bmi < 12.0) return "SW"; // Severely Wasted
    if (bmi < 13.5) return "MW"; // Moderately Wasted
    if (bmi > 18.5) return "OB"; // Obese
    if (bmi > 17.0) return "OW"; // Overweight
    return "N"; // Normal
}

function getVitaminsByAge(age) {
    if (age <= 6) return ["Vit A (100k IU)", "Newborn Screening"];
    if (age <= 23) return ["Vit A (200k IU)", "Iron Drops", "Deworming"];
    return ["Vit A (High Dose)", "Deworming", "Zinc Supplement"];
}

function getStatusBadge(status) {
    if (status === "N") return `<span class="badge-status badge-normal">N</span>`;
    if (["OW", "OB", "T"].includes(status)) return `<span class="badge-status badge-warning">${status}</span>`;
    if (["UW", "SUW", "ST", "SST", "MW", "SW"].includes(status)) return `<span class="badge-status badge-danger">${status}</span>`;
    return `<span class="badge-status badge-pending">Pending</span>`;
}

function getFullStatusName(code) {
    const map = { "N":"Normal", "UW":"Underweight", "SUW":"Severely Underweight", "OW":"Overweight", "OB":"Obese", "ST":"Stunted", "SST":"Severely Stunted", "T":"Tall", "MW":"Moderately Wasted", "SW":"Severely Wasted" };
    return map[code] || "Pending";
}

// Generate Master Data
const masterData = {};
const brgyCoords = {};

balayanBrgys.forEach((brgy, index) => {
    masterData[brgy] = [];
    brgyCoords[brgy] = [
        balayanCenter[0] + (Math.random() * 0.08 - 0.04),
        balayanCenter[1] + (Math.random() * 0.08 - 0.04)
    ];

    for (let k = 1; k <= kidsPerBrgy; k++) {
        const history = [];
        for(let m=0; m<6; m++) { history.push(Math.random() > 0.2); } 

        let age = Math.floor(Math.random() * 60) + 1; 
        
        let bDate = new Date();
        bDate.setMonth(bDate.getMonth() - age);
        let birthdate = bDate.toISOString().split('T')[0];

        let dDate = new Date();
        dDate.setDate(Math.floor(Math.random() * 28) + 1);
        let dateMeasured = dDate.toISOString().split('T')[0];

        let weight = (Math.random() * 10 + 5).toFixed(1);
        let height = (Math.random() * 40 + 50).toFixed(1);
        
        let wfa = computeWFA(weight, age);
        let hfa = computeHFA(height, age);
        let wflh = computeWFLH(weight, height);

        // Overall classification logic for specific Masterlist/Map views
        let overall = "Normal";
        if (["UW", "SUW"].includes(wfa) || ["ST", "SST"].includes(hfa) || ["MW", "SW"].includes(wflh)) overall = "Malnourished";
        if (["OB", "OW"].includes(wflh) || wfa === "OW") overall = "Obese";

        masterData[brgy].push({
            id: `B${index}-K${k}`,
            name: getRandomName(),
            gender: Math.random() > 0.5 ? "Male" : "Female",
            parents: getRandomName(),
            age: age, 
            birthdate: birthdate,
            dateMeasured: dateMeasured,
            weight: weight,
            height: height,
            wfa: wfa,
            hfa: hfa,
            wflh: wflh,
            overallStatus: overall,
            sitio: "PUROK " + Math.ceil(Math.random() * 5),
            brgy: brgy,
            vitaminTaken: Math.random() > 0.3,
            history: history 
        });
    }
});

// GLOBAL FILTER ENGINE
function filterDataList(list, ageRange, status, vitStatus) {
    let filtered = list;
    if (ageRange && ageRange !== 'all') {
        if(ageRange === '0-11') filtered = filtered.filter(k => k.age <= 11);
        else if(ageRange === '12-23') filtered = filtered.filter(k => k.age >= 12 && k.age <= 23);
        else if(ageRange === '24-59') filtered = filtered.filter(k => k.age >= 24);
    }
    if (status && status !== 'all') filtered = filtered.filter(k => k.overallStatus === status);
    if (vitStatus && vitStatus !== 'all') filtered = filtered.filter(k => k.vitaminTaken === (vitStatus === 'Complete'));
    return filtered;
}

// VIEW SWITCHING
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    if (document.getElementById(viewName + '-view')) {
        document.getElementById(viewName + '-view').style.display = 'block';
    }
    
    const menuItems = document.querySelectorAll('#sidebar-menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    
    if(viewName === 'trends') { menuItems[0].classList.add('active'); updateTrends(); }
    if(viewName === 'records') { menuItems[1].classList.add('active'); updateRecords(); }
    if(viewName === 'reports') { menuItems[2].classList.add('active'); updateReportsView(); }
    if(viewName === 'map') { 
        menuItems[3].classList.add('active'); 
        if (fullMap) { setTimeout(() => { fullMap.invalidateSize(); }, 200); }
    }
}

function initFilters() {
    const selects = [document.getElementById('trendBrgy'), document.getElementById('filterBrgy')];
    let options = '<option value="all">All Barangays</option>';
    balayanBrgys.forEach(b => options += `<option value="${b}">Brgy. ${b}</option>`);
    
    selects.forEach(select => {
        if(select) select.innerHTML = options;
    });
}

// MAP LOGIC
let fullMap;

function initFullMap() {
    const mapEl = document.getElementById('full-city-map');
    if (!mapEl) return; 

    fullMap = L.map('full-city-map').setView(balayanCenter, 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(fullMap);

    balayanBrgys.forEach(brgy => {
        const kids = masterData[brgy];
        const normal = kids.filter(k => k.overallStatus === 'Normal').length;
        const mal = kids.filter(k => k.overallStatus === 'Malnourished').length;
        const obese = kids.filter(k => k.overallStatus === 'Obese').length;
        
        const totalKids = kids.length;
        const badCases = mal + obese;
        const caseRatio = badCases / totalKids;
        
        let markerColor = "#2e7d32"; 
        if (caseRatio >= 0.55) markerColor = "#d32f2f"; 
        else if (caseRatio >= 0.40) markerColor = "#fbc02d"; 

        L.circle(brgyCoords[brgy], { color: markerColor, fillColor: markerColor, fillOpacity: 0.5, radius: 500 }).addTo(fullMap);
        const marker = L.marker(brgyCoords[brgy]).addTo(fullMap);
        marker.on('click', () => { openInfoPanel(brgy, normal, mal, obese, badCases, markerColor, totalKids); });
    });
}

function openInfoPanel(brgy, normal, mal, obese, badCases, colorCode, totalKids) {
    const panel = document.getElementById('brgy-info-panel');
    const content = document.getElementById('panel-content');
    
    let suggestionClass = "green";
    let suggestionText = "GOOD: The majority of children in this barangay are healthy. Maintain current feeding and vitamin programs.";
    
    if(colorCode === "#d32f2f") {
        suggestionClass = "red";
        suggestionText = "URGENT ACTION NEEDED: Health issues heavily outweigh normal cases. Immediate intervention required.";
    } else if (colorCode === "#fbc02d") {
        suggestionClass = "yellow";
        suggestionText = "WARNING: Health issues are almost equal to normal cases. Monitor closely and schedule targeted parental health seminars.";
    }

    content.innerHTML = `
        <h2 style="color: #1b5e20; margin-bottom: 5px;">Brgy. ${brgy}</h2>
        <p style="color: #666; font-size: 13px; margin-bottom: 20px;"><i class="fas fa-map-marker-alt"></i> Balayan, Batangas</p>
        <div class="total-highlight">
            <h3>${totalKids}</h3>
            <span>Total Registered Children</span>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 14px; color: #333;">Health Status Breakdown</h3>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#2e7d32"></i> Normal:</span> <strong style="color: #2e7d32">${normal}</strong></div>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#d32f2f"></i> Malnourished:</span> <strong style="color: #d32f2f">${mal}</strong></div>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#fbc02d"></i> Obese:</span> <strong style="color: #fbc02d">${obese}</strong></div>
            <div class="stat-row" style="border:none; padding-top: 10px; margin-bottom: 0;">
                <span><strong>Total Health Cases:</strong></span> <strong>${badCases}</strong>
            </div>
        </div>
        <h3 style="font-size: 15px; color: #333;">System Recommendation</h3>
        <div class="suggestion-box ${suggestionClass}">${suggestionText}</div>
    `;
    panel.classList.add('open');
}

function closeInfoPanel() { if(document.getElementById('brgy-info-panel')) document.getElementById('brgy-info-panel').classList.remove('open'); }

// DASHBOARD CHARTS & TRENDS
function generateChartData(targetValue) {
    if (targetValue === 0) return months.map(() => 0);
    const data = [];
    let current = Math.max(1, Math.floor(targetValue * 0.4)); 
    for(let i=0; i<11; i++) {
        data.push(current);
        current += Math.floor((Math.random() * 5) - 1); 
        if(current < 0) current = 0;
    }
    data.push(targetValue); 
    return data;
}

let healthChart;
let comparisonChart; 

function updateTrends() {
    if(!document.getElementById('trendBrgy')) return; 

    const brgy = document.getElementById('trendBrgy').value;
    const ageRange = document.getElementById('trendAge').value;
    const selectedMetric = document.getElementById('trendStatus').value; // Values: WFLH, HFA, WFA

    let baseKids = brgy === 'all' ? Object.values(masterData).flat() : masterData[brgy];
    let filteredKids = baseKids;
    
    if(ageRange !== 'all') {
        if(ageRange === '0-11') filteredKids = filteredKids.filter(k => k.age <= 11);
        else if(ageRange === '12-23') filteredKids = filteredKids.filter(k => k.age >= 12 && k.age <= 23);
        else if(ageRange === '24-59') filteredKids = filteredKids.filter(k => k.age >= 24);
    }

    // Custom Stats Calculation for Metric View
    let countNormal = 0, countUnder = 0, countOver = 0;
    filteredKids.forEach(k => {
        let val = selectedMetric === "WFLH" ? k.wflh : (selectedMetric === "HFA" ? k.hfa : k.wfa);
        if (val === "N") countNormal++;
        else if (["UW", "SUW", "ST", "SST", "MW", "SW"].includes(val)) countUnder++;
        else if (["OW", "OB", "T"].includes(val)) countOver++;
    });

    document.getElementById('statNormal').innerText = countNormal;
    document.getElementById('statMal').innerText = countUnder;
    document.getElementById('statObese').innerText = countOver;

    const ctxLine = document.getElementById('healthTrendChart').getContext('2d');
    if (healthChart) healthChart.destroy();
    
    const datasets = [];
    const addDataset = (label, color, count) => {
        datasets.push({
            label: label,
            data: generateChartData(count),
            borderColor: color,
            backgroundColor: color + '1A', // 10% Opacity Fill
            fill: true,
            tension: 0.4
        });
    };

    // Generate Dynamic Lines based on the exact selected Metric
    if (selectedMetric === "WFLH") {
        addDataset('Normal (N)', '#2e7d32', filteredKids.filter(k=>k.wflh==='N').length);
        addDataset('Overweight (OW)', '#fbc02d', filteredKids.filter(k=>k.wflh==='OW').length);
        addDataset('Obese (OB)', '#e65100', filteredKids.filter(k=>k.wflh==='OB').length);
        addDataset('Mod. Wasted (MW)', '#f44336', filteredKids.filter(k=>k.wflh==='MW').length);
        addDataset('Sev. Wasted (SW)', '#b71c1c', filteredKids.filter(k=>k.wflh==='SW').length);
    } 
    else if (selectedMetric === "HFA") {
        addDataset('Normal (N)', '#2e7d32', filteredKids.filter(k=>k.hfa==='N').length);
        addDataset('Tall (T)', '#1976d2', filteredKids.filter(k=>k.hfa==='T').length);
        addDataset('Stunted (ST)', '#f44336', filteredKids.filter(k=>k.hfa==='ST').length);
        addDataset('Sev. Stunted (SST)', '#b71c1c', filteredKids.filter(k=>k.hfa==='SST').length);
    } 
    else if (selectedMetric === "WFA") {
        addDataset('Normal (N)', '#2e7d32', filteredKids.filter(k=>k.wfa==='N').length);
        addDataset('Overweight (OW)', '#fbc02d', filteredKids.filter(k=>k.wfa==='OW').length);
        addDataset('Underweight (UW)', '#f44336', filteredKids.filter(k=>k.wfa==='UW').length);
        addDataset('Sev. Underweight (SUW)', '#b71c1c', filteredKids.filter(k=>k.wfa==='SUW').length);
    }

    healthChart = new Chart(ctxLine, {
        type: 'line',
        data: { labels: months, datasets: datasets },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { beginAtZero: true } }, 
            plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12 } } } // Explicitly show chart legend
        }
    });

    const ctxBar = document.getElementById('brgyComparisonChart').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();

    const barData = [];
    const barColors = [];

    balayanBrgys.forEach(b => {
        let list = masterData[b];
        if(ageRange !== 'all') {
            if(ageRange === '0-11') list = list.filter(k => k.age <= 11);
            else if(ageRange === '12-23') list = list.filter(k => k.age >= 12 && k.age <= 23);
            else if(ageRange === '24-59') list = list.filter(k => k.age >= 24);
        }

        // Count only the issues based on the selected metric type
        let issuesCount = 0;
        list.forEach(k => {
            let val = selectedMetric === "WFLH" ? k.wflh : (selectedMetric === "HFA" ? k.hfa : k.wfa);
            if (val !== "N") issuesCount++;
        });

        let baseColor = '#f57c00'; 
        if (brgy !== 'all' && brgy !== b) baseColor += '40'; 

        barData.push(issuesCount);
        barColors.push(baseColor);
    });

    comparisonChart = new Chart(ctxBar, {
        type: 'bar',
        data: { labels: balayanBrgys, datasets: [{ label: `Total Issues (${selectedMetric})`, data: barData, backgroundColor: barColors, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { size: 10 } } } }, plugins: { legend: { display: false } } }
    });
}

function updateRecords() {
    if(!document.getElementById('filterBrgy')) return;
    
    const brgy = document.getElementById('filterBrgy').value;
    const ageRange = document.getElementById('filterAge').value;
    const status = document.getElementById('filterStatus').value;
    const vitStatus = document.getElementById('filterVitamin').value;

    let baseList = brgy === 'all' ? Object.values(masterData).flat() : masterData[brgy];
    let filteredList = filterDataList(baseList, ageRange, status, vitStatus);

    const totalReg = filteredList.length;
    const missedTotal = filteredList.filter(k => !k.vitaminTaken).length;

    // UPDATE KPIs
    if(document.getElementById('statTotalRecords')) document.getElementById('statTotalRecords').innerText = totalReg;
    if(document.getElementById('statMissedRecords')) document.getElementById('statMissedRecords').innerText = missedTotal;

    const formatBtnDate = (dStr) => {
        if(!dStr || dStr === "--") return "--";
        const date = new Date(dStr);
        const m = date.toLocaleString('default', { month: 'short' });
        return `${m}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    };

    document.getElementById('records-table-body').innerHTML = filteredList.slice(0, 100).map(k => {
        let vitaminDisplay = "";
        if (k.vitaminTaken) {
            vitaminDisplay = `<span class="badge complete" style="font-size:10px; padding: 4px 8px;"><i class="fas fa-check"></i> Complete</span>`;
        } else {
            const requiredVits = getVitaminsByAge(k.age);
            vitaminDisplay = requiredVits.map(v => `<div style="color: #c62828; font-size: 10px; margin-bottom: 2px;"><i class="fas fa-times"></i> ${v}</div>`).join('');
        }

        const dobFmt = formatBtnDate(k.birthdate);
        const domFmt = formatBtnDate(k.dateMeasured);
        const sexFmt = k.gender === "Male" ? "M" : "F";

        return `
            <tr>
                <td>Brgy. ${k.brgy},<br><small>${k.sitio}</small></td>
                <td>${k.parents}</td>
                <td><strong>${k.name}</strong></td>
                <td>NO</td>
                <td>${sexFmt}</td>
                <td>${dobFmt}</td>
                <td>${domFmt}</td>
                <td><strong>${k.weight}</strong></td>
                <td><strong>${k.height}</strong></td>
                <td>${k.age}</td>
                <td>${getStatusBadge(k.wfa)}</td>
                <td>${getStatusBadge(k.hfa)}</td>
                <td>${getStatusBadge(k.wflh)}</td>
                <td>${vitaminDisplay}</td>
                <td><button class="view-btn" onclick="openProfile('${k.brgy}', '${k.id}')">Profile</button></td>
            </tr>
        `;
    }).join('');
}

// REPORTS VIEW LOGIC
function updateReportsView() {
    if(!document.getElementById('reports-table-body')) return;

    const reportData = balayanBrgys.map(brgy => {
        const kids = masterData[brgy];
        const total = kids.length;
        
        const normal = kids.filter(k => k.overallStatus === 'Normal').length;
        const mal = kids.filter(k => k.overallStatus === 'Malnourished').length;
        const obese = kids.filter(k => k.overallStatus === 'Obese').length;
        const totalIssues = mal + obese; 

        return { brgy, total, normal, mal, obese, totalIssues };
    });

    reportData.sort((a, b) => b.totalIssues - a.totalIssues);

    const tbody = document.getElementById('reports-table-body');
    tbody.innerHTML = reportData.map(data => `
        <tr>
            <td><strong>Brgy. ${data.brgy}</strong></td>
            <td>${data.total}</td>
            <td><span style="color: #2e7d32; font-weight: 600;">${data.normal}</span></td>
            <td>${data.mal}</td>
            <td>${data.obese}</td>
            <td><span style="color: #d32f2f; font-weight: bold; font-size: 16px;">${data.totalIssues}</span></td>
        </tr>
    `).join('');
}

// PROFILE MODAL
function openProfile(brgy, id) {
    const kid = masterData[brgy].find(k => k.id === id);
    const vits = getVitaminsByAge(kid.age);
    
    let historyHTML = "";
    const pastMonthsNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    kid.history.forEach((took, i) => {
        historyHTML += `<div class="month-box ${took ? 'green' : 'red'}">${pastMonthsNames[i]}<br><i class="fas ${took ? 'fa-check' : 'fa-times'}"></i></div>`;
    });

    document.getElementById('modal-data').innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar"><i class="fas fa-child"></i></div>
            <div class="profile-title"><h2>${kid.name}</h2><p><i class="fas fa-map-marker-alt"></i> Brgy. ${kid.brgy}, ${kid.sitio}</p></div>
        </div>
        <div class="profile-grid">
            <div>
                <div class="info-box"><span class="info-label">Parents / Guardian</span><span class="info-value">${kid.parents}</span></div>
                <div class="info-box"><span class="info-label">Gender & Age</span><span class="info-value">${kid.gender} | ${kid.age} Months</span></div>
                
                <div class="info-box">
                    <span class="info-label">Current Health Breakdown</span>
                    <p style="font-size:13px; margin:5px 0;"><strong>WFA:</strong> <span style="color:${kid.wfa==='N'?'#2e7d32':'#d32f2f'}">${getFullStatusName(kid.wfa)}</span></p>
                    <p style="font-size:13px; margin:5px 0;"><strong>HFA:</strong> <span style="color:${kid.hfa==='N'?'#2e7d32':'#d32f2f'}">${getFullStatusName(kid.hfa)}</span></p>
                    <p style="font-size:13px; margin:5px 0;"><strong>WFL/H:</strong> <span style="color:${kid.wflh==='N'?'#2e7d32':'#d32f2f'}">${getFullStatusName(kid.wflh)}</span></p>
                </div>
            </div>
            <div>
                <div class="vitamin-card" style="border-left: 4px solid ${kid.vitaminTaken ? '#2e7d32' : '#d32f2f'}">
                    <h4>Current Month Vitamins</h4>
                    <ul class="vit-list">
                        ${vits.map(v => `<li><span style="color: ${kid.vitaminTaken ? '#2e7d32' : '#d32f2f'}"><i class="fas ${kid.vitaminTaken ? 'fa-check' : 'fa-times'}"></i></span> ${v}</li>`).join('')}
                    </ul>
                </div>
                <div class="history-tracker">
                    <h4>Past 6 Months Compliance Insight</h4>
                    <div class="months-grid">${historyHTML}</div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('profileModal').style.display = 'flex';
}

function closeModal() { document.getElementById('profileModal').style.display = 'none'; }

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initFullMap(); 
    if(document.getElementById('trendBrgy')) updateTrends(); 
});