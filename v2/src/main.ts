import { app, BrowserWindow, globalShortcut, GlobalShortcut} from 'electron';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow | null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // this is the default value if nodeIntegration is true}
        }
        })
    mainWindow.loadFile('index.html')
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    // Quit the application if another instance is already running
    app.quit()
} else {

    // do not quit when all windows are closed
    // and continue running on background to listen
    // for shortcuts
    app.on('window-all-closed', (e : any) => {
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
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
