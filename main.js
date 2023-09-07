const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const resizeImg = require('resize-img');
const { existsSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

process.env.NODE_ENV == 'production';

const isDevelopment = process.env.NODE_ENV !== 'production';

let win;

function createWindow() {
    win = new BrowserWindow({
        title: 'Image Resizer',
        width: isDevelopment ? 1200 : 800,
        height: isDevelopment ? 900 : 600,
        contextIsolation: true,
        nodeIntegration: true,
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDevelopment) {
        win.webContents.openDevTools();
    }

    win.loadFile(path.join(__dirname, './renderer/index.html'));
}

function createAboutWindow() {
    const win = new BrowserWindow({
        title: 'About',
        width: isDevelopment ? 600 : 300,
        height: isDevelopment ? 600 : 300
    });

    win.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
    createWindow();

    console.log('starting ...');

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    if (isDevelopment) {
        Menu.setApplicationMenu(mainMenu);
    }

    win.on('closed', () => (win = null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Menu template
const menuTemplate = [
    {
        // role: 'fileMenu'
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit(),
                accelerator: 'CmdOrCtrl + W'
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }
];

// Respond to ipcRenderer
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
});

async function resizeImage({ imgPath, width, height, dest }) {
    try {
        const newPath = await resizeImg(readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        // Create filename
        const filename = path.basename(imgPath);

        // Create destination folder if doesnt exist
        if (!existsSync(dest)) {
            mkdirSync(dest);
        }

        // Write file to destination
        writeFileSync(path.join(dest, filename), newPath);

        // Send success to renderer
        win.webContents.send('image:done');

        shell.openPath(dest);

    } catch (error) {
        console.log(error);
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});