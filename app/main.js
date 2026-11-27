// Homefront Budget — the application.
//
// A single-page site on hash routes: #/ dashboard, #/planner budget planner,
// #/expenses expense tracker, #/goals savings goals, #/learn guidance.
// All state starts as a copy of the sample data in data.js and lives only in
// this tab: add, edit and delete controls update the state and re-render, so
// every total, chart and list on every page always agrees with the same
// numbers. Nothing is fetched, stored or uploaded anywhere.

// ---------------------------------------------------------------- state ---

const state = {
  income: INCOME.map((i) => ({ ...i })),
  categories: CATEGORIES.map((c) => ({ ...c })),
  transactions: TRANSACTIONS.map((t) => ({ ...t })),
  goals: GOALS.map((g) => ({ ...g })),
  savingsPlan: SAVINGS_PLAN.map((s) => ({ ...s })),
  trend: TREND.map((m) => ({ ...m })),
  // Transient UI: which row is being edited, which delete is armed, the
  // expense filters, and which trend month is inspected on the dashboard.
  ui: {
    editingPlan: null,
    confirmDeleteCat: null,
    confirmDeleteTxn: null,
    expenseSearch: "",
    expenseCat: "all",
    expenseSort: "newest",
    inspectMonth: TREND.length - 1,
    plannerError: "",
    expenseError: "",
    goalError: "",
  },
};

let catCounter = 0;

// ------------------------------------------------------------- arithmetic ---

function totalIncome() {
  return state.income.reduce((sum, i) => sum + i.amount, 0);
}

function spentByCategory() {
  const out = {};
  for (const c of state.categories) out[c.id] = 0;
  for (const t of state.transactions) {
    if (out[t.cat] === undefined) out[t.cat] = 0;
    out[t.cat] += t.amount;
  }
  return out;
}

function totalSpent() {
  return state.transactions.reduce((sum, t) => sum + t.amount, 0);
}

function plannedTotal() {
  return state.categories.reduce((sum, c) => sum + c.planned, 0);
}

function savingsPlanned() {
  return state.savingsPlan.reduce((sum, s) => sum + s.amount, 0);
}

// Money left over after spending and the month's saving: the household's
// "ready to assign" — the number a zero-based budget watches most closely.
function readyToAssign() {
  return totalIncome() - totalSpent() - savingsPlanned();
}

function savingsRate() {
  const income = totalIncome();
  return income > 0 ? ((income - totalSpent()) / income) * 100 : 0;
}

function categoryById(id) {
  return state.categories.find((c) => c.id === id);
}

function goalById(id) {
  return state.goals.find((g) => g.id === id);
}

// -------------------------------------------------------------- utilities ---

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(text) {
  const base = String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  catCounter += 1;
  return (base || "category") + "-" + catCounter;
}

function roundCents(n) {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------- routing ---

function currentRoute() {
  const hash = window.location.hash || "#/";
  const route = hash.replace(/^#\/?/, "").split("/")[0];
  return ["planner", "expenses", "goals", "learn"].includes(route) ? route : "";
}

function setActiveNav(route) {
  for (const link of document.querySelectorAll(".site-nav a")) {
    link.classList.toggle("active", link.dataset.route === route);
  }
}

function render() {
  const route = currentRoute();
  setActiveNav(route);
  const view = document.getElementById("view");
  if (route === "planner") view.innerHTML = plannerPage();
  else if (route === "expenses") view.innerHTML = expensesPage();
  else if (route === "goals") view.innerHTML = goalsPage();
  else if (route === "learn") view.innerHTML = learnPage();
  else view.innerHTML = dashboardPage();
  window.scrollTo(0, 0);
}

// -------------------------------------------------------------- dashboard ---

function dashboardPage() {
  const income = totalIncome();
  const spent = totalSpent();
  const saved = savingsPlanned();
  const ready = readyToAssign();
  const rate = savingsRate();
  const byCat = spentByCategory();
  const slices = state.categories
    .map((c) => ({ label: c.label, value: byCat[c.id] || 0, color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const rows = state.categories
    .map((c) => ({ ...c, spent: byCat[c.id] || 0 }))
    .sort((a, b) => Math.abs(b.spent - b.planned) - Math.abs(a.spent - a.planned));
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 5);
  const inspected = state.trend[state.ui.inspectMonth];
  const tightest = rows
    .filter((c) => c.spent < c.planned)
    .sort((a, b) => (a.planned - a.spent) - (b.planned - b.spent))[0];

  return `
  <div class="page-head">
    <h1>November 2026 at a glance</h1>
    <p><strong>${esc(HOUSEHOLD.name)}</strong> · ${esc(HOUSEHOLD.members)} · ${esc(HOUSEHOLD.place)}.
    Take-home pay ${fmtUSD(income)} a month; this page shows where November&rsquo;s money went and what is left to give a job.</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="label">Income</div><div class="value">${fmtUSD(income)}</div><div class="note">take-home, 3 sources</div></div>
    <div class="stat"><div class="label">Spent</div><div class="value">${fmtUSD(spent)}</div><div class="note">${state.transactions.length} expenses tracked</div></div>
    <div class="stat good"><div class="label">Saved</div><div class="value">${fmtUSD(saved)}</div><div class="note">savings rate ${fmtPct(rate)}</div></div>
    <div class="stat warn"><div class="label">Ready to assign</div><div class="value">${fmtUSD(ready)}</div><div class="note">give every dollar a job</div></div>
  </div>

  <div class="grid two">
    <section class="card">
      <h2>Where November&rsquo;s money went</h2>
      <p class="sub">Spending by category, from the expense tracker.</p>
      <div class="grid two" style="align-items:center">
        ${donutSVG(slices, 220)}
        <ul class="legend">
          ${slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.label)}<span class="amt">${fmtUSD(s.value)}</span><span class="pct">${fmtPct((s.value / spent) * 100)}</span></li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="card">
      <h2>Budget vs. actual</h2>
      <p class="sub">Bar: what was spent. Tick: what was planned.</p>
      <table>
        <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th style="width:34%">Progress</th></tr></thead>
        <tbody>
          ${rows.map((c) => `<tr><td>${esc(c.label)}</td><td class="num">${fmtUSD(c.planned)}</td><td class="num">${fmtUSD(c.spent)}</td><td>${meterSVG(c.spent, c.planned, c.color)}</td></tr>`).join("")}
        </tbody>
      </table>
      <p class="chart-note">${tightest ? `Tightest category: ${esc(tightest.label)}, ${fmtUSD(tightest.planned - tightest.spent)} under plan. ` : ""}Housing and childcare landed exactly on plan.</p>
    </section>
  </div>

  <div class="stack" style="margin-top:18px">
    <section class="card">
      <h2>Six months: income vs. spending</h2>
      <p class="sub">Select a bar to inspect that month. November is the month above.</p>
      <div class="legend-key"><span><i style="background:#1f5138"></i>Income</span><span><i style="background:#d97706"></i>Spent</span></div>
      ${trendSVG(state.trend)}
      <p class="chart-note" id="trend-detail"><strong>${esc(inspected.month)} 2026:</strong> income ${fmtUSD(inspected.income)} · spent ${fmtUSD(inspected.spent)} · saved ${fmtUSD(inspected.income - inspected.spent)} (${fmtPct(((inspected.income - inspected.spent) / inspected.income) * 100)} savings rate).</p>
    </section>

    <div class="grid two">
      <section class="card">
        <h2>Latest expenses</h2>
        <p class="sub">The five most recent entries. <a href="#/expenses">See all ${state.transactions.length} &rarr;</a></p>
        <table>
          <tbody>
            ${recent.map((t) => {
              const c = categoryById(t.cat);
              return `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.desc)}</td><td class="num">${fmtUSD(t.amount, true)}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </section>

      <section class="card">
        <h2>Savings goals</h2>
        <p class="sub">${fmtUSD(state.goals.reduce((a, g) => a + g.saved, 0))} saved toward ${fmtUSD(state.goals.reduce((a, g) => a + g.target, 0))} in goals. <a href="#/goals">Open goals &rarr;</a></p>
        ${state.goals.map((g) => `
          <div class="progress-row"><span>${esc(g.name)}</span><b>${fmtUSD(g.saved)} / ${fmtUSD(g.target)}</b></div>
          <div class="progress"><span style="width:${Math.min(100, (g.saved / g.target) * 100).toFixed(1)}%"></span></div>
        `).join("")}
      </section>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- planner ---

function plannerPage() {
  const byCat = spentByCategory();
  const spent = totalSpent();
  const planned = plannedTotal();
  const income = totalIncome();
  const needs = state.categories.filter((c) => c.group === "needs").reduce((a, c) => a + (byCat[c.id] || 0), 0);
  const wants = state.categories.filter((c) => c.group === "wants").reduce((a, c) => a + (byCat[c.id] || 0), 0);
  const saved = savingsPlanned();
  const ui = state.ui;

  const rows = state.categories.map((c) => {
    const s = byCat[c.id] || 0;
    const left = roundCents(c.planned - s);
    const status = s > c.planned
      ? `<span class="pill over">Over by ${fmtUSD(s - c.planned)}</span>`
      : left === 0
        ? `<span class="pill under">On plan</span>`
        : left <= 25
          ? `<span class="pill ontrack">Nearly used</span>`
          : `<span class="pill under">${fmtUSD(left)} left</span>`;
    const plannedCell = ui.editingPlan === c.id
      ? `<input id="plan-edit" class="inline-edit" type="number" min="0" step="1" value="${c.planned}" aria-label="Planned amount for ${esc(c.label)}">`
      : fmtUSD(c.planned);
    const editBtn = ui.editingPlan === c.id
      ? `<button class="btn small" data-action="save-plan" data-id="${c.id}">Save</button> <button class="btn small secondary" data-action="cancel-plan">Cancel</button>`
      : `<button class="btn small secondary" data-action="edit-plan" data-id="${c.id}">Edit</button>`;
    const delBtn = ui.confirmDeleteCat === c.id
      ? `<button class="btn small danger armed" data-action="delete-cat" data-id="${c.id}">Confirm delete</button>`
      : `<button class="btn small danger" data-action="arm-delete-cat" data-id="${c.id}">Delete</button>`;
    return `<tr>
      <td><span class="dot" style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${c.color};margin-right:7px"></span>${esc(c.label)}</td>
      <td class="num">${plannedCell}</td>
      <td class="num">${fmtUSD(s)}</td>
      <td class="num">${fmtUSD(left)}</td>
      <td style="min-width:120px">${meterSVG(s, c.planned, c.color)}</td>
      <td>${status}</td>
      <td style="white-space:nowrap">${editBtn} ${delBtn}</td>
    </tr>`;
  }).join("");

  return `
  <div class="page-head">
    <h1>Budget planner</h1>
    <p>Plan November before the month spends it for you. Edit any planned amount, add a category you forgot, or delete one you don&rsquo;t need — every total on this page and on the dashboard updates at once.</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="label">Planned spending</div><div class="value">${fmtUSD(planned)}</div><div class="note">across ${state.categories.length} categories</div></div>
    <div class="stat"><div class="label">Actually spent</div><div class="value">${fmtUSD(spent)}</div><div class="note">${fmtUSD(planned - spent)} left in the plan</div></div>
    <div class="stat good"><div class="label">Planned saving</div><div class="value">${fmtUSD(saved)}</div><div class="note">${fmtPct((saved / income) * 100)} of take-home pay</div></div>
    <div class="stat warn"><div class="label">Ready to assign</div><div class="value">${fmtUSD(readyToAssign())}</div><div class="note">income minus spending and saving</div></div>
  </div>

  <section class="card" style="margin-bottom:18px">
    <h2>November plan</h2>
    <p class="sub">Bar: what was spent. Tick: what was planned. Deleting a category also removes its expenses.</p>
    <div class="table-wrap">
    <table>
      <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Left</th><th>Progress</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row"><td>Total</td><td class="num">${fmtUSD(planned)}</td><td class="num">${fmtUSD(spent)}</td><td class="num">${fmtUSD(planned - spent)}</td><td></td><td></td><td></td></tr></tfoot>
    </table>
    </div>
    ${ui.plannerError ? `<p class="error">${esc(ui.plannerError)}</p>` : ""}
  </section>

  <div class="grid two">
    <section class="card">
      <h2>Add a category</h2>
      <p class="sub">A new line in the plan, with its own budget.</p>
      <form id="add-category-form">
        <div class="controls">
          <label class="field" style="flex:2">Category name<input name="name" type="text" placeholder="e.g. Pet care" maxlength="40" required></label>
          <label class="field">Planned $/month<input name="planned" type="number" min="1" step="1" placeholder="100" required></label>
          <label class="field">Group
            <select name="group"><option value="needs">Need</option><option value="wants">Want</option></select>
          </label>
          <button class="btn" type="submit">Add category</button>
        </div>
      </form>
      <p class="form-note">New categories start with $0 spent and appear on the dashboard donut as soon as they have expenses.</p>
    </section>

    <section class="card">
      <h2>The 50/30/20 check</h2>
      <p class="sub">A common guideline: 50% needs, 30% wants, 20% savings. Here is November, measured against it.</p>
      <div class="split-bar" role="img" aria-label="Needs ${fmtPct((needs / income) * 100)}, wants ${fmtPct((wants / income) * 100)}, savings ${fmtPct((saved / income) * 100)} of income">
        <span style="width:${((needs / income) * 100).toFixed(1)}%;background:#1f5138"></span>
        <span style="width:${((wants / income) * 100).toFixed(1)}%;background:#d97706"></span>
        <span style="width:${((saved / income) * 100).toFixed(1)}%;background:#3b6ea5"></span>
      </div>
      <div class="split-legend">
        <span><i style="background:#1f5138"></i>Needs ${fmtUSD(needs)} · ${fmtPct((needs / income) * 100)}</span>
        <span><i style="background:#d97706"></i>Wants ${fmtUSD(wants)} · ${fmtPct((wants / income) * 100)}</span>
        <span><i style="background:#3b6ea5"></i>Savings ${fmtUSD(saved)} · ${fmtPct((saved / income) * 100)}</span>
      </div>
      <p class="chart-note">Needs run high at ${fmtPct((needs / income) * 100)} because childcare is $650 a month — that is normal for a family with a four-year-old, and the guideline bends around it. Wants stay low, so the household still saves ${fmtPct((saved / income) * 100)}.</p>
    </section>
  </div>`;
}

// --------------------------------------------------------------- expenses ---

function filteredTransactions() {
  const ui = state.ui;
  let list = [...state.transactions];
  if (ui.expenseCat !== "all") list = list.filter((t) => t.cat === ui.expenseCat);
  if (ui.expenseSearch.trim()) {
    const q = ui.expenseSearch.trim().toLowerCase();
    list = list.filter((t) => t.desc.toLowerCase().includes(q));
  }
  if (ui.expenseSort === "oldest") list.sort((a, b) => (a.date < b.date ? -1 : 1));
  else if (ui.expenseSort === "amount-desc") list.sort((a, b) => b.amount - a.amount);
  else if (ui.expenseSort === "amount-asc") list.sort((a, b) => a.amount - b.amount);
  else list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return list;
}

function expensesPage() {
  const ui = state.ui;
  const list = filteredTransactions();
  const shownTotal = list.reduce((a, t) => a + t.amount, 0);

  return `
  <div class="page-head">
    <h1>Expense tracker</h1>
    <p>Every dollar November has spent, in one list. Search it, filter it by category, sort it — or add the expense you just made and watch the totals move.</p>
  </div>

  <section class="card" style="margin-bottom:18px">
    <h2>Add an expense</h2>
    <form id="add-expense-form">
      <div class="controls">
        <label class="field">Date<input name="date" type="date" value="2026-11-27" min="2026-11-01" max="2026-11-30" required></label>
        <label class="field" style="flex:2">What was it?<input name="desc" type="text" placeholder="e.g. Corner Bakery — croissants" maxlength="80" required></label>
        <label class="field">Category
          <select name="cat">${state.categories.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join("")}</select>
        </label>
        <label class="field">Amount $<input name="amount" type="number" min="0.01" step="0.01" placeholder="12.50" required></label>
        <button class="btn" type="submit">Add expense</button>
      </div>
    </form>
    ${ui.expenseError ? `<p class="error">${esc(ui.expenseError)}</p>` : ""}
    <p class="form-note">Adding an expense updates the dashboard, the planner and the savings rate immediately — it is the same list everywhere.</p>
  </section>

  <section class="card">
    <h2>November expenses</h2>
    <p class="sub">Showing ${list.length} of ${state.transactions.length} expenses · ${fmtUSD(shownTotal, true)} in view · ${fmtUSD(totalSpent(), true)} this month.</p>
    <div class="controls">
      <label class="field" style="flex:2">Search<input id="expense-search" type="search" placeholder="Search descriptions, e.g. market" value="${esc(ui.expenseSearch)}"></label>
      <label class="field">Category
        <select id="expense-cat">
          <option value="all">All categories</option>
          ${state.categories.map((c) => `<option value="${c.id}"${ui.expenseCat === c.id ? " selected" : ""}>${esc(c.label)}</option>`).join("")}
        </select>
      </label>
      <label class="field">Sort by
        <select id="expense-sort">
          <option value="newest"${ui.expenseSort === "newest" ? " selected" : ""}>Newest first</option>
          <option value="oldest"${ui.expenseSort === "oldest" ? " selected" : ""}>Oldest first</option>
          <option value="amount-desc"${ui.expenseSort === "amount-desc" ? " selected" : ""}>Amount: high to low</option>
          <option value="amount-asc"${ui.expenseSort === "amount-asc" ? " selected" : ""}>Amount: low to high</option>
        </select>
      </label>
    </div>
    ${list.length === 0
      ? `<p class="empty">No expenses match. Clear the search or pick another category.</p>`
      : `<div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
        <tbody>
          ${list.map((t, i) => {
            const c = categoryById(t.cat);
            const key = state.transactions.indexOf(t);
            return `<tr>
              <td style="white-space:nowrap">${fmtDate(t.date)}</td>
              <td>${esc(t.desc)}</td>
              <td>${c ? `<span class="cat-chip" style="background:${c.color}">${esc(c.label)}</span>` : "—"}</td>
              <td class="num">${fmtUSD(t.amount, true)}</td>
              <td>${ui.confirmDeleteTxn === key
                ? `<button class="btn small danger armed" data-action="delete-txn" data-key="${key}">Confirm</button>`
                : `<button class="btn small danger" data-action="arm-delete-txn" data-key="${key}">Delete</button>`}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table></div>`}
  </section>`;
}

// ------------------------------------------------------------------ goals ---

function goalsPage() {
  const savedTotal = state.goals.reduce((a, g) => a + g.saved, 0);
  const targetTotal = state.goals.reduce((a, g) => a + g.target, 0);
  const ui = state.ui;

  return `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p>Money with a name on it gets saved first. ${fmtUSD(savedTotal)} is set aside toward ${fmtUSD(targetTotal)} in goals — add to a goal and watch its bar move.</p>
  </div>

  <div class="stats three-col">
    <div class="stat"><div class="label">Saved in goals</div><div class="value">${fmtUSD(savedTotal)}</div><div class="note">across ${state.goals.length} goals</div></div>
    <div class="stat"><div class="label">Still to save</div><div class="value">${fmtUSD(targetTotal - savedTotal)}</div><div class="note">to reach every target</div></div>
    <div class="stat good"><div class="label">Overall progress</div><div class="value">${fmtPct((savedTotal / targetTotal) * 100)}</div><div class="note">of all targets combined</div></div>
  </div>

  <div class="goal-grid">
    ${state.goals.map((g) => {
      const pct = Math.min(100, (g.saved / g.target) * 100);
      const done = g.saved >= g.target;
      return `<section class="card goal-card">
        <h3>${esc(g.name)}</h3>
        <p class="sub">${esc(g.note)}</p>
        <div class="goal-big">${fmtUSD(g.saved)} <span style="font-size:1rem;color:var(--muted)">of ${fmtUSD(g.target)}</span></div>
        <div class="progress-row"><span>${fmtPct(pct)} funded</span><b>${done ? "Goal reached" : fmtUSD(g.target - g.saved) + " to go"}</b></div>
        <div class="progress${done ? "" : " amber"}"><span style="width:${pct.toFixed(1)}%"></span></div>
        <div class="goal-actions">
          <button class="btn small" data-action="goal-add" data-id="${g.id}" data-amount="50" ${done ? "disabled" : ""}>Add $50</button>
          <button class="btn small" data-action="goal-add" data-id="${g.id}" data-amount="100" ${done ? "disabled" : ""}>Add $100</button>
          ${done ? `<span class="pill under">Reached — nice work</span>` : ""}
        </div>
      </section>`;
    }).join("")}
  </div>

  <section class="card" style="margin-top:18px">
    <h2>Start a new goal</h2>
    <p class="sub">Name it, price it, and put the first dollars in.</p>
    <form id="add-goal-form">
      <div class="controls">
        <label class="field" style="flex:2">Goal name<input name="name" type="text" placeholder="e.g. New roof fund" maxlength="60" required></label>
        <label class="field">Target $<input name="target" type="number" min="1" step="1" placeholder="5000" required></label>
        <label class="field">Already saved $<input name="saved" type="number" min="0" step="1" value="0"></label>
        <button class="btn" type="submit">Create goal</button>
      </div>
    </form>
    ${ui.goalError ? `<p class="error">${esc(ui.goalError)}</p>` : ""}
    <p class="form-note">November&rsquo;s saving plan already sends $700 to the emergency fund, $250 to the vacation and $150 to the car — $1,100 a month, before anything is spent.</p>
  </section>`;
}

// ------------------------------------------------------------------ learn ---

function learnPage() {
  const income = totalIncome();
  const needs = state.categories.filter((c) => c.group === "needs").reduce((a, c) => a + (spentByCategory()[c.id] || 0), 0);
  const wants = state.categories.filter((c) => c.group === "wants").reduce((a, c) => a + (spentByCategory()[c.id] || 0), 0);
  const saved = savingsPlanned();

  return `
  <div class="page-head">
    <h1>Learn: how a household budget actually works</h1>
    <p>No jargon, no shame, no selling. Five habits and one simple split, shown with the Alvarez household&rsquo;s real November numbers.</p>
  </div>

  <div class="stack">
    <section class="card">
      <h2>The 50/30/20 split, with real numbers</h2>
      <p class="sub">Take-home pay ${fmtUSD(income)} a month. The guideline says: about half for needs, under a third for wants, a fifth for savings.</p>
      <div class="split-bar" role="img" aria-label="Needs ${fmtPct((needs / income) * 100)}, wants ${fmtPct((wants / income) * 100)}, savings ${fmtPct((saved / income) * 100)} of income">
        <span style="width:${((needs / income) * 100).toFixed(1)}%;background:#1f5138"></span>
        <span style="width:${((wants / income) * 100).toFixed(1)}%;background:#d97706"></span>
        <span style="width:${((saved / income) * 100).toFixed(1)}%;background:#3b6ea5"></span>
      </div>
      <div class="split-legend">
        <span><i style="background:#1f5138"></i>Needs ${fmtUSD(needs)} · ${fmtPct((needs / income) * 100)}</span>
        <span><i style="background:#d97706"></i>Wants ${fmtUSD(wants)} · ${fmtPct((wants / income) * 100)}</span>
        <span><i style="background:#3b6ea5"></i>Savings ${fmtUSD(saved)} · ${fmtPct((saved / income) * 100)}</span>
      </div>
      <p class="chart-note">The Alvarez household&rsquo;s needs run at ${fmtPct((needs / income) * 100)}, not 50%, because childcare alone is $650 a month. The split is a compass, not a verdict: what matters is that wants stay small enough for saving to happen — here ${fmtPct((saved / income) * 100)} of pay is saved while every bill is covered.</p>
    </section>

    <section class="card">
      <h2>Five habits that keep a budget working</h2>
      <ol class="tip-list">
        <li><h3>Pay yourself first</h3><p>Move the saving out on payday, before the month starts spending. The Alvarez household sends ${fmtUSD(savingsPlanned())} to its goals on the 1st; what is left is what the month may spend.</p></li>
        <li><h3>Give every dollar a job</h3><p>Income minus plans should be zero. November has ${fmtUSD(readyToAssign())} still unassigned — that money is a decision waiting to happen, not spare change.</p></li>
        <li><h3>Track the small leaks, not the big bills</h3><p>Rent never surprises anyone. The $24 movie night and the $30 takeout do — five small wants a week are $150 a month. The tracker exists for those.</p></li>
        <li><h3>Fund the irregular things monthly</h3><p>Car insurance ($186 every six months), holiday gifts, a new coat: divide the yearly cost by twelve and save it monthly, so no single month takes the hit.</p></li>
        <li><h3>Review once a month, for fifteen minutes</h3><p>Compare plan to actual, move the unassigned money, adjust one category. A budget reviewed monthly stays honest; one written in January and ignored does not.</p></li>
      </ol>
    </section>

    <div class="grid two">
      <section class="card">
        <h2>Benchmarks: is this normal?</h2>
        <p class="sub">Public U.S. figures, for scale — not targets.</p>
        <table><tbody>
          <tr><td>Median household income, 2024</td><td class="num"><strong>$83,730 / year</strong></td></tr>
          <tr><td>Average household spending, 2024</td><td class="num"><strong>$78,535 / year</strong></td></tr>
          <tr><td>Average spending per month</td><td class="num"><strong>$6,545</strong></td></tr>
          <tr><td>Housing share of spending</td><td class="num"><strong>33.4%</strong></td></tr>
          <tr><td>Transport share of spending</td><td class="num"><strong>17.0%</strong></td></tr>
          <tr><td>This household&rsquo;s spending</td><td class="num"><strong>$4,845 / month</strong></td></tr>
        </tbody></table>
        <p class="chart-note">Sources: U.S. Census Bureau, Income in the United States: 2024; U.S. Bureau of Labor Statistics, Consumer Expenditure Survey 2024. The Alvarez household spends less than the national average because its rent is modest and it owns its cars outright.</p>
      </section>

      <section class="card">
        <h2>Start your own in five steps</h2>
        <ul class="check-list">
          <li>Write down take-home pay, not salary — the money that actually lands.</li>
          <li>List the fixed bills first: housing, utilities, transport, childcare.</li>
          <li>Look at last month&rsquo;s bank statement and sort every spend into a category.</li>
          <li>Pick one number to improve — usually dining out or subscriptions.</li>
          <li>Set the saving transfer for payday, then live on what is left.</li>
        </ul>
        <p class="callout" style="margin-top:14px"><p><strong>Emergency fund first.</strong> Three to six months of essentials, in a plain savings account, before investing or extra debt payments. The Alvarez fund sits at ${fmtUSD((goalById("emergency") || { saved: 0 }).saved)} of its ${fmtUSD((goalById("emergency") || { target: 0 }).target)} target.</p></p>
      </section>
    </div>
  </div>`;
}

// ----------------------------------------------------------------- events ---

function bindEvents() {
  const view = document.getElementById("view");

  view.addEventListener("click", (event) => {
    // Trend bars on the dashboard: inspect that month.
    const bar = event.target.closest(".trend-bar");
    if (bar) {
      state.ui.inspectMonth = Number(bar.dataset.month);
      render();
      return;
    }
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const ui = state.ui;

    if (action === "edit-plan") {
      ui.editingPlan = id;
      ui.confirmDeleteCat = null;
      render();
      const input = document.getElementById("plan-edit");
      if (input) { input.focus(); input.select(); }
    } else if (action === "cancel-plan") {
      ui.editingPlan = null;
      render();
    } else if (action === "save-plan") {
      const input = document.getElementById("plan-edit");
      const value = input ? roundCents(Number(input.value)) : NaN;
      const cat = categoryById(id);
      if (!cat || !Number.isFinite(value) || value < 0) {
        ui.plannerError = "Enter a planned amount of $0 or more.";
      } else {
        cat.planned = value;
        ui.editingPlan = null;
        ui.plannerError = "";
      }
      render();
    } else if (action === "arm-delete-cat") {
      ui.confirmDeleteCat = id;
      render();
    } else if (action === "delete-cat") {
      state.transactions = state.transactions.filter((t) => t.cat !== id);
      state.categories = state.categories.filter((c) => c.id !== id);
      state.savingsPlan = state.savingsPlan.filter((s) => s.goal !== id);
      ui.confirmDeleteCat = null;
      ui.editingPlan = null;
      render();
    } else if (action === "arm-delete-txn") {
      ui.confirmDeleteTxn = Number(btn.dataset.key);
      render();
    } else if (action === "delete-txn") {
      const key = Number(btn.dataset.key);
      state.transactions.splice(key, 1);
      ui.confirmDeleteTxn = null;
      render();
    } else if (action === "goal-add") {
      const goal = goalById(id);
      const amount = Number(btn.dataset.amount);
      if (goal && Number.isFinite(amount)) {
        goal.saved = roundCents(Math.min(goal.target, goal.saved + amount));
      }
      render();
    }
  });

  view.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("trend-bar")) {
      event.preventDefault();
      state.ui.inspectMonth = Number(event.target.dataset.month);
      render();
    }
  });

  view.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const ui = state.ui;

    if (form.id === "add-category-form") {
      const name = String(data.get("name") || "").trim();
      const planned = roundCents(Number(data.get("planned")));
      const group = data.get("group") === "wants" ? "wants" : "needs";
      if (!name) { ui.plannerError = "Give the category a name."; render(); return; }
      if (!Number.isFinite(planned) || planned <= 0) { ui.plannerError = "Enter a planned amount above $0."; render(); return; }
      const palette = ["#7c5cbf", "#0f766e", "#b45309", "#3b6ea5", "#c25e7a", "#64748b"];
      state.categories.push({
        id: slug(name),
        label: name,
        planned,
        group,
        color: palette[state.categories.length % palette.length],
      });
      ui.plannerError = "";
      render();
    } else if (form.id === "add-expense-form") {
      const desc = String(data.get("desc") || "").trim();
      const amount = roundCents(Number(data.get("amount")));
      const date = String(data.get("date") || "");
      const cat = String(data.get("cat") || "");
      if (!desc) { ui.expenseError = "Describe the expense."; render(); return; }
      if (!Number.isFinite(amount) || amount <= 0) { ui.expenseError = "Enter an amount above $0."; render(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !categoryById(cat)) { ui.expenseError = "Pick a valid date and category."; render(); return; }
      state.transactions.push({ date, desc, cat, amount });
      ui.expenseError = "";
      render();
    } else if (form.id === "add-goal-form") {
      const name = String(data.get("name") || "").trim();
      const target = roundCents(Number(data.get("target")));
      const saved = roundCents(Number(data.get("saved") || 0));
      if (!name) { ui.goalError = "Give the goal a name."; render(); return; }
      if (!Number.isFinite(target) || target <= 0) { ui.goalError = "Enter a target above $0."; render(); return; }
      if (!Number.isFinite(saved) || saved < 0) { ui.goalError = "Already-saved cannot be below $0."; render(); return; }
      state.goals.push({ id: slug(name), name, saved: Math.min(saved, target), target, note: "Added by the household." });
      ui.goalError = "";
      render();
    }
  });

  // Expense filters re-render live, without losing what was typed.
  view.addEventListener("input", (event) => {
    if (event.target.id === "expense-search") {
      state.ui.expenseSearch = event.target.value;
      const pos = event.target.selectionStart;
      render();
      const again = document.getElementById("expense-search");
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    }
  });
  view.addEventListener("change", (event) => {
    if (event.target.id === "expense-cat") {
      state.ui.expenseCat = event.target.value;
      render();
    } else if (event.target.id === "expense-sort") {
      state.ui.expenseSort = event.target.value;
      render();
    }
  });
}

window.addEventListener("hashchange", render);
bindEvents();
render();
