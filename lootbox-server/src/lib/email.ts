export const truncateEmail = (email: string) => {
  return email.replace(/^(.)(.*)(.@.*)$/, (_, a, _b, c) => a + "*****" + c);
};
