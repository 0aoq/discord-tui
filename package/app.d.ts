export declare const loadMainApp: () => void;
export declare const addConfigKey: (key: any, value: any) => void;
/**
 * @function createTextStream
 *
 * @param {string} data The text data
 */
export declare const createTextStream: (data: string) => void;
export declare const postSystemMessage: (message: string) => void;
export declare const setChannelId: (id: any) => void;
export declare const loadSocketConnection: () => void;
declare const _default: {
    loadSocketConnection: () => void;
    postSystemMessage: (message: string) => void;
    createTextStream: (data: string) => void;
    setChannelId: (id: any) => void;
    addConfigKey: (key: any, value: any) => void;
    loadMainApp: () => void;
};
export default _default;
