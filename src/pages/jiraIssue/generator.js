const rnd = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const money = (value) => Math.round(value * 100) / 100;
const qty2 = (value) => Math.round(value * 100) / 100;

const randomDate = () => {
  const start = new Date("2026-05-01").getTime();
  const end = new Date("2026-05-31").getTime();
  return new Date(rnd(start, end)).toISOString().slice(0, 10);
};

const makeId = (prefix, index) => `${prefix}-${String(index + 1).padStart(3, "0")}`;

const workProcesses = [
  // Grafika / PM
  { name: "Projektowanie grafiki", department: "Grafika", category: "DESIGN", margin: "M3", rate: [65, 95] },
  { name: "Przygotowanie plików produkcyjnych", department: "Grafika", category: "DESIGN", margin: "M3", rate: [65, 95] },
  { name: "Projekt wykrojnika", department: "Grafika", category: "DESIGN", margin: "M3", rate: [70, 110] },

  { name: "Wycena projektu", department: "PM", category: "SALE", margin: "M3", rate: [65, 100] },
  { name: "Kontakt z klientem", department: "PM", category: "SALE", margin: "M3", rate: [65, 100] },
  { name: "Przygotowanie specyfikacji", department: "PM", category: "PLANING", margin: "M3", rate: [65, 100] },
  { name: "Procesowanie zamówienia", department: "PM", category: "PLANING", margin: "M3", rate: [65, 100] },

  // Produkcja
  { name: "Przygotowanie sztancy", department: "Produkcja", category: "SETUP", margin: "M1", rate: [55, 85] },
  { name: "Sztancowanie", department: "Produkcja", category: "UNIT", margin: "M1", rate: [50, 80] },
  { name: "Hot Stamping", department: "Produkcja", category: "UNIT", margin: "M1", rate: [55, 90] },
  { name: "Pakowanie", department: "Produkcja", category: "UNIT", margin: "M1", rate: [45, 70] },
  { name: "Kontrola jakości", department: "Produkcja", category: "UNIT", margin: "M1", rate: [45, 70] },

  // Plotery / lasery
  { name: "Przygotowanie programu lasera", department: "Plotery Laser", category: "SETUP", margin: "M1", rate: [55, 85] },
  { name: "Wycinanie wkładek laserem", department: "Plotery Laser", category: "UNIT", margin: "M1", rate: [55, 85] },
  { name: "Grawerowanie laserowe", department: "Plotery Laser", category: "UNIT", margin: "M1", rate: [55, 90] },
];

const materials = [
  { name: "Wkładka piankowa", unit: "szt", department: "Produkcja", category: "UNIT", margin: "M1", price: [0.8, 2.4] },
  { name: "Taśma dwustronna", unit: "mb", department: "Produkcja", category: "UNIT", margin: "M1", price: [1.2, 4.5] },
  { name: "Kartony zbiorcze", unit: "szt", department: "Produkcja", category: "UNIT", margin: "M1", price: [3.5, 12] },
  { name: "Folia zabezpieczająca", unit: "mb", department: "Produkcja", category: "UNIT", margin: "M1", price: [1.5, 6] },
  { name: "Klej montażowy", unit: "szt", department: "Produkcja", category: "UNIT", margin: "M1", price: [12, 35] },
];

const purchases = [
  { name: "Druk zewnętrzny blistera", unit: "usł", department: "Zakupy", category: "UNIT", margin: "M1", cost: [800, 2600] },
  { name: "Usługa nakładania kleju", unit: "usł", department: "Zakupy", category: "UNIT", margin: "M1", cost: [250, 900] },
  { name: "Zewnętrzny hot stamping", unit: "usł", department: "Zakupy", category: "UNIT", margin: "M1", cost: [450, 1800] },
  { name: "Transport od podwykonawcy", unit: "usł", department: "Logistyka", category: "UNIT", margin: "M1", cost: [120, 500] },
];

const deptCostDictionary = [
  { name: "CUW", department: "Produkcja", category: "CUW", margin: "M5", rate: [4, 16] },
  { name: "Leasing maszyn", department: "Produkcja", category: "LEASING MASZYN", margin: "M4", rate: [4, 16] },
  { name: "Najem powierzchni produkcyjnej", department: "Produkcja", category: "NAJEM", margin: "M4", rate: [3, 12] },
  { name: "Energia i media", department: "Produkcja", category: "OPŁATY STAŁE", margin: "M4", rate: [2, 10] },
  { name: "Serwis i utrzymanie maszyn", department: "Utrzymanie Ruchu", category: "MASZYNY", margin: "M4", rate: [3, 14] },
  { name: "Koszt zarządu", department: "Administracja", category: "ZARZĄD", margin: "M5", rate: [4, 18] },
  { name: "Koszty biurowe", department: "Administracja", category: "ADMINISTRACJA", margin: "M5", rate: [1, 6] },
];

export function generateWorklog(count = 50) {
  return Array.from({ length: count }, (_, index) => {
    const process = pick(workProcesses);
    const hours = qty2(rnd(0.25, 4));
    const rate = rnd(process.rate[0], process.rate[1]);

    return {
      id: makeId("work", index),
      date: randomDate(),
      typ: "Praca",
      kategoria: process.category,
      nazwa: process.name,
      ilosc: hours,
      jm: "h",
      koszt: money(hours * rate),
      marza: process.margin,
      dzial: process.department,

      sourceType: "operation_log",
      sourceId: 10000 + index,
    };
  });
}

export function generateMaterials(count = 30) {
  return Array.from({ length: count }, (_, index) => {
    const material = pick(materials);
    const amount = qty2(rnd(1, 120));
    const unitPrice = rnd(material.price[0], material.price[1]);

    return {
      id: makeId("material", index),
      date: randomDate(),
      typ: "Materiał",
      kategoria: material.category,
      nazwa: material.name,
      ilosc: amount,
      jm: material.unit,
      koszt: money(amount * unitPrice),
      marza: material.margin,
      dzial: material.department,

      sourceType: "material_log",
      sourceId: 20000 + index,
    };
  });
}

export function generatePurchase(count = 10) {
  return Array.from({ length: count }, (_, index) => {
    const purchase = pick(purchases);

    return {
      id: makeId("purchase", index),
      date: randomDate(),
      typ: "Zakup",
      kategoria: purchase.category,
      nazwa: purchase.name,
      ilosc: 1,
      jm: purchase.unit,
      koszt: money(rnd(purchase.cost[0], purchase.cost[1])),
      marza: purchase.margin,
      dzial: purchase.department,

      sourceType: "direct_purchase",
      sourceId: 30000 + index,
    };
  });
}

export function generateDeptCosts(count = 40, workRows = []) {
  const totalHours = workRows.reduce((sum, row) => sum + Number(row.ilosc || 0), 0) || 1;

  return Array.from({ length: count }, (_, index) => {
    const item = pick(deptCostDictionary);
    const hoursShare = qty2(rnd(0.5, Math.max(1, totalHours / 8)));
    const rate = rnd(item.rate[0], item.rate[1]);

    return {
      id: makeId("dept", index),
      date: "2026-05-31",
      typ: "Koszt wydziałowy",
      kategoria: item.category,
      nazwa: item.name,
      ilosc: hoursShare,
      jm: "h",
      koszt: money(hoursShare * rate),
      marza: item.margin,
      dzial: item.department,

      sourceType: "department_cost_matrix",
      sourceId: 40000 + index,
    };
  });
}

export function generateCostRows({
  worklogQty = 50,
  materialsQty = 30,
  purchaseQty = 10,
  deptCostsQty = 40,
} = {}) {
  const worklog = generateWorklog(worklogQty);
  const materialRows = generateMaterials(materialsQty);
  const purchaseRows = generatePurchase(purchaseQty);
  const deptRows = generateDeptCosts(deptCostsQty, worklog);

  const rows = [
    ...worklog,
    ...materialRows,
    ...purchaseRows,
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const allRows = [
    ...rows,
    ...deptRows,
  ];

  return {
    projectName: "Blister na monety okolicznościowe",
    currency: "PLN",
    rows: allRows,
    summary: {
      total: money(allRows.reduce((sum, row) => sum + Number(row.koszt || 0), 0)),
      byType: groupSum(allRows, "typ"),
      byCategory: groupSum(allRows, "kategoria"),
      byMargin: groupSum(allRows, "marza"),
      byDepartment: groupSum(allRows, "dzial"),
      marginCumulative: marginCumulative(allRows),
    },
  };
}

function groupSum(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Brak";
    acc[value] = money((acc[value] || 0) + Number(row.koszt || 0));
    return acc;
  }, {});
}

function marginCumulative(rows) {
  const margins = ["M1", "M2", "M3", "M4", "M5"];
  let cumulative = 0;

  return margins.map((margin) => {
    const levelCost = money(
      rows
        .filter((row) => row.marza === margin)
        .reduce((sum, row) => sum + Number(row.koszt || 0), 0)
    );

    cumulative = money(cumulative + levelCost);

    return {
      margin,
      levelCost,
      cumulative,
    };
  });
}