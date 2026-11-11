import { describe, expect, it } from "vitest";
import { toSheetCell, toSheetRow } from "./sheetValues";

describe('toSheetCell', () => {
  // Real values from the lead sheets: none of them can start a formula, so
  // each must reach Google exactly as before and be parsed the same way.
  it.each([
    'michelej7436@yahoo.com',
    '4707572350',
    '434686',
    'Online classes ',
    'Taking my class',
    'Math',
    '',
    'IwcGRvZgVmZGlkFlDi_Oe2DX5OsjU8BYzjX_hFhZqueoxleHRuA2FlbQEwAGFkaWQBqzd3Rjy2lHNydGMGYXBwX2lk',
    'https://scholarlyhelp.com/take-my-class/?utm_source=fb&utm_campaign=mohsin%20testing%20%232',
    'September 11, 2026 12:35 PM',
    "O'Brien",
    "'already text",
    '12',
    '-5',
    '+15551234567',
    ' -3.5',
    '1e3',
  ])('leaves %j unchanged', (value) => {
    expect(toSheetCell(value)).toBe(value);
  });

  it.each([0, 42, -1, true, null, undefined])('leaves the non-string %j unchanged', (value) => {
    expect(toSheetCell(value)).toBe(value);
  });

  it.each([
    '=IMAGE("https://attacker.example/x.png")',
    '=HYPERLINK("http://bxss.me","x")',
    "+response.write(9579277*9658494)+'",
    '-2+3',
    '@SUM(1,2)',
    ' =1+1',
    '\t=1+1',
    '+1 (555) 123-4567',
  ])('writes %j as literal text', (value) => {
    expect(toSheetCell(value)).toBe(`'${value}`);
  });
});

describe("toSheetRow", () => {
  it("converts every cell", () => {
    expect(toSheetRow(["a@b.com", "=1+1", 5, "-x"])).toEqual(["a@b.com", "'=1+1", 5, "'-x"]);
  });
});
