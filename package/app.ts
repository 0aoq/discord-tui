// const config = require('../bot.config.json')
import * as discord from './discord'

import * as blessed from 'neo-blessed'
import * as WebSockets from 'websocket'

import * as fs from 'fs'

let currentChannelId = "0"
let currentContentStore = {}
let allowedChannelIds = [] // list of all channel ids the user is allowed to access
let READY = false

const config = {} as any

// create screen
let app = blessed.screen({
    smartCSR: true
})

app.title = "Bot View"

// Quit on Escape, q, or Control-C.
app.key(['escape', 'C-c'], () => {
    return process.exit(0);
})

// create ui elements

///////////////////////////////////////////////////////////////////////
// Base UI
const messageStream = blessed.list({
    height: '82%', // without title bar: 82
    content: '',
    tags: true,
    label: 'Message Stream',
    scrollable: true,
    mouse: true,
    autoPadding: true,
    border: {
        type: 'line',
    },
    top: '7%', // under title bar
    left: '25.5%', /* 15.5% so the stream is positioned directly next to the channels tab and it matches the other margins
                      25.5% so the steam is positioned directly next to the channels and guilds tab(s) */
    style: {
        fg: 'white',
        bg: 'rgba(255, 255, 255, 0)',
        shadow: true
    },
    scrollbar: {
        bg: '#5865F2'
    }
})

///////////////////////////////////////////////////////////////////////
// Message Input

const messageInput = blessed.textarea({
    height: '14%', // without title bar: 22
    tags: true,
    scrollable: true,
    inputOnFocus: true,
    mouse: true,
    autoPadding: true,
    border: {
        type: 'line'
    },
    top: '88%', // without title bar: 80%
    left: '25.5%', // follows same rules as messageStream
    style: {
        fg: 'white'
    }
})

///////////////////////////////////////////////////////////////////////
// Title Bar

const titleBar = blessed.list({
    height: '7%',
    width: '100%',
    tags: true,
    scrollable: true,
    inputOnFocus: true,
    autoPadding: true,
    mouse: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
    }
})

const titleBarOptions = [
    // discord options
    blessed.text({
        parent: titleBar,
        width: '10%',
        tags: true,
        scrollable: true,
        inputOnFocus: true,
        autoPadding: true,
        mouse: true,
        align: 'center',
        content: 'Discord Options',
        style: {
            fg: 'white',
            hover: { bg: 'white' }
        }
    }),
    // socket log
    blessed.text({
        parent: titleBar,
        width: '10%',
        left: '10%', // position after previous element; equal to the width of all previous items
        tags: true,
        scrollable: true,
        inputOnFocus: true,
        autoPadding: true,
        mouse: true,
        align: 'center',
        content: 'Socket Log',
        style: {
            fg: 'white',
            hover: { bg: 'white' }
        }
    }),
    // http log
    blessed.text({
        parent: titleBar,
        width: '10%',
        left: '20%', // position after previous element; equal to the width of all previous items
        tags: true,
        scrollable: true,
        inputOnFocus: true,
        autoPadding: true,
        mouse: true,
        align: 'center',
        content: 'HTTP Log',
        style: {
            fg: 'white',
            hover: { bg: 'white' }
        }
    })
]

const topDropDownMenu = blessed.list({
    height: '50%',
    width: '15%',
    tags: true,
    scrollable: true,
    inputOnFocus: true,
    autoPadding: true,
    mouse: true,
    label: 'Dropdown',
    shadow: true,
    top: '7%', // under title bar
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
    }
})

topDropDownMenu.toggle()

///////////////////////////////////////////////////////////////////////
// Others

const guilds = blessed.list({
    width: '10%',
    height: '95%', // without title bar: 100%
    tags: true,
    label: 'Guilds',
    scrollable: true,
    autoPadding: true,
    top: '7%', // under title bar
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        shadow: true
    }
})

const channels = blessed.list({
    width: '15%',
    height: '95%', // without title bar: 100%
    tags: true,
    label: 'Channels',
    scrollable: true,
    autoPadding: true,
    top: '7%', // under title bar
    left: '10.5%', // beside guilds tab
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        shadow: true
    }
})

// append all
export const loadMainApp = () => {
    app.append(messageStream)
    app.append(messageInput)

    app.append(guilds)
    app.append(channels)

    app.append(titleBar)
    app.append(topDropDownMenu)

    app.render()
}

export const addConfigKey = (key, value) => { config[key] = value }

messageInput.setHover('Send Message -- Ctrl+S to send; Escape to exit')

// hide elements until gateway is loaded
messageStream.toggle()
messageInput.toggle()
channels.toggle()
guilds.toggle()

titleBarOptions[0].toggle() // discord options

// get current user
let me;

(async () => {
    const request = await discord.getMe({ authToken: config.authToken })
    me = await request.json()
})();

// functions
let selectedLines = []
let allMessages = {}
let replyMessage = null

/**
 * @function renderMessage
 * 
 * @param {string} line Structured line
 */
const renderMessage = (line: string) => {
    let content = line.split('!!META:')[0]
    if (!content) return

    const meta = line.split('!!META:')[1]
    if (!meta) return

    const message = JSON.parse(meta)

    // render special tag
    if (config.custom_user_options[message.author.id] && config.custom_user_options[message.author.id].tag) {
        const tagName = config.custom_user_options[message.author.id].tag.name
        const tagColor = config.custom_user_options[message.author.id].tag.color

        if (tagName && tagColor) content = ` {${tagColor}-fg}[${tagName}]{/${tagColor}-fg}${content.slice(1)}`
    }

    // render attachment (link)
    if (message.content === '' && message.attachments && message.attachments[0]) {
        // if there is no text, but there is an attachment ... show that
        content = ` [{bold}${message.author.username}{/bold}]: ${message.attachments[0].url}`
    } else if (message.content !== '' && message.attachments && message.attachments[0]) {
        content = ` [{bold}${message.author.username}{/bold}]: ${message.content} {gray-fg}${message.attachments[0].url}{/gray-fg}`
    }

    // render reference message
    if (message.referenced_message) {
        const refmsg = message.referenced_message
        const item = messageStream.addItem(`{gray-fg}┌╴[${refmsg.author.username}]: ${refmsg.content}{/gray-fg}`)
        content = `{gray-fg}└╴{/gray-fg}${content.slice(1)}` // make the boxes connect

        item.on('click', () => {
            const refitem = allMessages[refmsg.id]
            if (refitem) {
                refitem.style.bg = '#5865F2'

                setTimeout(() => {
                    refitem.style.bg = ''
                    app.render()
                }, 2000);
            }

            app.render()
        })

        app.render()
    } else content = ` ${content}`

    // render source message
    if (!content.startsWith(' ') && !content.startsWith('{gray-fg}└')) content = ` ${content}`
    const item = messageStream.addItem(content)
    allMessages[message.id] = item

    // handle selection - basically the same as the Discord right-click context menu
    item.on('click', () => {
        if (!selectedLines.includes(item)) selectedLines.push(item)
        else delete selectedLines[selectedLines.indexOf(item)]

        if (selectedLines.includes(item)) {
            item.style.bg = 'white'
            item.style.fg = 'black'
            item.setHover('Message selected:\n\nShift+D - Delete\nShift+E - Edit\nShift+F - View Full\nShift+R - Reply')

            // unselect all others
            for (let _item of selectedLines) {
                if (_item !== item && _item) {
                    _item.style.bg = 'rgba(255, 255, 255, 0)'
                    _item.style.fg = 'white'
                    _item.removeHover()

                    delete selectedLines[selectedLines.indexOf(_item)]
                }
            }
        } else {
            item.style.bg = 'rgba(255, 255, 255, 0)'
            item.style.fg = 'white'
            item.removeHover()
        }

        app.render()
    })

    // handle actions

    // delete message
    app.key('S-d', async () => {
        if (!selectedLines.includes(item)) return

        await discord.deleteMessage({
            channelId: currentChannelId,
            messageId: message.id,
            authToken: config.authToken
        })

        delete selectedLines[selectedLines.indexOf(item)]
        // renderChannelMessages(currentChannelId) // WILL BE DONE AUTOMATICALLY BY SOCKET
    })

    // edit message
    app.key('S-e', () => {
        if (!selectedLines.includes(item)) return

        messageInput.clearValue()
        messageInput.setValue(message.content)

        messageStream.clearItems()
        messageStream.addItem(`{center}--- EDITING MESSAGE {bold}${message.id}{/bold} ---{/center}`)

        app.render()
    })

    // view full message
    app.key('S-f', () => {
        if (!selectedLines.includes(item)) return

        messageStream.setContent('')
        item.removeHover()
        messageStream.clearItems()
        messageStream.setContent(`${content.replaceAll(' [\\n] ', '\n')}\n\n{center}{gray-fg}End of message ⎯  Re-open channel to return{/gray-fg}{/center}`)
        currentChannelId = "0" // prevent app from reloading messages
        app.render()
    })

    // reply to message
    app.key('S-r', () => {
        if (!selectedLines.includes(item)) return

        replyMessage = {
            message_id: message.id
        }

        messageStream.setContent('')
        item.removeHover()
        messageStream.clearItems()

        messageStream.setContent(`{center}{gray-fg}Replying to messagex{/gray-fg}{/center}

${content.replaceAll(' [\\n] ', '\n')}

{center}{gray-fg}End of message ⎯  Re-open channel to {bold}cancel{/bold}{/gray-fg}{/center}`)

        app.render()
    })
}

/**
 * @function createTextStream
 * 
 * @param {string} data The text data
 */
export const createTextStream = (data: string) => {
    messageStream.setContent()
    selectedLines = []

    const lines = data.split('\n')

    for (let line of lines) {
        renderMessage(line)
    }

    messageStream.setScrollPerc(100)
    app.render()
}

export const postSystemMessage = (message: string) => {
    messageStream.setContent(messageStream.getContent() + `[{bold}System{/bold}]: ${message}\n`)
    app.render()
}

export const setChannelId = (id) => { currentChannelId = id }

/**
 * @function renderChannelMessages
 * 
 * @param {string} channelId The Discord channel ID
 * @param {number} limit Maximum amount of messages to load
 */
const renderChannelMessages = async (channelId: string, limit = 100) => {
    messageStream.clearItems()
    replyMessage = null

    if (!READY) {
        messageStream.addItem(`{center}--- CANNOT RENDER UNTIL CONNECTED TO SERVER ---{/center}`)
        return
    }

    currentChannelId = channelId
    currentContentStore = {}

    const request = await discord.getMessages({
        channelId: channelId,
        limit: limit,
        authToken: config.authToken
    })

    const messages = await request.json()
    discord.pushToHTTPLog(JSON.stringify(messages))

    let streamData = ''

    if (messages.message) {
        messageStream.setContent('')
        messageStream.clearItems()

        postSystemMessage(`${messages.message}: ${JSON.stringify(messages)}`)
        app.render()
        return "RATE_LIMIT_REACHED"
    }

    for (let message of messages) {
        currentContentStore[message.id] = { sender: message.author.username, text: message.content }
        streamData = `[{bold}${message.author.username}{/bold}]: ${message.content.replaceAll('\n', ' [\\n] ')}!!META:${JSON.stringify(message)}\n ${streamData}`
    }

    createTextStream(streamData)
}

let categories = {}

/**
 * @function renderGuildChannels
 * 
 * @param {object} props
 * @param {string} props.guildId The Discord server ID
 * @param {string} props.userPermission The user's permissions in this guild
 * @param {Array<object>} props.importantRoles An array of all roles that we need to look for in permissions
 */
const renderGuildChannels = async (props: { guildId: string, userPermission: string, importantRoles: Array<object> }) => {
    channels.clearItems()
    categories = {}

    const request = await discord.getChannels({
        authToken: config.authToken,
        guildId: props.guildId
    })

    const allowedTypes = [0, 1, 3, 4, 5]
    let channelList = await request.json()
    discord.pushToHTTPLog(JSON.stringify(channelList))

    function sortChannels(a, b) {
        return a.position - b.position
    }

    channelList = channelList.sort(sortChannels)

    let renderedChannels = []

    const createItem = (channel) => {
        const item = channels.addItem(channel.name)
        let _saved = '' // saved background color

        item.on('mouseover', () => { _saved = item.style.bg; item.style.bg = 'white'; app.render() })
        item.on('mouseout', () => { item.style.bg = _saved; app.render() })
        item.setHover(channel.name)
        renderedChannels.push(item)
        item.on('click', () => {
            if (channel.type !== 4) {
                currentChannelId = channel.id
                renderChannelMessages(channel.id)

                item.style.bg = '#5865F2'
                for (let _item of renderedChannels) {
                    if (_item !== item && _item) { _item.style.bg = 'rgba(255, 255, 255, 0)' }
                }

                app.render()
            } else {
                messageStream.clearItems()
                messageStream.addItem(`{center}--- CATEGORY CHANNEL ---{/center}`)
                app.render()
            }
        })

        app.render()
    }

    // load channels
    channels.clearItems()

    const loadingText = channels.addItem('Loading...')
    app.render()

    for (let channel of channelList) {
        if (!allowedTypes.includes(channel.type)) continue // channel must be text

        if (!allowedChannelIds.includes(channel.id) && channel.type !== 4 /* category channel */) {
            // to avoid getting easily rate limited, we'll only check channels we haven't seen before

            // check permission to view channel by trying to read the messages
            const canReadRequest = await discord.getMessages({
                channelId: channel.id,
                authToken: config.authToken,
                limit: 1
            })

            const messages = await canReadRequest.json()
            if (typeof messages[0] !== 'object') continue // we don't have permission
            allowedChannelIds.push(channel.id)

            // let deny = false

            // for (let permission of channel.permission_overwrites) {
            //     if (!props.importantRoles.includes(permission.id) && permission.id !== props.guildId) continue // it doesn't matter to us
            //     if (permission.allow >= 1024 /* allowed view channel ; 1 << 10 */) break
            //     if (permission.deny >= 1024 /* denied view channel ; 1 << 10 */) {
            //         deny = true
            //         break
            //     }
            // }

            // if (deny === false) allowedChannelIds.push(channel.id)
            // else continue
        }

        if (channel.type === 4) {
            channel.name = `▶ ${channel.name.toUpperCase()}◀`
            categories[channel.id] = { self: channel, channels: [] } // save to categories variable to sort channels
            continue
        } else channel.name = `◈ ${channel.name}`

        if (channel.parent_id) {
            if (categories[channel.parent_id]) categories[channel.parent_id].channels.push(channel)
        } else createItem(channel)

        app.render()
    }

    Object.entries(categories).map(item => {
        const [key, value] = item as any

        // create category label
        createItem(value.self)

        // create channels
        for (let channel of value.channels) {
            createItem(channel)
        }
    })

    loadingText.destroy()
    app.render()
}

let userGuildProfiles = {}

/**
 * @function renderUserGuilds
 */
const renderUserGuilds = async () => {
    guilds.clearItems()

    const request = await discord.getUserGuilds({ authToken: config.authToken })
    const guildList = await request.json()

    discord.pushToHTTPLog(JSON.stringify(guildList))

    for (let guild of guildList) {
        let myProfile

        // create button
        const item = guilds.addItem(guild.name)
        item.setHover(guild.name)
        item.on('mouseover', () => { item.style.bg = 'white'; app.render() })
        item.on('mouseout', () => { item.style.bg = ''; app.render() })
        item.on('click', async () => {
            if (!userGuildProfiles[guild.id]) {
                const request1 = await discord.getCurrentUserInGuild({ authToken: config.authToken, guildId: guild.id })
                const _myProfile = await request1.json()
                if (_myProfile.message) {
                    messageStream.setContent('')
                    messageStream.clearItems()

                    postSystemMessage(`${_myProfile.message}: ${JSON.stringify(_myProfile)}`)
                    app.render()
                    return "RATE_LIMIT_REACHED"
                }

                userGuildProfiles[guild.id] = _myProfile
                myProfile = _myProfile
            } else myProfile = userGuildProfiles[guild.id]

            let importantRoles = [] // an array of all roles that we need to look for in permissions
            for (let role of myProfile.roles) importantRoles.push(role.id)

            renderGuildChannels({
                guildId: guild.id,
                userPermission: guild.permissions,
                importantRoles: importantRoles
            })
        })

        app.render()
    }
}

// handle action

// focus "Send Message" box
app.key('i', () => {
    messageInput.focus()
})

// submit "Send Message" box
messageInput.key(['C-s'], async () => {
    const value = messageInput.getValue().replaceAll(/\{.\}/g, '').replaceAll(/\{\/.\}/g, '')

    await discord.sendMessage({
        contentType: "application/json",
        channelId: currentChannelId,
        authToken: config.authToken,
        body: JSON.stringify({
            content: value,
            message_reference: replyMessage
        })
    })

    renderChannelMessages(currentChannelId)

    // clear input
    messageInput.cancel()
    messageInput.clearValue()
    replyMessage = null
    app.render()
})

// handle title bar
const createDropDownItem = (text: string, onclick: any) => {
    const item = topDropDownMenu.addItem(text)
    item.on('mouseover', () => { item.style.bg = 'white'; app.render() })
    item.on('mouseout', () => { item.style.bg = ''; app.render() })
    item.on('click', () => { onclick(item) })
    return item
}

titleBarOptions[0].on('click', () => {
    topDropDownMenu.clearItems()
    topDropDownMenu.setLabel('Discord Options')

    createDropDownItem('Render Messages', () => {
        topDropDownMenu.toggle()
        renderChannelMessages("908905186930622544")
    })

    createDropDownItem('Render Guilds', () => {
        topDropDownMenu.toggle()
        renderUserGuilds()
    })

    createDropDownItem('Reset Channels', () => {
        topDropDownMenu.toggle()
        allowedChannelIds = []
    })

    createDropDownItem('Save Data', async () => {
        topDropDownMenu.toggle()

        await fs.writeFileSync(`${process.cwd()}/clientdata.json`, JSON.stringify({
            currentContentStore: currentContentStore,
            allowedChannelIds: allowedChannelIds,
            currentChannelId: currentChannelId,
            savedCategories: categories,
            // allMessages: allMessages,
            HTTPLog: discord.httpLog,
            socketLog: socketLog,
            config: config
        }))

        topDropDownMenu.toggle()
        messageStream.setContent('')
        messageStream.clearItems()

        postSystemMessage(`Saved current client state to: ${process.cwd()}/clientdata.json`)
    })

    // finish
    topDropDownMenu.toggle()
    app.render()
})

// handle socket log
let socketLog = []

titleBarOptions[1].on('click', () => {
    topDropDownMenu.clearItems()
    topDropDownMenu.setLabel('Socket Log')

    for (let item of socketLog) {
        const _item = topDropDownMenu.addItem(item)

        _item.on('mouseover', () => { _item.style.bg = 'white'; app.render() })
        _item.on('mouseout', () => { _item.style.bg = ''; app.render() })

        _item.on('click', () => {
            // close dropdown and render
            topDropDownMenu.toggle()
            messageStream.setContent('')
            messageStream.clearItems()

            postSystemMessage(item)
            app.render()
        })
    }

    // finish
    topDropDownMenu.toggle()
    app.render()
})

// handle HTTP log
titleBarOptions[2].on('click', () => {
    topDropDownMenu.clearItems()
    topDropDownMenu.setLabel('HTTP Log')

    for (let item of discord.httpLog) {
        const _item = topDropDownMenu.addItem(item)

        _item.on('mouseover', () => { _item.style.bg = 'white'; app.render() })
        _item.on('mouseout', () => { _item.style.bg = ''; app.render() })

        _item.on('click', () => {
            // close dropdown and render
            topDropDownMenu.toggle()
            messageStream.setContent('')
            messageStream.clearItems()

            postSystemMessage(item)
            app.render()
        })
    }

    // finish
    topDropDownMenu.toggle()
    app.render()
})

// renderChannelMessages("908905186930622544")
app.render()

///////////////////////////////////////////////////////////////////////
// Discord Websocket Connection

// wait for open
export const loadSocketConnection = () => {
    const socket = new WebSockets.w3cwebsocket('wss://gateway.discord.gg/?v=10&encoding=json') // create gateway

    socket.addEventListener('open', () => {
        socket.addEventListener('message', async (event) => {
            if (typeof event.data !== 'string') return
            const data = JSON.parse(event.data)

            // get our session id
            if (data.op === 10) { // Discord "Hello" message
                // wait heartbeat_interval * jitter
                const initial_wait = data.d.heartbeat_interval * 0.05 /* Math.random() */

                socketLog.push(`identify_time: ${Math.floor(initial_wait)}ms`)

                setTimeout(() => {
                    // initial request; send heartbeat and then identify
                    socket.send(JSON.stringify({
                        "op": 1,
                        "d": null
                    }))

                    socket.send(JSON.stringify({
                        "op": 2,
                        "d": {
                            "token": config.authToken,
                            "intents": 513,
                            "properties": {
                                "os": "linux",
                                "browser": "discord.js",
                                "device": "discord.js"
                            }
                        }
                    }))

                    READY = true

                    // AFTER IDENTIFY ---

                    messageStream.toggle()
                    messageInput.toggle()
                    channels.toggle()
                    guilds.toggle()

                    titleBarOptions[0].toggle() // discord options

                    renderUserGuilds()

                    setInterval(() => {
                        socket.send(JSON.stringify({ "op": 1, "d": null })) // keep sending checks so Discord doesn't kick us out
                    }, data.d.heartbeat_interval);
                }, initial_wait);
            } else if (data.op === 0) { // dispatched event
                if (data.t === "MESSAGE_CREATE") { // a new message!
                    // if we are currently on that channel, use this data to render a message
                    if (currentChannelId === data.d.channel_id) {
                        // content returns blank for message and I don't know why, so just pull the individual message
                        if (replyMessage !== null) return

                        const request = await discord.getMessages({
                            channelId: data.d.channel_id,
                            authToken: config.authToken,
                            limit: 1
                        })

                        let message = await request.json()
                        message = message[0]

                        renderMessage(`[{bold}${message.author.username}{/bold}]: ${message.content.replaceAll('\n', ' [\\n] ')}!!META:${JSON.stringify(message)}\n`)
                    }
                } else if (data.t === "MESSAGE_DELETE") {
                    if (currentChannelId === data.d.channel_id) {
                        // if it does, find that message in the stream and add (deleted) to the end of the message
                        // nevermind the comment above, just re-render
                        renderChannelMessages(data.d.channel_id, 15)
                    }
                }
            }

            socketLog.push(JSON.stringify(data))
        })
    })

    socket.addEventListener('close', () => {
        socketLog.push('ERR: WSDISCONNECT')

        messageStream.toggle()
        messageInput.toggle()
        channels.toggle()

        titleBarOptions[0].toggle() // discord options
    })
}

export default {
    loadSocketConnection,
    postSystemMessage,
    createTextStream,
    setChannelId,
    addConfigKey,
    loadMainApp,
}