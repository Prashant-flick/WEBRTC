import { useEffect, useRef, useState } from 'react'

const Sender = () => {
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const otherVideoRef = useRef<HTMLVideoElement|null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null)
  
  useEffect(() => {
    if(socket)return;
    const socket1 = new WebSocket('ws://localhost:8080');
    setSocket(socket1)
    socket1.onopen = () => {
      socket1.send(JSON.stringify({ type: 'sender'}));
    }
  }, [socket])

  useEffect(() => {      
    if(!socket) return;
    let pc : null | RTCPeerConnection = null;
    socket.onmessage = async(event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'create-offer'){
        console.log("here-offer");
        
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);

        pc.onicecandidate = (event) => {
          if( event.candidate ){
            socket.send(JSON.stringify({  type: 'iceCandidate', candidate: event.candidate}))
          }
        }

        pc.ontrack = (event) => {
          console.log(event);
          if(videoRef.current){
            videoRef.current.srcObject = new MediaStream([event.track]);
            videoRef.current.muted = true
            videoRef.current.play();
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.send(JSON.stringify({ type: 'create-answer', sdp: pc.localDescription}))

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
        pc.addTrack(stream.getVideoTracks()[0]);
      }else if(message.type === 'iceCandidate'){
        if(pc!==null){
          await pc.addIceCandidate(message.candidate)
        }
      } 
    }
  },[socket])
  
  const handleSendVideo = async() => {
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
        socket.send(JSON.stringify({ type: 'send-video' }))
      }else if(message.type === 'iceCandidate'){
        await pc.addIceCandidate(message.candidate)
      }else if(message.type === 'create-offer'){
        const pc1 = new RTCPeerConnection();
        pc1.setRemoteDescription(message.sdp);
        pc1.onicecandidate = (event) => {
          if( event.candidate ){
            socket.send(JSON.stringify({  type: 'iceCandidate', candidate: event.candidate}))
          }
        }

        pc1.ontrack = (event) => {
          console.log(event);
          if(videoRef.current){
            videoRef.current.srcObject = new MediaStream([event.track]);
            videoRef.current.muted = true
            videoRef.current.play();
          }
        }

        const answer = await pc1.createAnswer();
        await pc1.setLocalDescription(answer);
        socket?.send(JSON.stringify({ type: 'create-answer', sdp: pc1.localDescription}))

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
        if(otherVideoRef.current){
          otherVideoRef.current.srcObject = stream;
          otherVideoRef.current.play();
        }
        pc1.addTrack(stream.getVideoTracks()[0]);
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false});
    pc.addTrack(stream.getVideoTracks()[0]);
  }

  return (
    <div>
      <div>
        <h1> Sender </h1>
        <button
          onClick={handleSendVideo}
        > Send Video </button>
      </div>
      <video ref={videoRef}></video>
      <video ref={otherVideoRef}></video>
    </div>
  )
}

export default Sender