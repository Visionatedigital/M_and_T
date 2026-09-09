/** Print only a report/document — not the staff sidebar or chrome. */

export type PrintDocumentOptions = {
  /**
   * Soft cap for table body rows. Omit or set 0 for no cap.
   * Default: no cap (full document).
   */
  maxTableRows?: number;
  /** Drop chart SVGs (Recharts). Default true. */
  stripCharts?: boolean;
  /** Page orientation. Default portrait. */
  orientation?: "portrait" | "landscape";
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintHtml(
  title: string,
  bodyHtml: string,
  options: { orientation?: "portrait" | "landscape" } = {},
): string {
  const safeTitle = escapeHtml(title);
  const orientation = options.orientation === "landscape" ? "landscape" : "portrait";
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
      font-size: 13px;
      line-height: 1.55;
    }
    body { padding: 14mm 16mm; }
    .print-doc-header {
      border-bottom: 2px solid #1e3a5f;
      margin: 0 0 28px;
      padding: 0 0 14px;
    }
    .print-doc-header .org {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }
    .print-doc-header h1 {
      margin: 8px 0 0;
      font-size: 22px;
      color: #1e3a5f;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }
    .print-doc-header .printed-at {
      margin-top: 8px;
      font-size: 11px;
      color: #94a3b8;
    }
    h1, h2, h3, h4 {
      margin: 0 0 10px;
      color: #1e3a5f;
      page-break-after: avoid;
      line-height: 1.35;
    }
    h1 { font-size: 18px; }
    h2 { font-size: 15px; margin-top: 6px; }
    h3, h4 { font-size: 13px; }
    p { margin: 0 0 10px; }

    /*
      Soften Tailwind spacing for print: give sections room,
      but don't honor huge py / min-h utilities that explode page count.
    */
    [class*="p-"], [class*="px-"], [class*="py-"], [class*="pt-"], [class*="pb-"],
    [class*="pl-"], [class*="pr-"] {
      padding: 0 !important;
    }
    [class*="m-"], [class*="mx-"], [class*="my-"], [class*="mt-"], [class*="mb-"] {
      margin: 0 !important;
    }
    [class*="gap-"] { gap: 18px !important; }
    [class*="space-y-"] > * + * { margin-top: 22px !important; }
    [class*="space-x-"] > * + * { margin-left: 12px !important; }

    /* Flatten cards / KPI boxes — sit on the page, no nested containers */
    [class*="rounded"][class*="border"],
    [class*="border-l-"],
    .shadow-sm, .shadow-md, .shadow-xl, .shadow-inner,
    [class*="shadow"] {
      border: none !important;
      border-left: none !important;
      padding: 0 0 20px !important;
      margin: 0 0 22px !important;
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }

    /* Badges / chips → plain text (no pills in tables) */
    [class*="rounded-full"],
    [class*="badge"],
    span[class*="bg-emerald-100"],
    span[class*="bg-red-100"],
    span[class*="bg-blue-100"],
    span[class*="bg-amber-100"],
    span[class*="bg-indigo-"] {
      display: inline !important;
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: inherit !important;
      height: auto !important;
      text-transform: capitalize;
    }

    /* Stack statement / KPI grids vertically on the page */
    .grid,
    .grid-cols-2, .grid-cols-3, .grid-cols-4,
    .md\\:grid-cols-3, .md\\:grid-cols-4,
    .lg\\:grid-cols-4, .lg\\:grid-cols-5,
    .sm\\:grid-cols-3, .xl\\:grid-cols-12 {
      display: block !important;
    }
    .grid > *,
    [class*="grid-cols-"] > * {
      display: block !important;
      width: 100% !important;
      margin: 0 0 18px !important;
      padding: 0 0 14px !important;
      border: none !important;
      border-bottom: 1px solid #e2e8f0 !important;
      background: transparent !important;
    }

    .statement-stack > .statement-section,
    .statement-section {
      display: block !important;
      width: 100% !important;
      margin: 0 0 28px !important;
      padding: 0 0 8px !important;
      page-break-inside: avoid;
    }
    .statement-section h3 {
      font-size: 14px;
      margin: 0 0 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .statement-month {
      margin: 0 0 20px !important;
      padding: 0 0 8px !important;
      page-break-inside: avoid;
    }
    .kpi-print-row {
      display: block !important;
      margin: 0 0 24px !important;
    }
    .kpi-print-row .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .kpi-print-row .kpi-value {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .kpi-print-row .kpi-hint {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    [class*="min-h-"], [class*="h-"] {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
    }
    [class*="min-w-"], [class*="w-\\["] {
      width: auto !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: auto;
      margin: 8px 0 20px;
      font-size: 12.5px;
      line-height: 1.5;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th, td {
      padding: 10px 12px !important;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      overflow-wrap: break-word;
      word-break: normal;
    }
    th {
      text-align: left;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      font-weight: 700;
      background: #f8fafc;
      padding-top: 12px !important;
      padding-bottom: 12px !important;
      white-space: nowrap;
    }
    tbody tr:nth-child(even) td { background: #fafbfc; }

    /* Ledger / cashbook column rhythm */
    table.ledger-print { table-layout: fixed !important; }
    table.ledger-print col.col-date { width: 10%; }
    table.ledger-print col.col-details { width: 34%; }
    table.ledger-print col.col-amount { width: 13%; }
    table.ledger-print col.col-balance { width: 14%; }
    table.ledger-print col.col-narration { width: 16%; }
    table.ledger-print td.col-date,
    table.ledger-print td.col-amount,
    table.ledger-print td.col-balance {
      white-space: nowrap !important;
      overflow-wrap: normal;
      word-break: keep-all;
    }
    table.ledger-print td.col-amount,
    table.ledger-print td.col-balance {
      text-align: right !important;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    table.ledger-print .details-title {
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
      text-transform: none;
      letter-spacing: 0;
      line-height: 1.35;
    }
    table.ledger-print .details-meta {
      margin-top: 4px;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0;
    }
    table.ledger-print .details-channel {
      margin-top: 2px;
      font-size: 10.5px;
      color: #94a3b8;
      text-transform: capitalize;
    }
    .ledger-currency-note {
      margin: 0 0 10px;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .text-right, [class*="text-right"] { text-align: right !important; }
    .text-center, [class*="text-center"] { text-align: center !important; }
    .font-bold, .font-semibold, .font-black, .font-extrabold { font-weight: 700 !important; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .whitespace-nowrap, [class*="whitespace-nowrap"] {
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
    }
    .text-xl, .text-2xl, .text-lg { font-size: 16px !important; line-height: 1.35 !important; }
    .text-base { font-size: 13px !important; }
    .text-sm { font-size: 12.5px !important; }
    .text-xs, .text-\\[10px\\], .text-\\[11px\\], .text-\\[9px\\], .text-\\[8px\\] { font-size: 11.5px !important; }

    .bg-slate-50, .bg-slate-100, .bg-slate-100\\/90, .bg-muted\\/30, .bg-muted\\/10,
    .bg-slate-50\\/50, .bg-slate-50\\/80 { background: #f8fafc !important; }
    .text-emerald-600, .text-emerald-700, .text-green-600, .text-green-700 { color: #059669 !important; }
    .text-red-500, .text-red-600, .text-red-700 { color: #dc2626 !important; }
    .text-blue-700, .text-blue-800, .text-\\[\\#1F4E79\\] { color: #1e3a5f !important; }
    .text-slate-400, .text-slate-500, .text-muted-foreground { color: #64748b !important; }
    .text-slate-700, .text-slate-800, .text-slate-900 { color: #0f172a !important; }

    button, [data-print-hide], input, select, textarea, [role="combobox"],
    .recharts-responsive-container, .recharts-wrapper, [class*="recharts"],
    svg.lucide, .lucide, svg:not(table svg) {
      display: none !important;
    }

    .overflow-x-auto, .overflow-y-auto, .overflow-hidden, [class*="overflow"], [class*="max-h-"] {
      overflow: visible !important;
      max-height: none !important;
    }
    .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded-full { border-radius: 0 !important; }
    .shadow-sm, .shadow-md, .shadow-xl, [class*="shadow"] { box-shadow: none !important; }

    /* Keep simple label/value rows; don't force multi-column flex wraps */
    .flex { display: flex !important; flex-wrap: nowrap; gap: 12px !important; align-items: baseline; justify-content: space-between; }
    section, .statement-section { margin-bottom: 28px !important; }
    table th, table td { padding: 11px 12px !important; }
    table.text-\\[10px\\], table[class*="text-[10px]"] { font-size: 11px !important; }

    @media print {
      body { padding: 0; }
      @page { margin: 14mm; size: ${orientation}; }
    }
  </style>
</head>
<body>
  <header class="print-doc-header">
    <div class="org">M-T Growth Gateway</div>
    <h1>${safeTitle}</h1>
    <div class="printed-at">${escapeHtml(new Date().toLocaleString("en-GB"))}</div>
  </header>
  <div class="print-body">
  ${bodyHtml}
  </div>
</body>
</html>`;
}

function prepareClone(element: HTMLElement, options: PrintDocumentOptions): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  const maxRows = options.maxTableRows ?? 0;
  const stripCharts = options.stripCharts !== false;

  clone.querySelectorAll("button, [data-print-hide], input, select, textarea, [role='combobox']").forEach((n) => n.remove());
  if (stripCharts) {
    clone.querySelectorAll(".recharts-responsive-container, .recharts-wrapper, [class*='recharts'], svg").forEach((n) => n.remove());
  }

  clone.querySelectorAll("[class*='overflow'], [class*='max-h']").forEach((n) => {
    const el = n as HTMLElement;
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
  });

  if (maxRows > 0) {
    clone.querySelectorAll("table").forEach((table) => {
      const bodies = table.tBodies?.length
        ? Array.from(table.tBodies)
        : ([table.querySelector("tbody")].filter(Boolean) as HTMLTableSectionElement[]);
      bodies.forEach((tbody) => {
        const rows = Array.from(tbody.rows);
        if (rows.length <= maxRows) return;
        rows.slice(maxRows).forEach((r) => r.remove());
      });
    });
  }

  return clone;
}

function printViaIframe(html: string): void {
  const existing = document.getElementById("mt-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "mt-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    throw new Error("Could not create print frame");
  }

  doc.open();
  doc.write(html);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    throw new Error("Could not access print frame window");
  }

  const cleanup = () => {
    setTimeout(() => {
      try {
        iframe.remove();
      } catch {
        /* ignore */
      }
    }, 1000);
  };

  const trigger = () => {
    try {
      win.focus();
      win.print();
    } finally {
      cleanup();
    }
  };

  setTimeout(trigger, 200);
}

/**
 * Prints only the given element as a readable document.
 * Uses a hidden iframe (not window.open) so popup blockers cannot
 * fall back to printing the entire staff UI.
 */
export function printElementAsDocument(
  element: HTMLElement | null | undefined,
  title = "Document",
  options: PrintDocumentOptions = {},
): void {
  if (!element || typeof window === "undefined") return;

  const clone = prepareClone(element, options);
  const html = buildPrintHtml(title, clone.outerHTML, { orientation: options.orientation });

  try {
    printViaIframe(html);
  } catch (err) {
    console.error("Print failed", err);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) {
      const t = setInterval(() => {
        try {
          if (w.document.readyState === "complete") {
            clearInterval(t);
            w.focus();
            w.print();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
          }
        } catch {
          clearInterval(t);
          URL.revokeObjectURL(url);
        }
      }, 100);
    } else {
      URL.revokeObjectURL(url);
      alert("Allow pop-ups for this site to print, or try again.");
    }
  }
}
