const { app, BrowserWindow, Menu } = require('electron')

var kafkaListener = require('./lib/listener/kafkaListener')
var kafkaMessageEvent = require('./lib/event/kafkaMessageEvent')
var rfqMessageHandler = require('./lib/handler/rfqMessageHandler')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var rfqMessageMap = new Map()
var winMap = new Map()
// let win

function createWindow(templateKey) {

  // 创建浏览器窗口。
  var win = new BrowserWindow({ width: 800, height: 600 })

  // 然后加载应用的 index.html。
  win.loadFile('index.html')

  // 打开开发者工具
  win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
    winMap.set(templateKey, win)
  })

  console.log('winmap set tempalteKey: ' + templateKey)
  winMap.set(templateKey, win)
}

rfqMessageHandler.initRenderRfqMessage(function (event, templateKey) {
  if (rfqMessageMap.has(templateKey)) {
    var rfqMessages = rfqMessageMap.get(templateKey)
    if (rfqMessages != undefined && rfqMessages != null) {
      event.sender.send(templateKey, rfqMessages)
    }
  }
})

rfqMessageHandler.closeWindow(function (event, tempalteKey) {
  console.log(tempalteKey)
  if (winMap.has(tempalteKey)) {
    console.log(" close tempalteKey:" + tempalteKey)
    var closeWindow = winMap.get(tempalteKey)
    closeWindow.close()
    winMap.set(tempalteKey, null)
  }
})

kafkaMessageEvent.onMessage(function (message) {
  var rfqMessage = eval("(" + message + ")")
  var templateKey = rfqMessage.rfqProperties[0].value
  var rfqId = rfqMessage.rfqHeader.rfqId
  var isExist = false
  console.log('tempalteKey: ' + templateKey)
  console.log('rfqId: ' + rfqId)
  if (rfqMessageMap.has(templateKey)) {
    var rfqMessages = rfqMessageMap.get(templateKey)
    rfqMessages.forEach((item, index) => {
      if (!isExist) {
        if (item.rfqHeader.rfqId == rfqId) {
          if (rfqMessage.rfqHeader.routingtargets.indexOf("closerole:") > -1) {
            console.log('delete rfqId: ' + rfqId)
            rfqMessages.splice(index, 1)
          }
          else {
            console.log('update rfqId: ' + rfqId)
            rfqMessages[index] = rfqMessage
          }
          isExist = true;
        }
      }
    })

    if (!isExist) {
      rfqMessages.unshift(rfqMessage)
    }
    rfqMessageMap.set(templateKey, rfqMessages)

  } else {
    var rfqMessages = new Array()
    rfqMessages.unshift(rfqMessage)
    rfqMessageMap.set(templateKey, rfqMessages)
  }

  var window = winMap.get(templateKey)
  if (window == undefined || window == null) {
    if (rfqMessage.rfqHeader.routingtargets.indexOf("popuprole:") > -1) {
      createWindow(templateKey)
    }
  }
  else {
    window.webContents.send(templateKey, rfqMessage)
  }
})

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
// app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})