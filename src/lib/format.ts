export function formatNpr(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `NPR ${value}`;
  return `NPR ${new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
