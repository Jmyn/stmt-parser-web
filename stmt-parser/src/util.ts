export function convertddMMMToDate(dateString: string, year?: number): Date {
  // Define a map of month abbreviations to their corresponding zero-based month index.
  const months: { [key: string]: number } = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  // Extract day and month from the input string.
  const [day, month] = dateString.split(" ");
  const dateYear = year !== undefined ? year : new Date().getFullYear();

  return new Date(dateYear, months[month.toUpperCase()], parseInt(day, 10));
}

export function determineTrxDateYear(trxDate: Date, statementDate: Date) {
  const trxMth = trxDate.getMonth();
  const statementMth = statementDate.getMonth();
  const statementYr = statementDate.getFullYear();
  if (statementMth === 0 && trxMth === 11) {
    return statementYr - 1;
  }
  if (statementMth === 12 && trxMth === 1) {
    return statementYr + 1;
  }
  return statementYr;
}

export function parseDateString(
  dateString: string,
  separator: string,
  defaultYear?: number,
): Date | null {
  // Remove spaces from the string and split by '-'
  const dateParts = dateString.trim().split(separator).map((part) =>
    parseInt(part, 10)
  );

  // Validate that the split resulted in three parts (day, month, year)
  if (dateParts.length < 2 || dateParts.some(isNaN)) {
    console.error("Invalid date string format");
    return null;
  }

  // Adjust month index as Date constructor expects 0-based month index
  const [day, month, year] = dateParts;
  return new Date(year ?? defaultYear, month - 1, day);
}
