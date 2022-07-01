/**
 * @file Handle requests to the Discord API
 * @name discord.js
 * 
 * @author 0aoq <hkau@oxvs.net>
 * @license  MIT
 */

///////////////////////////////////////////////////////////////////////
// Message events

/**
 * @function discord.sendMessage
 * 
 * @param {object} props
 * @param {string} props.contentType The exact content-type header for the request
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.authToken The user authorization token
 * @param {string} props.body The request body
 */
const sendMessage = (props) => {
    return fetch(`https://discord.com/api/v9/channels/${props.channelId}/messages`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": props.contentType,
            "Authorization": props.authToken,
            "X-Discord-Locale": "en-US",
            "X-Debug-Options": "bugReporterEnabled",
            "Alt-Used": "discord.com",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "body": props.body,
        "method": "POST",
        "mode": "cors"
    })
}

/**
 * @function discord.deleteMessage
 * 
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.messageId The Discord message ID
 * @param {string} props.authToken The user authorization token
 */
const deleteMessage = (props) => {
    return fetch(`https://discord.com/api/v9/channels/${props.channelId}/messages/${props.messageId}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "DELETE",
        "mode": "cors"
    })
}

/**
 * @function discord.getMessages
 * 
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.authToken The user authorization token
 * @param {number} props.limit The maximum amount of messages to return (1 - 100)
 * @param {number} props.before Get all messages before specified id
 */
const getMessages = (props) => {
    let before_statement = ""
    if (props.before !== null && props.before !== undefined) before_statement = `&before=${props.before}`

    return fetch(`https://discord.com/api/v9/channels/${props.channelId}/messages?limit=${props.limit}${before_statement}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

/**
 * @function discord.getMessage
 * 
 * @param {object} props
 * @param {string} props.channelId The Discord channel ID
 * @param {string} props.messageId The Discord message ID
 * @param {string} props.authToken The user authorization token
 */
const getMessage = (props) => {
    return fetch(`https://discord.com/api/v9/channels/${props.channelId}/messages/${props.messageId}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

///////////////////////////////////////////////////////////////////////
// Guild Requests

/**
 * @function discord.getChannels
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
const getChannels = (props) => {
    return fetch(`https://discord.com/api/v9/guilds/${props.guildId}/channels`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

/**
 * @function discord.getGuild
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
const getGuild = (props) => {
    return fetch(`https://discord.com/api/v9/guilds/${props.guildId}?with_counts=true`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

///////////////////////////////////////////////////////////////////////
// User Requests

/**
 * @function discord.getCurrentUserInGuild
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.guildId The Discord server ID
 */
 const getCurrentUserInGuild = (props) => {
    return fetch(`https://discord.com/api/v9/users/@me/guilds/${props.guildId}/member`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

/**
 * @function discord.updateUserSettings
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 * @param {string} props.body The request body
 */
const updateUserSettings = (props) => {
    return fetch("https://discord.com/api/v9/users/@me/settings", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": props.body,
        "method": "PATCH",
        "mode": "cors"
    })
}

/**
 * @function discord.getUserGuilds
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 */
 const getUserGuilds = (props) => {
    return fetch("https://discord.com/api/v9/users/@me/guilds", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

/**
 * @function discord.getMe
 * 
 * @param {object} props
 * @param {string} props.authToken The user authorization token
 */
 const getMe = (props) => {
    return fetch("https://discord.com/api/v9/users/@me", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": props.authToken,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
}

///////////////////////////////////////////////////////////////////////

module.exports = {
    sendMessage,
    deleteMessage,
    getMessages,
    getMessage,

    getChannels,
    getGuild,

    getCurrentUserInGuild,
    updateUserSettings,
    getUserGuilds,
    getMe
}