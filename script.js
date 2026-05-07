// Balayan, Batangas Configuration
const balayanCenter = [13.938, 120.732];
const balayanBrgys = [
  "Caloocan", "Lanatan", "San Roque", "Ermita", "Gumamela", 
  "Navotas", "Palikpikan", "Sampaga", "Santol", "San Pioquinto", 
  "Dalig", "Langgangan", "Canda", "Pooc", "Tanggoy"
];
const kidsPerBrgy = 40;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Date Setup for mock data
const today = new Date();
const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// FILIPINO NAME GENERATOR
const firstNames = ["Juan", "Maria", "Jose", "Luz", "Pedro", "Ana", "Miguel", "Rosa", "Carlos", "Teresa", "Luis", "Carmen", "Mateo", "Sofia", "Diego", "Elena"];
const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Aquino", "Ramos", "Villanueva", "Mercado"];

function getRandomName() {
  return `${lastNames[Math.floor(Math.random() * lastNames.length)]}, ${firstNames[Math.floor(Math.random() * firstNames.length)]}`.toUpperCase();
}

// FIXED NUTRITION CALCULATION FORMULAS
function computeWFA(weight, ageMonths) {
  if (!weight) return "Pending";
  let expectedH = 60 + ageMonths * 0.8;
  let expectedW = 15.5 * Math.pow(expectedH / 100, 2);
  if (weight < expectedW - 3) return "SUW";
  if (weight < expectedW - 1.5) return "UW";
  if (weight > expectedW + 3) return "OW";
  return "N";
}

function computeHFA(height, ageMonths) {
  if (!height) return "Pending";
  let expectedH = 60 + ageMonths * 0.8;
  if (height < expectedH - 6) return "SST";
  if (height < expectedH - 3) return "ST";
  if (height > expectedH + 5) return "T";
  return "N";
}

function computeWFLH(weight, height) {
  if (!weight || !height) return "Pending";
  let hM = height / 100;
  let bmi = weight / (hM * hM);
  if (bmi < 12.0) return "SW";
  if (bmi < 13.5) return "MW";
  if (bmi > 18.5) return "OB";
  if (bmi > 17.0) return "OW";
  return "N";
}

function getStatusBadge(status) {
  if (status === "N") return `<span class="badge-status badge-normal">N</span>`;
  if (["OW", "OB", "T"].includes(status)) return `<span class="badge-status badge-warning">${status}</span>`;
  if (["UW", "SUW", "ST", "SST", "MW", "SW"].includes(status)) return `<span class="badge-status badge-danger">${status}</span>`;
  return `<span class="badge-status badge-pending">Pending</span>`;
}

function getFullStatusName(code) {
  const map = { N: "Normal", UW: "Underweight", SUW: "Severely Underweight", OW: "Overweight", OB: "Obese", ST: "Stunted", SST: "Severely Stunted", T: "Tall", MW: "Moderately Wasted", SW: "Severely Wasted" };
  return map[code] || "Pending";
}

function ordinalSuffix(i) {
    if(!i || i <= 0) return "1st";
    let j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
}

// GENERATE CONTROLLED MASTER DATA
const masterData = {};
const brgyCoords = {};

balayanBrgys.forEach((brgy, index) => {
  masterData[brgy] = [];
  brgyCoords[brgy] = [
    balayanCenter[0] + (Math.random() * 0.08 - 0.04),
    balayanCenter[1] + (Math.random() * 0.08 - 0.04)
  ];

  let conditions = [];
  if (index === 0) {
    for (let i = 0; i < 28; i++) conditions.push("N");
    for (let i = 0; i < 3; i++) conditions.push("UW", "ST", "OW", "OB");
  } else if (index === 1) {
    for (let i = 0; i < 32; i++) conditions.push("N");
    for (let i = 0; i < 2; i++) conditions.push("UW", "ST", "OW", "OB");
  } else {
    for (let i = 0; i < 35; i++) conditions.push("N");
    conditions.push("UW", "ST", "W", "OW", "OB");
  }
  conditions.sort(() => Math.random() - 0.5);

  for (let k = 1; k <= kidsPerBrgy; k++) {
    let age = Math.floor(Math.random() * 59) + 1;
    let bDate = new Date();
    bDate.setMonth(bDate.getMonth() - age);
    let birthdate = bDate.toISOString().split("T")[0];

    let dDate = new Date();
    dDate.setDate(Math.floor(Math.random() * 28) + 1);
    let dateMeasured = dDate.toISOString().split("T")[0];

    let expectedH = 60 + age * 0.8;
    let expectedW = 15.5 * Math.pow(expectedH / 100, 2);

    let targetCond = conditions[k - 1] || "N";
    let weight = expectedW;
    let height = expectedH;

    if (targetCond === "N") {
      weight += Math.random() * 1.0 - 0.5;
      height += Math.random() * 2.0 - 1.0;
    } else if (targetCond === "UW") {
      weight -= 2.0;
    } else if (targetCond === "ST") {
      height -= 4.0;
      weight = 15.5 * Math.pow(height / 100, 2);
    } else if (targetCond === "W") {
      weight -= 2.5;
    } else if (targetCond === "OW") {
      weight += 3.5;
    } else if (targetCond === "OB") {
      weight += 5.5;
    }

    weight = weight.toFixed(1);
    height = height.toFixed(1);

    let wfa = computeWFA(weight, age);
    let hfa = computeHFA(height, age);
    let wflh = computeWFLH(weight, height);

    let overall = "Normal";
    if (["UW", "SUW"].includes(wfa) || ["ST", "SST"].includes(hfa) || ["MW", "SW"].includes(wflh)) overall = "Malnourished";
    if (["OB", "OW"].includes(wflh) || wfa === "OW") overall = "Obese";

    // GENERATE MOCK VITAMIN DATA FOR ADMIN VIEW (simulating BNS submission)
    let vitRecords = [];
    if (Math.random() > 0.7) { 
        // 30% chance a kid received something this month to show data in report
        if (age >= 6) vitRecords.push({ month: currentMonthString, date: currentMonthString + "-05", type: "Vitamin A", dose: Math.max(1, Math.floor(age/6)) });
        if (age >= 12 && Math.random() > 0.5) vitRecords.push({ month: currentMonthString, date: currentMonthString + "-05", type: "Deworming", dose: Math.max(1, Math.floor(age/6) - 1) });
    }

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
      vitaminRecords: vitRecords
    });
  }
});

// GLOBAL FILTER ENGINE
function filterDataList(list, ageRange, status) {
  let filtered = list;
  if (ageRange && ageRange !== "all") {
    if (ageRange === "0-11") filtered = filtered.filter((k) => k.age <= 11);
    else if (ageRange === "12-23") filtered = filtered.filter((k) => k.age >= 12 && k.age <= 23);
    else if (ageRange === "24-59") filtered = filtered.filter((k) => k.age >= 24);
  }
  if (status && status !== "all") filtered = filtered.filter((k) => k.overallStatus === status);
  return filtered;
}

// VIEW SWITCHING
function switchView(viewName) {
  document.querySelectorAll(".view").forEach((v) => (v.style.display = "none"));
  if (document.getElementById(viewName + "-view")) {
    document.getElementById(viewName + "-view").style.display = "block";
  }

  const menuItems = document.querySelectorAll("#sidebar-menu li");
  menuItems.forEach((item) => item.classList.remove("active"));

  const mainContent = document.querySelector(".main-content");
  if (viewName === "map") {
    mainContent.style.padding = "0";
    mainContent.style.overflow = "hidden";
  } else {
    mainContent.style.padding = "";
    mainContent.style.overflow = "";
  }

  if (viewName === "trends") {
    menuItems[0].classList.add("active");
    updateTrends();
  }
  if (viewName === "records") {
    menuItems[1].classList.add("active");
    updateRecords();
  }
  if (viewName === "reports") {
    menuItems[2].classList.add("active");
    updateReportsView();
  }
  if (viewName === "vit-reports") {
    menuItems[3].classList.add("active");
    renderAdminVitaminReport();
  }
  if (viewName === "map") {
    menuItems[4].classList.add("active");
    if (fullMap) {
      setTimeout(() => { fullMap.invalidateSize(); }, 200);
    }
  }
}

function initFilters() {
  const selects = [
    document.getElementById("trendBrgy"),
    document.getElementById("filterBrgy"),
    document.getElementById("reportBrgyFilter"),
    document.getElementById("adminVitReportBrgyFilter")
  ];
  
  let options = '<option value="all">All Barangays</option>';
  balayanBrgys.forEach((b) => (options += `<option value="${b}">Brgy. ${b}</option>`));
  
  selects.forEach((select) => {
    if (select) select.innerHTML = options;
  });
}

// MAP LOGIC
let fullMap;
function initFullMap() {
  const mapEl = document.getElementById("full-city-map");
  if (!mapEl) return;

  fullMap = L.map("full-city-map").setView(balayanCenter, 13);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "&copy; OpenStreetMap" }).addTo(fullMap);

  balayanBrgys.forEach((brgy) => {
    const kids = masterData[brgy];
    const normal = kids.filter((k) => k.overallStatus === "Normal").length;
    const mal = kids.filter((k) => k.overallStatus === "Malnourished").length;
    const obese = kids.filter((k) => k.overallStatus === "Obese").length;

    const totalKids = kids.length;
    const badCases = mal + obese;
    const caseRatio = badCases / totalKids;

    let markerColor = "#2e7d32";
    if (caseRatio >= 0.25) markerColor = "#d32f2f";
    else if (caseRatio >= 0.15) markerColor = "#fbc02d";

    L.circle(brgyCoords[brgy], { color: markerColor, fillColor: markerColor, fillOpacity: 0.5, radius: 500 }).addTo(fullMap);
    const marker = L.marker(brgyCoords[brgy]).addTo(fullMap);

    marker.bindTooltip(`Brgy. ${brgy}`, { permanent: true, direction: "bottom", className: "brgy-map-label", offset: [0, 5] }).openTooltip();
    marker.on("click", () => { openInfoPanel(brgy, normal, mal, obese, badCases, markerColor, totalKids); });
  });
}

function openInfoPanel(brgy, normal, mal, obese, badCases, colorCode, totalKids) {
  const panel = document.getElementById("brgy-info-panel");
  const content = document.getElementById("panel-content");

  let aiAnalysis = ""; let aiAction = "";
  const issueRate = ((badCases / totalKids) * 100).toFixed(1);

  if (badCases === 0) {
    aiAnalysis = `Data indicates an exceptional health profile for Brgy. ${brgy}, with 100% of children falling within normal nutritional parameters.`;
    aiAction = "Continue sustaining current BNS monitoring and standard vitamin distributions.";
  } else if (colorCode === "#d32f2f") {
    aiAnalysis = `Critical alert: Statistical analysis detects a significant nutritional deficit in Brgy. ${brgy}. The community currently has a concerning ${issueRate}% issue rate.`;
    aiAction = `Immediate Operation Timbang Plus (OPT+) reassessment is strongly advised. Prioritize the ${mal} malnourished children for local supplementary feeding.`;
  } else if (colorCode === "#fbc02d") {
    aiAnalysis = `Elevated health risks detected in Brgy. ${brgy}. The dataset shows ${badCases} children falling outside of normal parameters.`;
    aiAction = mal > obese ? `Schedule targeted nutritional counseling focusing on the ${mal} cases of malnutrition.` : `Initiate awareness seminars focusing on balanced diets to address the ${obese} cases of obesity.`;
  } else {
    aiAnalysis = `Brgy. ${brgy} maintains a stable health baseline. The vast majority of children (${normal}) are healthy.`;
    aiAction = "Maintain standard tracking protocols and routine monthly checkup follow-ups.";
  }

  content.innerHTML = `
        <h2 style="color: #1b5e20; margin-bottom: 5px;">Brgy. ${brgy}</h2>
        <p style="color: #666; font-size: 13px; margin-bottom: 20px;"><i class="fas fa-map-marker-alt"></i> Balayan, Batangas</p>
        <div class="total-highlight"><h3>${totalKids}</h3><span>Total Registered Children</span></div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; font-size: 14px; color: #333;">Health Status Breakdown</h3>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#2e7d32"></i> Normal:</span> <strong style="color: #2e7d32">${normal}</strong></div>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#d32f2f"></i> Malnourished:</span> <strong style="color: #d32f2f">${mal}</strong></div>
            <div class="stat-row"><span><i class="fas fa-circle" style="color:#fbc02d"></i> Obese:</span> <strong style="color: #fbc02d">${obese}</strong></div>
        </div>
        <div class="ai-suggestion-box">
            <div class="ai-header"><img src="Gemini.png" alt="Gemini Logo" class="gemini-logo"> AI Insight & Recommendation</div>
            <div id="ai-typing-content" class="ai-content typing-effect">Analyzing barangay datasets</div>
        </div>
    `;
  panel.classList.add("open");
  setTimeout(() => {
    const aiBox = document.getElementById("ai-typing-content");
    if (aiBox) {
      aiBox.classList.remove("typing-effect");
      aiBox.innerHTML = `<strong>Analysis:</strong> ${aiAnalysis}<br><br><strong>Action:</strong> ${aiAction}`;
    }
  }, 1500);
}

function closeInfoPanel() {
  if (document.getElementById("brgy-info-panel")) document.getElementById("brgy-info-panel").classList.remove("open");
}

// DASHBOARD CHARTS & TRENDS
function generateChartData(targetValue) {
  if (targetValue === 0) return months.map(() => 0);
  const data = [];
  let current = Math.max(1, Math.floor(targetValue * 0.4));
  for (let i = 0; i < 11; i++) {
    data.push(current);
    current += Math.floor(Math.random() * 5 - 1);
    if (current < 0) current = 0;
  }
  data.push(targetValue);
  return data;
}

let healthChart; let comparisonChart;

function updateTrends() {
  if (!document.getElementById("trendBrgy")) return;

  const brgy = document.getElementById("trendBrgy").value;
  const ageRange = document.getElementById("trendAge").value;
  const selectedMetric = document.getElementById("trendStatus").value;

  let baseKids = brgy === "all" ? Object.values(masterData).flat() : masterData[brgy];
  let filteredKids = baseKids;

  if (ageRange !== "all") {
    if (ageRange === "0-11") filteredKids = filteredKids.filter((k) => k.age <= 11);
    else if (ageRange === "12-23") filteredKids = filteredKids.filter((k) => k.age >= 12 && k.age <= 23);
    else if (ageRange === "24-59") filteredKids = filteredKids.filter((k) => k.age >= 24);
  }

  let countNormal = 0, countUnder = 0, countOver = 0;
  filteredKids.forEach((k) => {
    let val = selectedMetric === "WFLH" ? k.wflh : selectedMetric === "HFA" ? k.hfa : k.wfa;
    if (val === "N") countNormal++;
    else if (["UW", "SUW", "ST", "SST", "MW", "SW"].includes(val)) countUnder++;
    else if (["OW", "OB", "T"].includes(val)) countOver++;
  });

  document.getElementById("statNormal").innerText = countNormal;
  document.getElementById("statMal").innerText = countUnder;
  document.getElementById("statObese").innerText = countOver;

  const ctxLine = document.getElementById("healthTrendChart").getContext("2d");
  if (healthChart) healthChart.destroy();

  const datasets = [];
  const addDataset = (label, color, count) => {
    datasets.push({ label: label, data: generateChartData(count), borderColor: color, backgroundColor: color + "1A", fill: true, tension: 0.4 });
  };

  if (selectedMetric === "WFLH") {
    addDataset("Normal (N)", "#2e7d32", filteredKids.filter((k) => k.wflh === "N").length);
    addDataset("Overweight (OW)", "#fbc02d", filteredKids.filter((k) => k.wflh === "OW").length);
    addDataset("Obese (OB)", "#e65100", filteredKids.filter((k) => k.wflh === "OB").length);
    addDataset("Mod. Wasted (MW)", "#f44336", filteredKids.filter((k) => k.wflh === "MW").length);
    addDataset("Sev. Wasted (SW)", "#b71c1c", filteredKids.filter((k) => k.wflh === "SW").length);
  } else if (selectedMetric === "HFA") {
    addDataset("Normal (N)", "#2e7d32", filteredKids.filter((k) => k.hfa === "N").length);
    addDataset("Tall (T)", "#1976d2", filteredKids.filter((k) => k.hfa === "T").length);
    addDataset("Stunted (ST)", "#f44336", filteredKids.filter((k) => k.hfa === "ST").length);
    addDataset("Sev. Stunted (SST)", "#b71c1c", filteredKids.filter((k) => k.hfa === "SST").length);
  } else if (selectedMetric === "WFA") {
    addDataset("Normal (N)", "#2e7d32", filteredKids.filter((k) => k.wfa === "N").length);
    addDataset("Overweight (OW)", "#fbc02d", filteredKids.filter((k) => k.wfa === "OW").length);
    addDataset("Underweight (UW)", "#f44336", filteredKids.filter((k) => k.wfa === "UW").length);
    addDataset("Sev. Underweight (SUW)", "#b71c1c", filteredKids.filter((k) => k.wfa === "SUW").length);
  }

  healthChart = new Chart(ctxLine, { type: "line", data: { labels: months, datasets: datasets }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 12 } } } } });

  const ctxBar = document.getElementById("brgyComparisonChart").getContext("2d");
  if (comparisonChart) comparisonChart.destroy();

  const barData = []; const barColors = [];
  balayanBrgys.forEach((b) => {
    let list = masterData[b];
    if (ageRange !== "all") {
      if (ageRange === "0-11") list = list.filter((k) => k.age <= 11);
      else if (ageRange === "12-23") list = list.filter((k) => k.age >= 12 && k.age <= 23);
      else if (ageRange === "24-59") list = list.filter((k) => k.age >= 24);
    }
    let issuesCount = 0;
    list.forEach((k) => {
      let val = selectedMetric === "WFLH" ? k.wflh : selectedMetric === "HFA" ? k.hfa : k.wfa;
      if (val !== "N") issuesCount++;
    });

    let baseColor = "#f57c00";
    if (brgy !== "all" && brgy !== b) baseColor += "40";
    barData.push(issuesCount);
    barColors.push(baseColor);
  });

  comparisonChart = new Chart(ctxBar, { type: "bar", data: { labels: balayanBrgys, datasets: [{ label: `Total Issues (${selectedMetric})`, data: barData, backgroundColor: barColors, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { size: 10 } } } }, plugins: { legend: { display: false } } } });
}

// MASTERLIST LOGIC
function updateRecords() {
  if (!document.getElementById("filterBrgy")) return;

  const brgy = document.getElementById("filterBrgy").value;
  const ageRange = document.getElementById("filterAge").value;
  const status = document.getElementById("filterStatus").value;

  let baseList = brgy === "all" ? Object.values(masterData).flat() : masterData[brgy];
  let filteredList = filterDataList(baseList, ageRange, status);

  if (document.getElementById("statTotalRecords")) document.getElementById("statTotalRecords").innerText = filteredList.length;

  const formatBtnDate = (dStr) => {
    if (!dStr || dStr === "--") return "--";
    const date = new Date(dStr);
    const m = date.toLocaleString('default', { month: 'short' });
    return `${m}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
  };

  document.getElementById("records-table-body").innerHTML = filteredList.slice(0, 100).map((k) => {
    return `
      <tr>
          <td>Brgy. ${k.brgy},<br><small>${k.sitio}</small></td>
          <td>${k.parents}</td>
          <td><strong>${k.name}</strong></td>
          <td>NO</td>
          <td>${k.gender === "Male" ? "M" : "F"}</td>
          <td>${formatBtnDate(k.birthdate)}</td>
          <td>${formatBtnDate(k.dateMeasured)}</td>
          <td><strong>${k.weight}</strong></td>
          <td><strong>${k.height}</strong></td>
          <td>${k.age}</td>
          <td>${getStatusBadge(k.wfa)}</td>
          <td>${getStatusBadge(k.hfa)}</td>
          <td>${getStatusBadge(k.wflh)}</td>
          <td><button class="view-btn" onclick="openProfile('${k.brgy}', '${k.id}')">Profile</button></td>
      </tr>
    `;
  }).join("");
}

// NUTRITION REPORTS LOGIC
function updateReportsView() {
  if (!document.getElementById("reports-list-body")) return;

  const brgyFilter = document.getElementById("reportBrgyFilter").value;
  const tbody = document.getElementById("reports-list-body");
  let reportListHTML = "";

  function generateSummaryRow(locationName, kids) {
    const total = kids.length;
    if (total === 0) return "";
    let counts = { wfa_n: 0, wfa_uw: 0, wfa_suw: 0, wfa_ow: 0, hfa_n: 0, hfa_st: 0, hfa_sst: 0, hfa_t: 0, wflh_n: 0, wflh_mw: 0, wflh_sw: 0, wflh_ow: 0, wflh_ob: 0 };

    kids.forEach((k) => {
      if (k.wfa === "N") counts.wfa_n++; else if (k.wfa === "UW") counts.wfa_uw++; else if (k.wfa === "SUW") counts.wfa_suw++; else if (k.wfa === "OW") counts.wfa_ow++;
      if (k.hfa === "N") counts.hfa_n++; else if (k.hfa === "ST") counts.hfa_st++; else if (k.hfa === "SST") counts.hfa_sst++; else if (k.hfa === "T") counts.hfa_t++;
      if (k.wflh === "N") counts.wflh_n++; else if (k.wflh === "MW") counts.wflh_mw++; else if (k.wflh === "SW") counts.wflh_sw++; else if (k.wflh === "OW") counts.wflh_ow++; else if (k.wflh === "OB") counts.wflh_ob++;
    });

    return `<tr><td style="text-align:left; padding-left:15px; font-weight:600; color:#37474f;">${locationName}</td><td style="font-weight:bold;">${total}</td><td>${counts.wfa_n}</td><td>${counts.wfa_uw}</td><td>${counts.wfa_suw}</td><td>${counts.wfa_ow}</td><td>${counts.hfa_n}</td><td>${counts.hfa_st}</td><td>${counts.hfa_sst}</td><td>${counts.hfa_t}</td><td>${counts.wflh_n}</td><td>${counts.wflh_mw}</td><td>${counts.wflh_sw}</td><td>${counts.wflh_ow}</td><td>${counts.wflh_ob}</td></tr>`;
  }

  let totals = { kids: [] };

  if (brgyFilter === "all") {
    balayanBrgys.forEach((brgy) => {
      const kids = masterData[brgy] || [];
      reportListHTML += generateSummaryRow(`Brgy. ${brgy}`, kids);
      totals.kids.push(...kids);
    });
  } else {
    const kidsInBrgy = masterData[brgyFilter] || [];
    ["PUROK 1", "PUROK 2", "PUROK 3", "PUROK 4", "PUROK 5"].forEach((purok) => {
      reportListHTML += generateSummaryRow(`${brgyFilter} - ${purok}`, kidsInBrgy.filter((k) => k.sitio === purok));
    });
    totals.kids = kidsInBrgy;
  }

  if (totals.kids.length > 0) reportListHTML += generateSummaryRow("GRAND TOTAL", totals.kids).replace("<tr>", '<tr style="background-color:#f0f4f1;">');
  tbody.innerHTML = reportListHTML || `<tr><td colspan="15">No records.</td></tr>`;
}

// NEW ADMIN VITAMIN REPORT LOGIC
function renderAdminVitaminReport() {
    if (!document.getElementById('adminVitReportBrgyFilter')) return;

    const brgyFilter = document.getElementById('adminVitReportBrgyFilter').value;
    const tbody = document.getElementById('admin-vit-reports-table-body');
    
    let html = "";
    let totalAdministered = 0;
    
    // Determine which barangays to loop through
    const targetBrgys = brgyFilter === "all" ? balayanBrgys : [brgyFilter];

    targetBrgys.forEach(brgy => {
        const kids = masterData[brgy] || [];
        kids.forEach(kid => {
            if (kid.vitaminRecords) {
                kid.vitaminRecords.forEach(rec => {
                    if (rec.month === currentMonthString) {
                        totalAdministered++;
                        html += `
                            <tr>
                                <td><strong>Brgy. ${kid.brgy}</strong></td>
                                <td>${kid.sitio}</td>
                                <td><strong>${kid.name}</strong></td>
                                <td>${kid.age}</td>
                                <td>${rec.date}</td>
                                <td><span class="badge complete"><i class="fas fa-pills"></i> ${rec.type}</span></td>
                                <td><strong>${ordinalSuffix(rec.dose)} Dose</strong></td>
                            </tr>
                        `;
                    }
                });
            }
        });
    });

    document.getElementById('adminStatVitTotal').innerText = totalAdministered;
    tbody.innerHTML = html || `<tr><td colspan="7" style="text-align:center;">No interval supplements reported for this month.</td></tr>`;
}

// PROFILE MODAL
function openProfile(brgy, id) {
  const kid = masterData[brgy].find((k) => k.id === id);

  document.getElementById("modal-data").innerHTML = `
        <div class="profile-header"><div class="profile-avatar"><i class="fas fa-child"></i></div><div class="profile-title"><h2>${kid.name}</h2><p>Brgy. ${kid.brgy}, ${kid.sitio}</p></div></div>
        <div class="profile-grid" style="display: block;">
            <div class="info-box" style="margin-bottom:15px;"><span class="info-label">Parents / Caregiver</span><span class="info-value">${kid.parents}</span></div>
            <div class="info-box">
                <span class="info-label">Current Nutritional Breakdown</span>
                <p><strong>WFA (Weight for Age):</strong> ${getFullStatusName(kid.wfa)}</p>
                <p><strong>HFA (Height for Age):</strong> ${getFullStatusName(kid.hfa)}</p>
                <p><strong>WFL/H (Weight for Length/Height):</strong> ${getFullStatusName(kid.wflh)}</p>
            </div>
        </div>
    `;
  document.getElementById("profileModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("profileModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initFullMap();
  if (document.getElementById("trendBrgy")) updateTrends();
});