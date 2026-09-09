/** Print only a report/document — not the staff sidebar or chrome. */

function buildPrintHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/</g, "&lt;")}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 28px;
      font-size: 13px;
      line-height: 1.45;
    }
    h1, h2, h3 { margin: 0 0 6px; color: #1e3a5f; }
    h1 { font-size: 20px; }
    h2 { font-size: 16px; }
    h3 { font-size: 14px; }
    .muted { color: #64748b; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      font-weight: 700;
    }
    .text-right, th.text-right, td.text-right { text-align: right; }
    .font-bold, .font-semibold, .font-black { font-weight: 700; }
    .bg-slate-50, .bg-slate-100\\/90, .bg-slate-100 { background: #f8fafc; }
    .text-emerald-600 { color: #059669; }
    .text-red-600 { color: #dc2626; }
    .text-\\[\\#1F4E79\\] { color: #1f4e79; }
    button, [data-print-hide] { display: none !important; }
    svg { display: none; }
    .overflow-x-auto, .overflow-y-auto, .overflow-hidden {
      overflow: visible !important;
      max-height: none !important;
    }
    @media print {
      body { padding: 12px; }
      @page { margin: 12mm; size: auto; }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Opens a clean print window with only the given element’s contents,
 * then triggers the system print dialog (printer or Save as PDF).
 *
 * Tip: “Save as PDF” is a normal print destination when no printer is installed.
 * Choose a physical printer in the Destination dropdown to print on paper.
 */
export function printElementAsDocument(
  element: HTMLElement | null | undefined,
  title = "Document"
): void {
  if (!element || typeof window === "undefined") return;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("button, [data-print-hide]").forEach((n) => n.remove());
  // Expand scroll containers so the full statement prints
  clone.querySelectorAll("[class*='overflow'], [class*='max-h']").forEach((n) => {
    const el = n as HTMLElement;
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
  });

  const bodyHtml = clone.outerHTML;
  const html = buildPrintHtml(title, bodyHtml);

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
    setTimeout(trigger, 250);
  } else {
    w.addEventListener("load", () => setTimeout(trigger, 250));
    setTimeout(trigger, 600);
  }
}
