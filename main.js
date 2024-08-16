/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2024-08-12 17:28:19
 * @LastEditors: houqiangxie
 * @LastEditTime: 2024-08-16 16:34:34
 */
// main.js
const { app, BrowserWindow,Tray,Menu ,ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
let win
function createWindow() {
   win = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar:true,
    webContents: {
    openDevTools: true //不想要控制台直接把这段删除
    },
    webPreferences: {
      preload: path.join(__dirname, './js/preload.js'),
      // preload: path.resolve(__dirname, 'js', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    }
  });

  win.loadURL('http://localhost:9527/');
  // win.loadURL('https://qyjgzf.szius.com:5888');

  // 监听应用退出事件，确保托盘图标被删除
  win.on('close', () => {
    app.quit()
    if (tray) {
      clearTray()
      tray.destroy();
      tray = null;
    }
  });


  // 当窗口准备好时，恢复 sessionStorage 数据
  win.webContents.on('did-finish-load', () => {
    const sessionDataPath = path.join(app.getPath('userData'), 'sessionStorage.json');
    if (fs.existsSync(sessionDataPath)) {
      const data = fs.readFileSync(sessionDataPath, 'utf8');
      win.webContents.send('restore-session-storage', data);
    }
  });
  // 监听渲染进程发来的 sessionStorage 数据并保存到文件
  ipcMain.on('save-session-storage', (event, data) => {
    const sessionDataPath = path.join(app.getPath('userData'), 'sessionStorage.json');
    fs.writeFileSync(sessionDataPath, data);
  });
  ipcMain.on('toDoList', (event, data) => {
    // console.log('notificationWindow: ', notificationWindow);
    // if (notificationWindow) notificationWindow.webContents.send('toDoList', data);
    // else {
    //   showNotificationWindow(()=>notificationWindow.webContents.send('toDoList', data))
    // }
    noticeData = data || []
    if(noticeData.length>0){
      toggleTray()
    }else clearTray()
  });
  ipcMain.on('todoListClick', (event, data) => {
    win.webContents.send('todoListClick', data);
    if (!win.isVisible()) {
      win.show()
      win.focus()
    }
  });
}


let notificationWindow
let tray
let noticeData=[]
const createnotificationWindow = (data) => {
  tray = new Tray(path.join(__dirname, "./image/logo.png"))
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('企业端');
  tray.setContextMenu(contextMenu);
  // showNotificationWindow()
  // 当鼠标移到托盘图标上时显示窗口
  tray.on('mouse-enter', (event, bounds) => {
    // console.log('bounds: ', bounds);
    // const x = Math.round(bounds.x + (bounds.width||0) / 2 - 150);
    // console.log('x: ', x);
    // const y = Math.round(bounds.y - 200);
    // console.log('y: ', y);
    showNotificationWindow(noticeData)
  });

  // 当鼠标离开托盘图标时隐藏窗口
  // tray.on('mouse-leave', () => {
  //   setTimeout(()=>{
  //     if (!notificationWindow.isMouseHovered) {
  //      hideNotificationWindow()
  //     }
  //   },300)
  // });

  notificationWindow = new BrowserWindow({
      width: 300,
      height: 200,
      frame: false,
      show: false,
      resizable:true,
      movable:true,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true, // 确保窗口不显示在任务栏
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
    notificationWindow.loadFile(path.join(__dirname, './html/detail.html'));
    // 监听窗口内的鼠标悬停事件
    notificationWindow.webContents.once('did-finish-load', () => {
      notificationWindow.webContents.send('set-hover-listeners');
    });

    // 监听窗口的焦点离开事件
    notificationWindow.on('blur', () => {
      notificationWindow.hide();
    });
    // notificationWindow.on('show', () => {
    //   notificationWindow.webContents.send('toDoList', noticeData);
    // });

}
const showNotificationWindow =(data)=>{
  // if (notificationWindow) {
  //   notificationWindow.close();
  // }
  // 创建消息详情窗口
  // if(!notificationWindow){
    
  // }
  const trayBounds = tray.getBounds();
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (300 / 2));
    const y = Math.round(trayBounds.y-200);
    notificationWindow.setPosition(x, y, false);
  notificationWindow.show();
  setTimeout(() => {
    notificationWindow.webContents.send('todoList', noticeData);
  }, 300);
}
const hideNotificationWindow=()=> {
  if (notificationWindow) {
    notificationWindow.hide();
  }
}
let blinkInterval = null;
let iconIndex = 0;
const toggleTray = () => {
  // 定义两个图标
  const icons = [
    path.join(__dirname, "./image/line.png"),
    path.join(__dirname, "./image/off.png")
  ];

  // 开始闪烁
  blinkInterval = setInterval(() => {
    iconIndex = (iconIndex + 1) % 2;
    tray.setImage(icons[iconIndex]);
  }, 500); // 每500毫秒切换一次图标
}

const clearTray=()=>{
  if(blinkInterval)clearInterval(blinkInterval);
  tray.setImage(path.join(__dirname, "./image/logo.png"));
}

// 处理鼠标悬浮事件
ipcMain.on('mouse-hover', (event, isHovered) => {
  if (notificationWindow) {
    notificationWindow.isMouseHovered = isHovered;
    if(!isHovered)notificationWindow.hide();
  }
});

app.whenReady().then(() => {
  createWindow();
  createnotificationWindow()
  // tray = new Tray(path.join(__dirname, "./image/logo.png")); //设置托盘图标路径const contextMenu = Menu.buildFromTemplate([{label:'退出'click:()=> app.quit()}J);
  // tray.setToolTip('这是一个托盘应用');//设置托盘图标的提示tray.setContextMenu(contextMenu):
  // tray.on('mouse-enter',()=>{
  // //在鼠标移到托盘图标上时显示消息
  // const notification = new Notification({
  // title:'消息标题',
  // body:'这是鼠标移到图标上时显示的消息详情'
  // })
  // notification.show();
  // console.log('notification: ', notification);
  // });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
 // 监听应用退出事件，确保托盘图标被删除
  // app.on('before-quit', () => {
  //   if (tray) {
  //     clearTray()
  //     tray.destroy();
  //     tray = null;
  //   }
  // });
