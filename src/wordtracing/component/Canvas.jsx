import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils/drawing_utils";
import { Camera } from "@mediapipe/camera_utils/camera_utils";
import { detectHandGesture } from "../../MainPage/Component/HandGesture"
import * as constants from "../../utils/Constants"
import "../Game.css"
import canvasPicture from "../img/canvas.png" 
import Tesseract from 'tesseract.js';

function Canvas() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // 그리기 변수
  const canvasRef2 = useRef(null);
  const contextRef = useRef(null);
  const handGesture = useRef(constants.HOVER);

  //스팰링 도안 캔버스 변수
  const spellingArtOfCanvasRef = useRef(null);
  const spellingArtOfContextRef = useRef(null);

  //현재 시점 그리기 변수
  const pointOfContextRef = useRef(null);
  const pointOfCanvasRef = useRef(null);

  const preFingerPositionX = useRef(null);
  const preFingerPositionY = useRef(null);
  const [fingerPosition, setFingerPosition] = useState({
    x: null,
    y: null
  });

  //window size
  const [windowSize, setWindowSize] = useState({
      width: window.innerHeight*constants.HEIGHT_RATIO*(4.0 / 3.0),
      height: window.innerHeight*constants.HEIGHT_RATIO
  });

  //단어목록
  const wordList = ["apple", "Z", "cat", "Zoo", "b", "bread", "J"];

  // 손그리기 캔버스
  useEffect(() => {
    let radius = 20;

    if(handGesture.current == constants.DRAW && (preFingerPositionX == null || preFingerPositionY == null)){
      return;
    }

    switch(handGesture.current){
      case constants.DRAW:
        contextRef.current.beginPath();
        contextRef.current.moveTo(preFingerPositionX.current, preFingerPositionY.current);
        contextRef.current.lineTo(fingerPosition.x, fingerPosition.y);
        contextRef.current.stroke();
        contextRef.current.closePath();   
        break;
      case constants.ERASE:
        contextRef.current.save();
        contextRef.current.beginPath();
        contextRef.current.arc(fingerPosition.x, fingerPosition.y, radius, 0, 2*Math.PI, true);
        contextRef.current.clip();
        contextRef.current.clearRect(fingerPosition.x - radius, fingerPosition.y - radius, radius*2, radius*2);
        contextRef.current.restore();
        break;
      case constants.OK:
        checkIfWordsMatch();
        break;
    }

    if (contextRef.current) {
      preFingerPositionX.current = fingerPosition.x;
      preFingerPositionY.current = fingerPosition.y;
    }
  }, [fingerPosition])

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3.1626903359/${file}`;
      }
    })
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    canvasRef2.current.focus();
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: constants.CANVAS_WIDTH,
        height: constants.CANVAS_HEIGHT,
      });
      camera.start();
    }

    hands.onResults(onResults);

    //사용자 그리기 캔버스
    const canvas = canvasRef2.current;
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "orange";
    context.lineWidth = 10;

    contextRef.current = context;

    //영어 단어 스펠링 도안 캔버스
    const spellingArtCanvas = spellingArtOfCanvasRef.current;
    spellingArtCanvas.width = windowSize.width;
    spellingArtCanvas.height = windowSize.height;

    const spellingArtOfContext = spellingArtCanvas.getContext("2d");

    let spellingArtImg = new Image();

    spellingArtImg.src = canvasPicture;
    spellingArtImg.onload = () => {
      spellingArtOfContext.drawImage(
        spellingArtImg, 0, 0, spellingArtCanvas.width, spellingArtCanvas.height);
    }
    spellingArtOfContext.fillRect(0, 0, spellingArtCanvas.width, spellingArtCanvas.height);

    spellingArtOfContextRef.current = spellingArtOfContext;

    //현재 8번 포인트가 가리키는 지점 표시
    const pointOfCanvas = pointOfCanvasRef.current;
    pointOfCanvas.width = windowSize.width;
    pointOfCanvas.height = windowSize.height;

    const pointOfContext = pointOfCanvas.getContext("2d");
    pointOfContextRef.current = pointOfContext;

    // pointOfContext.lineCap = "round";
    // pointOfContext.strokeStyle = "orange";
    // pointOfContext.lineWidth = 8;
  }, []);

  //윈도우 화면 resize시 캔버스와
  const handleResize = () => {
    let height = window.innerHeight*constants.HEIGHT_RATIO;
    let width = height*(4.0 / 3.0);

    setWindowSize({
      width: width,
      height: height
    });
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }  
  }, [])

  const getCurrentHandGesture = () => {    
    switch(handGesture.current){
      case constants.DRAW:
        return "Draw";
      case constants.ERASE:
        return "Erase";
      case constants.OK:
        return "Ok";
      default:
        return "Hover";
    }
  }

  const onResults = (results) => {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    canvasCtx.save(); //현재상태를 저장
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);   // 직사각형 영역의 픽셀을 투명한 검은색으로 설정
    canvasCtx.translate(videoWidth, 0); // 비디오 가로만큼 이동해서 손그릴 캔버스를 웹캠과 일치하도록 설정
    canvasCtx.scale(-1, 1);  // 뒤집기 

    // 캔버스 이미지 그리기
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // 손가락 부분 그리기
    if (results.multiHandLandmarks) {

      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { // 손가락 선
          color: "#00FF00",
          lineWidth: 1,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FFFFFF", lineWidth: 2 }); // 손가락 점
      }
      
      let x = parseInt(windowSize.width - results.multiHandLandmarks[0][8].x*windowSize.width);
      let y = parseInt(windowSize.height*results.multiHandLandmarks[0][8].y);

      handGesture.current = detectHandGesture(results.multiHandLandmarks[0]);  //현재 그리기 모드

      let radius = 10;

      //현재 8번으로 포인트되는 지점 표시
      pointOfContextRef.current.clearRect(0, 0, windowSize.width, windowSize.height);
      pointOfContextRef.current.beginPath();
      pointOfContextRef.current.arc(x, y, radius, 0, 2 * Math.PI, false);
      // pointOfContextRef.current.fillStyle = contextRef.current.strokeStyle;
      // pointOfContextRef.current.fillRect();
      pointOfContextRef.current.lineWidth = 3;
      pointOfContextRef.current.strokeStyle = "ffa03b";
      pointOfContextRef.current.stroke();
      pointOfContextRef.current.closePath();

      setFingerPosition({ x: x, y: y });
    }
    //save한 곳으로 이동
    canvasCtx.restore();
  };

  //사용자가 적은 단어와 제시된 단어의 일치 여부 확인
  const checkIfWordsMatch = ( ) => {
    const image = canvasRef2.current.toDataURL("image/png");
    saveImage(image);
  };

  const saveImage = (imgDataUrl) => {
  
    var blobBin = atob(imgDataUrl.split(',')[1]);	// base64 데이터 디코딩
    var array = [];
    for (var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
    }

    var file = new Blob([new Uint8Array(array)], {type: 'image/png'});	// Blob 생성
    const image = URL.createObjectURL(file);
  
    Tesseract.recognize(image, 'eng', {
      logger: (m) => {
        console.log(m);
      
      },
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        console.log("결과값 + " + result.data.text);
      });

}

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}>
      <div style={{
        textShadow: "-1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000",
        position: "absolute", 
        width:"100%",
        height: "80%",
        bottom: "0",
        display: "flex",
        justifyContent: "center",
        // marginTop: "10px",
        // marginRight: "10px",
        // alignItems: "center",
        textAlign: "center",
        fontSize: "500%",
        fontFamily: "Bungee_Outline",
        zIndex: 2,
        color: "black",
      }}>
        { wordList[5] }
      </div>
      {/* <div style={{
        position: "absolute", 
        width:"100%",
        height:"100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontSize: "20px",
        color: "white",
        zIndex: 16,
      }}>
      </div> */}
      <Webcam
        audio={false}
        mirrored={true}
        ref={webcamRef}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: '(0, 0, 0, 0.5)',
          // objectFit: "cover", 
          // objectPosition: "center"
        }}
      />
      <canvas
        ref={canvasRef}
        mirrored={true}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          height: "100%",
          // objectFit: "cover", 
          // objectPosition: "center"
        }}>
      </canvas>
      <canvas
        ref={canvasRef2}
        mirrored={true}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          textAlign: "center",
          zIndex: 3,
          width: "100%",
          height: "100%",
          // objectFit: "cover", 
          // objectPosition: "center"
        }}>
      </canvas>
      <canvas
        ref={spellingArtOfCanvasRef}
        mirrored={true}    
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          textAlign: "center",
          zIndex: 1,
          width: "100%",
          height: "100%",
          background: "transparent"
          // objectFit: "cover", 
          // objectPosition: "center"
        }}>
      </canvas>
      <canvas
        ref={pointOfCanvasRef}
        mirrored={true}
        tabIndex={0}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          textAlign: "center",
          zIndex: 4,
          width: "100%",
          height: "100%",
          // objectFit: "cover", 
          // objectPosition: "center"
        }}>
      </canvas>
    </div>
  )
}

export default Canvas;
