// Initialization Constants
const currentBrgy = "Brgy. Caloocan";
const puroks = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"];
let childrenData = [];
let currentEditingId = null;

const today = new Date();
const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

// 1. HELPERS: AGE AND BMI CALCULATION
function calculateAgeInMonths(birthdateStr) {
    const birthDate = new Date(birthdateStr);
    const currentDate = new Date();
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += currentDate.getMonth();
    return months <= 0 ? 0 : months;
}

function computeNutritionalStatus(weightKg, heightCm) {
    if (!weightKg || !heightCm) return "Pending";
    let heightM = heightCm / 100;
    let bmi = weightKg / (heightM * heightM);
    
    if (bmi < 13.5) return "Underweight";
    if (bmi >= 13.5 && bmi <= 18.5) return "Normal";
    if (bmi > 18.5) return "Obese";
    return "Unknown";
}

function getVitaminsByAge(ageMonths) {
    if (ageMonths <= 6) return ["Vitamin A (100k IU)", "Newborn Screening"];
    if (ageMonths <= 23) return ["Vitamin A (200k IU)", "Iron Drops", "Deworming"];
    return ["Vitamin A (High Dose)", "Deworming", "Zinc Supplement"];
}

// 2. MOCK DATA GENERATION
function generateMockData() {
    const firstNames = ["Juan", "Maria", "Jose", "Luz", "Pedro", "Ana"];
    const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo"];
    
    for(let i=1; i<=15; i++) {
        const bDate = new Date();
        bDate.setMonth(bDate.getMonth() - Math.floor(Math.random() * 58) - 1);
        const bdateStr = bDate.toISOString().split('T')[0];
        
        const checkedThisMonth = Math.random() > 0.4; 
        
        let historyRecords = [];
        historyRecords.push({
            month: "2026-02",
            weight: (Math.random() * 10 + 5).toFixed(1),
            height: (Math.random() * 40 + 50).toFixed(1),
            status: ["Normal", "Underweight", "Obese"][Math.floor(Math.random() * 3)],
            vitamins: ["Vitamin A", "Iron Drops"]
        });

        if(checkedThisMonth) {
            historyRecords.push({
                month: currentMonthString,
                weight: (Math.random() * 10 + 5).toFixed(1),
                height: (Math.random() * 40 + 50).toFixed(1),
                status: ["Normal", "Underweight", "Obese"][Math.floor(Math.random() * 3)],
                vitamins: ["Vitamin A", "Zinc"]
            });
        }

        childrenData.push({
            id: `KID-${Math.floor(Math.random()*10000)}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            birthdate: bdateStr,
            parents: `Mr. & Mrs. ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            purok: puroks[Math.floor(Math.random() * puroks.length)],
            records: historyRecords
        });
    }
}

// 3. RENDER MASTERLIST
function renderMasterlist() {
    const searchStr = document.getElementById('searchChild').value.toLowerCase();
    const filterPurok = document.getElementById('filterPurok').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const tableBody = document.getElementById('bns-table-body');
    
    let filtered = childrenData;

    if (searchStr) filtered = filtered.filter(k => k.name.toLowerCase().includes(searchStr));
    if (filterPurok !== 'all') filtered = filtered.filter(k => k.purok === filterPurok);
    if (filterStatus !== 'all') {
        filtered = filtered.filter(kid => {
            const latestRecord = kid.records[kid.records.length - 1];
            const isChecked = latestRecord && latestRecord.month === currentMonthString;
            return filterStatus === 'checked' ? isChecked : !isChecked;
        });
    }

    tableBody.innerHTML = filtered.map(kid => {
        const age = calculateAgeInMonths(kid.birthdate);
        const latestRecord = kid.records[kid.records.length - 1];
        const isCheckedThisMonth = latestRecord && latestRecord.month === currentMonthString;
        
        let checkupBadge = isCheckedThisMonth 
            ? `<span class="badge complete">🟢 Checked</span>` 
            : `<span class="badge pending">🔴 Pending</span>`;
            
        let statusDisplay = latestRecord ? latestRecord.status : "No Data";
        let statusColor = statusDisplay === "Normal" ? "#2e7d32" : (statusDisplay === "Obese" ? "#fbc02d" : (statusDisplay === "No Data" ? "#666" : "#d32f2f"));

        return `
            <tr>
                <td><strong>${kid.name}</strong><br><small>${kid.parents}</small></td>
                <td>${kid.purok}</td>
                <td>${age} mos</td>
                <td><strong style="color:${statusColor}">${statusDisplay}</strong></td>
                <td>${checkupBadge}</td>
                <td><button class="view-btn" onclick="openProfile('${kid.id}')">Manage</button></td>
            </tr>
        `;
    }).join('');
    
    renderReports();
}

// 4. ADD NEW CHILD
function openAddChildModal() {
    document.getElementById('add-child-form').reset();
    document.getElementById('add-age-preview').innerText = "";
    document.getElementById('addChildModal').style.display = 'flex';
}

function previewAge() {
    const bdate = document.getElementById('add-bday').value;
    if(bdate) document.getElementById('add-age-preview').innerText = `Calculated Age: ${calculateAgeInMonths(bdate)} months`;
}

function submitNewChild(e) {
    e.preventDefault();
    const newKid = {
        id: `KID-${Math.floor(Math.random()*10000)}`,
        name: document.getElementById('add-name').value,
        birthdate: document.getElementById('add-bday').value,
        parents: document.getElementById('add-parents').value,
        purok: document.getElementById('add-purok').value,
        records: [] 
    };
    childrenData.unshift(newKid); 
    closeModal('addChildModal');
    renderMasterlist();
    alert("New child registered successfully!");
}

// 5. PROFILE & EDIT MODAL
function openProfile(id) {
    currentEditingId = id;
    const kid = childrenData.find(k => k.id === id);
    const age = calculateAgeInMonths(kid.birthdate);
    
    // Set text contents
    document.getElementById('prof-name').innerText = kid.name;
    document.getElementById('prof-subtitle').innerText = `📍 ${kid.purok} | Age: ${age} mos`;
    document.getElementById('view-name').innerText = kid.name;
    document.getElementById('view-bday').innerText = kid.birthdate;
    document.getElementById('view-parents').innerText = kid.parents;
    document.getElementById('view-purok').innerText = kid.purok;

    // Fill hidden edit form
    document.getElementById('edit-id').value = kid.id;
    document.getElementById('edit-name').value = kid.name;
    document.getElementById('edit-bday').value = kid.birthdate;
    document.getElementById('edit-parents').value = kid.parents;
    document.getElementById('edit-purok').value = kid.purok;

    toggleEditMode(false);
    setupAssessmentTab(kid, age);
    populateHistoryTab(kid);

    // Call Safe Tab Switcher
    switchProfileTab('info');
    document.getElementById('childProfileModal').style.display = 'flex';
}

function toggleEditMode(isEditing) {
    document.getElementById('info-view-mode').style.display = isEditing ? 'none' : 'block';
    document.getElementById('info-edit-mode').style.display = isEditing ? 'block' : 'none';
}

function saveChildEdits(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const kid = childrenData.find(k => k.id === id);
    
    kid.name = document.getElementById('edit-name').value;
    kid.birthdate = document.getElementById('edit-bday').value;
    kid.parents = document.getElementById('edit-parents').value;
    kid.purok = document.getElementById('edit-purok').value;
    
    document.getElementById('prof-name').innerText = kid.name;
    document.getElementById('view-name').innerText = kid.name;
    document.getElementById('view-bday').innerText = kid.birthdate;
    document.getElementById('view-parents').innerText = kid.parents;
    document.getElementById('view-purok').innerText = kid.purok;

    toggleEditMode(false); 
    renderMasterlist();
    alert("Child Information Updated!");
}

// 6. MONTHLY ASSESSMENT & CUSTOM VITAMINS
function setupAssessmentTab(kid, age) {
    const latestRecord = kid.records[kid.records.length - 1];
    const isCheckedThisMonth = latestRecord && latestRecord.month === currentMonthString;
    const banner = document.getElementById('assessment-status-banner');
    const formContainer = document.getElementById('assessment-form-container');

    if (isCheckedThisMonth) {
        banner.className = "status-banner success";
        banner.innerHTML = `✅ <b>Assessment Completed!</b><br>You have already recorded the data for ${currentMonthName}.`;
        
        let vitList = latestRecord.vitamins && latestRecord.vitamins.length > 0 
            ? latestRecord.vitamins.join(", ") : "None Recorded";

        formContainer.innerHTML = `
            <div class="info-box">
                <p><strong>Weight:</strong> ${latestRecord.weight} kg</p>
                <p><strong>Height:</strong> ${latestRecord.height} cm</p>
                <p><strong>Status:</strong> ${latestRecord.status}</p>
                <p><strong>Vitamins Given:</strong> ${vitList}</p>
            </div>
            <p style="font-size:12px; color:#666; text-align:center; margin-top:15px;">Next checkup is available next month.</p>
        `;
    } else {
        banner.className = "status-banner warning";
        banner.innerHTML = `⚠️ <b>Pending Checkup</b><br>Please enter the height, weight, and vitamin intake for ${currentMonthName}.`;
        
        formContainer.innerHTML = `
            <h3 style="margin-bottom: 15px;">New Checkup (<span id="current-month-label">${currentMonthName}</span>)</h3>
            <div class="form-grid">
                <div class="input-group">
                    <label>Weight (kg)</label>
                    <input type="number" step="0.01" id="assess-weight" placeholder="e.g. 10.5" oninput="autoComputeStatus()">
                </div>
                <div class="input-group">
                    <label>Height (cm)</label>
                    <input type="number" step="0.1" id="assess-height" placeholder="e.g. 75.0" oninput="autoComputeStatus()">
                </div>
            </div>
            <div class="info-box" style="margin-bottom: 15px; text-align:center;">
                <span class="info-label">Computed Nutritional Status</span>
                <span id="computed-status" class="info-value" style="font-size: 20px;">Enter Height & Weight</span>
            </div>
            <h4 style="margin-bottom: 10px;">Vitamins Checklist</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-end;">
                <div class="input-group" style="margin-bottom: 0; flex-grow: 1;">
                    <input type="text" id="custom-vit-input" placeholder="Add specific vitamin (e.g. Vitamin C Drops)">
                </div>
                <button type="button" class="view-btn" onclick="addCustomVitamin()">+ Add</button>
            </div>
            <div id="vitamins-checkboxes" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;"></div>
            <button class="add-btn" style="width:100%;" onclick="submitAssessment()">Save Monthly Assessment</button>
        `;

        const vits = getVitaminsByAge(age);
        const vitContainer = document.getElementById('vitamins-checkboxes');
        
        vitContainer.innerHTML = vits.map((v, i) => `
            <div class="vit-label-container">
                <label style="display:flex; align-items:center; gap:5px; margin:0; cursor:pointer;">
                    <input type="checkbox" value="${v}" class="vit-check" checked> ${v}
                </label>
            </div>
        `).join('');
    }
}

// Fixed function to remove added vitamins via Javascript DOM manipulation
function addCustomVitamin() {
    const input = document.getElementById('custom-vit-input');
    const val = input.value.trim();
    if(val === "") return;

    const vitContainer = document.getElementById('vitamins-checkboxes');
    const uniqueId = 'custom-vit-' + Date.now();
    
    const newDiv = document.createElement('div');
    newDiv.className = 'vit-label-container';
    newDiv.id = uniqueId;
    newDiv.innerHTML = `
        <label style="display:flex; align-items:center; gap:5px; margin:0; cursor:pointer;">
            <input type="checkbox" value="${val}" class="vit-check" checked> ${val}
        </label>
        <button type="button" class="remove-vit-btn" onclick="document.getElementById('${uniqueId}').remove()" title="Remove this vitamin">&times;</button>
    `;
    
    vitContainer.appendChild(newDiv);
    input.value = ""; 
}

function autoComputeStatus() {
    const w = parseFloat(document.getElementById('assess-weight').value);
    const h = parseFloat(document.getElementById('assess-height').value);
    const statusText = document.getElementById('computed-status');
    
    if (w && h) {
        const status = computeNutritionalStatus(w, h);
        statusText.innerText = status;
        if(status === "Normal") statusText.style.color = "#2e7d32";
        else if (status === "Obese") statusText.style.color = "#fbc02d";
        else statusText.style.color = "#d32f2f";
    } else {
        statusText.innerText = "Enter Height & Weight";
        statusText.style.color = "#333";
    }
}

function submitAssessment() {
    const w = parseFloat(document.getElementById('assess-weight').value);
    const h = parseFloat(document.getElementById('assess-height').value);
    if(!w || !h) return alert("Please input both weight and height.");

    const status = computeNutritionalStatus(w, h);
    const checkboxes = document.querySelectorAll('.vit-check:checked');
    let selectedVits = Array.from(checkboxes).map(cb => cb.value);

    const kid = childrenData.find(k => k.id === currentEditingId);
    kid.records.push({
        month: currentMonthString,
        weight: w,
        height: h,
        status: status,
        vitamins: selectedVits
    });

    renderMasterlist();
    closeModal('childProfileModal');
    alert("Monthly Assessment Saved!");
}

// 7. HISTORY TAB
function populateHistoryTab(kid) {
    const tbody = document.getElementById('history-table-body');
    if(kid.records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No history available.</td></tr>`;
        return;
    }
    const reversedRecords = [...kid.records].reverse();
    tbody.innerHTML = reversedRecords.map(rec => {
        let vitDisplay = rec.vitamins && rec.vitamins.length > 0 ? rec.vitamins.join(', ') : 'None';
        let statusColor = rec.status === "Normal" ? "#2e7d32" : (rec.status === "Obese" ? "#fbc02d" : "#d32f2f");
        return `
            <tr>
                <td><strong>${rec.month}</strong></td>
                <td>${rec.weight} kg</td>
                <td>${rec.height} cm</td>
                <td style="color:${statusColor}; font-weight:bold;">${rec.status}</td>
                <td style="font-size:12px;">${vitDisplay}</td>
            </tr>
        `;
    }).join('');
}

// 8. REPORTS GENERATION
function renderReports() {
    let total = childrenData.length;
    let normal = 0, mal = 0, obese = 0;
    let issuesListHTML = "";

    childrenData.forEach(kid => {
        const latest = kid.records[kid.records.length - 1];
        const age = calculateAgeInMonths(kid.birthdate);
        
        if (latest) {
            if (latest.status === "Normal") normal++;
            if (latest.status === "Underweight" || latest.status === "Stunted") mal++;
            if (latest.status === "Obese") obese++;

            if (latest.status !== "Normal") {
                issuesListHTML += `
                    <tr>
                        <td><strong>${kid.name}</strong></td>
                        <td>${age} mos</td>
                        <td>${kid.purok}</td>
                        <td style="color:${latest.status === 'Obese' ? '#fbc02d' : '#d32f2f'}; font-weight:bold;">${latest.status}</td>
                        <td>${latest.month}</td>
                    </tr>
                `;
            }
        }
    });

    document.getElementById('rep-total').innerText = total;
    document.getElementById('rep-normal').innerText = normal;
    document.getElementById('rep-mal').innerText = mal;
    document.getElementById('rep-obese').innerText = obese;
    document.getElementById('reports-table-body').innerHTML = issuesListHTML || `<tr><td colspan="5" style="text-align:center;">No health issues recorded.</td></tr>`;
}

// UTILITIES & BUG FIXES
function switchBNSView(view) {
    document.getElementById('masterlist-view').style.display = view === 'masterlist' ? 'block' : 'none';
    document.getElementById('reports-view').style.display = view === 'reports' ? 'block' : 'none';
    const menuItems = document.querySelectorAll('#sidebar-menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    menuItems[view === 'masterlist' ? 0 : 1].classList.add('active');
}

// **BUG FIX:** Removed the "event.currentTarget" error that was breaking subsequent clicks
function switchProfileTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // Safely apply the active class based on the tab name
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tab === 'info') tabButtons[0].classList.add('active');
    else if (tab === 'assessment') tabButtons[1].classList.add('active');
    else if (tab === 'history') tabButtons[2].classList.add('active');
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
    generateMockData();
    renderMasterlist();
});