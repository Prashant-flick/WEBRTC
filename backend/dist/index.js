"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'sender') {
            console.log("sender Connected");
            senderSocket = ws;
        }
        else if (message.type === 'receiver') {
            console.log("Receiver Connected");
            receiverSocket = ws;
        }
        else if (message.type === 'create-offer') {
            if (ws === senderSocket) {
                console.log("sender create offer");
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'create-offer', sdp: message.sdp }));
            }
            else if (ws === receiverSocket) {
                console.log("receiver create offer");
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'create-offer', sdp: message.sdp }));
            }
        }
        else if (message.type === 'create-answer') {
            if (ws === senderSocket) {
                console.log("sender create answer");
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'create-answer', sdp: message.sdp }));
            }
            else if (ws === receiverSocket) {
                console.log("receiver create answer");
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'create-answer', sdp: message.sdp }));
            }
        }
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            }
            else if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            }
        }
        else if (message.type === 'send-video') {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'send-video' }));
            }
        }
    });
});
