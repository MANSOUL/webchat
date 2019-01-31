/**
 * 1. 创建RTCPeerConnection
 * 
 * 2. peerConnection监听icecandidate事件
 * 
 * 3. 本地peerConnection创建offer
 * 
 * 4. 本地peerConnection将offser的description使用setLocalDescription加入到本地描述，
 *     远程peerConnection将offser的description使用setRemoteDescription设置为远程描述
 *     
 * 5. 远程peerConnection创建answer
 * 
 * 6. 本地peerConnection将offser的description使用setRemoteDescription设置为远程描述，
 *     远程peerConnection将offser的description使用setLocalDescription加入到本地描述
 *     
 * 7. 两个peerConnection连接上之后会触发icecandidate事件
 *
 * 8. 两个peerConnection通过addIceCandidate将对方添加到自己的candidate
 *
 * 9.
 */



const $localVideo = document.getElementById('localVideo');
const $remoteVideo = document.getElementById('remoteVideo');
const $startButton = document.getElementById('startButton');
const $callButton = document.getElementById('callButton');
const $hangupButton = document.getElementById('hangupButton');

let localStream;
let remoteStream;

let localPeerConnection;
let remotePeerConnection;

const mediaStreamConstrains = {
  video: true
}; 

const offsetOptions = {
  offsetToReceiveVideo: 1
};

// 设置按钮不可用
$callButton.disabled = true;
$hangupButton.disabled = true;


// 按钮点击处理
$startButton.addEventListener('click', handleStartAction);
$callButton.addEventListener('click', handleCallAction);
$hangupButton.addEventListener('click', handleHangupAction);

// video 事件
$localVideo.addEventListener('loadedmetadata', logVideoLoaded);
$remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
$remoteVideo.addEventListener('resize', logResizedVideo);

// video handlers
function logVideoLoaded(e) {
  const video = event.target;
  trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
        `videoHeight: ${video.videoHeight}px.`);
}
function logResizedVideo(event) {
  logVideoLoaded(event);

  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    startTime = null;
    trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
  }
}


function handleStartAction() {
  $startButton.disabled = true;
  navigator.mediaDevices.getUserMedia(mediaStreamConstrains)
    .then(handleGotLocalMediaStream)
    .catch(handleLocalMediaStreamError);
  trace('requesting local stream.');
}


let startTime;
function handleCallAction() {
  $callButton.disabled = true;
  $hangupButton.disabled = false;

  trace('starting call.');
  startTime = window.performance.now();

  // 获取本地流轨道
  const videoTracks = localStream.getVideoTracks();
  const audioTracks = localStream.getAudioTracks();

  if (videoTracks.length > 0) {
    trace(`using video device: ${videoTracks[0].label}`);
  }

  if (audioTracks.length > 0) {
    trace(`using audio device: ${audioTracks[0].label}`);
  }

  const servers = null;

  // 创建 本地连接
  localPeerConnection = new RTCPeerConnection(servers);
  trace('create local peer connection object localPeerConnection.');
  // TODO 本地连接监听是否有连接加入或变化
  localPeerConnection.addEventListener('icecandidate', handleConnection);
  localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);

  // 创建 远程连接
  remotePeerConnection = new  RTCPeerConnection(servers);
  trace('create remote peer connection object remotePeerConnection.');
  // TODO
  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener('icecandidatestatechange', handleConnectionChange);
  // TODO 远程监听流加入
  remotePeerConnection.addEventListener('addstream', handleGotRemoteStream);

  // 本地将流加入到通道中
  localPeerConnection.addStream(localStream);
  trace('add local stream to localPeerConnection.');

  // TODO 本地开始创建发起一个连接请求
  trace('localPeerConnection createOffer start.');
  localPeerConnection.createOffer(offsetOptions)
    .then(handleCreatedOffer)
    .catch(setSessionDescriptionError);
}

function handleHangupAction() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  $hangupButton.disabled = true;
  $startButton.disabled = false;
  trace('ending call.');
}


// local stream handler
function handleGotLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
  trace('received local stream.');
  callButton.disabled = false;
}

function handleLocalMediaStreamError(error) {
  trace(`navigator.getUserMedia error: ${error.toString()}.`);
}

// conenction handler
function handleConnection(e) {
  trace('connection start.')
  const peerConnection = e.target;
  const iceCandidate = e.candidate;
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);

    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        handleConnectionSuccess(peerConnection);
      })
      .catch(() => {
        handleConnectionFailure(peerConnection, error);
      });

    trace(`${getPeerName(peerConnection)} ICE candidate: \n ${event.candidate.candidate}`);
  }
}

function handleConnectionChange(e) {
  const peerConnection = e.target;
  trace('ice state change event: ', event);
  trace(`${getPeerName(peerConnection)} ICE state: ${peerConnection.iceConnectionState}`);
}

function handleConnectionSuccess(peerConnection) {
  trace(`${getPeerName(peerConnection)} addIceCandidate success.`);
}

function handleConnectionFailure(peerConnection, error) {
  trace(`${getPeerName(peerConnection)} fail to addIceCandidate: \n ${error.toString()}`);
}


// created offer handlers
function handleCreatedOffer(description) {
  trace(`offer from localPeerConnection: \n${description.sdp}`);
  trace(`localPeerConnection setLocalDescription start.`);
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(localPeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace('remotePeerConnection setRemoteDescription start.');
  remotePeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(remotePeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace('remotePeerConnection createAnswer start.');
  remotePeerConnection.createAnswer()
    .then(handleCreatedAnwser)
    .catch(setSessionDescriptionError)
}

function handleCreatedAnwser (description) {
  trace(`answer from remotePeerConnection:\n${description.sdp}.`);
  trace(`remotePeerConnection setLocalDescription start.`);
  remotePeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(remotePeerConnection);
    })
    .catch(setSessionDescriptionError);

  trace(`localPeerConnection setRemoteDescription start.`);
  localPeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(localPeerConnection);
    })
    .catch(setSessionDescriptionError);
}

// description handles
function setLocalDescriptionSuccess (peerConnection) {
  setDescriptionSuccess(peerConnection, 'setLocalDescription');
}

function setRemoteDescriptionSuccess (peerConnection) {
  setDescriptionSuccess(peerConnection, 'setRemoteDescription');
}

function setSessionDescriptionError (error) {
  trace(`Failed to create session description: ${error.toString()}.`);
}

function setDescriptionSuccess(peerConnection, functionName) {
  const peerName = getPeerName(peerConnection);
  trace(`${peerName} ${functionName} complete.`);
}


// got stream handlers
function handleGotRemoteStream(e) {
  const mediaStream = e.stream;
  $remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
  trace('remote peer connection received remote stream.');
}

// get connection info
function getPeerName(peerConnection) {
  return peerConnection === localPeerConnection ? 'pc1' : 'pc2';
}

function getOtherPeer(peerConnection) {
  return peerConnection === localPeerConnection ? remotePeerConnection : localPeerConnection;
}

// trace log
function trace(content) {
  console.log(content);
}