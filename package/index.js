"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed = __importStar(require("neo-blessed"));
const path = __importStar(require("path"));
const app = __importStar(require("./app"));
const fs = __importStar(require("fs"));
let login_screen = blessed.screen({
    smartCSR: true
});
login_screen.title = 'Login';
// Quit on Escape, q, or Control-C.
login_screen.key(['escape', 'C-c'], () => {
    return process.exit(0);
});
///////////////////////////////////////////////////////////////////////
// Base UI
const container = blessed.list({
    parent: login_screen,
    height: '80%',
    width: '50%',
    tags: true,
    scrollable: true,
    inputOnFocus: true,
    autoPadding: true,
    mouse: true,
    label: 'Login',
    shadow: true,
    top: 'center',
    left: 'center',
    border: { type: 'line' },
    style: { fg: 'white' }
});
const input = blessed.textarea({
    parent: login_screen,
    width: '100%',
    height: '100%',
    tags: true,
    top: '10%',
    scrollable: false,
    inputOnFocus: true,
    autoPadding: true,
    mouse: true,
    keys: true,
    border: { type: 'line' },
    style: { fg: 'white' },
});
input.toggle();
const createContainerItem = (text, onclick) => {
    const item = container.addItem(text);
    item.on('mouseover', () => { item.style.bg = 'white'; login_screen.render(); });
    item.on('mouseout', () => { item.style.bg = ''; login_screen.render(); });
    item.on('click', () => { onclick(item); });
    return item;
};
// login_screen.append(container)
///////////////////////////////////////////////////////////////////////
// Login
(async () => {
    const config = await fs.readFileSync(path.resolve(__dirname, 'config', 'auth.config.json'));
    // @ts-ignore
    const json = JSON.parse(config);
    if (json.authToken === null || json.authToken === undefined || json.authToken === '') {
        let foundString = null;
        // let token = null
        // handle login events
        createContainerItem('Login With Discord', (item) => {
            input.toggle();
            container.toggle();
            input.setValue(`--- LOGIN WITH DISCORD ---
- Open Discord desktop client or browser
- Login normally
- Click "F12" and navigate to the "Network" tab (Ctrl+Shift+E)
- Click on "Filter" in the top left and type "messages"
- Send a message in any channel and then select the most recnet "messages" event in the network tab
- Scroll down to "Request Headers" and find the entry named "authorization"
- Copy the value of that entry and then type "fo{/}und" below after the "fo{/}und:" once you have found it
- Press enter to continue

found:`);
            input.readInput();
            input.key('enter', async () => {
                if (foundString /* && input.getValue().split('token:')[1] */) {
                    fs.writeFileSync(path.resolve(__dirname, 'config', 'auth.config.json'), JSON.stringify({
                        authToken: ''
                    }));
                    // save to file
                    //json.authToken = token
                    //fs.writeFileSync(path.resolve(__dirname, 'config', 'auth.config.json'), JSON.stringify(json))
                    //app.addConfigKey('authToken', token)
                    //app.loadMainApp()
                    //app.loadSocketConnection()
                }
                else if (!foundString && input.getValue().split('found:')[1]) {
                    // continue to password
                    foundString = input.getValue().split('found:')[1].split('\n')[0];
                    // input.setValue('Paste the copied to{/}ken after the "to{/}ken:"\nPress enter to login.\n\ntoken:')
                    input.setValue(`Navigate to "${path.resolve(__dirname, 'config', 'auth.config.json')}" in an editor and set "authToken" to your authentication token and then re-run this program. Click "Escape" to exit`);
                    login_screen.render();
                }
                else {
                    process.exit(1);
                }
            });
            item.destroy();
        });
        login_screen.render();
    }
    else {
        container.destroy();
        login_screen.destroy();
        app.addConfigKey('authToken', json.authToken);
        app.loadMainApp();
        app.loadSocketConnection();
    }
})();
