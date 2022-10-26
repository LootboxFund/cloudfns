export const batcher = <T>(values: T[], batchSize = 450): T[][] => {
  const result: T[][] = [];
  const _arr = values.slice();
  while (_arr.length) {
    result.push(_arr.splice(0, batchSize));
  }
  return result;
};
