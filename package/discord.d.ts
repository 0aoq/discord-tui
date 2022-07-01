/**
 * @file Handle requests to the Discord API
 * @name discord.js
 *
 * @author 0aoq <hkau@oxvs.net>
 * @license  MIT
 */
/**
 * @function discord.sendMessage
 *
 * @param {object} props
 * @param {string} props.contentType The exact content-type header for the request
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.authToken The user authorization token
 * @param {string} props.body The request body
 */
export declare const sendMessage: (props: {
    contentType: string;
    channelId: string;
    authToken: string;
    body: string;
}) => Promise<Response>;
/**
 * @function discord.deleteMessage
 *
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.messageId The Discord message ID
 * @param {string} props.authToken The user authorization token
 */
export declare const deleteMessage: (props: {
    channelId: string;
    authToken: string;
    messageId: string;
}) => Promise<Response>;
/**
 * @function discord.getMessages
 *
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.authToken The user authorization token
 * @param {number} props.limit The maximum amount of messages to return (1 - 100)
 * @param {number} props.before Get all messages before specified id
 */
export declare const getMessages: (props: {
    channelId: string;
    authToken: string;
    limit: string;
    before: string;
}) => Promise<Response>;
/**
 * @function discord.getMessage
 *
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.messageId The Discord message ID
 * @param {string} props.authToken The user authorization token
 */
export declare const getMessage: (props: {
    channelId: string;
    messageId: string;
    authToken: string;
}) => Promise<Response>;
/**
 * @function discord.getChannels
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
export declare const getChannels: (props: {
    authToken: string;
    guildId: string;
}) => Promise<Response>;
/**
 * @function discord.getGuild
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
export declare const getGuild: (props: {
    authToken: string;
    guildId: string;
}) => Promise<Response>;
/**
 * @function discord.getCurrentUserInGuild
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
export declare const getCurrentUserInGuild: (props: {
    authToken: string;
    guildId: string;
}) => Promise<Response>;
/**
 * @function discord.updateUserSettings
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.body The request body
 */
export declare const updateUserSettings: (props: {
    authToken: string;
    body: string;
}) => Promise<Response>;
/**
 * @function discord.getUserGuilds
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 */
export declare const getUserGuilds: (props: {
    authToken: string;
}) => Promise<Response>;
/**
 * @function discord.getMe
 *
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 */
export declare const getMe: (props: {
    authToken: string;
}) => Promise<Response>;
declare const _default: {
    sendMessage: (props: {
        contentType: string;
        channelId: string;
        authToken: string;
        body: string;
    }) => Promise<Response>;
    deleteMessage: (props: {
        channelId: string;
        authToken: string;
        messageId: string;
    }) => Promise<Response>;
    getMessages: (props: {
        channelId: string;
        authToken: string;
        limit: string;
        before: string;
    }) => Promise<Response>;
    getMessage: (props: {
        channelId: string;
        messageId: string;
        authToken: string;
    }) => Promise<Response>;
    getChannels: (props: {
        authToken: string;
        guildId: string;
    }) => Promise<Response>;
    getGuild: (props: {
        authToken: string;
        guildId: string;
    }) => Promise<Response>;
    getCurrentUserInGuild: (props: {
        authToken: string;
        guildId: string;
    }) => Promise<Response>;
    updateUserSettings: (props: {
        authToken: string;
        body: string;
    }) => Promise<Response>;
    getUserGuilds: (props: {
        authToken: string;
    }) => Promise<Response>;
    getMe: (props: {
        authToken: string;
    }) => Promise<Response>;
};
export default _default;
