declare const _default: {
    name: string;
    key: string;
    version: string;
    props: {
        http: {
            type: string;
            customResponse: boolean;
        };
        secret: string;
    };
    run(event: any): Promise<void>;
};
export default _default;
