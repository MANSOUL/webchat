import routes from '../routes.js';
import { removeClass, addClass, text, map, html, hasClass, attr, parent } from '../common.js';
import mSocket, { CANDIDATE, OFFER, ANSWER, BYE } from '../socket/socket.js';
import { getStore, changeInlineUsers, changeToUID } from '../store/store.js';

const $page = document.querySelector('.page-video');
routes.add('/video', handleEnterWebrtcPage);

function handleEnterWebrtcPage() {
  const chater = getStore().toUser;
  const loginer = getStore().loginer;
  if (!chater) {
    window.history.back();
    return;
  }
  removeClass($page, 'page--hidden');
  let pc = null;
  let localStream = null;
  let remoteStream = null;
  const $remoteVideo = document.getElementById('remoteVideo');
  const $localVideo = document.getElementById('localVideo');
  const $hangup = document.getElementById('hangup');
  const $call = document.getElementById('call')
  // style
  $localVideo.style.width = window.innerWidth * 0.25 + 'px';
  $localVideo.style.height = window.innerHeight * 0.25 + 'px';

  /**
   * 请求摄像头权限，并开始拨号
   */
  function startVideo() {
    window.navigator.mediaDevices.getUserMedia({
      video: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }).then((stream) => {
      localStream = stream;
      $localVideo.srcObject = stream;
      pc = createPeerConnection();
      pc.addStream(localStream);
    }, (error) => {
      console.log(`getUserMedia error: ${error.toString()}`);
    });
  }

  /**
   * 挂断
   */
  function hangupCall() {
    pc && pc.close();
    pc = null;
    if (localStream.active) {
      localStream.getTracks()[0].stop();
    }
  }

  function handleCall() {
    doCall();
  }

  /********* webrtc object ************/
  function createPeerConnection() {
    try {
      let pc = new RTCPeerConnection();
      pc.addEventListener('icecandidate', handleIceCandidate);
      pc.addEventListener('iceconnectionstatechange', handleIceCandidateStateChange);
      pc.addEventListener('addstream', handleAddRemoteStream);
      pc.addEventListener('removestream', handleRemoveRemoteStream);
      return pc;
    } catch (error) {
      console.log('Failed to create PeerConnection, exception: ' + error.message);
      alert('Cannot create RTCPeerConnection object.');
      return null;
    }
  }

  /**
   * call 
   */
  function doCall() {
    pc.createOffer(
      (sessionDescription) => {
        pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        // 发起OFFER
        mSocket.sendMessage(OFFER, {
          touid: chater.uid,
          data: sessionDescription
        });
      }, (error) => {
        console.log('createOffer() error: ', error);
      });
  }

  /**
   * 应答
   */
  function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
      (sessionDescription) => {
        pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        // 发起ANSWER
        mSocket.sendMessage(ANSWER, {
          touid: chater.uid,
          data: sessionDescription
        });
      },
      (error) => {
        console.log('Failed to create session description: ' + error.toString());
      }
    );
  }

  function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      mSocket.sendMessage(CANDIDATE, {
        touid: chater.uid,
        data: {
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        }
      });
    } else {
      console.log('End of candidates.');
    }
  }

  function handleIceCandidateStateChange() {

  }

  function handleAddRemoteStream(event) {
    console.log('remote stream add');
    remoteStream = event.stream;
    $remoteVideo.srcObject = remoteStream;
  }

  function handleRemoveRemoteStream(event) {
    console.log('Remote stream removed. Event: ', event);
  }

  /**** socket ****/
  function handleOnSocketMessage(message) {
    console.log('Client received message:', message);
    const { type, data } = message;
    if (type === OFFER) {
      console.log('received offer: ', data);
      pc.setRemoteDescription(new RTCSessionDescription(data));
      doAnswer();
    } else if (type === ANSWER) {
      pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === CANDIDATE) {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: data.label,
        candidate: data.candidate
      });
      pc.addIceCandidate(candidate);
    } else if (type === BYE) {
      hangupCall();
    }
  }

  mSocket.on('message', handleOnSocketMessage);

  // bind events
  $hangup.addEventListener('click', hangupCall);
  $call.addEventListener('click', handleCall);

  //
  startVideo();
}



