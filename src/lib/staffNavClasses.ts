/**
 * Shared layout for staff section tab rows (loan officers on phones).
 * Horizontal scroll + touch-friendly targets; safe area via -mx on narrow layouts.
 */
export const staffTabRowClass =
  "flex w-full min-w-0 gap-1 sm:gap-2 border-b border-border pb-2 overflow-x-auto overflow-y-hidden flex-nowrap -mx-1 px-1 touch-pan-x [scrollbar-width:thin]";

export const staffTabButtonClass =
  "rounded-b-none h-auto min-h-9 shrink-0 touch-manipulation whitespace-nowrap px-2 py-1.5 text-[11px] sm:min-h-9 sm:px-3 sm:text-xs";
