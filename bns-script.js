// Initialization Constants
const currentBrgy = "Brgy. Caloocan";
const puroks = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"];
let childrenData = [];
let currentEditingId = null;

const today = new Date();
const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

// HELPERS: AGE AND NUTRITIONAL CALCULATION MOCKS
function calculateAgeInMonths(birthdateStr) {
    const birthDate = new Date(birthdateStr);
    const currentDate = new Date();
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += currentDate.getMonth();
    return months <= 0 ? 0 : months;
}

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

function getVitaminsByAge(ageMonths) {
    if (ageMonths <= 6) return ["Vitamin A (100k IU)", "Newborn Screening"];
    if (ageMonths <= 23) return ["Vitamin A (200k IU)", "Iron Drops", "Deworming"];
    return ["Vitamin A (High Dose)", "Deworming", "Zinc Supplement"];
}

// MOCK DATA GENERATION - Strict 15 Children Array matching the prompt's layout
function generateMockData() {
    const firstNames = ["James Andrei", "Rayvin", "Dylan Charles", "Ethan Jake", "Weldion", "Carlo", "Wilford", "Princess Ann", "Clyde Allen", "Clyde Yohann", "Andrei Shann", "Enzo Mateo", "Craige Anthony", "Liana", "Mia"];
    const lastNames = ["Gomez", "Castromero", "Macalalad", "Perez", "Dela Cuesta", "Castromero", "Dela Cuesta", "Castromero", "Natividad", "De Padua", "Baon", "Macalalad", "Sale", "Santos", "Reyes"];
    const parentNames = ["Bautista, Angelique", "Castromero, Richard", "Macalalad, Leahrose", "Perez, Jennelyn", "Dela Cuesta, Rowena", "Castromero, Carla", "Dela Cuesta, Rowena", "Castromero, Anselma", "Natividad, Rhegine", "De Padua, Joanna", "Baon, Mina", "Macalalad, Laarni", "Dacaymat, Josalyn", "Santos, Maria", "Reyes, Elena"];
    
    // Predetermined Specific cases. Lots of Normal, 1 of each special condition
    const conditions = ["N", "N", "OW", "N", "OB", "N", "N", "N", "N", "N", "ST", "N", "N", "UW", "MW"];

    for(let i=0; i<15; i++) {
        const bDate = new Date();
        let ageMonths = Math.floor(Math.random() * 40) + 12; 
        bDate.setMonth(bDate.getMonth() - ageMonths);
        const bdateStr = bDate.toISOString().split('T')[0];
        
        const gender = (i === 7 || i >= 13) ? "Female" : "Male";
        
        let expectedW = ageMonths * 0.2 + 3.5; 
        let expectedH = ageMonths * 1.5 + 48;
        
        let w = expectedW;
        let h = expectedH;

        // Force weights/heights to fit the predetermined target condition
        if (conditions[i] === "UW") { w = expectedW - 2.0; }
        else if (conditions[i] === "OW") { w = expectedW + 3.5; }
        else if (conditions[i] === "OB") { w = expectedW + 5.5; }
        else if (conditions[i] === "ST") { h = expectedH - 4.5; }
        else if (conditions[i] === "MW") { w = expectedW - 2.5; h = expectedH + 2.0; }

        let historyRecords = [];
        
        // Make the last 3 children "Pending" for the current month
        let isPendingThisMonth = i >= 12; // Children 12, 13, and 14 will NOT have a record for current month

        if (!isPendingThisMonth) {
            historyRecords.push({
                month: currentMonthString,
                dateMeasured: currentMonthString + "-15",
                weight: w.toFixed(1),
                height: h.toFixed(1),
                wfa: computeWFA(w, ageMonths),
                hfa: computeHFA(h, ageMonths),
                wflh: computeWFLH(w, h),
                vitamins: ["Vitamin A"]
            });
        }

        childrenData.push({
            id: `KID-${Math.floor(Math.random()*10000)}`,
            name: `${lastNames[i]}, ${firstNames[i]}`.toUpperCase(),
            gender: gender,
            birthdate: bdateStr,
            parents: parentNames[i].toUpperCase(),
            purok: "PUROK " + (Math.floor(i/3) + 1),
            records: historyRecords
        });
    }
}

// RENDER MASTERLIST
function renderMasterlist() {
    const searchStr = document.getElementById('searchChild').value.toLowerCase();
    const filterPurok = document.getElementById('filterPurok').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const tableBody = document.getElementById('bns-table-body');
    
    let filtered = childrenData;

    if (searchStr) filtered = filtered.filter(k => k.name.toLowerCase().includes(searchStr));
    if (filterPurok !== 'all') filtered = filtered.filter(k => k.purok === filterPurok.toUpperCase());
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
            ? `<span class="badge complete"><i class="fas fa-check-circle"></i> Checked</span>` 
            : `<span class="badge pending"><i class="fas fa-times-circle"></i> Pending</span>`;

        return `
            <tr>
                <td><strong>${kid.name}</strong></td>
                <td>${kid.parents}</td>
                <td>${kid.gender}</td>
                <td>${age}</td>
                <td>${kid.purok}</td>
                <td>${checkupBadge}</td>
                <td><button class="view-btn" onclick="openProfile('${kid.id}')">Manage</button></td>
            </tr>
        `;
    }).join('');
    
    renderReports();
}

// ADD NEW CHILD
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
        name: document.getElementById('add-name').value.toUpperCase(),
        gender: document.getElementById('add-gender').value,
        birthdate: document.getElementById('add-bday').value,
        parents: document.getElementById('add-parents').value.toUpperCase(),
        purok: document.getElementById('add-purok').value.toUpperCase(),
        records: [] 
    };
    childrenData.unshift(newKid); 
    closeModal('addChildModal');
    renderMasterlist();
    alert("New child registered successfully!");
}

// PROFILE & EDIT MODAL
function openProfile(id) {
    currentEditingId = id;
    const kid = childrenData.find(k => k.id === id);
    const age = calculateAgeInMonths(kid.birthdate);
    
    document.getElementById('prof-name').innerText = kid.name;
    document.getElementById('prof-subtitle').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${kid.purok} | Age: ${age} mos | ${kid.gender}`;
    
    document.getElementById('view-name').innerText = kid.name;
    document.getElementById('view-gender').innerText = kid.gender;
    document.getElementById('view-bday').innerText = kid.birthdate;
    document.getElementById('view-parents').innerText = kid.parents;
    document.getElementById('view-purok').innerText = kid.purok;

    // Capitalize inputs logic for editing
    let nameParts = kid.name.split(', ');
    document.getElementById('edit-name').value = nameParts.length > 1 ? `${nameParts[1]} ${nameParts[0]}` : kid.name; 
    document.getElementById('edit-gender').value = kid.gender;
    document.getElementById('edit-bday').value = kid.birthdate;
    document.getElementById('edit-parents').value = kid.parents;
    document.getElementById('edit-purok').value = kid.purok.charAt(0).toUpperCase() + kid.purok.slice(1).toLowerCase();

    toggleEditMode(false);
    setupAssessmentTab(kid, age);
    populateHistoryTab(kid);

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
    
    let rawName = document.getElementById('edit-name').value.toUpperCase();
    if(!rawName.includes(',')) {
        let nParts = rawName.split(' ');
        if(nParts.length > 1) rawName = `${nParts[nParts.length-1]}, ${nParts.slice(0, nParts.length-1).join(' ')}`;
    }

    kid.name = rawName;
    kid.gender = document.getElementById('edit-gender').value;
    kid.birthdate = document.getElementById('edit-bday').value;
    kid.parents = document.getElementById('edit-parents').value.toUpperCase();
    kid.purok = document.getElementById('edit-purok').value.toUpperCase();
    
    openProfile(kid.id); 
    renderMasterlist();
    alert("Child Information Updated!");
}

// MONTHLY ASSESSMENT
function setupAssessmentTab(kid, age) {
    const latestRecord = kid.records[kid.records.length - 1];
    const isCheckedThisMonth = latestRecord && latestRecord.month === currentMonthString;
    const banner = document.getElementById('assessment-status-banner');
    const formContainer = document.getElementById('assessment-form-container');

    if (isCheckedThisMonth) {
        banner.className = "status-banner success";
        banner.innerHTML = `<i class="fas fa-check-circle"></i> <b>Assessment Completed!</b><br>You have already recorded the data for ${currentMonthName}.`;
        
        let vitList = latestRecord.vitamins && latestRecord.vitamins.length > 0 ? latestRecord.vitamins.join(", ") : "None Recorded";

        formContainer.innerHTML = `
            <div class="info-box">
                <p><strong>Weight:</strong> ${latestRecord.weight} kg | <strong>Height:</strong> ${latestRecord.height} cm</p>
                <hr style="border:0; border-top:1px solid #ddd; margin:10px 0;">
                <p><strong>Weight for Age (WFA):</strong> <span style="color:${latestRecord.wfa==='N'?'#2e7d32':'#d32f2f'}">${latestRecord.wfa}</span></p>
                <p><strong>Height for Age (HFA):</strong> <span style="color:${latestRecord.hfa==='N'?'#2e7d32':'#d32f2f'}">${latestRecord.hfa}</span></p>
                <p><strong>Weight for L/H (WFL/H):</strong> <span style="color:${latestRecord.wflh==='N'?'#2e7d32':'#d32f2f'}">${latestRecord.wflh}</span></p>
                <hr style="border:0; border-top:1px solid #ddd; margin:10px 0;">
                <p><strong>Vitamins Given:</strong> ${vitList}</p>
            </div>
            <p style="font-size:12px; color:#666; text-align:center; margin-top:15px;">Next checkup is available next month.</p>
        `;
    } else {
        banner.className = "status-banner warning";
        banner.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <b>Pending Checkup</b><br>Please enter the height, weight, and vitamin intake for ${currentMonthName}.`;
        
        formContainer.innerHTML = `
            <h3 style="margin-bottom: 15px;">New Checkup (<span id="current-month-label">${currentMonthName}</span>)</h3>
            <div class="form-grid">
                <div class="input-group">
                    <label>Weight (kg)</label>
                    <input type="number" step="0.01" id="assess-weight" placeholder="e.g. 10.5" oninput="autoComputeStatus(${age})">
                </div>
                <div class="input-group">
                    <label>Height (cm)</label>
                    <input type="number" step="0.1" id="assess-height" placeholder="e.g. 75.0" oninput="autoComputeStatus(${age})">
                </div>
            </div>
            <div class="info-box" style="margin-bottom: 15px; text-align:center;">
                <span class="info-label">Computed Nutritional Status</span>
                <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                    <div><small>WFA</small><br><strong id="comp-wfa">--</strong></div>
                    <div><small>HFA</small><br><strong id="comp-hfa">--</strong></div>
                    <div><small>WFL/H</small><br><strong id="comp-wflh">--</strong></div>
                </div>
            </div>
            <h4 style="margin-bottom: 10px;">Vitamins Checklist</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-end;">
                <div class="input-group" style="margin-bottom: 0; flex-grow: 1;">
                    <input type="text" id="custom-vit-input" placeholder="Add specific vitamin (e.g. Vitamin C Drops)">
                </div>
                <button type="button" class="view-btn" onclick="addCustomVitamin()">+ Add</button>
            </div>
            <div id="vitamins-checkboxes" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;"></div>
            <button class="add-btn" style="width:100%;" onclick="submitAssessment(${age})">Save Monthly Assessment</button>
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

function autoComputeStatus(ageMonths) {
    const w = parseFloat(document.getElementById('assess-weight').value);
    const h = parseFloat(document.getElementById('assess-height').value);
    
    if (w) document.getElementById('comp-wfa').innerText = computeWFA(w, ageMonths);
    if (h) document.getElementById('comp-hfa').innerText = computeHFA(h, ageMonths);
    if (w && h) document.getElementById('comp-wflh').innerText = computeWFLH(w, h);
}

function submitAssessment(ageMonths) {
    const w = parseFloat(document.getElementById('assess-weight').value);
    const h = parseFloat(document.getElementById('assess-height').value);
    if(!w || !h) return alert("Please input both weight and height.");

    const checkboxes = document.querySelectorAll('.vit-check:checked');
    let selectedVits = Array.from(checkboxes).map(cb => cb.value);

    const kid = childrenData.find(k => k.id === currentEditingId);
    kid.records.push({
        month: currentMonthString,
        dateMeasured: new Date().toISOString().split('T')[0],
        weight: w,
        height: h,
        wfa: computeWFA(w, ageMonths),
        hfa: computeHFA(h, ageMonths),
        wflh: computeWFLH(w, h),
        vitamins: selectedVits
    });

    renderMasterlist();
    closeModal('childProfileModal');
    alert("Monthly Assessment Saved!");
}

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
        <button type="button" class="remove-vit-btn" onclick="document.getElementById('${uniqueId}').remove()">&times;</button>
    `;
    vitContainer.appendChild(newDiv);
    input.value = ""; 
}

// HISTORY TAB 
function populateHistoryTab(kid) {
    const tbody = document.getElementById('history-table-body');
    if(kid.records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No history available.</td></tr>`;
        return;
    }
    
    const recordsToShow = [...kid.records].reverse().slice(0, 5);
    
    tbody.innerHTML = recordsToShow.map(rec => {
        let colWFA = rec.wfa === 'N' ? '#2e7d32' : '#d32f2f';
        let colHFA = rec.hfa === 'N' ? '#2e7d32' : '#d32f2f';
        let colWFLH = rec.wflh === 'N' ? '#2e7d32' : '#d32f2f';
        
        return `
            <tr>
                <td><strong>${rec.month}</strong></td>
                <td>${rec.weight}kg / ${rec.height}cm</td>
                <td style="color:${colWFA}; font-weight:bold;">${rec.wfa}</td>
                <td style="color:${colHFA}; font-weight:bold;">${rec.hfa}</td>
                <td style="color:${colWFLH}; font-weight:bold;">${rec.wflh}</td>
            </tr>
        `;
    }).join('');
}

// REPORTS GENERATION (Clean Report logic)
function getStatusBadge(status) {
    if (status === "N") return `<span class="badge-status badge-normal">N</span>`;
    if (["OW", "OB", "T"].includes(status)) return `<span class="badge-status badge-warning">${status}</span>`;
    if (["UW", "SUW", "ST", "SST", "MW", "SW"].includes(status)) return `<span class="badge-status badge-danger">${status}</span>`;
    return `<span class="badge-status badge-pending">Pending</span>`;
}

function renderReports() {
    const selectedMonth = document.getElementById('reportMonthFilter').value || currentMonthString;
    
    let total = childrenData.length;
    let normal = 0, mal = 0, obese = 0;
    let reportListHTML = "";

    childrenData.forEach(kid => {
        const monthRecord = kid.records.find(r => r.month === selectedMonth);
        const age = calculateAgeInMonths(kid.birthdate);
        
        let w = monthRecord ? monthRecord.weight : "--";
        let h = monthRecord ? monthRecord.height : "--";
        let wfa = monthRecord ? monthRecord.wfa : "Pending";
        let hfa = monthRecord ? monthRecord.hfa : "Pending";
        let wflh = monthRecord ? monthRecord.wflh : "Pending";
        let dateMeasured = monthRecord && monthRecord.dateMeasured ? monthRecord.dateMeasured : "--";

        if (monthRecord) {
            if (wfa === "N" && hfa === "N" && wflh === "N") {
                normal++;
            } else {
                if (["UW", "SUW"].includes(wfa) || ["ST", "SST"].includes(hfa) || ["MW", "SW"].includes(wflh)) mal++;
                if (["OB", "OW"].includes(wflh) || wfa === "OW") obese++;
            }
        }

        const formatBtnDate = (dStr) => {
            if(!dStr || dStr === "--") return "--";
            const date = new Date(dStr);
            const m = date.toLocaleString('default', { month: 'short' });
            return `${m}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
        };

        const dobFmt = formatBtnDate(kid.birthdate);
        const domFmt = formatBtnDate(dateMeasured);
        const sexFmt = kid.gender === "Male" ? "M" : "F";

        reportListHTML += `
            <tr>
                <td>${kid.purok}</td>
                <td>${kid.parents}</td>
                <td><strong>${kid.name}</strong></td>
                <td>NO</td>
                <td>${sexFmt}</td>
                <td>${dobFmt}</td>
                <td>${domFmt}</td>
                <td><strong>${w}</strong></td>
                <td><strong>${h}</strong></td>
                <td>${age}</td>
                <td>${getStatusBadge(wfa)}</td>
                <td>${getStatusBadge(hfa)}</td>
                <td>${getStatusBadge(wflh)}</td>
            </tr>
        `;
    });

    document.getElementById('rep-total').innerText = total;
    document.getElementById('rep-normal').innerText = normal;
    document.getElementById('rep-mal').innerText = mal;
    document.getElementById('rep-obese').innerText = obese;
    document.getElementById('reports-table-body').innerHTML = reportListHTML || `<tr><td colspan="13" style="text-align:center;">No records for this month.</td></tr>`;
}

function submitReportToAdmin() {
    const selectedMonth = document.getElementById('reportMonthFilter').value || currentMonthString;
    alert(`Report for ${selectedMonth} has been submitted to the Admin successfully!`);
}

function switchBNSView(view) {
    document.getElementById('masterlist-view').style.display = view === 'masterlist' ? 'block' : 'none';
    document.getElementById('reports-view').style.display = view === 'reports' ? 'block' : 'none';
    const menuItems = document.querySelectorAll('#sidebar-menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    menuItems[view === 'masterlist' ? 0 : 1].classList.add('active');
}

function switchProfileTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tab === 'info') tabButtons[0].classList.add('active');
    else if (tab === 'assessment') tabButtons[1].classList.add('active');
    else if (tab === 'history') tabButtons[2].classList.add('active');
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('reportMonthFilter')) {
        document.getElementById('reportMonthFilter').value = currentMonthString;
    }
    generateMockData();
    renderMasterlist();
});