export const csvCleaner = (s: string | number) => {
  // removes any special chars for csv export
  if (typeof s === "number") {
    return s;
  }
  return s.replace(/,/gi, "");
};
