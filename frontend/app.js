const form = document.getElementById("form");
const input = document.getElementById("item");
const submitBtn = document.getElementById("submit");
const resultBox = document.getElementById("result");
const chartBox = document.getElementById("chart");
const chartEmpty = document.getElementById("chart-empty");

const TYPES = ["recyclable", "biodegradable", "hazardous", "general"];
const COLORS = {
  recyclable: "#2fb36d",
  biodegradable: "#8bc34a",
  hazardous: "#f2a900",
  general: "#7d8f88",
};

// How many items of each waste type were checked in this browser session.
let counts = { recyclable: 0, biodegradable: 0, hazardous: 0, general: 0 };
try {
  const saved = JSON.parse(sessionStorage.getItem("ecosortCounts") || "null");
  if (saved) counts = { ...counts, ...saved };
} catch (e) { /* storage may be unavailable; the chart still works */ }

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function row(label, value) {
  const r = el("div", "row");
  r.append(el("div", "label", label), el("div", "value", value));
  return r;
}

function renderResult(data) {
  resultBox.innerHTML = "";
  resultBox.classList.remove("hidden");

  if (!data.found) {
    resultBox.append(el("h2", null, data.item || "Item not recognised"));
    resultBox.append(el("p", null, data.message));
    resultBox.append(traceBlock(data.trace));
    return;
  }

  const head = el("div", "result-head");
  head.append(el("h2", null, data.item));
  head.append(el("span", "badge " + data.waste_type, data.waste_type));
  head.append(el("span", "source", data.source === "gemini" ? "Analyzed by Gemini AI" : "From knowledge base"));
  resultBox.append(head);

  const rows = el("div", "rows");
  rows.append(row("Category", data.category));
  rows.append(row("Waste type", data.waste_type));
  rows.append(row("Recyclable", data.recyclable ? "Yes" : "No"));
  rows.append(row("Recommended action", data.action));
  rows.append(row("Reuse idea", data.reuse_idea));
  rows.append(row("Eco tip", data.eco_tip));
  rows.append(row("Why this decision", data.explanation));
  resultBox.append(rows);

  resultBox.append(el("div", "final", "Final eco-friendly action: " + data.action));
  resultBox.append(el("p", "note", data.note));
  resultBox.append(traceBlock(data.trace));
}

function traceBlock(trace) {
  const details = el("details");
  details.append(el("summary", null, "How the AI agent decided"));
  const list = el("ol");
  (trace || []).forEach((step) => list.append(el("li", null, step)));
  details.append(list);
  return details;
}

function renderChart() {
  const total = TYPES.reduce((sum, t) => sum + counts[t], 0);
  chartBox.innerHTML = "";
  chartEmpty.classList.toggle("hidden", total > 0);
  if (total === 0) return;
  const max = Math.max(...TYPES.map((t) => counts[t]));
  TYPES.forEach((type) => {
    const col = el("div", "bar-col");
    col.append(el("div", "bar-count", String(counts[type])));
    const bar = el("div", "bar");
    bar.style.height = Math.max(4, (counts[type] / max) * 130) + "px";
    bar.style.background = COLORS[type];
    col.append(bar, el("div", "bar-label", type));
    chartBox.append(col);
  });
}

function countItem(wasteType) {
  if (!(wasteType in counts)) return;
  counts[wasteType] += 1;
  try { sessionStorage.setItem("ecosortCounts", JSON.stringify(counts)); } catch (e) { /* ignore */ }
  renderChart();
}

async function check(item) {
  submitBtn.disabled = true;
  submitBtn.textContent = "Checking...";
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    });
    if (!res.ok) throw new Error("Server error " + res.status);
    const data = await res.json();
    renderResult(data);
    if (data.found) countItem(data.waste_type);
  } catch (err) {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "";
    resultBox.append(el("p", null, "Something went wrong. Please check that the server is running and try again."));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Check item";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const item = input.value.trim();
  if (item.length >= 2) check(item);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.item;
    check(chip.dataset.item);
  });
});

renderChart();
