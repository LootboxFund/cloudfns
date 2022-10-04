import { randomBytes } from "crypto";
import { LootboxMintSignatureNonce } from "@wormgraph/helpers";

/** @deprecated duplicated in cloudfns/functions */
export const generateNonce = (): LootboxMintSignatureNonce => {
  const hexToDec = (s: string) => {
    var i,
      j,
      digits = [0],
      carry;
    for (i = 0; i < s.length; i += 1) {
      carry = parseInt(s.charAt(i), 16);
      for (j = 0; j < digits.length; j += 1) {
        digits[j] = digits[j] * 16 + carry;
        carry = (digits[j] / 10) | 0;
        digits[j] %= 10;
      }
      while (carry > 0) {
        digits.push(carry % 10);
        carry = (carry / 10) | 0;
      }
    }
    return digits.reverse().join("");
  };
  const bytes = randomBytes(16);
  return hexToDec(bytes.toString("hex")) as LootboxMintSignatureNonce;
};
