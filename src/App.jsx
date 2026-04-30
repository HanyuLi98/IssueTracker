import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

const ADMIN_PASSWORD = "10105zheweijunjie";
const todayStr = () => new Date().toISOString().split("T")[0];
const nowISO = () => new Date().toISOString();

const fmtDuration = (ms) => {
  if (!ms || ms <= 0) return "-";
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}天${h}时${m}分`;
  if (h > 0) return `${h}时${m}分`;
  return `${m}分`;
};

// ─── Icons ───
const I = {
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  eye: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  gear: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  globe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  download: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  migrate: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>,
  translate: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>,
  sortDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  sortUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  log: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  palette: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="10" cy="19" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.74-.39-1.01-.24-.27-.39-.62-.39-1.01A1.5 1.5 0 0 1 14.22 17H16a6 6 0 0 0 6-6c0-5.52-4.48-10-10-10z"/></svg>,
  exportAll: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>,
};

// ─── Styles ───
const S = {
  app: { fontFamily: "'Geist','Noto Sans SC',system-ui,sans-serif", background: "#09090b", color: "#e4e4e7", minHeight: "100vh" },
  card: { background: "#18181b", borderRadius: 10, border: "1px solid #27272a", padding: "18px 22px", marginBottom: 14 },
  input: { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 7, padding: "7px 11px", color: "#e4e4e7", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 },
  btnGhost: { background: "transparent", border: "1px solid #3f3f46", color: "#a1a1aa" },
  btnSm: { padding: "4px 10px", fontSize: 12 },
  tag: (status) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600,
    background: status === "已解决" ? "#16a34a18" : status === "pending" ? "#f9731618" : "#eab30818",
    color: status === "已解决" ? "#4ade80" : status === "pending" ? "#fb923c" : "#fbbf24",
    border: `1px solid ${status === "已解决" ? "#16a34a33" : status === "pending" ? "#f9731633" : "#eab30833"}` }),
  th: { padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717a", borderBottom: "1px solid #27272a", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" },
  td: { padding: "8px 10px", fontSize: 13, borderBottom: "1px solid #1e1e21", verticalAlign: "top" },
  sidebar: (on) => ({ padding: "8px 14px", borderRadius: 7, cursor: "pointer", background: on ? "#2563eb15" : "transparent", color: on ? "#60a5fa" : "#a1a1aa", fontWeight: on ? 600 : 400, fontSize: 13, marginBottom: 2, display: "flex", alignItems: "center", gap: 7 }),
  tab: (on) => ({ padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: on ? "#2563eb" : "transparent", color: on ? "#fff" : "#71717a" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" },
  modalBox: { background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 28, minWidth: 400, maxWidth: 560, width: "92%", maxHeight: "85vh", overflowY: "auto" },
  chk: (on) => ({ width: 20, height: 20, borderRadius: 5, border: `2px solid ${on ? "#16a34a" : "#3f3f46"}`, background: on ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }),
};

// ─── Column definitions ───
const COL = {
  preSales: [
    { key: "date", label: "时间", w: 110 }, { key: "customer", label: "客户名称" }, { key: "sales", label: "对应销售" },
    { key: "problem", label: "问题" }, { key: "status", label: "状态", w: 120 }, { key: "note", label: "备注" }, { key: "owners", label: "负责人" },
  ],
  midSales: [
    { key: "date", label: "日期", w: 110 }, { key: "customer", label: "客户名称" }, { key: "task_type", label: "任务类型" },
    { key: "problem", label: "问题" }, { key: "status", label: "状态", w: 120 }, { key: "note", label: "备注" }, { key: "owners", label: "负责人" },
  ],
  keyProject: [
    { key: "date", label: "时间", w: 110 }, { key: "customer", label: "客户名称" }, { key: "project_desc", label: "项目描述" },
    { key: "craft", label: "项目工艺" }, { key: "status", label: "最新状态", w: 120 }, { key: "sales", label: "对应销售" },
    { key: "requirement", label: "需求" }, { key: "owners", label: "负责人" },
  ],
  tickets: [
    { key: "date", label: "时间", w: 110 }, { key: "customer", label: "客户" }, { key: "serial_no", label: "序列号" },
    { key: "problem", label: "问题描述" }, { key: "timer", label: "计时", w: 100 }, { key: "status", label: "状态", w: 120 }, { key: "note", label: "备注" }, { key: "owners", label: "负责人" },
  ],
  warranty: [
    { key: "date", label: "时间", w: 110 }, { key: "customer", label: "客户" }, { key: "order_no", label: "售后单号" },
    { key: "serial_no", label: "序列号" }, { key: "content", label: "维修内容" }, { key: "status", label: "状态", w: 120 }, { key: "note", label: "备注" }, { key: "owners", label: "负责人" },
  ],
  paidRepair: [
    { key: "date", label: "时间", w: 110 }, { key: "customer", label: "客户" }, { key: "order_no", label: "售后单号" },
    { key: "serial_no", label: "序列号" }, { key: "content", label: "维修内容" }, { key: "problem", label: "问题描述" },
    { key: "quote", label: "报价" }, { key: "invoice", label: "Invoice" }, { key: "status", label: "状态", w: 120 }, { key: "owners", label: "负责人" },
  ],
};

// Craft presets for keyProject
const CRAFT_PRESETS = ["码垛", "焊接", "2D视觉", "3D视觉", "PLC", "上下料", "打磨", "喷涂", "装配"];

// DB field mapping (frontend key -> database column)
const dbField = (k) => k; // columns already match snake_case

// ─── Translation ───
async function translateText(text, from, to) {
  if (!text?.trim()) return "";
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const d = await r.json();
    return d?.responseData?.translatedText || text;
  } catch { return "[翻译失败]"; }
}

// ─── CSV Export ───
function exportCSV(rows, columns, filename) {
  const header = columns.map(c => c.label).join(",");
  const body = rows.map(r => columns.map(c => {
    let v = c.key === "owners" ? (r.owners || []).join("; ") : (r[c.key] || "");
    if (c.key === "timer") v = r.status === "已解决" && r.resolved_at && r.created_at ? fmtDuration(new Date(r.resolved_at) - new Date(r.created_at)) : (r.created_at ? "进行中" : "-");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

// ─── Get current week range (Mon-Sun) ───
function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toISOString().split("T")[0];
  return { start: fmt(mon), end: fmt(sun), label: `${fmt(mon)}_${fmt(sun)}` };
}

// ─── Export weekly report with scope ───
function exportWeeklyReport(tasks, engineers, filterScope, scopeLabel) {
  const week = getWeekRange();
  const cats = [
    { key: "preSales", label: "售前咨询", cols: COL.preSales },
    { key: "midSales", label: "售中任务", cols: COL.midSales },
    { key: "tickets", label: "Ticket", cols: COL.tickets },
    { key: "warranty", label: "质保内维修", cols: COL.warranty },
    { key: "paidRepair", label: "付费维修", cols: COL.paidRepair },
    { key: "keyProject", label: "Key Project", cols: COL.keyProject },
  ];
  let csv = "\uFEFF";
  csv += `周报 ${week.start} ~ ${week.end}\n`;
  csv += `范围: ${scopeLabel}\n\n`;
  cats.forEach(cat => {
    const all = tasks.filter(t => t.category === cat.key);
    const filtered = filterScope(all);
    const rows = filtered.filter(r => r.date >= week.start && r.date <= week.end);
    csv += `=== ${cat.label} (${rows.length}条) ===\n`;
    csv += cat.cols.map(c => c.label).join(",") + "\n";
    rows.forEach(r => {
      csv += cat.cols.map(c => {
        let v = c.key === "owners" ? (r.owners || []).join("; ") : (r[c.key] || "");
        if (c.key === "timer") v = r.status === "已解决" && r.resolved_at && r.created_at ? fmtDuration(new Date(r.resolved_at) - new Date(r.created_at)) : (r.created_at ? "进行中" : "-");
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",") + "\n";
    });
    csv += "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `周报_${scopeLabel}_${week.label}.csv`; a.click();
}

// ─── PDF Export (generates printable HTML) ───
function exportWeeklyPDF(tasks, engineers, filterFn, scopeLabel) {
  const week = getWeekRange();
  const cats = [
    { key: "preSales", label: "售前咨询", cols: COL.preSales },
    { key: "midSales", label: "售中任务", cols: COL.midSales },
    { key: "tickets", label: "Ticket", cols: COL.tickets },
    { key: "warranty", label: "质保内维修", cols: COL.warranty },
    { key: "paidRepair", label: "付费维修", cols: COL.paidRepair },
    { key: "keyProject", label: "Key Project", cols: COL.keyProject },
  ];
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>周报 ${scopeLabel}</title><style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: 'Microsoft YaHei','Noto Sans SC',Arial,sans-serif; color: #1a1a1a; font-size: 11px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
    .header h1 { font-size: 22px; color: #2563eb; margin: 0 0 4px 0; }
    .header p { font-size: 13px; color: #666; margin: 0; }
    .section { margin-bottom: 18px; page-break-inside: avoid; }
    .section h2 { font-size: 14px; color: #fff; background: #2563eb; padding: 6px 14px; border-radius: 6px; margin: 0 0 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    th { background: #f0f4ff; color: #2563eb; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 8px; text-align: left; border: 1px solid #d0d7e8; }
    td { padding: 5px 8px; border: 1px solid #e0e4ec; font-size: 11px; vertical-align: top; }
    tr:nth-child(even) { background: #f8f9fc; }
    .resolved { color: #16a34a; font-weight: 600; }
    .ongoing { color: #d97706; font-weight: 600; }
    .empty { color: #999; text-align: center; padding: 16px; font-style: italic; }
    .stats { display: flex; gap: 12px; margin-bottom: 16px; }
    .stat-box { background: #f0f4ff; border: 1px solid #d0d7e8; border-radius: 8px; padding: 10px 16px; text-align: center; flex: 1; }
    .stat-num { font-size: 22px; font-weight: 700; color: #2563eb; }
    .stat-label { font-size: 10px; color: #666; }
    .footer { text-align: center; color: #999; font-size: 10px; margin-top: 20px; border-top: 1px solid #e0e4ec; padding-top: 8px; }
  </style></head><body>`;
  html += `<div class="header"><h1>⚙️ AE 周报</h1><p>${week.start} ~ ${week.end} · ${scopeLabel}</p></div>`;
  // Stats
  html += `<div class="stats">`;
  cats.forEach(cat => {
    const rows = filterFn(tasks.filter(t => t.category === cat.key)).filter(r => r.date >= week.start && r.date <= week.end);
    html += `<div class="stat-box"><div class="stat-num">${rows.length}</div><div class="stat-label">${cat.label}</div></div>`;
  });
  html += `</div>`;
  cats.forEach(cat => {
    const rows = filterFn(tasks.filter(t => t.category === cat.key)).filter(r => r.date >= week.start && r.date <= week.end);
    html += `<div class="section"><h2>${cat.label} (${rows.length})</h2>`;
    if (rows.length === 0) { html += `<div class="empty">本周无记录</div>`; }
    else {
      html += `<table><tr>${cat.cols.filter(c => c.key !== "timer").map(c => `<th>${c.label}</th>`).join("")}</tr>`;
      rows.forEach(r => {
        html += `<tr>${cat.cols.filter(c => c.key !== "timer").map(c => {
          let v = c.key === "owners" ? (r.owners || []).join(", ") : (r[c.key] || "-");
          if (c.key === "status") v = `<span class="${r.status === "已解决" ? "resolved" : "ongoing"}">${r.status === "已解决" ? "✓ 已解决" : "● Ongoing"}</span>`;
          return `<td>${v}</td>`;
        }).join("")}</tr>`;
      });
      html += `</table>`;
    }
    html += `</div>`;
  });
  html += `<div class="footer">生成时间: ${new Date().toLocaleString("zh-CN")} · AE 任务管理平台</div>`;
  html += `</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

// ─── Export Modal ───
function ExportModal({ tasks, engineers, regions, currentUser, isAdmin, onClose }) {
  const [scope, setScope] = useState("current");
  const [selEng, setSelEng] = useState("");
  const [selReg, setSelReg] = useState("");
  const [fmt, setFmt] = useState("pdf");
  const week = getWeekRange();

  const doExport = () => {
    let filterFn, label;
    if (scope === "current") {
      label = currentUser;
      filterFn = (rows) => rows.filter(t => (t.owners || []).includes(currentUser));
    } else if (scope === "engineer") {
      label = selEng;
      filterFn = (rows) => rows.filter(t => (t.owners || []).includes(selEng));
    } else if (scope === "region") {
      const names = engineers.filter(e => e.region === selReg).map(e => e.name);
      label = `区域_${selReg}`;
      filterFn = (rows) => rows.filter(t => (t.owners || []).some(o => names.includes(o)));
    } else {
      label = "全部";
      filterFn = (rows) => rows;
    }
    if (fmt === "pdf") exportWeeklyPDF(tasks, engineers, filterFn, label);
    else exportWeeklyReport(tasks, engineers, filterFn, label);
    onClose();
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, fontSize: 17, color: "#fff", marginBottom: 6 }}>导出周报</h3>
        <p style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 16 }}>本周范围: {week.start} ~ {week.end}（周一至周日）</p>

        {/* Format toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button style={{ ...S.btn, ...(fmt === "pdf" ? { background: "#7c3aed" } : S.btnGhost), fontSize: 12 }} onClick={() => setFmt("pdf")}>📄 PDF（打印）</button>
          <button style={{ ...S.btn, ...(fmt === "csv" ? { background: "#7c3aed" } : S.btnGhost), fontSize: 12 }} onClick={() => setFmt("csv")}>📊 CSV（Excel）</button>
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", borderRadius: 7, background: scope === "current" ? "#2563eb12" : "#27272a", border: `1px solid ${scope === "current" ? "#2563eb44" : "#3f3f46"}` }}
            onClick={() => setScope("current")}>
            <div style={S.chk(scope === "current")}>{scope === "current" && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
            <div><div style={{ fontSize: 13, color: "#e4e4e7" }}>我的周报</div><div style={{ fontSize: 11, color: "#71717a" }}>导出 {currentUser} 的数据</div></div>
          </label>

          {isAdmin && (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", borderRadius: 7, background: scope === "engineer" ? "#2563eb12" : "#27272a", border: `1px solid ${scope === "engineer" ? "#2563eb44" : "#3f3f46"}` }}
                onClick={() => setScope("engineer")}>
                <div style={S.chk(scope === "engineer")}>{scope === "engineer" && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#e4e4e7" }}>按工程师</div>
                  {scope === "engineer" && (
                    <select style={{ ...S.input, marginTop: 6, width: "100%" }} value={selEng} onChange={e => setSelEng(e.target.value)} onClick={e => e.stopPropagation()}>
                      <option value="">选择工程师</option>
                      {engineers.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </select>
                  )}
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", borderRadius: 7, background: scope === "region" ? "#2563eb12" : "#27272a", border: `1px solid ${scope === "region" ? "#2563eb44" : "#3f3f46"}` }}
                onClick={() => setScope("region")}>
                <div style={S.chk(scope === "region")}>{scope === "region" && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#e4e4e7" }}>按区域</div>
                  {scope === "region" && (
                    <select style={{ ...S.input, marginTop: 6, width: "100%" }} value={selReg} onChange={e => setSelReg(e.target.value)} onClick={e => e.stopPropagation()}>
                      <option value="">选择区域</option>
                      {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  )}
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", borderRadius: 7, background: scope === "all" ? "#2563eb12" : "#27272a", border: `1px solid ${scope === "all" ? "#2563eb44" : "#3f3f46"}` }}
                onClick={() => setScope("all")}>
                <div style={S.chk(scope === "all")}>{scope === "all" && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
                <div><div style={{ fontSize: 13, color: "#e4e4e7" }}>全部数据</div><div style={{ fontSize: 11, color: "#71717a" }}>导出所有人的周报</div></div>
              </label>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={{ ...S.btn, ...S.btnGhost }} onClick={onClose}>取消</button>
          <button style={{ ...S.btn, background: "#7c3aed" }}
            disabled={(scope === "engineer" && !selEng) || (scope === "region" && !selReg)}
            onClick={doExport}>{I.exportAll} 导出{fmt === "pdf" ? " PDF" : " CSV"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Multi-owner selector ───
function OwnerSelect({ value = [], engineers, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => { const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ ...S.input, cursor: "pointer", minHeight: 32, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }} onClick={() => setOpen(!open)}>
        {value.length === 0 && <span style={{ color: "#71717a" }}>选择负责人...</span>}
        {value.map(n => <span key={n} style={{ background: "#2563eb22", color: "#60a5fa", padding: "1px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{n}</span>)}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#27272a", border: "1px solid #3f3f46", borderRadius: 7, marginTop: 4, zIndex: 50, maxHeight: 180, overflowY: "auto" }}>
          {engineers.map(e => (
            <div key={e.id} style={{ padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: value.includes(e.name) ? "#60a5fa" : "#d4d4d8", background: value.includes(e.name) ? "#2563eb12" : "transparent" }}
              onClick={() => onChange(value.includes(e.name) ? value.filter(n => n !== e.name) : [...value, e.name])}>
              <div style={S.chk(value.includes(e.name))}>{value.includes(e.name) && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
              {e.name} <span style={{ marginLeft: "auto", fontSize: 11, color: "#52525b" }}>{e.region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Translate Button ───
function TranslateBtn({ text }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dir, setDir] = useState("zh2en");
  const doIt = async () => { setLoading(true); const [f, t] = dir === "zh2en" ? ["zh", "en"] : ["en", "zh"]; setResult(await translateText(text, f, t)); setLoading(false); };
  if (!text) return null;
  return (
    <span style={{ position: "relative" }}>
      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, gap: 3, color: "#818cf8" }} onClick={doIt} title="翻译">{loading ? "..." : I.translate}</button>
      {result && (
        <div style={{ position: "absolute", bottom: "110%", left: 0, background: "#27272a", border: "1px solid #3f3f46", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#e4e4e7", zIndex: 100, minWidth: 200, maxWidth: 350, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#818cf8", fontWeight: 600, fontSize: 11 }}>{dir === "zh2en" ? "中→英" : "英→中"}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: 11, textDecoration: "underline" }} onClick={() => { setDir(d => d === "zh2en" ? "en2zh" : "zh2en"); setResult(null); }}>切换</button>
              <button style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: 11 }} onClick={() => setResult(null)}>✕</button>
            </div>
          </div>
          {result}
        </div>
      )}
    </span>
  );
}

// ─── Live Timer ───
function LiveTimer({ createdAt }) {
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 60000); return () => clearInterval(iv); }, []);
  return <span style={{ color: "#fbbf24", fontFamily: "monospace", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 3 }}>{I.clock} {fmtDuration(Date.now() - new Date(createdAt).getTime())}</span>;
}

// ─── Delete Confirm Modal ───
function DeleteConfirm({ item, onConfirm, onClose }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, fontSize: 17, color: "#f87171", marginBottom: 10 }}>确认删除</h3>
        <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>确定要删除以下记录吗？此操作不可恢复。</p>
        <div style={{ ...S.card, background: "#27272a", fontSize: 13, marginBottom: 16 }}>
          {item.customer && <div><b style={{ color: "#71717a" }}>客户: </b>{item.customer}</div>}
          {item.problem && <div><b style={{ color: "#71717a" }}>问题: </b>{item.problem}</div>}
          {item.content && <div><b style={{ color: "#71717a" }}>内容: </b>{item.content}</div>}
          <div><b style={{ color: "#71717a" }}>日期: </b>{item.date || "-"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={{ ...S.btn, ...S.btnGhost }} onClick={onClose}>取消</button>
          <button style={{ ...S.btn, background: "#dc2626" }} onClick={() => { onConfirm(item.id); onClose(); }}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Table ───
function TaskTable({ cat, columns, data, onUpdate, onDelete, onAdd, engineers, onMigrate, onPin, hideResolved, setHideResolved, sortState, onSort }) {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [inlineEdit, setInlineEdit] = useState(null); // { rowId, key }
  const [inlineValue, setInlineValue] = useState("");
  const inlineRef = useRef();
  const fileFields = cat === "paidRepair" ? ["invoice"] : [];

  // Handle inline edit save
  const saveInline = (row) => {
    if (inlineEdit && inlineValue !== (row[inlineEdit.key] || "")) {
      onUpdate({ ...row, [inlineEdit.key]: inlineValue });
    }
    setInlineEdit(null);
  };

  // Editable text fields (double-click to edit)
  const editableFields = ["customer", "problem", "content", "note", "serial_no", "order_no", "sales", "quote", "project_desc", "requirement", "craft"];

  let sorted = [...data];
  const sf = sortState?.field, sd = sortState?.dir;
  if (sf) {
    sorted.sort((a, b) => {
      let va = a[sf] || "", vb = b[sf] || "";
      if (sf === "status") { va = va === "已解决" ? 0 : 1; vb = vb === "已解决" ? 0 : 1; }
      if (sf === "owners") { va = (a.owners || []).join(","); vb = (b.owners || []).join(","); }
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sd === "asc" ? 1 : -1);
    });
  }
  // Pinned items always on top
  sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  // Search filter
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    sorted = sorted.filter(r => columns.some(c => {
      if (c.key === "owners") return (r.owners || []).some(o => o.toLowerCase().includes(q));
      return String(r[c.key] || "").toLowerCase().includes(q);
    }));
  }
  if (hideResolved) sorted = sorted.filter(r => r.status !== "已解决");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={S.btn} onClick={onAdd}>{I.plus} 新增记录</button>
        <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setHideResolved(!hideResolved)}>{hideResolved ? I.eye : I.eyeOff} {hideResolved ? "显示已解决" : "隐藏已解决"}</button>
        <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => exportCSV(sorted, columns, `${cat}_${todayStr()}.csv`)}>{I.download} 导出CSV</button>
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <input style={{ ...S.input, width: 200, paddingLeft: 30 }} placeholder="搜索客户/问题/序列号..." value={searchText} onChange={e => setSearchText(e.target.value)} />
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#71717a" }}>{I.search}</span>
        </div>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #27272a" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead><tr>
            {columns.map(c => (
              <th key={c.key} style={{ ...S.th, width: c.w || "auto" }} onClick={() => c.key !== "timer" && onSort(c.key)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{c.label} {sf === c.key && (sd === "asc" ? I.sortUp : I.sortDown)}</span>
              </th>
            ))}
            <th style={S.th}>操作</th>
          </tr></thead>
          <tbody>
            {sorted.length === 0 && <tr><td colSpan={columns.length + 1} style={{ ...S.td, textAlign: "center", color: "#52525b", padding: 28 }}>暂无记录</td></tr>}
            {sorted.map(row => (
              <tr key={row.id} style={{ background: row.pinned ? "#2563eb08" : row.status === "已解决" ? "#16a34a06" : "transparent", borderLeft: row.pinned ? "3px solid #2563eb" : "3px solid transparent" }}>
                {columns.map(c => (
                  <td key={c.key} style={S.td}>
                    {editId === row.id ? (
                      c.key === "status" ? <select style={{ ...S.input, width: 110 }} value={editData.status || "ongoing"} onChange={e => setEditData({ ...editData, status: e.target.value })}><option value="ongoing">Ongoing</option><option value="pending">Pending</option><option value="已解决">已解决</option></select>
                      : c.key === "owners" ? <OwnerSelect value={editData.owners || []} engineers={engineers} onChange={v => setEditData({ ...editData, owners: v })} />
                      : c.key === "date" ? <input type="date" style={{ ...S.input, width: 130 }} value={editData.date || ""} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                      : c.key === "timer" ? <span style={{ color: "#71717a", fontSize: 12 }}>自动</span>
                      : fileFields.includes(c.key) ? <label style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, cursor: "pointer" }}>{I.upload} PDF<input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { if (e.target.files[0]) { const f = e.target.files[0]; const fname = `${Date.now()}_${f.name}`; await supabase.storage.from("invoices").upload(fname, f); setEditData({ ...editData, [c.key]: fname }); } }} /></label>
                      : <input style={S.input} value={editData[c.key] || ""} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} />
                    ) : (
                      c.key === "status" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={S.chk(row.status === "已解决")} onClick={() => {
                            const cycle = { "ongoing": "pending", "pending": "已解决", "已解决": "ongoing" };
                            const ns = cycle[row.status] || "ongoing";
                            onUpdate({ ...row, status: ns, resolved_at: ns === "已解决" ? nowISO() : null });
                          }}>{row.status === "已解决" && <span style={{ color: "#fff" }}>{I.check}</span>}</div>
                          <span style={S.tag(row.status)}>{row.status === "已解决" ? "已解决" : row.status === "pending" ? "Pending" : "Ongoing"}</span>
                        </div>
                      ) : c.key === "owners" ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {(row.owners || []).map(n => <span key={n} style={{ background: "#2563eb18", color: "#60a5fa", padding: "1px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{n}</span>)}
                          {(!row.owners || !row.owners.length) && <span style={{ color: "#52525b" }}>-</span>}
                        </div>
                      ) : c.key === "timer" ? (
                        row.status === "已解决" && row.resolved_at && row.created_at ? <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 3 }}>{I.clock} {fmtDuration(new Date(row.resolved_at) - new Date(row.created_at))}</span>
                        : row.created_at ? <LiveTimer createdAt={row.created_at} /> : <span style={{ color: "#52525b" }}>-</span>
                      ) : fileFields.includes(c.key) ? (
                        row[c.key] ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <a href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${row[c.key]}`} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>{I.download} {row[c.key].length > 25 ? row[c.key].slice(0, 22) + "..." : row[c.key]}</a>
                          </div>
                        ) : <span style={{ color: "#52525b" }}>-</span>
                      ) : (
                        editableFields.includes(c.key) && inlineEdit?.rowId === row.id && inlineEdit?.key === c.key ? (
                          <input ref={inlineRef} style={{ ...S.input, fontSize: 13 }} value={inlineValue} autoFocus
                            onChange={e => setInlineValue(e.target.value)}
                            onBlur={() => saveInline(row)}
                            onKeyDown={e => { if (e.key === "Enter") saveInline(row); if (e.key === "Escape") setInlineEdit(null); }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: editableFields.includes(c.key) ? "text" : "default", minHeight: 20, padding: "1px 2px", borderRadius: 4, transition: "background 0.1s" }}
                            onDoubleClick={() => { if (editableFields.includes(c.key)) { setInlineEdit({ rowId: row.id, key: c.key }); setInlineValue(row[c.key] || ""); } }}
                            title={editableFields.includes(c.key) ? "双击编辑" : ""}>
                            <span style={{ color: c.key === "date" ? "#a1a1aa" : "#e4e4e7" }}>{row[c.key] || "-"}</span>
                            {(c.key === "problem" || c.key === "content" || c.key === "note") && row[c.key] && <TranslateBtn text={row[c.key]} />}
                          </div>
                        )
                      )
                    )}
                  </td>
                ))}
                <td style={S.td}>
                  {editId === row.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ ...S.btn, ...S.btnSm }} onClick={() => { onUpdate(editData); setEditId(null); }}>保存</button>
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => setEditId(null)}>取消</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 3 }}>
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: row.pinned ? "#fbbf24" : "#71717a" }} onClick={() => onPin(row)} title={row.pinned ? "取消置顶" : "置顶"}>{I.pin}</button>
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => { setEditId(row.id); setEditData({ ...row }); }} title="编辑">{I.edit}</button>
                      {cat === "tickets" && onMigrate && <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: "#818cf8" }} onClick={() => onMigrate(row)} title="迁移">{I.migrate}</button>}
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: "#f87171" }} onClick={() => setDeleteItem(row)} title="删除">{I.trash}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteItem && <DeleteConfirm item={deleteItem} onConfirm={onDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

// ─── Add Modal ───
function AddModal({ cat, columns, onSave, onClose, defaultOwners, engineers }) {
  const init = {};
  columns.forEach(c => { init[c.key] = c.key === "date" ? todayStr() : c.key === "status" ? "ongoing" : c.key === "owners" ? (defaultOwners || []) : ""; });
  const [data, setData] = useState(init);
  const [customCraft, setCustomCraft] = useState(false);
  const fileFields = cat === "paidRepair" ? ["invoice"] : [];
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, fontSize: 17, color: "#fff", marginBottom: 18 }}>新增记录</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {columns.filter(c => c.key !== "timer").map(c => (
            <div key={c.key}>
              <label style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 3, display: "block", fontWeight: 600 }}>{c.label}</label>
              {c.key === "status" ? <select style={S.input} value={data.status} onChange={e => setData({ ...data, status: e.target.value })}><option value="ongoing">Ongoing</option><option value="pending">Pending</option><option value="已解决">已解决</option></select>
              : c.key === "owners" ? <OwnerSelect value={data.owners || []} engineers={engineers} onChange={v => setData({ ...data, owners: v })} />
              : c.key === "date" ? <input type="date" style={S.input} value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
              : fileFields.includes(c.key) ? <div><label style={{ ...S.btn, ...S.btnGhost, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>{I.upload} 上传PDF<input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { if (e.target.files[0]) { const f = e.target.files[0]; const fname = `${Date.now()}_${f.name}`; await supabase.storage.from("invoices").upload(fname, f); setData({ ...data, [c.key]: fname }); } }} /></label>{data[c.key] && <span style={{ marginLeft: 8, fontSize: 12, color: "#818cf8" }}>✓ {data[c.key].length > 20 ? data[c.key].slice(0, 17) + "..." : data[c.key]}</span>}</div>
              : c.key === "task_type" ? <select style={S.input} value={data.task_type || ""} onChange={e => setData({ ...data, task_type: e.target.value })}><option value="">选择类型...</option><option value="程序开发">程序开发</option><option value="仿真">仿真</option><option value="安装对接">安装对接</option><option value="培训">培训</option><option value="验收">验收</option><option value="其他">其他</option></select>
              : c.key === "craft" ? (
                <div>
                  {!customCraft ? (
                    <div>
                      <select style={S.input} value={data.craft || ""} onChange={e => setData({ ...data, craft: e.target.value })}>
                        <option value="">选择工艺...</option>
                        {CRAFT_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, marginTop: 6 }} onClick={() => setCustomCraft(true)}>+ 自定义工艺</button>
                    </div>
                  ) : (
                    <div>
                      <input style={S.input} value={data.craft || ""} onChange={e => setData({ ...data, craft: e.target.value })} placeholder="输入自定义工艺" />
                      <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, marginTop: 6 }} onClick={() => setCustomCraft(false)}>返回预设</button>
                    </div>
                  )}
                </div>
              )
              : <input style={S.input} value={data[c.key] || ""} onChange={e => setData({ ...data, [c.key]: e.target.value })} placeholder={c.label} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button style={{ ...S.btn, ...S.btnGhost }} onClick={onClose}>取消</button>
          <button style={S.btn} onClick={() => { onSave(data); onClose(); }}>保存</button>
        </div>
      </div>
    </div>
  );
}

// ─── Migrate Modal ───
function MigrateModal({ ticket, onMigrate, onClose }) {
  const [target, setTarget] = useState("warranty");
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, fontSize: 17, color: "#fff", marginBottom: 6 }}>迁移 Ticket</h3>
        <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 16 }}>将「{ticket.customer} - {ticket.problem}」迁移到：</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button style={S.tab(target === "warranty")} onClick={() => setTarget("warranty")}>质保内维修</button>
          <button style={S.tab(target === "paidRepair")} onClick={() => setTarget("paidRepair")}>付费维修</button>
        </div>
        <div style={{ ...S.card, background: "#27272a", fontSize: 13 }}>
          <div style={{ marginBottom: 4 }}><b style={{ color: "#a1a1aa" }}>客户：</b>{ticket.customer || "-"}</div>
          <div style={{ marginBottom: 4 }}><b style={{ color: "#a1a1aa" }}>序列号：</b>{ticket.serial_no || "-"}</div>
          <div style={{ marginBottom: 4 }}><b style={{ color: "#a1a1aa" }}>问题：</b>{ticket.problem || "-"}</div>
          <div><b style={{ color: "#a1a1aa" }}>负责人：</b>{(ticket.owners || []).join(", ") || "-"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button style={{ ...S.btn, ...S.btnGhost }} onClick={onClose}>取消</button>
          <button style={{ ...S.btn, background: "#7c3aed" }} onClick={() => { onMigrate(ticket, target); onClose(); }}>{I.migrate} 确认迁移</button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ───
function AdminPanel({ engineers, regions, onSaveEng, onSaveReg, onDeleteEng, onDeleteReg, onAddEng, onAddReg, onAssign, onBack }) {
  const [ne, setNe] = useState("");
  const [nr, setNr] = useState("");
  const [aEng, setAEng] = useState("");
  const [aReg, setAReg] = useState("");
  return (
    <div style={{ padding: 28, maxWidth: 820, margin: "0 auto" }}>
      <button style={{ ...S.btn, ...S.btnGhost, marginBottom: 20 }} onClick={onBack}>{I.back} 返回</button>
      <h2 style={{ fontSize: 22, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>{I.gear} 管理员设置</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <h3 style={{ marginTop: 0, fontSize: 15, color: "#60a5fa", marginBottom: 12 }}>{I.user} 工程师管理</h3>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input style={S.input} placeholder="工程师姓名" value={ne} onChange={e => setNe(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ne.trim()) { onAddEng(ne.trim()); setNe(""); } }} />
            <button style={{ ...S.btn, whiteSpace: "nowrap" }} onClick={() => { if (ne.trim()) { onAddEng(ne.trim()); setNe(""); } }}>{I.plus}</button>
          </div>
          {engineers.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, background: "#27272a", marginBottom: 4, fontSize: 13 }}>
              <span>{e.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>{e.region || "未分配"}</span>
                <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: "#f87171", padding: "2px 6px" }} onClick={() => onDeleteEng(e.id)}>{I.trash}</button>
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ marginTop: 0, fontSize: 15, color: "#fbbf24", marginBottom: 12 }}>{I.globe} 区域管理</h3>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input style={S.input} placeholder="区域名称" value={nr} onChange={e => setNr(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && nr.trim()) { onAddReg(nr.trim()); setNr(""); } }} />
            <button style={{ ...S.btn, whiteSpace: "nowrap" }} onClick={() => { if (nr.trim()) { onAddReg(nr.trim()); setNr(""); } }}>{I.plus}</button>
          </div>
          {regions.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, background: "#27272a", marginBottom: 4, fontSize: 13 }}>
              <span>{r.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>{engineers.filter(e => e.region === r.name).map(e => e.name).join(", ") || "无"}</span>
                <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: "#f87171", padding: "2px 6px" }} onClick={() => onDeleteReg(r.id)}>{I.trash}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...S.card, marginTop: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 15, color: "#4ade80", marginBottom: 12 }}>分配工程师到区域</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div><label style={{ fontSize: 11, color: "#a1a1aa", display: "block", marginBottom: 3 }}>工程师</label><select style={{ ...S.input, width: 170 }} value={aEng} onChange={e => setAEng(e.target.value)}><option value="">选择</option>{engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
          <div><label style={{ fontSize: 11, color: "#a1a1aa", display: "block", marginBottom: 3 }}>区域</label><select style={{ ...S.input, width: 170 }} value={aReg} onChange={e => setAReg(e.target.value)}><option value="">选择</option>{regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
          <button style={S.btn} onClick={() => { if (aEng && aReg) { onAssign(aEng, aReg); setAEng(""); setAReg(""); } }}>分配</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════
// ─── MAIN APP ───
// ═══════════════════════════════
export default function App() {
  const [engineers, setEngineers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem("ae_user")); } catch { return null; } });
  const [view, setView] = useState(currentUser ? "main" : "login");
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminPwdErr, setAdminPwdErr] = useState(false);

  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [activeTab, setActiveTab] = useState("preSales");
  const [activeSubTab, setActiveSubTab] = useState("tickets");
  const [showAdd, setShowAdd] = useState(null);
  const [hideResolved, setHideResolved] = useState({});
  const [sortState, setSortState] = useState({});
  const [migrateTicket, setMigrateTicket] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => { try { return JSON.parse(localStorage.getItem("ae_admin")) === true; } catch { return false; } });
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ae_theme")) || { bg: "dark", fontSize: 13 }; }
    catch { return { bg: "dark", fontSize: 13 }; }
  });
  const saveTheme = (t) => { setTheme(t); localStorage.setItem("ae_theme", JSON.stringify(t)); };

  // ─── Fetch all data from Supabase ───
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [engRes, regRes, taskRes] = await Promise.all([
      supabase.from("engineers").select("*").order("created_at"),
      supabase.from("regions").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    ]);
    setEngineers(engRes.data || []);
    setRegions(regRes.data || []);
    setTasks(taskRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-select engineer on login
  useEffect(() => {
    if (currentUser && engineers.length && !selectedEngineer && !selectedRegion) {
      const eng = engineers.find(e => e.name === currentUser);
      if (eng) setSelectedEngineer(eng.id);
    }
  }, [currentUser, engineers]);

  // ─── Audit log helper ───
  const logAction = async (action, category, target, detail) => {
    await supabase.from("audit_logs").insert({ user_name: currentUser || "unknown", action, category, target, detail });
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
    setLogs(data || []);
    setShowLogs(true);
  };

  // ─── Supabase CRUD helpers ───
  const addEng = async (name) => { await supabase.from("engineers").insert({ name, region: "" }); logAction("创建工程师", "", name, ""); fetchAll(); };
  const delEng = async (id) => { const e = engineers.find(x => x.id === id); await supabase.from("engineers").delete().eq("id", id); logAction("删除工程师", "", e?.name || "", ""); fetchAll(); };
  const assignEng = async (id, region) => { const e = engineers.find(x => x.id === id); await supabase.from("engineers").update({ region }).eq("id", id); logAction("分配区域", "", e?.name || "", `→ ${region}`); fetchAll(); };
  const addReg = async (name) => { await supabase.from("regions").insert({ name }); logAction("创建区域", "", name, ""); fetchAll(); };
  const delReg = async (id) => { const r = regions.find(x => x.id === id); await supabase.from("regions").delete().eq("id", id); logAction("删除区域", "", r?.name || "", ""); fetchAll(); };

  const addTask = async (cat, data) => {
    const row = { category: cat, date: data.date || todayStr(), customer: data.customer || "", sales: data.sales || "", problem: data.problem || "", status: data.status || "ongoing", note: data.note || "", owners: data.owners || [], serial_no: data.serial_no || "", order_no: data.order_no || "", content: data.content || "", task_type: data.task_type || "", quote: data.quote || "", invoice: data.invoice || "", project_desc: data.project_desc || "", craft: data.craft || "", requirement: data.requirement || "" };
    await supabase.from("tasks").insert(row);
    logAction("新增", cat, data.customer || "", data.problem || data.content || "");
    fetchAll();
  };

  const updateTask = async (row) => {
    const { id, created_at, ...updates } = row;
    await supabase.from("tasks").update(updates).eq("id", id);
    logAction("更新", row.category || "", row.customer || "", row.status === "已解决" ? "标记已解决" : "编辑记录");
    fetchAll();
  };

  const deleteTask = async (id) => {
    const t = tasks.find(x => x.id === id);
    await supabase.from("tasks").delete().eq("id", id);
    logAction("删除", t?.category || "", t?.customer || "", t?.problem || "");
    fetchAll();
  };

  const pinTask = async (row) => {
    await supabase.from("tasks").update({ pinned: !row.pinned }).eq("id", row.id);
    logAction(row.pinned ? "取消置顶" : "置顶", row.category, row.customer || "", "");
    fetchAll();
  };

  const handleMigrate = async (ticket, target) => {
    await addTask(target, { date: todayStr(), customer: ticket.customer, serial_no: ticket.serial_no, content: ticket.problem, problem: ticket.problem, status: "ongoing", note: `从Ticket迁移 (${ticket.date || ""})`, owners: ticket.owners, order_no: "", quote: "", invoice: "" });
    logAction("迁移Ticket", target, ticket.customer || "", `→ ${target === "warranty" ? "质保维修" : "付费维修"}`);
  };

  // ─── Filtering ───
  const getFiltered = (cat) => {
    const all = tasks.filter(t => t.category === cat);
    if (selectedRegion) {
      const names = engineers.filter(e => e.region === selectedRegion).map(e => e.name);
      return all.filter(t => (t.owners || []).some(o => names.includes(o)));
    }
    if (selectedEngineer) {
      const eng = engineers.find(e => e.id === selectedEngineer);
      return eng ? all.filter(t => (t.owners || []).includes(eng.name)) : [];
    }
    return all;
  };

  const handleSort = (cat, f) => { const c = sortState[cat]; setSortState({ ...sortState, [cat]: { field: f, dir: c?.field === f && c?.dir === "asc" ? "desc" : "asc" } }); };
  const defOwners = selectedEngineer ? [engineers.find(e => e.id === selectedEngineer)?.name].filter(Boolean) : (currentUser && currentUser !== "__admin__" ? [currentUser] : []);
  const cnt = (cat) => getFiltered(cat).length;
  const cntOn = (cat) => getFiltered(cat).filter(t => t.status !== "已解决").length;
  const avgTime = () => {
    const r = getFiltered("tickets").filter(t => t.status === "已解决" && t.resolved_at && t.created_at);
    if (!r.length) return "-";
    return fmtDuration(r.reduce((s, t) => s + (new Date(t.resolved_at) - new Date(t.created_at)), 0) / r.length);
  };

  const handleLogin = async () => {
    const name = loginName.trim();
    if (!name) { setLoginError("请输入姓名"); return; }
    // Fetch fresh engineers
    const { data } = await supabase.from("engineers").select("*");
    const eng = (data || []).find(e => e.name.toLowerCase() === name.toLowerCase());
    if (!eng) { setLoginError("未找到该工程师，请联系管理员添加"); return; }
    setCurrentUser(eng.name); localStorage.setItem("ae_user", JSON.stringify(eng.name));
    setSelectedEngineer(eng.id); setView("main"); fetchAll();
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem("ae_user"); setIsAdmin(false); localStorage.removeItem("ae_admin"); setSelectedEngineer(null); setSelectedRegion(null); setView("login"); };

  // ─── LOGIN ───
  if (view === "login") {
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #1e1b4b33 0%, transparent 50%)" }}>
          <div style={{ textAlign: "center", maxWidth: 420, width: "90%" }}>
            <div style={{ fontSize: 42, marginBottom: 6 }}>⚙️</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Application Engineer</h1>
            <h2 style={{ fontSize: 15, fontWeight: 400, color: "#71717a", marginBottom: 36 }}>任务管理平台</h2>
            <div style={{ ...S.card, padding: 28, textAlign: "left" }}>
              <label style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600, display: "block", marginBottom: 6 }}>输入你的姓名</label>
              <input style={{ ...S.input, marginBottom: 14, fontSize: 15, padding: "10px 14px" }} placeholder="例如：hanyu" value={loginName}
                onChange={e => { setLoginName(e.target.value); setLoginError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus />
              {loginError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>{loginError}</div>}
              <button style={{ ...S.btn, width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 14 }} onClick={handleLogin}>进入</button>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button style={{ background: "none", border: "none", color: "#71717a", fontSize: 12, cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowAdminLogin(true)}>管理员登录</button>
              </div>
            </div>
          </div>
        </div>
        {showAdminLogin && (
          <div style={S.modal} onClick={() => setShowAdminLogin(false)}>
            <div style={{ ...S.modalBox, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginTop: 0, fontSize: 16, color: "#fff", marginBottom: 14 }}>管理员登录</h3>
              <input type="password" style={{ ...S.input, marginBottom: 12 }} placeholder="管理员密码" value={adminPwd}
                onChange={e => { setAdminPwd(e.target.value); setAdminPwdErr(false); }}
                onKeyDown={e => { if (e.key === "Enter") { if (adminPwd === ADMIN_PASSWORD) { setCurrentUser("__admin__"); localStorage.setItem("ae_user", JSON.stringify("__admin__")); setIsAdmin(true); localStorage.setItem("ae_admin", "true"); setView("admin"); setShowAdminLogin(false); fetchAll(); } else setAdminPwdErr(true); } }} autoFocus />
              {adminPwdErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>密码错误</div>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setShowAdminLogin(false)}>取消</button>
                <button style={S.btn} onClick={() => { if (adminPwd === ADMIN_PASSWORD) { setCurrentUser("__admin__"); localStorage.setItem("ae_user", JSON.stringify("__admin__")); setIsAdmin(true); localStorage.setItem("ae_admin", "true"); setView("admin"); setShowAdminLogin(false); fetchAll(); } else setAdminPwdErr(true); }}>登录</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ADMIN ───
  if (view === "admin") {
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <AdminPanel engineers={engineers} regions={regions} onAddEng={addEng} onDeleteEng={delEng} onAddReg={addReg} onDeleteReg={delReg} onAssign={assignEng} onBack={() => setView(currentUser && currentUser !== "__admin__" ? "main" : "login")} />
      </div>
    );
  }

  // ─── MAIN ───
  const curEng = selectedEngineer ? engineers.find(e => e.id === selectedEngineer) : null;
  const viewLabel = selectedRegion ? `区域: ${selectedRegion}` : (curEng ? `工程师: ${curEng.name}` : "全部概览");

  const renderContent = () => {
    if (activeTab === "dashboard") {
      const catDefs = [
        { key: "preSales", label: "售前咨询", clr: "#60a5fa" },
        { key: "midSales", label: "售中任务", clr: "#a78bfa" },
        { key: "keyProject", label: "Key Project", clr: "#34d399" },
        { key: "tickets", label: "Ticket", clr: "#fbbf24" },
        { key: "warranty", label: "质保维修", clr: "#fb923c" },
        { key: "paidRepair", label: "付费维修", clr: "#f87171" },
      ];
      const statusCounts = catDefs.map(c => {
        const d = getFiltered(c.key);
        return { ...c, ongoing: d.filter(t => t.status === "ongoing").length, pending: d.filter(t => t.status === "pending").length, resolved: d.filter(t => t.status === "已解决").length, total: d.length };
      });
      const maxTotal = Math.max(...statusCounts.map(s => s.total), 1);

      // Monthly trend (last 6 months)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        const label = `${d.getMonth() + 1}月`;
        months.push({ key, label });
      }
      const monthlyData = months.map(m => {
        const all = tasks.filter(t => (t.date || "").startsWith(m.key));
        return { ...m, created: all.length, resolved: all.filter(t => t.status === "已解决").length };
      });
      const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.created, m.resolved)), 1);

      // Per engineer workload
      const engLoad = engineers.map(e => {
        const all = tasks.filter(t => (t.owners || []).includes(e.name));
        return { name: e.name, total: all.length, ongoing: all.filter(t => t.status === "ongoing").length, pending: all.filter(t => t.status === "pending").length, resolved: all.filter(t => t.status === "已解决").length };
      }).filter(e => e.total > 0).sort((a, b) => b.total - a.total);
      const maxEng = Math.max(...engLoad.map(e => e.total), 1);

      return (
        <div>
          {/* Status distribution by category */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>各类别状态分布</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {statusCounts.map(s => (
                <div key={s.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: s.clr, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: "#71717a" }}>{s.total} 条</span>
                  </div>
                  <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", background: "#27272a" }}>
                    {s.resolved > 0 && <div style={{ width: `${(s.resolved / maxTotal) * 100}%`, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, minWidth: s.resolved > 0 ? 28 : 0 }}>{s.resolved}</div>}
                    {s.pending > 0 && <div style={{ width: `${(s.pending / maxTotal) * 100}%`, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, minWidth: s.pending > 0 ? 28 : 0 }}>{s.pending}</div>}
                    {s.ongoing > 0 && <div style={{ width: `${(s.ongoing / maxTotal) * 100}%`, background: s.clr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, minWidth: s.ongoing > 0 ? 28 : 0 }}>{s.ongoing}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#16a34a", display: "inline-block" }} /> 已解决</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#f97316", display: "inline-block" }} /> Pending</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#60a5fa", display: "inline-block" }} /> Ongoing</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Monthly trend */}
            <div style={S.card}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>月度趋势（近6个月）</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
                {monthlyData.map(m => (
                  <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 130, width: "100%" }}>
                      <div style={{ flex: 1, background: "#2563eb", borderRadius: "4px 4px 0 0", height: `${(m.created / maxMonthly) * 100}%`, minHeight: m.created > 0 ? 8 : 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                        {m.created > 0 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, marginTop: 2 }}>{m.created}</span>}
                      </div>
                      <div style={{ flex: 1, background: "#16a34a", borderRadius: "4px 4px 0 0", height: `${(m.resolved / maxMonthly) * 100}%`, minHeight: m.resolved > 0 ? 8 : 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                        {m.resolved > 0 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, marginTop: 2 }}>{m.resolved}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#71717a" }}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#2563eb", display: "inline-block" }} /> 新增</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#16a34a", display: "inline-block" }} /> 已解决</span>
              </div>
            </div>

            {/* Engineer workload */}
            <div style={S.card}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#fff" }}>工程师工作量</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {engLoad.map(e => (
                  <div key={e.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: "#e4e4e7", fontWeight: 600 }}>{e.name}</span>
                      <span style={{ fontSize: 11, color: "#71717a" }}>{e.total} 条 (进行中 {e.ongoing + e.pending})</span>
                    </div>
                    <div style={{ display: "flex", height: 16, borderRadius: 4, overflow: "hidden", background: "#27272a" }}>
                      {e.resolved > 0 && <div style={{ width: `${(e.resolved / maxEng) * 100}%`, background: "#16a34a" }} />}
                      {e.pending > 0 && <div style={{ width: `${(e.pending / maxEng) * 100}%`, background: "#f97316" }} />}
                      {e.ongoing > 0 && <div style={{ width: `${(e.ongoing / maxEng) * 100}%`, background: "#2563eb" }} />}
                    </div>
                  </div>
                ))}
                {engLoad.length === 0 && <div style={{ color: "#52525b", textAlign: "center", padding: 20 }}>暂无数据</div>}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === "afterSales") {
      const sub = { tickets: "Ticket", warranty: "质保内维修", paidRepair: "付费维修及易损件" };
      return (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{Object.entries(sub).map(([k, v]) => <button key={k} style={S.tab(activeSubTab === k)} onClick={() => setActiveSubTab(k)}>{v}</button>)}</div>
          <TaskTable cat={activeSubTab} columns={COL[activeSubTab]} data={getFiltered(activeSubTab)} onUpdate={updateTask} onDelete={deleteTask} onAdd={() => setShowAdd(activeSubTab)} engineers={engineers}
            onMigrate={activeSubTab === "tickets" ? t => setMigrateTicket(t) : null} onPin={pinTask}
            hideResolved={hideResolved[activeSubTab]} setHideResolved={v => setHideResolved({ ...hideResolved, [activeSubTab]: v })}
            sortState={sortState[activeSubTab]} onSort={f => handleSort(activeSubTab, f)} />
        </div>
      );
    }
    if (activeTab === "keyProject") {
      return <TaskTable cat="keyProject" columns={COL.keyProject} data={getFiltered("keyProject")} onUpdate={updateTask} onDelete={deleteTask} onAdd={() => setShowAdd("keyProject")} engineers={engineers} onPin={pinTask}
        hideResolved={hideResolved.keyProject} setHideResolved={v => setHideResolved({ ...hideResolved, keyProject: v })}
        sortState={sortState.keyProject} onSort={f => handleSort("keyProject", f)} />;
    }
    const cat = activeTab;
    return <TaskTable cat={cat} columns={COL[cat]} data={getFiltered(cat)} onUpdate={updateTask} onDelete={deleteTask} onAdd={() => setShowAdd(cat)} engineers={engineers} onPin={pinTask}
      hideResolved={hideResolved[cat]} setHideResolved={v => setHideResolved({ ...hideResolved, [cat]: v })}
      sortState={sortState[cat]} onSort={f => handleSort(cat, f)} />;
  };

  const themeColors = {
    dark: { bg: "#09090b", sidebar: "#0f0f12", card: "#18181b", border: "#27272a", text: "#e4e4e7", sub: "#a1a1aa", muted: "#71717a" },
    midnight: { bg: "#0a1628", sidebar: "#0d1f3c", card: "#122244", border: "#1e3a5f", text: "#e0ecff", sub: "#8baad9", muted: "#5a7faa" },
    charcoal: { bg: "#1a1a1a", sidebar: "#222222", card: "#2a2a2a", border: "#3a3a3a", text: "#e8e8e8", sub: "#b0b0b0", muted: "#808080" },
    light: { bg: "#f5f5f5", sidebar: "#e8e8e8", card: "#ffffff", border: "#d0d0d0", text: "#1a1a1a", sub: "#555", muted: "#888" },
  };
  const tc = themeColors[theme.bg] || themeColors.dark;
  const fs = theme.fontSize || 13;

  return (
    <div style={{ ...S.app, background: tc.bg, color: tc.text, fontSize: fs }}>
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: 230, background: tc.sidebar, borderRight: `1px solid ${tc.border}`, padding: "16px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "0 14px", marginBottom: 3 }}>⚙️ AE 任务平台</div>
          <div style={{ fontSize: 10, color: "#52525b", padding: "0 14px", marginBottom: 18 }}>
            {currentUser && currentUser !== "__admin__" ? `当前: ${currentUser}` : "Application Engineer"}{isAdmin && " ⭐管理员"}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", padding: "0 14px", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>区域</div>
          {regions.map(r => (
            <div key={r.id} style={S.sidebar(selectedRegion === r.name)} onClick={() => { setSelectedRegion(r.name); setSelectedEngineer(null); }}>
              {I.globe} <span>{r.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#52525b" }}>{engineers.filter(e => e.region === r.name).length}</span>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", padding: "0 14px", marginBottom: 6, marginTop: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>工程师</div>
          {engineers.map(e => (
            <div key={e.id} style={S.sidebar(selectedEngineer === e.id)} onClick={() => { setSelectedEngineer(e.id); setSelectedRegion(null); }}>
              {I.user} <span>{e.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#52525b" }}>{e.region}</span>
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #27272a" }}>
            <div style={S.sidebar(false)} onClick={() => { setSelectedEngineer(null); setSelectedRegion(null); }}>📊 全部概览</div>
            <div style={S.sidebar(false)} onClick={() => fetchAll()}>{I.refresh} 刷新数据</div>
            <div style={S.sidebar(false)} onClick={fetchLogs}>{I.log} 操作日志</div>
            <div style={S.sidebar(false)} onClick={() => { const p = prompt("请输入管理员密码："); if (p === ADMIN_PASSWORD) { setIsAdmin(true); localStorage.setItem("ae_admin", "true"); setView("admin"); } else if (p !== null) alert("密码错误"); }}>{I.gear} 管理员设置 {isAdmin && <span style={{ fontSize: 10, color: "#4ade80", marginLeft: "auto" }}>✓</span>}</div>
            <div style={{ ...S.sidebar(false), color: "#f87171" }} onClick={handleLogout}>{I.logout} 退出登录</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px 28px", overflowY: "auto" }}>
          {loading ? <div style={{ textAlign: "center", padding: 60, color: "#71717a" }}>加载中...</div> : <>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{viewLabel}</h1>
            <p style={{ fontSize: 12, color: "#71717a", margin: 0, marginTop: 3 }}>
              {selectedRegion && `工程师: ${engineers.filter(e => e.region === selectedRegion).map(e => e.name).join(", ") || "无"}`}
              {curEng && `区域: ${curEng.region || "未分配"}`}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { l: "售前咨询", c: "preSales", clr: "#60a5fa", tab: "preSales" }, { l: "售中任务", c: "midSales", clr: "#a78bfa", tab: "midSales" },
              { l: "Key Project", c: "keyProject", clr: "#34d399", tab: "keyProject" },
              { l: "Ticket", c: "tickets", clr: "#fbbf24", tab: "afterSales", sub: "tickets" }, { l: "质保维修", c: "warranty", clr: "#fb923c", tab: "afterSales", sub: "warranty" }, { l: "付费维修", c: "paidRepair", clr: "#f87171", tab: "afterSales", sub: "paidRepair" },
            ].map(s => (
              <div key={s.c} style={{ ...S.card, padding: "14px 18px", cursor: "pointer", transition: "all 0.15s", border: activeTab === s.tab && (!s.sub || activeSubTab === s.sub) ? `1px solid ${s.clr}44` : "1px solid #27272a" }}
                onClick={() => { setActiveTab(s.tab); if (s.sub) setActiveSubTab(s.sub); }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontSize: 10, color: "#71717a", fontWeight: 600, marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.clr }}>{cnt(s.c)}</div>
                <div style={{ fontSize: 10, color: "#52525b", marginTop: 1 }}>进行中 {cntOn(s.c)}{s.c === "tickets" ? ` · 平均 ${avgTime()}` : ""}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, background: "#0f0f12", padding: 3, borderRadius: 8 }}>
              <button style={S.tab(activeTab === "preSales")} onClick={() => setActiveTab("preSales")}>售前咨询</button>
              <button style={S.tab(activeTab === "midSales")} onClick={() => setActiveTab("midSales")}>售中</button>
              <button style={S.tab(activeTab === "afterSales")} onClick={() => setActiveTab("afterSales")}>售后</button>
              <button style={S.tab(activeTab === "keyProject")} onClick={() => setActiveTab("keyProject")}>Key Project</button>
              <button style={{ ...S.tab(activeTab === "dashboard"), background: activeTab === "dashboard" ? "#059669" : "transparent" }} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
            </div>
            <button style={{ ...S.btn, background: "#7c3aed" }} onClick={() => setShowExport(true)}>{I.exportAll} 一键导出周报</button>
            <button style={{ ...S.btn, ...S.btnGhost, marginLeft: "auto" }} onClick={() => setShowTheme(true)}>{I.palette} 显示设置</button>
          </div>
          {renderContent()}
          </>}
        </div>
      </div>
      {showAdd && <AddModal cat={showAdd} columns={COL[showAdd] || []} onSave={data => addTask(showAdd, data)} onClose={() => setShowAdd(null)} defaultOwners={defOwners} engineers={engineers} />}
      {migrateTicket && <MigrateModal ticket={migrateTicket} onMigrate={handleMigrate} onClose={() => setMigrateTicket(null)} />}
      {showExport && <ExportModal tasks={tasks} engineers={engineers} regions={regions} currentUser={currentUser} isAdmin={isAdmin} onClose={() => setShowExport(false)} />}
      {showLogs && (
        <div style={S.modal} onClick={() => setShowLogs(false)}>
          <div style={{ ...S.modalBox, maxWidth: 700, maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#fff" }}>{I.log} 操作日志（最近50条）</h3>
              <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => setShowLogs(false)}>✕</button>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "65vh" }}>
              {logs.length === 0 && <div style={{ color: "#52525b", textAlign: "center", padding: 24 }}>暂无日志</div>}
              {logs.map(log => (
                <div key={log.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #27272a", fontSize: 13 }}>
                  <span style={{ color: "#71717a", fontSize: 11, whiteSpace: "nowrap", minWidth: 130 }}>{new Date(log.created_at).toLocaleString("zh-CN")}</span>
                  <span style={{ color: "#60a5fa", fontWeight: 600, minWidth: 60 }}>{log.user_name}</span>
                  <span style={{ color: log.action.includes("删除") ? "#f87171" : log.action.includes("新增") || log.action.includes("创建") ? "#4ade80" : "#fbbf24", fontWeight: 600, minWidth: 70 }}>{log.action}</span>
                  <span style={{ color: "#a1a1aa" }}>{log.target}{log.detail ? ` · ${log.detail}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showTheme && (
        <div style={S.modal} onClick={() => setShowTheme(false)}>
          <div style={{ ...S.modalBox, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, fontSize: 17, color: "#fff", marginBottom: 16 }}>{I.palette} 显示设置</h3>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600, display: "block", marginBottom: 8 }}>背景主题</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { k: "dark", label: "深黑", bg: "#09090b", fg: "#e4e4e7" },
                  { k: "midnight", label: "午夜蓝", bg: "#0a1628", fg: "#e0ecff" },
                  { k: "charcoal", label: "炭灰", bg: "#1a1a1a", fg: "#e8e8e8" },
                  { k: "light", label: "明亮", bg: "#f5f5f5", fg: "#1a1a1a" },
                ].map(t => (
                  <div key={t.k} style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer", background: t.bg, color: t.fg, border: `2px solid ${theme.bg === t.k ? "#2563eb" : "#3f3f46"}`, fontSize: 13, fontWeight: 600, textAlign: "center" }}
                    onClick={() => saveTheme({ ...theme, bg: t.k })}>
                    {t.label} {theme.bg === t.k && "✓"}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600, display: "block", marginBottom: 8 }}>字体大小: {theme.fontSize}px</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>小</span>
                <input type="range" min="11" max="18" value={theme.fontSize} onChange={e => saveTheme({ ...theme, fontSize: parseInt(e.target.value) })} style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "#71717a" }}>大</span>
              </div>
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#27272a", borderRadius: 6, fontSize: theme.fontSize }}>
                预览文字: AE 任务管理平台 Sample Text 123
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={S.btn} onClick={() => setShowTheme(false)}>完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
