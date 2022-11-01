// Used to inject a chain in the synchronous invocations of a promise array
export const promiseChainDelay = async <T>(promises: (Promise<any> | undefined)[], delay = 100): Promise<T[]> => {
    const res = [];
    for (const promise of promises) {
        if (promise == undefined) {
            res.push(undefined);
            continue;
        }
        const promiseResult = await promise;
        res.push(promiseResult);
        await new Promise((res) => {
            setTimeout(() => {
                return res(null);
            }, delay);
        });
    }
    return res;
};
