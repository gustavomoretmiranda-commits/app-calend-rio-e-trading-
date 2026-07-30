export const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const WEEKDAY_HEAD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export const PERIODS = [
  { key: "manha", label: "Manhã" },
  { key: "tarde", label: "Tarde" },
  { key: "noite", label: "Noite" },
];

export const WEEK_DAYS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function dateKey(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export function firstWeekday(y, m) {
  return new Date(y, m, 1).getDay();
}

export function fmtBRL(v) {
  const sign = v < 0 ? "-" : v > 0 ? "+" : "";
  return sign + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(value, balance) {
  if (!balance) return null;
  const pct = (value / balance) * 100;
  const sign = pct < 0 ? "-" : pct > 0 ? "+" : "";
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

export function formatDateLabel(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export const DOW_TO_KEY = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function dayOfWeekKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return DOW_TO_KEY[new Date(y, m - 1, d).getDay()];
}

export function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function mondayOfWeek(key) {
  const [y, m, d] = key.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(key, diff);
}

export function formatShortDate(key) {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}
