export const toFilename = (string: string): string => {
  // Replace any character that is not a letter, number, or underscore with an underscore
  const filename = string.replace(/[^\w]/g, "_");
  return filename;
};
