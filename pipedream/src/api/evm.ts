import { EthLog } from "defender-autotask-utils";
import { ethers } from "ethers";
import { ABIUtilRepresenation } from '@wormgraph/helpers';

export const decodeEVMLogs = <T>({
  eventName,
  logs,
  abiReps,
}: {
  eventName: string;
  logs: EthLog[];
  abiReps: ABIUtilRepresenation[];
}) => {
  const allAbis = abiReps.map((r) => r.abi);
  const allKeys = abiReps
    .map((r) => r.keys)
    .reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);
  const iface = new ethers.utils.Interface(allAbis);
  const decodedLogs = logs
    .map((log: any) => {
      try {
        const data = iface.decodeEventLog(eventName, log.data, log.topics);
        return allKeys.reduce(
          (acc, key) => ({
            ...acc,
            [key]: data[key],
          }),
          {}
        );
      } catch (e) {
        console.log(e);
        return;
      }
    })
    .filter((ev) => ev) as T[];
  console.log(`
      
        ----- Decoded Logs
      
    `);
  console.log(decodedLogs);
  return decodedLogs;
};
