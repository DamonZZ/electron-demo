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

exports.sendRenderRfqMessage = sendRenderRfqMessage
exports.initRenderRfqMessage = initRenderRfqMessage