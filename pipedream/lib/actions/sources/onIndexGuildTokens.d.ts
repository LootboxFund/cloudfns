/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_yLugbaW/configuration
 */
declare const _default: {
    key: string;
    name: string;
    description: string;
    version: string;
    type: string;
    props: {
        httpInterface: {
            type: string;
            customResponse: boolean;
        };
        emitBodyOnly: {
            type: string;
            label: string;
            description: string;
            optional: boolean;
            default: boolean;
        };
        resStatusCode: {
            type: string;
            label: string;
            description: string;
            optional: boolean;
            default: string;
        };
        resContentType: {
            type: string;
            label: string;
            description: string;
            optional: boolean;
            default: string;
        };
        resBody: {
            type: string;
            label: string;
            description: string;
            optional: boolean;
            default: string;
        };
        http: any;
        secret: string;
    };
    run(event: any): Promise<void>;
};
export default _default;
