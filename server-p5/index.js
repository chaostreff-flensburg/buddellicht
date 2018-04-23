'use strict';
const electron = require('electron');
const fs = require("fs");

const app = electron.app;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 1200,
		height: 720
	});

	win.loadURL(`file://${__dirname}/sketch/index.html`);
	win.on('closed', onClosed);

	// auto-reload on filechange in sketch folder
	fs.watch(__dirname + "/sketch", () => {
		win.reload();
	});

	return win;
}

app.commandLine.appendSwitch("disable-renderer-backgrounding");

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
