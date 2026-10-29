export function formatEUR(value: number): string {
  return '€' + value.toFixed(2).replace('.', ',')
}
