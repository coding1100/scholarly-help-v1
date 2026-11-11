// With valueInputOption USER_ENTERED, Google Sheets parses each value as if it
// were typed into the cell, so text starting with "=" (or "+", "-", "@") can
// become a formula. Most of what we write comes from visitors.
const FORMULA_START = /^[=+\-@]/;
const PLAIN_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/**
 * Returns the value to send for one cell. Text that could start a formula gets
 * a leading apostrophe, which Sheets reads as "store as text" and does not
 * display. Everything else, including plain numbers such as phone numbers and
 * our own timestamps, is returned unchanged and parsed exactly as before.
 */
export function toSheetCell<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  const start = value.trimStart();
  if (!FORMULA_START.test(start) || PLAIN_NUMBER.test(start.trimEnd())) return value;
  return `'${value}`;
}

export function toSheetRow(row: readonly unknown[]): unknown[] {
  return row.map(toSheetCell);
}
