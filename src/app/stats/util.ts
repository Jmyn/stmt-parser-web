export function formatDateMMMyyyy(date: Date | string) {
  const dte = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[dte.getMonth()];
  const year = dte.getFullYear();

  return `${month} ${year}`;
}
