export const convertLogs = (logs) => {
  const xlogs = logs.map((log) => {
    return log.eventFragment.inputs.reduce((acc, curr, i) => {
      return {
        ...acc,
        [curr.name]: log.args[i],
      };
    }, {});
  });
  return xlogs;
};
