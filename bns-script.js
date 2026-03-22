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
    if (weight < expectedW - 3) return "Severely Underweight (suw)";
    if (weight < expectedW - 1.5) return "Underweight (uw)";
    if (weight > expectedW + 3) return "Overweight (ow)";
    return "Normal (n)";
}

function computeHFA(height, ageMonths) {
    if (!height) return "Pending";
    let expectedH = ageMonths * 1.5 + 48;
    if (height < expectedH - 6) return "Severely Stunted (sst)";
    if (height < expectedH - 3) return "Stunted (st)";
    if (height > expectedH + 5) return "Tall (t)";
    return "Normal (n)";
}

function computeWFLH(weight, height) {
    if (!weight || !height) return "Pending";
    let hM = height / 100;
    let bmi = weight / (hM * hM);
    if (bmi < 12.0) return "Severely Wasted (sw)";
    if (bmi < 13.5) return "Wasted (w)";
    if (bmi > 18.5) return "Obese (ob)";
    if (bmi > 17.0) return "Overweight (ow)";
    return "Normal (n)";
}

function getVitaminsByAge(ageMonths) {
    if (ageMonths <= 6) return ["Vitamin A (100k IU)", "Newborn Screening"];
    if (ageMonths <= 23) return ["Vitamin A (200k IU)", "Iron Drops", "Deworming"];
    return ["Vitamin A (High Dose)", "Deworming", "Zinc Supplement"];
}

// MOCK DATA GENERATION
function generateMockData() {
    const firstNames = ["Juan", "Maria", "Jose", "Luz", "Pedro", "Ana"];
    const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo"];
    
    for(let i=1; i<=15; i++) {
        const bDate = new Date();
        bDate.setMonth(bDate.getMonth() - Math.floor(Math.random() * 58) - 1);
        const bdateStr = bDate.toISOString().split('T')[0];
        
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const checkedThisMonth = Math.random() > 0.4; 
        
        let historyRecords = [];
        for (let m = 5; m >= 1; m--) {
            let pDate = new Date();
            pDate.setMonth(pDate.getMonth() - m);
            let pMonth = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
            
            let w = (Math.random() * 10 + 5).toFixed(1);
            let h = (Math.random() * 40 + 50).toFixed(1);
            let age = calculateAgeInMonths(bdateStr);
            
            historyRecords.push({
                month: pMonth,
                weight: w,
                height: h,
                wfa: computeWFA(w, age),
                hfa: computeHFA(h, age),
                wflh: computeWFLH(w, h),
                vitamins: ["Vitamin A", "Iron Drops"]
            });
        }

        if(checkedThisMonth) {
            let w = (Math.random() * 10 + 5).toFixed(1);
            let h = (Math.random() * 40 + 50).toFixed(1);
            let age = calculateAgeInMonths(bdateStr);
            
            historyRecords.push({
                month: currentMonthString,
                weight: w,
                height: h,
                wfa: computeWFA(w, age),
                hfa: computeHFA(h, age),
                wflh: computeWFLH(w, h),
                vitamins: ["Vitamin A", "Zinc"]
            });
        }

        childrenData.push({
            id: `KID-${Math.floor(Math.random()*10000)}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            gender: gender,
            birthdate: bdateStr,
            parents: `Mr. & Mrs. ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            purok: puroks[Math.floor(Math.random() * puroks.length)],
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
            ? `<span class="badge complete"><i class="fas fa-check-circle"></i> Checked</span>` 
            : `<span class="badge pending"><i class="fas fa-times-circle"></i> Pending</span>`;

        let cWFA = latestRecord && latestRecord.wfa.includes('Normal') ? '#2e7d32' : '#d32f2f';
        let cHFA = latestRecord && latestRecord.hfa.includes('Normal') ? '#2e7d32' : '#d32f2f';
        let cWFLH = latestRecord && latestRecord.wflh.includes('Normal') ? '#2e7d32' : '#d32f2f';

        return `
            <tr>
                <td><strong>${kid.name}</strong><br><small>${kid.parents}</small></td>
                <td>${kid.gender}</td>
                <td>${age} mos</td>
                <td>${latestRecord ? latestRecord.weight + ' kg' : '--'}</td>
                <td>${latestRecord ? latestRecord.height + ' cm' : '--'}</td>
                <td><strong style="color:${cWFA}; font-size:12px;">${latestRecord ? latestRecord.wfa : '--'}</strong></td>
                <td><strong style="color:${cHFA}; font-size:12px;">${latestRecord ? latestRecord.hfa : '--'}</strong></td>
                <td><strong style="color:${cWFLH}; font-size:12px;">${latestRecord ? latestRecord.wflh : '--'}</strong></td>
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
        name: document.getElementById('add-name').value,
        gender: document.getElementById('add-gender').value,
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

    document.getElementById('edit-id').value = kid.id;
    document.getElementById('edit-name').value = kid.name;
    document.getElementById('edit-gender').value = kid.gender;
    document.getElementById('edit-bday').value = kid.birthdate;
    document.getElementById('edit-parents').value = kid.parents;
    document.getElementById('edit-purok').value = kid.purok;

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
    
    kid.name = document.getElementById('edit-name').value;
    kid.gender = document.getElementById('edit-gender').value;
    kid.birthdate = document.getElementById('edit-bday').value;
    kid.parents = document.getElementById('edit-parents').value;
    kid.purok = document.getElementById('edit-purok').value;
    
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
                <p><strong>Weight for Age (WFA):</strong> <span style="color:${latestRecord.wfa.includes('Normal')?'#2e7d32':'#d32f2f'}">${latestRecord.wfa}</span></p>
                <p><strong>Height for Age (HFA):</strong> <span style="color:${latestRecord.hfa.includes('Normal')?'#2e7d32':'#d32f2f'}">${latestRecord.hfa}</span></p>
                <p><strong>Weight for L/H (WFL/H):</strong> <span style="color:${latestRecord.wflh.includes('Normal')?'#2e7d32':'#d32f2f'}">${latestRecord.wflh}</span></p>
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
        let colWFA = rec.wfa.includes('Normal') ? '#2e7d32' : '#d32f2f';
        let colHFA = rec.hfa.includes('Normal') ? '#2e7d32' : '#d32f2f';
        let colWFLH = rec.wflh.includes('Normal') ? '#2e7d32' : '#d32f2f';
        
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

// REPORTS GENERATION
function renderReports() {
    const selectedMonth = document.getElementById('reportMonthFilter').value || currentMonthString;
    
    let total = childrenData.length;
    let normal = 0, mal = 0, obese = 0;
    let issuesListHTML = "";

    childrenData.forEach(kid => {
        const monthRecord = kid.records.find(r => r.month === selectedMonth);
        const age = calculateAgeInMonths(kid.birthdate);
        
        if (monthRecord) {
            if (monthRecord.wfa.includes("Normal") && monthRecord.hfa.includes("Normal") && monthRecord.wflh.includes("Normal")) {
                normal++;
            } else {
                if (monthRecord.wfa.includes("Underweight") || monthRecord.hfa.includes("Stunted") || monthRecord.wflh.includes("Wasted")) mal++;
                if (monthRecord.wflh.includes("Obese") || monthRecord.wfa.includes("Overweight")) obese++;
                
                let issues = [];
                if(!monthRecord.wfa.includes("Normal")) issues.push(`WFA: ${monthRecord.wfa}`);
                if(!monthRecord.hfa.includes("Normal")) issues.push(`HFA: ${monthRecord.hfa}`);
                if(!monthRecord.wflh.includes("Normal")) issues.push(`WFL/H: ${monthRecord.wflh}`);

                issuesListHTML += `
                    <tr>
                        <td><strong>${kid.name}</strong></td>
                        <td>${kid.gender}</td>
                        <td>${age} mos</td>
                        <td>${kid.purok}</td>
                        <td style="color:#d32f2f; font-size: 13px;">${issues.join('<br>')}</td>
                    </tr>
                `;
            }
        }
    });

    document.getElementById('rep-total').innerText = total;
    document.getElementById('rep-normal').innerText = normal;
    document.getElementById('rep-mal').innerText = mal;
    document.getElementById('rep-obese').innerText = obese;
    document.getElementById('reports-table-body').innerHTML = issuesListHTML || `<tr><td colspan="5" style="text-align:center;">No health issues recorded for this month.</td></tr>`;
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