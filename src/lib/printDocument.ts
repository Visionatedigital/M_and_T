/** Print only a report/document — not the staff sidebar or chrome. */

export type PrintDocumentOptions = {
  /** Soft cap for table body rows (ledgers). Default 120. Statements stay short anyway. */
  maxTableRows?: number;
  /** Drop chart SVGs (Recharts) — they inflate preview size and page count. Default true. */
  stripCharts?: boolean;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintHtml(title: string, bodyHtml: string, note?: string): string {
  const safeTitle = escapeHtml(title);
  const noteHtml = note
    ? `<p class="print-note">${escapeHtml(note)}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #0f172a;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 10px;
      line-height: 1.35;
    }
    body { padding: 12mm; }
    .print-doc-header {
      border-bottom: 2px solid #1e3a5f;
      margin: 0 0 10px;
      padding: 0 0 8px;
    }
    .print-doc-header .org {
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .print-doc-header h1 {
      margin: 2px 0 0;
      font-size: 16px;
      color: #1e3a5f;
      font-weight: 700;
    }
    .print-doc-header .printed-at {
      margin-top: 2px;
      font-size: 9px;
      color: #94a3b8;
    }
    .print-note {
      margin: 0 0 10px;
      padding: 6px 8px;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      color: #92400e;
      font-size: 9px;
    }
    h1, h2, h3, h4 {
      margin: 0 0 4px;
      color: #1e3a5f;
      page-break-after: avoid;
    }
    h1 { font-size: 14px; }
    h2 { font-size: 12px; }
    h3, h4 { font-size: 11px; }
    p { margin: 0 0 4px; }

    /* Neutralize Tailwind spacing that blows out page count */
    [class*="p-"], [class*="px-"], [class*="py-"], [class*="pt-"], [class*="pb-"],
    [class*="pl-"], [class*="pr-"], [class*="m-"], [class*="mx-"], [class*="my-"],
    [class*="mt-"], [class*="mb-"], [class*="gap-"], [class*="space-y-"], [class*="space-x-"] {
      padding: 0 !important;
      margin: 0 !important;
      gap: 0 !important;
    }
    [class*="space-y-"] > * + * { margin-top: 6px !important; }
    [class*="min-h-"], [class*="h-\\["], [class*="h-5"], [class*="h-6"], [class*="h-7"],
    [class*="h-8"], [class*="h-9"], [class*="h-10"], [class*="h-12"], [class*="h-14"],
    [class*="h-16"], [class*="h-20"], [class*="h-24"], [class*="h-28"], [class*="h-32"],
    [class*="h-40"], [class*="h-48"], [class*="h-56"], [class*="h-64"], [class*="h-72"],
    [class*="h-80"], [class*="h-96"] {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
    }
    [class*="w-\\["], [class*="min-w-"] {
      width: auto !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: auto;
      margin: 4px 0 8px;
      font-size: 9px;
      page-break-inside: auto;
    }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: auto; page-break-after: auto; }
    th, td {
      padding: 3px 5px !important;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      text-align: left;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #64748b;
      font-weight: 700;
      background: #f8fafc;
    }
    td.border, th.border, .border, [class*="border"] {
      border-color: #e2e8f0 !important;
    }

    .text-right, th.text-right, td.text-right, [class*="text-right"] { text-align: right !important; }
    .text-center, th.text-center, td.text-center, [class*="text-center"] { text-align: center !important; }
    .font-bold, .font-semibold, .font-black, .font-extrabold { font-weight: 700 !important; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }

    .bg-slate-50, .bg-slate-100, .bg-slate-100\\/90, .bg-muted\\/30, .bg-muted\\/10, .bg-muted\\/20,
    .bg-slate-50\\/50, .bg-slate-50\\/80 {
      background: #f8fafc !important;
    }
    .text-emerald-600, .text-emerald-700, .text-emerald-800, .text-green-600, .text-green-700 { color: #059669 !important; }
    .text-red-500, .text-red-600, .text-red-700 { color: #dc2626 !important; }
    .text-blue-700, .text-blue-800, .text-indigo-800, .text-\\[\\#1F4E79\\] { color: #1e3a5f !important; }
    .text-slate-400, .text-slate-500, .text-muted-foreground { color: #64748b !important; }
    .text-slate-700, .text-slate-800, .text-slate-900 { color: #0f172a !important; }

    button, [data-print-hide], .print\\\\:hidden, input, select, textarea, [role="combobox"],
    .recharts-responsive-container, .recharts-wrapper, [class*="recharts"] {
      display: none !important;
    }
    svg.lucide, .lucide { display: none !important; }

    .overflow-x-auto, .overflow-y-auto, .overflow-hidden, .overflow-x-clip,
    [class*="overflow"], [class*="max-h-"] {
      overflow: visible !important;
      max-height: none !important;
    }
    .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded-full { border-radius: 0 !important; }
    .shadow-sm, .shadow-md, .shadow-xl, .shadow-inner, [class*="shadow"] { box-shadow: none !important; }

    .grid {
      display: grid !important;
      gap: 6px !important;
      margin-bottom: 8px;
    }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3, .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .grid-cols-4, .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }

    /* Keep flex as flex so badge rows don't stack into tall columns */
    .flex { display: flex !important; flex-wrap: wrap; gap: 2px !important; }
    .flex-col { flex-direction: column !important; }
    .items-center { align-items: center !important; }
    .justify-between { justify-content: space-between !important; }

    [class*="Badge"], [class*="badge"] {
      display: inline !important;
      border: none !important;
      padding: 0 !important;
      font-size: 8px !important;
      background: transparent !important;
    }

    @media print {
      body { padding: 0; }
      @page { margin: 8mm; size: auto; }
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
  ${noteHtml}
  ${bodyHtml}
</body>
</html>`;
}

function prepareClone(element: HTMLElement, options: PrintDocumentOptions): { clone: HTMLElement; note?: string } {
  const clone = element.cloneNode(true) as HTMLElement;
  const maxRows = options.maxTableRows ?? 120;
  const stripCharts = options.stripCharts !== false;

  clone.querySelectorAll("button, [data-print-hide], input, select, textarea, [role='combobox']").forEach((n) => n.remove());
  if (stripCharts) {
    clone.querySelectorAll(".recharts-responsive-container, .recharts-wrapper, [class*='recharts']").forEach((n) => n.remove());
  }
  clone.querySelectorAll("svg.lucide, .lucide").forEach((n) => n.remove());

  clone.querySelectorAll("[class*='overflow'], [class*='max-h']").forEach((n) => {
    const el = n as HTMLElement;
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
  });

  let truncated = 0;
  clone.querySelectorAll("tbody").forEach((tbody) => {
    const rows = Array.from(tbody.querySelectorAll(":scope > tr"));
    if (rows.length <= maxRows) return;
    rows.slice(maxRows).forEach((r) => r.remove());
    truncated += rows.length - maxRows;
    const noteRow = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 20;
    td.textContent = `… ${rows.length - maxRows} more rows not printed. Narrow the date range (or search filter) to print a shorter document.`;
    td.style.fontStyle = "italic";
    td.style.color = "#92400e";
    td.style.padding = "6px";
    noteRow.appendChild(td);
    tbody.appendChild(noteRow);
  });

  const note = truncated > 0
    ? `Large ledger trimmed for printing (${truncated} row(s) omitted). Narrow From/To dates to print the full period in fewer pages.`
    : undefined;

  return { clone, note };
}

/**
 * Opens a clean print window with only the given element’s contents,
 * then triggers the system print dialog (printer or Save as PDF).
 */
export function printElementAsDocument(
  element: HTMLElement | null | undefined,
  title = "Document",
  options: PrintDocumentOptions = {}
): void {
  if (!element || typeof window === "undefined") return;

  const { clone, note } = prepareClone(element, options);
  const html = buildPrintHtml(title, clone.outerHTML, note);

  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) {
    console.warn("Print popup blocked; falling back to window.print()");
    window.print();
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  // Compact docs ready quickly; avoid long waits that freeze the preview
  const trigger = () => {
    try {
      w.print();
    } catch {
      /* ignore */
    }
  };

  setTimeout(trigger, 150);
}
