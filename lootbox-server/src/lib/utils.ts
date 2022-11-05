export const batcher = <T>(values: T[], batchSize = 450): T[][] => {
  const result: T[][] = [];
  const _arr = values.slice();
  while (_arr.length) {
    result.push(_arr.splice(0, batchSize));
  }
  return result;
};

export const formatEmail = (email: string) => email.toLowerCase().trim();

export const checkIfValidEmail = (text: string) => {
  const matches = String(text)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  return matches && matches.length > 0;
};
