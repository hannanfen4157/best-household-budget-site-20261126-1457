// Homefront Budget — chart and formatting helpers.
//
// Every chart on the site is drawn here as inline SVG from the household's
// own numbers. No chart library, no canvas, no network: the SVG is built as
// a string and dropped into the page, so the numbers on screen are always
// the numbers in data.js.

// Money as "$1,234" or "$1,234.56" (cents only when they matter).
function fmtUSD(n, cents) {
  const v = Math.round(n * 100) / 100;
  const body = v.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  return "$" + body;
}

// Percent with one decimal, e.g. 24.3%.
function fmtPct(n) {
  return (Math.round(n * 10) / 10).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + "%";
}

// A short "Nov 4" date for transaction rows.
function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Donut chart of spending by category. slices: [{label, value, color}].
// Returns an SVG string; the hole carries the total in the middle.
function donutSVG(slices, size) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const hole = r * 0.62;
  let a0 = -Math.PI / 2;
  let paths = "";
  for (const s of slices) {
    if (s.value <= 0) continue;
    const frac = s.value / total;
    const a1 = a0 + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + hole * Math.cos(a1);
    const yi1 = cy + hole * Math.sin(a1);
    const xi0 = cx + hole * Math.cos(a0);
    const yi0 = cy + hole * Math.sin(a0);
    paths += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${hole} ${hole} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${s.color}"><title>${s.label}: ${fmtUSD(s.value)}</title></path>`;
    a0 = a1;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category, total ${fmtUSD(total)}">${paths}<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${fmtUSD(total)}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">spent in November</text></svg>`;
}

// Grouped bar chart: income vs spending for each month in TREND.
// Clicking a bar calls window.inspectMonth(i) (defined in main.js).
function trendSVG(months) {
  const w = 640;
  const h = 300;
  const padL = 52;
  const padB = 30;
  const padT = 14;
  const maxV = Math.max(...months.map((m) => m.income)) * 1.08;
  const innerW = w - padL - 16;
  const innerH = h - padT - padB;
  const slot = innerW / months.length;
  const bw = Math.min(30, slot * 0.32);
  let bars = "";
  let labels = "";
  months.forEach((m, i) => {
    const x = padL + i * slot + slot / 2;
    const hi = (m.income / maxV) * innerH;
    const hs = (m.spent / maxV) * innerH;
    const y = padT + innerH;
    bars += `<g class="trend-bar" data-month="${i}" tabindex="0" role="button" aria-label="${m.month}: income ${fmtUSD(m.income)}, spent ${fmtUSD(m.spent)}"><rect x="${(x - bw - 3).toFixed(1)}" y="${(y - hi).toFixed(1)}" width="${bw}" height="${hi.toFixed(1)}" rx="3" fill="#1f5138"><title>${m.month} income ${fmtUSD(m.income)}</title></rect><rect x="${(x + 3).toFixed(1)}" y="${(y - hs).toFixed(1)}" width="${bw}" height="${hs.toFixed(1)}" rx="3" fill="#d97706"><title>${m.month} spent ${fmtUSD(m.spent)}</title></rect></g>`;
    labels += `<text x="${x.toFixed(1)}" y="${h - 8}" text-anchor="middle" class="axis-label">${m.month}</text>`;
  });
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padT + innerH * (1 - f);
    const val = Math.round((maxV * f) / 100) * 100;
    return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${w - 16}" y2="${gy.toFixed(1)}" class="grid-line"/><text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" class="axis-label">${fmtUSD(val)}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="chart-svg" role="img" aria-label="Income versus spending, June to November 2026">${grid}${bars}${labels}</svg>`;
}

// A horizontal bar: value against a max, with a marker line at the plan.
// Used for budget-vs-actual rows on the dashboard and planner.
function meterSVG(value, plan, color) {
  const max = Math.max(value, plan) * 1.05;
  const vw = 100;
  const pw = (plan / max) * vw;
  const vw2 = (value / max) * vw;
  return `<svg viewBox="0 0 100 12" class="meter" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="100" height="8" rx="4" fill="#e9e2d2"/><rect x="0" y="2" width="${vw2.toFixed(1)}" height="8" rx="4" fill="${color}"/><line x1="${pw.toFixed(1)}" y1="0" x2="${pw.toFixed(1)}" y2="12" stroke="#1e2b22" stroke-width="1.6"/></svg>`;
}
