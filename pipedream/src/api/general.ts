export const convertHexToDecimal = (hex: string): string => {
  return parseInt(hex, 16).toString()
}
export const convertDecimalToHex = (decimal: string): string => {
  return `0x${parseInt(decimal, 10).toString(16)}`
}
