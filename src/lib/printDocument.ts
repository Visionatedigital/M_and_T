/** Print only a report/document — not the staff sidebar or chrome. */

export type PrintDocumentOptions = {
  /** Soft cap for table body rows (ledgers). Default 80. */
  maxTableRows?: number;
  /** Drop chart SVGs (Recharts). Default true. */
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
      line-height: 1.3;
    }
    body { padding: 10mm; }
    .print-doc-header {
      border-bottom: 2px solid #1e3a5f;
      margin: 0 0 8px;
      padding: 0 0 6px;
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
      font-size: 15px;
      color: #1e3a5f;
      font-weight: 700;
    }
    .print-doc-header .printed-at {
      margin-top: 2px;
      font-size: 9px;
      color: #94a3b8;
    }
    .print-note {
      margin: 0 0 8px;
      padding: 5px 7px;
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
    h1 { font-size: 13px; }
    h2 { font-size: 12px; }
    h3, h4 { font-size: 11px; }
    p { margin: 0 0 4px; }

    /* Kill Tailwind spacing that creates hundreds of blank/tall pages */
    [class*="p-"], [class*="px-"], [class*="py-"], [class*="pt-"], [class*="pb-"],
    [class*="pl-"], [class*="pr-"], [class*="m-"], [class*="mx-"], [class*="my-"],
    [class*="mt-"], [class*="mb-"], [class*="gap-"], [class*="space-y-"], [class*="space-x-"] {
      padding: 0 !important;
      margin: 0 !important;
      gap: 0 !important;
    }
    [class*="space-y-"] > * + * { margin-top: 4px !important; }
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
      margin: 4px 0 6px;
      font-size: 8.5px;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: auto; }
    th, td {
      padding: 2px 4px !important;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      text-align: left;
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: #64748b;
      font-weight: 700;
      background: #f8fafc;
    }

    .text-right, [class*="text-right"] { text-align: right !important; }
    .text-center, [class*="text-center"] { text-align: center !important; }
    .font-bold, .font-semibold, .font-black, .font-extrabold { font-weight: 700 !important; }
    .tabular-nums { font-variant-numeric: tabular-nums; }

    .bg-slate-50, .bg-slate-100, .bg-slate-100\\/90, .bg-muted\\/30, .bg-muted\\/10,
    .bg-slate-50\\/50, .bg-slate-50\\/80 { background: #f8fafc !important; }
    .text-emerald-600, .text-emerald-700, .text-green-600, .text-green-700 { color: #059669 !important; }
    .text-red-500, .text-red-600, .text-red-700 { color: #dc2626 !important; }
    .text-blue-700, .text-blue-800, .text-\\[\\#1F4E79\\] { color: #1e3a5f !important; }
    .text-slate-400, .text-slate-500, .text-muted-foreground { color: #64748b !important; }

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

    .grid { display: grid !important; gap: 4px !important; margin-bottom: 6px; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3, .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .grid-cols-4, .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
    .flex { display: flex !important; flex-wrap: wrap; gap: 2px !important; }

    @media print {
      body { padding: 0; }
      @page { margin: 8mm; size: portrait; }
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
  const maxRows = options.maxTableRows ?? 80;
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

  let truncated = 0;
  clone.querySelectorAll("table").forEach((table) => {
    const bodies = table.tBodies?.length
      ? Array.from(table.tBodies)
      : [table.querySelector("tbody")].filter(Boolean) as HTMLTableSectionElement[];
    bodies.forEach((tbody) => {
      const rows = Array.from(tbody.rows);
      if (rows.length <= maxRows) return;
      const removeCount = rows.length - maxRows;
      rows.slice(maxRows).forEach((r) => r.remove());
      truncated += removeCount;
      const noteRow = tbody.insertRow(-1);
      const td = noteRow.insertCell(0);
      td.colSpan = Math.max(1, rows[0]?.cells.length || 8);
      td.textContent = `… ${removeCount} more rows omitted. Narrow the date range to print a shorter document.`;
      td.style.fontStyle = "italic";
      td.style.color = "#92400e";
    });
  });

  const note = truncated > 0
    ? `Large ledger trimmed for printing (${truncated} row(s) omitted). Narrow From/To dates for a full short print.`
    : undefined;

  return { clone, note };
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

  // Wait a tick for layout; keep short so preview isn't blank for minutes
  setTimeout(trigger, 200);
}

/**
 * Prints only the given element as a compact document.
 * Uses a hidden iframe (not window.open) so popup blockers cannot
 * fall back to printing the entire staff UI (which caused ~369 blank pages).
 */
export function printElementAsDocument(
  element: HTMLElement | null | undefined,
  title = "Document",
  options: PrintDocumentOptions = {}
): void {
  if (!element || typeof window === "undefined") return;

  const { clone, note } = prepareClone(element, options);
  const html = buildPrintHtml(title, clone.outerHTML, note);

  try {
    printViaIframe(html);
  } catch (err) {
    console.error("Print failed", err);
    // Last resort: open blob URL tab (still NOT window.print on the app)
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
