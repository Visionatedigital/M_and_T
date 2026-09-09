/** Print only a report/document — not the staff sidebar or chrome. */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintHtml(title: string, bodyHtml: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      font-size: 12px;
      line-height: 1.45;
      background: #fff;
    }
    .print-doc-header {
      border-bottom: 2px solid #1e3a5f;
      margin-bottom: 18px;
      padding-bottom: 10px;
    }
    .print-doc-header .org {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .print-doc-header h1 {
      margin: 4px 0 0;
      font-size: 20px;
      color: #1e3a5f;
    }
    .print-doc-header .printed-at {
      margin-top: 4px;
      font-size: 11px;
      color: #94a3b8;
    }
    h1, h2, h3 { margin: 0 0 6px; color: #1e3a5f; }
    h1 { font-size: 18px; }
    h2 { font-size: 15px; }
    h3 { font-size: 13px; }
    p { margin: 0 0 8px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      page-break-inside: auto;
    }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      font-weight: 700;
      background: #f8fafc;
    }
    td.border, th.border, .border { border: 1px solid #e2e8f0; }
    .text-right, th.text-right, td.text-right, [class*="text-right"] { text-align: right !important; }
    .text-center, th.text-center, td.text-center, [class*="text-center"] { text-align: center !important; }
    .text-left, th.text-left, td.text-left { text-align: left !important; }
    .font-bold, .font-semibold, .font-black, .font-extrabold { font-weight: 700 !important; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    .bg-slate-50, .bg-slate-100\\/90, .bg-slate-100, .bg-muted\\/30, .bg-muted\\/10, .bg-muted\\/20 {
      background: #f8fafc !important;
    }
    .bg-slate-200 { background: #e2e8f0 !important; }
    .text-emerald-600, .text-emerald-700, .text-emerald-800, .text-green-600, .text-green-700 { color: #059669 !important; }
    .text-red-500, .text-red-600, .text-red-700 { color: #dc2626 !important; }
    .text-blue-700, .text-blue-800, .text-indigo-800, .text-\\[\\#1F4E79\\] { color: #1e3a5f !important; }
    .text-amber-700, .text-orange-600 { color: #b45309 !important; }
    .text-slate-400, .text-slate-500, .text-muted-foreground { color: #64748b !important; }
    .text-slate-700, .text-slate-800, .text-slate-900 { color: #0f172a !important; }
    button,
    [data-print-hide],
    .print\\\\:hidden,
    input,
    select,
    textarea,
    [role="combobox"] {
      display: none !important;
    }
    /* Keep chart SVGs; hide small lucide icon SVGs */
    svg.lucide, .lucide, button svg { display: none !important; }
    .overflow-x-auto, .overflow-y-auto, .overflow-hidden, .overflow-x-clip,
    [class*="max-h-"], [class*="max-w-"] {
      overflow: visible !important;
      max-height: none !important;
      max-width: none !important;
    }
    .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md { border-radius: 0 !important; }
    .shadow-sm, .shadow-md, .shadow-xl, .shadow-inner { box-shadow: none !important; }
    .border, .border-slate-100, .border-slate-200, .border-b, .border-t {
      border-color: #e2e8f0 !important;
    }
    .grid {
      display: grid !important;
      gap: 10px !important;
    }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3, .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .grid-cols-4, .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
    .flex { display: block !important; }
    .space-y-4 > * + *, .space-y-6 > * + *, .space-y-8 > * + * { margin-top: 12px; }
    /* Card-like blocks */
    [class*="rounded"][class*="border"], .shadow-sm.border, .shadow-xl {
      border: 1px solid #e2e8f0 !important;
      padding: 10px !important;
      margin-bottom: 12px;
      background: #fff !important;
    }
    .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
    @media print {
      body { padding: 0; }
      @page { margin: 10mm; size: auto; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <header class="print-doc-header">
    <div class="org">M-T Growth Gateway</div>
    <h1>${safeTitle}</h1>
    <div class="printed-at">Printed ${escapeHtml(new Date().toLocaleString("en-GB"))}</div>
  </header>
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Opens a clean print window with only the given element’s contents,
 * then triggers the system print dialog (printer or Save as PDF).
 */
export function printElementAsDocument(
  element: HTMLElement | null | undefined,
  title = "Document"
): void {
  if (!element || typeof window === "undefined") return;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("button, [data-print-hide], input, select, textarea, [role='combobox']").forEach((n) => n.remove());
  clone.querySelectorAll("[class*='overflow'], [class*='max-h']").forEach((n) => {
    const el = n as HTMLElement;
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
  });

  const html = buildPrintHtml(title, clone.outerHTML);
  const w = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
  if (!w) {
    console.warn("Print popup blocked; falling back to window.print()");
    window.print();
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  const trigger = () => {
    try {
      w.print();
    } catch {
      /* ignore */
    }
  };

  if (w.document.readyState === "complete") {
    setTimeout(trigger, 300);
  } else {
    w.addEventListener("load", () => setTimeout(trigger, 300));
    setTimeout(trigger, 700);
  }
}
