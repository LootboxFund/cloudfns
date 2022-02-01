declare const _default: {
    name: string;
    description: string;
    key: string;
    version: string;
    type: string;
    props: {
        googleCloud: {
            type: string;
            app: string;
        };
        webhookTrigger: {
            type: string;
        };
    };
    run(): Promise<void>;
};
export default _default;
