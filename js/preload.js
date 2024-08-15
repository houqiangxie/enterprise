const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
  pathJoin: (...args) => path.join(...args),
  __dirname: __dirname,
  sendMessage: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receiveMessage: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
