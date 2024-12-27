import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', (ws) => {
    ws.on('message', (data: any) => {
        const message = JSON.parse(data);
        if(message.type === 'sender'){
            console.log("sender Connected");
            senderSocket = ws;
        }else if(message.type === 'receiver'){
            console.log("Receiver Connected");
            receiverSocket = ws;
        }else if(message.type === 'create-offer'){
            if(ws === senderSocket){
                console.log("sender create offer");
                receiverSocket?.send(JSON.stringify({ type: 'create-offer', sdp: message.sdp}));
            }else if(ws === receiverSocket){
                console.log("receiver create offer");
                senderSocket?.send(JSON.stringify({ type: 'create-offer', sdp: message.sdp}));
            }
        }else if(message.type === 'create-answer'){
            if(ws === senderSocket){
                console.log("sender create answer");
                receiverSocket?.send(JSON.stringify({ type: 'create-answer', sdp: message.sdp}));
            }else if(ws === receiverSocket){
                console.log("receiver create answer");
                senderSocket?.send(JSON.stringify({ type: 'create-answer', sdp: message.sdp}));
            }
        }else if(message.type === 'iceCandidate'){
            if(ws === senderSocket){
                receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate}));
            }else if(ws === receiverSocket){
                senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate}));
            }
        }else if(message.type === 'send-video'){
            if(ws === senderSocket){
                receiverSocket?.send(JSON.stringify({ type: 'send-video'}));
            }
        }
    })
})