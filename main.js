const path = require('path')
const { app, BrowserWindow, globalShortcut } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('index.html')
}
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    // Quit the application if another instance is already running
    app.quit()
} else {

    // do not quit when all windows are closed
    // and continue running on background to listen
    // for shortcuts
    app.on('window-all-closed', (e) => {
        e.preventDefault()
        e.returnValue = false
    })
    app.whenReady().then(() => {
        globalShortcut.register('Ctrl+Meta+M', createWindow)
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })
}
