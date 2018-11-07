const ipcMain = require('electron').ipcMain

function sendRenderRfqMessage(templateKey, rfqMessage) {
    ipcMain.send(templateKey, rfqMessage);
}

function initRenderRfqMessage(initRfqMessage) {
    // ipcMain.on('messageInit', function (event, templateKey) {
    //     event.sender.send(templateKey, rfqMessage)
    // })
    ipcMain.on('initRfqMessage', initRfqMessage)
}

function closeWindow(closeWindow) {
    ipcMain.on('close', closeWindow)
}

exports.sendRenderRfqMessage = sendRenderRfqMessage
exports.initRenderRfqMessage = initRenderRfqMessage
exports.closeWindow = closeWindow