import { useCallback, useEffect, useRef, useState } from 'react'

const Receiver = () => {

  const myVideoRef = useRef<HTMLVideoElement|null>(null);
  const otherVideoRef = useRef<HTMLVideoElement|null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if(socket)return
    const socket1 = new WebSocket('ws://localhost:8080')
    setSocket(socket1)
    socket1.onopen = () => {
      socket1.send(JSON.stringify({ type: 'receiver'}));
    }
  }, [socket])

  const sendVideo = useCallback(async() => {
    if(!socket) return;

    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async() => {         
      const offer = await pc.createOffer(); // sdp
      await pc.setLocalDescription(offer);
      socket?.send(JSON.stringify({ type: 'create-offer', sdp: pc.localDescription}))
    }

    pc.onicecandidate = (event) => {
      if(event.candidate){
        socket?.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate}))
      }
    }

    socket.onmessage = async(event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'create-answer'){
        await pc.setRemoteDescription(message.sdp); 
      }else if(message.type === 'iceCandidate'){
        await pc.addIceCandidate(message.candidate)
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
    if(otherVideoRef.current){
      otherVideoRef.current.srcObject = stream;
      otherVideoRef.current.play();
    }
    pc.addTrack(stream.getVideoTracks()[0])
  },[socket])

  useEffect(() => {    
    if(socket===null) return;

    let pc : null | RTCPeerConnection = null;
    socket.onmessage = async(event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'create-offer'){
        console.log("here3");
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);

        pc.onicecandidate = (event) => {
          if( event.candidate ){
            socket.send(JSON.stringify({  type: 'iceCandidate', candidate: event.candidate}))
          }
        }

        pc.ontrack = (event) => {
          console.log(event);
          if(myVideoRef.current){
            myVideoRef.current.srcObject = new MediaStream([event.track]);
            myVideoRef.current.muted = true
            myVideoRef.current.play();
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.send(JSON.stringify({ type: 'create-answer', sdp: pc.localDescription}))
      }else if(message.type === 'iceCandidate'){
        if(pc!==null){
          await pc.addIceCandidate(message.candidate)
        }
      }else if(message.type === 'send-video'){
        sendVideo();
      }
    }
  },[socket, sendVideo])

  return (
    <div>
      <h1>Receiver</h1>
      <video ref={myVideoRef}></video>
      <video ref={otherVideoRef}></video>
    </div>
  )
}

export default Receiver