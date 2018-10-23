const { app, BrowserWindow } = require('electron')

var kafkaListener = require('./lib/listener/kafkaListener')
var kafkaMessageEvent = require('./lib/event/kafkaMessageEvent')
var rfqMessageHandler = require('./lib/handler/rfqMessageHandler')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

var rfqMessageMap = new Map()

let win

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({ width: 800, height: 600 })

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
  })
}

rfqMessageHandler.initRenderRfqMessage(function (event, templateKey) {
  if (rfqMessageMap.has(templateKey)) {
    var rfqMessages = rfqMessageMap.get(templateKey)
    if (rfqMessages != undefined && rfqMessages != null) {
      event.sender.send(templateKey, rfqMessages)
    }
  }
})

kafkaMessageEvent.onMessage(function (message) {
  var rfqMessage = eval("(" + message + ")")
  // console.log('rfqMessage:')
  // console.log(rfqMessage)
  var templateKey = rfqMessage.rfqProperties[0].value
  var rfqId = rfqMessage.rfqHeader.rfqId
  console.log('tempalteKey: ' + templateKey)
  console.log('rfqId: ' + rfqId)
  if (rfqMessageMap.has(templateKey)) {
    var rfqMessages = rfqMessageMap.get(templateKey)
    if (rfqMessages == undefined || rfqMessages == null) {
      rfqMessages = new Array()
    }
    // rfqMessages.forEach(element => {
    //   if(element.rfqHeader.rfqId == rfqId){

    //   }
    // })
    rfqMessages.push(rfqMessage)
    rfqMessageMap.set(templateKey, rfqMessages)
  } else {
    var rfqMessages = new Array()
    rfqMessages.push(rfqMessage)
    rfqMessageMap.set(templateKey, rfqMessages)
  }

  if (win == null) {
    createWindow();
  }
  else {
    win.webContents.send(templateKey, rfqMessage)
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