const brgyCount = 48;
const kidsPerBrgy = 100;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const sitios = ["Purok 1", "Purok 2", "Sitio Maligaya", "Sitio Pag-asa", "Purok 3"];
const statuses = ["Normal", "Underweight", "Stunted", "Obese"];

// 1. HELPER: Get Vitamin List based on Age
function getVitaminsByAge(age) {
    if (age <= 6) return ["Vit A (100k IU)", "Newborn Screening"];
    if (age <= 23) return ["Vit A (200k IU)", "Iron Drops", "Deworming"];
    return ["Vit A (High Dose)", "Deworming (Bi-annual)", "Zinc"];
}

// 2. GENERATE MASTER DATA
const masterData = {};
for (let b = 1; b <= brgyCount; b++) {
    const brgyName = `Brgy ${b}`;
    masterData[brgyName] = [];
    for (let k = 1; k <= kidsPerBrgy; k++) {
        masterData[brgyName].push({
            id: `B${b}-K${k}`,
            name: `Child ${k}, ${brgyName}`,
            age: Math.floor(Math.random() * 60),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            parents: `Parent Name ${k}`,
            sitio: sitios[Math.floor(Math.random() * sitios.length)],
            brgy: brgyName,
            vitaminTaken: Math.random() > 0.3 // 70% Compliance
        });
    }
}

// 3. VIEW SWITCHING
function switchView(viewName) {
    document.getElementById('trends-view').style.display = viewName === 'trends' ? 'block' : 'none';
    document.getElementById('records-view').style.display = viewName === 'records' ? 'block' : 'none';
    
    const menuItems = document.querySelectorAll('#sidebar-menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    
    if(viewName === 'trends') menuItems[0].classList.add('active');
    if(viewName === 'records') menuItems[1].classList.add('active');

    if(viewName === 'records') updateRecords();
    else updateTrends();
}

// 4. INITIALIZE FILTERS
function initFilters() {
    const trendBrgySelect = document.getElementById('trendBrgy');
    const recordBrgySelect = document.getElementById('filterBrgy');
    let options = '<option value="all">All Barangays</option>';
    for(let i=1; i<=brgyCount; i++) options += `<option value="Brgy ${i}">Barangay ${i}</option>`;
    
    if(trendBrgySelect) trendBrgySelect.innerHTML = options;
    if(recordBrgySelect) recordBrgySelect.innerHTML = options;
}

// 5. TRENDS VIEW LOGIC
let healthChart;
function updateTrends() {
    const brgy = document.getElementById('trendBrgy').value;
    const ageRange = document.getElementById('trendAge').value;
    const selectedStatus = document.getElementById('trendStatus').value;

    let kids = brgy === 'all' ? Object.values(masterData).flat() : masterData[brgy];

    if(ageRange !== 'all') {
        if(ageRange === '0-11') kids = kids.filter(k => k.age <= 11);
        else if(ageRange === '12-23') kids = kids.filter(k => k.age >= 12 && k.age <= 23);
        else kids = kids.filter(k => k.age >= 24);
    }

    document.getElementById('statNormal').innerText = kids.filter(k => k.status === 'Normal').length;
    document.getElementById('statMal').innerText = kids.filter(k => k.status === 'Underweight' || k.status === 'Stunted').length;
    document.getElementById('statObese').innerText = kids.filter(k => k.status === 'Obese').length;

    const ctx = document.getElementById('healthTrendChart').getContext('2d');
    if (healthChart) healthChart.destroy();

    const createMonthlyData = (baseCount) => months.map(() => Math.floor(Math.random() * (baseCount / 4)) + 2);
    const datasets = [];

    if(selectedStatus === 'all' || selectedStatus === 'Normal') {
        datasets.push({ label: 'Normal', data: createMonthlyData(kids.filter(k => k.status === 'Normal').length), borderColor: '#2e7d32', backgroundColor: 'transparent', tension: 0.4 });
    }
    if(selectedStatus === 'all' || selectedStatus === 'Underweight' || selectedStatus === 'Stunted') {
        datasets.push({ label: 'Malnourished', data: createMonthlyData(kids.filter(k => k.status === 'Underweight' || k.status === 'Stunted').length), borderColor: '#d32f2f', backgroundColor: 'transparent', tension: 0.4 });
    }
    if(selectedStatus === 'all' || selectedStatus === 'Obese') {
        datasets.push({ label: 'Obese', data: createMonthlyData(kids.filter(k => k.status === 'Obese').length), borderColor: '#fbc02d', backgroundColor: 'transparent', tension: 0.4 });
    }

    healthChart = new Chart(ctx, {
        type: 'line',
        data: { labels: months, datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 6. RECORDS VIEW LOGIC (With KPI and X-Marks)
function updateRecords() {
    const brgy = document.getElementById('filterBrgy').value;
    const ageRange = document.getElementById('filterAge').value;
    const status = document.getElementById('filterStatus').value;
    const vitStatus = document.getElementById('filterVitamin').value;

    let list = brgy === 'all' ? Object.values(masterData).flat() : masterData[brgy];

    // Filter Logic
    if(ageRange !== 'all') {
        if(ageRange === '0-11') list = list.filter(k => k.age <= 11);
        else if(ageRange === '12-23') list = list.filter(k => k.age >= 12 && k.age <= 23);
        else list = list.filter(k => k.age >= 24);
    }
    if(status !== 'all') list = list.filter(k => k.status === status);
    if(vitStatus !== 'all') list = list.filter(k => k.vitaminTaken === (vitStatus === 'Complete'));

    // KPI Update for Records View
    const missedTotal = list.filter(k => !k.vitaminTaken).length;
    const kpiElement = document.getElementById('statMissedRecords');
    if(kpiElement) kpiElement.innerText = missedTotal;

    const tableBody = document.getElementById('records-table-body');
    tableBody.innerHTML = list.slice(0, 100).map(k => {
        let vitaminDisplay = "";
        
        if (k.vitaminTaken) {
            vitaminDisplay = `<span class="badge complete">✓ Complete</span>`;
        } else {
            // Generate X marks for each required vitamin
            const requiredVits = getVitaminsByAge(k.age);
            vitaminDisplay = requiredVits.map(v => 
                `<div style="color: #c62828; font-size: 11px; margin-bottom: 2px;">
                    <b style="color:red">✘</b> ${v}
                </div>`
            ).join('');
        }

        return `
            <tr>
                <td><b>${k.name}</b></td>
                <td>${k.age} mos</td>
                <td>${k.status}</td>
                <td>${k.sitio}</td>
                <td>${vitaminDisplay}</td>
                <td><button class="view-btn" onclick="openProfile('${k.brgy}', '${k.id}')">Profile</button></td>
            </tr>
        `;
    }).join('');
}

// 7. MODAL PROFILE LOGIC
function openProfile(brgy, id) {
    const kid = masterData[brgy].find(k => k.id === id);
    const modalData = document.getElementById('modal-data');
    const vits = getVitaminsByAge(kid.age);

    modalData.innerHTML = `
        <div class="modal-profile-header">
            <div style="font-size:50px">👶</div>
            <h2>${kid.name}</h2>
            <p>${kid.brgy} | ${kid.sitio}</p>
        </div>
        <div class="modal-info">
            <p><strong>Age:</strong> ${kid.age} Months</p>
            <p><strong>Status:</strong> ${kid.status}</p>
            <p><strong>Parents:</strong> ${kid.parents}</p>
            <div class="vitamin-list" style="border-left: 5px solid ${kid.vitaminTaken ? '#2e7d32' : '#d32f2f'}">
                <h4>Monthly Vitamin Tracking</h4>
                <p>Overall Status: <b style="color:${kid.vitaminTaken ? 'green' : 'red'}">${kid.vitaminTaken ? 'TAKEN' : 'MISSED'}</b></p>
                <ul style="margin-top:8px; font-size:13px; list-style:none;">
                    ${vits.map(v => `<li>${kid.vitaminTaken ? '✅' : '❌'} ${v}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    document.getElementById('profileModal').style.display = 'flex';
}

function closeModal() { document.getElementById('profileModal').style.display = 'none'; }

// Initialize
initFilters();
updateTrends();