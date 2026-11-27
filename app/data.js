// Homefront Budget — the sample household's data.
//
// The Alvarez household: Maya and Jordan Alvarez and their daughter Sofia, 4,
// a two-earner family in Columbus, Ohio. Every figure here is invented sample
// data for this demo household, so the site works out of the box with real
// numbers. The magnitudes follow public U.S. benchmarks, which the Learn page
// cites: median household income was $83,730 in 2024 (U.S. Census Bureau),
// average household spending was $78,535 a year, about $6,545 a month, with
// housing at 33.4% of spending (Bureau of Labor Statistics, Consumer
// Expenditure Survey 2024). Nothing here is copied from any real budget site.
//
// All money is in U.S. dollars. Transaction amounts are exact cents; each
// category's "spent" total is the sum of its transactions, so the planner,
// the tracker and the dashboard can never disagree.

const HOUSEHOLD = {
  name: "The Alvarez household",
  members: "Maya & Jordan Alvarez, and Sofia, age 4",
  place: "Columbus, Ohio",
  month: "November 2026",
  monthLabel: "November 2026",
  currency: "USD",
};

// Monthly take-home pay. Gross pay is about $8,600 a month; tax, retirement
// and health premiums bring take-home to $6,400.
const INCOME = [
  { source: "Maya's salary (take-home)", amount: 3600.0 },
  { source: "Jordan's salary (take-home)", amount: 2650.0 },
  { source: "Weekend tutoring (side income)", amount: 150.0 },
];

// Budget categories. "planned" is what the household meant to spend in
// November; "spent" is computed from TRANSACTIONS below. "group" feeds the
// 50/30/20 check on the planner page: needs, wants, or savings.
const CATEGORIES = [
  { id: "housing",    label: "Housing",            planned: 1850, group: "needs", color: "#1f5138" },
  { id: "groceries",  label: "Groceries",          planned: 720,  group: "needs", color: "#2e7d5b" },
  { id: "dining",     label: "Dining out",         planned: 260,  group: "wants", color: "#d97706" },
  { id: "transport",  label: "Transport",          planned: 480,  group: "needs", color: "#3b6ea5" },
  { id: "utilities",  label: "Utilities",          planned: 340,  group: "needs", color: "#7c5cbf" },
  { id: "childcare",  label: "Childcare & school", planned: 650,  group: "needs", color: "#c25e7a" },
  { id: "health",     label: "Health",             planned: 310,  group: "needs", color: "#0f766e" },
  { id: "fun",        label: "Fun & streaming",    planned: 180,  group: "wants", color: "#b45309" },
  { id: "clothing",   label: "Clothing & home",    planned: 150,  group: "wants", color: "#64748b" },
  { id: "gifts",      label: "Gifts & giving",     planned: 120,  group: "wants", color: "#8b5cf6" },
];

// What the household set aside in November, by goal. Total: $1,100.
const SAVINGS_PLAN = [
  { goal: "emergency", amount: 700 },
  { goal: "vacation",  amount: 250 },
  { goal: "car",       amount: 150 },
];

// November 2026 transactions. Category totals (the sums the site shows):
// housing $1,850.00 · groceries $684.00 · dining $241.00 · transport $462.00
// utilities $318.00 · childcare $650.00 · health $287.00 · fun $172.00
// clothing $96.00 · gifts $85.00 · all spending $4,845.00.
const TRANSACTIONS = [
  { date: "2026-11-01", desc: "November rent — Maple Court Apartments", cat: "housing", amount: 1850.0 },
  { date: "2026-11-01", desc: "Sunrise Daycare — November tuition", cat: "childcare", amount: 650.0 },
  { date: "2026-11-02", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 86.4 },
  { date: "2026-11-02", desc: "City Power & Light — October electric", cat: "utilities", amount: 142.1 },
  { date: "2026-11-03", desc: "Corner Fuel — gas, Jordan's car", cat: "transport", amount: 48.2 },
  { date: "2026-11-04", desc: "Harbor Pharmacy — Sofia's prescription", cat: "health", amount: 32.5 },
  { date: "2026-11-05", desc: "Pasta House — family dinner", cat: "dining", amount: 58.75 },
  { date: "2026-11-06", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 112.75 },
  { date: "2026-11-07", desc: "StreamBox — monthly subscription", cat: "fun", amount: 15.99 },
  { date: "2026-11-08", desc: "Metro Transit — monthly pass, Maya", cat: "transport", amount: 96.0 },
  { date: "2026-11-09", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 94.2 },
  { date: "2026-11-10", desc: "BrightSmile Dental — cleaning copay", cat: "health", amount: 45.0 },
  { date: "2026-11-11", desc: "Corner Fuel — gas, Maya's car", cat: "transport", amount: 52.4 },
  { date: "2026-11-12", desc: "Taco Barn — lunch with coworkers", cat: "dining", amount: 42.3 },
  { date: "2026-11-13", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 78.55 },
  { date: "2026-11-13", desc: "City Water — November water bill", cat: "utilities", amount: 68.4 },
  { date: "2026-11-14", desc: "River Cinema — Saturday movie night", cat: "fun", amount: 24.0 },
  { date: "2026-11-15", desc: "Northgate Outfitters — Sofia's winter coat", cat: "clothing", amount: 42.0 },
  { date: "2026-11-16", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 103.9 },
  { date: "2026-11-17", desc: "Corner Fuel — gas, Jordan's car", cat: "transport", amount: 44.1 },
  { date: "2026-11-18", desc: "Noodle House — takeout dinner", cat: "dining", amount: 36.8 },
  { date: "2026-11-19", desc: "Harbor Pharmacy — vitamins & first aid", cat: "health", amount: 89.99 },
  { date: "2026-11-20", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 64.3 },
  { date: "2026-11-20", desc: "Hometown Mutual — car insurance, 6 months", cat: "transport", amount: 186.3 },
  { date: "2026-11-21", desc: "City parking — downtown garage", cat: "transport", amount: 35.0 },
  { date: "2026-11-22", desc: "Corner Bakery — Sunday brunch", cat: "dining", amount: 24.5 },
  { date: "2026-11-23", desc: "Maple Street Market — weekly shop", cat: "groceries", amount: 88.15 },
  { date: "2026-11-23", desc: "Northgate Outfitters — bedsheets & towels", cat: "clothing", amount: 54.0 },
  { date: "2026-11-24", desc: "GreenLeaf Grocers — Thanksgiving turkey run", cat: "groceries", amount: 55.75 },
  { date: "2026-11-24", desc: "Harbor Pharmacy — dental checkup copay", cat: "health", amount: 119.51 },
  { date: "2026-11-25", desc: "Lakeview Tickets — holiday concert, 2 seats", cat: "fun", amount: 89.0 },
  { date: "2026-11-25", desc: "Corner Books — Sofia's picture books", cat: "fun", amount: 43.01 },
  { date: "2026-11-25", desc: "Pasta House — dinner with grandparents", cat: "dining", amount: 47.9 },
  { date: "2026-11-26", desc: "Gifts — birthday present for Grandma Rosa", cat: "gifts", amount: 85.0 },
  { date: "2026-11-26", desc: "BrightNet — home internet", cat: "utilities", amount: 59.99 },
  { date: "2026-11-26", desc: "CallWave Mobile — two phone lines", cat: "utilities", amount: 47.51 },
  { date: "2026-11-26", desc: "Noodle House — lunch, last-minute", cat: "dining", amount: 30.75 },
];

// Income vs spending for the last six months. November is the month above.
const TREND = [
  { month: "Jun", income: 6400, spent: 5120 },
  { month: "Jul", income: 6400, spent: 5480 },
  { month: "Aug", income: 6550, spent: 5310 },
  { month: "Sep", income: 6400, spent: 4990 },
  { month: "Oct", income: 6400, spent: 5205 },
  { month: "Nov", income: 6400, spent: 4845 },
];

// Savings goals: what is saved so far toward each target.
const GOALS = [
  { id: "emergency", name: "Emergency fund", saved: 9600, target: 12000, note: "Six months of essentials, for the month nothing goes to plan." },
  { id: "vacation",  name: "Summer vacation — Lake Michigan", saved: 1850, target: 3000, note: "A week at the lake next July, cabin included." },
  { id: "car",       name: "Next car down payment", saved: 4200, target: 8000, note: "Jordan's car turns twelve next spring; the next one starts here." },
  { id: "holiday",   name: "Holiday gifts", saved: 420, target: 600, note: "December gifts, funded a little each month so December stays calm." },
];
