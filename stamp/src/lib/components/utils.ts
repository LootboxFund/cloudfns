/**
 * This parses the prize line into the three parts:
 * - smallPrefix
 *  Text or syumbols in front of a number
 * - leadingNumber
 *  A leading number, i.e. 5 in "$5 USD" or 25 in "25 out of 100 sheep"
 * - smallText
 *  The rest of the text i.e. "out of 100 sheep" in "25 out of 100 sheep"
 *
 * @param prizeLine
 * @returns
 */
export const parsePrizeLine = (
  prizeLine: string
): {
  smallPrefix: string | null;
  leadingNumber: string | null;
  smallText: string | null;
} => {
  const match = prizeLine.match(/^([^\d]*)([\d,\.]+)(.*)/);
  if (!match) {
    return {
      smallPrefix: null,
      leadingNumber: null,
      smallText: prizeLine,
    };
  }
  return {
    smallPrefix: match[1].trim(),
    leadingNumber: match[2],
    smallText: match[3].trim(),
  };
};
