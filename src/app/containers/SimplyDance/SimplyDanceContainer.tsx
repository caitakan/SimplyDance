import React from 'react';
import { RouteComponentProps } from 'react-router';
import ReactPlayer from 'react-player';
import * as posenet from '@tensorflow-models/posenet';
import {
  drawKeypoints,
  drawSkeleton,
  drawBoundingBox,
  createPoseVector,
  cosineDistanceMatching
} from './Utilities/util';
const keysData = require('./Data/keys.json');
const keyPointsDictionary = require('./Data/keyPointDict.json');
export const SimplyDanceContainer = React.memo((props: RouteComponentProps<{ [key: string]: string }>) => {
  const isExerciseMode = props.match.params['mode'] === 'exercise';
  const [isRefVideoPlay, setisRefVideoPlay] = React.useState<boolean>(false);
  const videoWidth = 600;
  const videoHeight = 500;
  const defaultQuantBytes = 2;
  const defaultMobileNetMultiplier = 0.75;
  const defaultMobileNetStride = 16;
  const defaultMobileNetInputResolution = 500;
  const defaultHardLevel = React.useRef(0.35);
  const [defaultdifficulty, setdefaultdifficulty] = React.useState<number>(0.35);
  const keys: string[] = keysData.map((key: any) => Object.keys(key)[0]);
  let j = 0;
  const newKeys = [keys[0]];
  //make each frame at least 300 ms
  keys.forEach((key, i) => {
    if (i > 0 && Number(key) * 50 - 300 > Number(newKeys[j]) * 50) {
      newKeys.push(key);
      j++;
    }
  });
  const isPlayRef = React.useRef(false);
  const timeStamps: number[] = newKeys.map((key: any) => Number(key) * 50);
  const guiState = {
    algorithm: 'single-pose',
    input: {
      architecture: 'ResNet50',
      outputStride: defaultMobileNetStride,
      inputResolution: defaultMobileNetInputResolution,
      multiplier: defaultMobileNetMultiplier,
      quantBytes: defaultQuantBytes
    },
    singlePoseDetection: {
      minPoseConfidence: 0.1,
      minPartConfidence: 0.5
    },
    multiPoseDetection: {
      maxPoseDetections: 5,
      minPoseConfidence: 0.15,
      minPartConfidence: 0.1,
      nmsRadius: 30.0
    },
    output: {
      showVideo: true,
      showSkeleton: true,
      showPoints: true,
      showBoundingBox: false
    },
    net: (null as unknown) as posenet.PoseNet
  };
  const [showContent, setshowContent] = React.useState<boolean>(false);

  async function setupCamera() {
    // if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    //   throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    // }

    const userVideo = document.getElementById('userVideo') as any;
    userVideo.width = videoWidth;
    userVideo.height = videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight
      }
    });
    userVideo.srcObject = stream;

    return new Promise((resolve) => {
      userVideo.onloadedmetadata = () => {
        resolve(userVideo);
      };
    });
  }

  async function loadVideo() {
    const video = await setupCamera();
    (video as any).play();

    return video;
  }
  const toggleRef = React.useRef(false);
  const keyIndexRef = React.useRef(-1);
  const startTimeRef = React.useRef(undefined as any);
  const showSkeletonRef = React.useRef(false);
  function detectPoseInRealTime(video: any, net: posenet.PoseNet) {
    const canvas = document.getElementById('output') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as any;

    // since images are being fed from a webcam, we want to feed in the
    // original image and then just flip the keypoints' x coordinates. If instead
    // we flip the image, then correcting left-right keypoint pairs requires a
    // permutation on all the keypoints.
    const flipPoseHorizontal = true;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    async function poseDetectionFrame() {
      let poses = [] as any;
      let minPoseConfidence: any;
      let minPartConfidence: any;
      switch (guiState.algorithm) {
        case 'single-pose':
          const pose = await guiState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'single-person'
          });
          poses = poses.concat(pose);
          minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
          minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
          break;
        case 'multi-pose':
          let all_poses = await guiState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'multi-person',
            maxDetections: guiState.multiPoseDetection.maxPoseDetections,
            scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
            nmsRadius: guiState.multiPoseDetection.nmsRadius
          });

          poses = poses.concat(all_poses);
          minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
          minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
          break;
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (guiState.output.showVideo) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores
      poses.forEach(({ score, keypoints }: any) => {
        if (score >= minPoseConfidence) {
          const currentTime = Math.ceil(playerRef.current.getCurrentTime() * 1000);
          console.log(
            keyIndexRef.current,
            currentTime,
            newKeys[keyIndexRef.current],
            Number(newKeys[keyIndexRef.current]) * 50 - currentTime
          );
          if (keyIndexRef.current > 0 && keyIndexRef.current <= newKeys.length) {
            const refKeypoint = keyPointsDictionary[newKeys[keyIndexRef.current - 1]];

            var poseVector = createPoseVector(keypoints);
            var gtVector = refKeypoint ? createPoseVector(refKeypoint) : keypoints;
            var similarityScore = cosineDistanceMatching(poseVector, gtVector, newKeys[keyIndexRef.current - 1]);
            if (similarityScore < defaultHardLevel.current) {
              //   console.log('sim score', poseVector, similarityScore);
              overRideRef.current = true;
              showSkeletonRef.current = false;
              if (!isExerciseMode) {
                toggleRef.current && playModeMatch();
              }
              refVideoPlayPauseToggle();
            }
            if (Date.now() - startTimeRef.current >= 2000 && showSkeletonRef.current && isExerciseMode) {
              drawKeypoints(refKeypoint, minPartConfidence, ctx);
              drawSkeleton(refKeypoint, minPartConfidence, ctx);
            }

            drawBoundingBox(refKeypoint, ctx);
          }

          if (
            currentTime - 35 < timeStamps[keyIndexRef.current] &&
            timeStamps[keyIndexRef.current] < currentTime + 35
          ) {
            if (isExerciseMode) {
              console.log(
                keyIndexRef.current,
                currentTime,
                newKeys[keyIndexRef.current],
                Number(newKeys[keyIndexRef.current]) * 50 - currentTime
              );
              startTimeRef.current = Date.now();
              showSkeletonRef.current = true;
              refVideoPlayPauseToggle();
            }
            toggleRef.current = true;

            keyIndexRef.current++;
          }
          if (guiState.output.showPoints) {
            drawKeypoints(keypoints, minPartConfidence, ctx);
          }
          if (guiState.output.showSkeleton) {
            drawSkeleton(keypoints, minPartConfidence, ctx);
          }
          if (guiState.output.showBoundingBox) {
            drawBoundingBox(keypoints, ctx);
          }
        }
      });

      requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
  }

  const [score, setscore] = React.useState<number>(0);
  const scoreRef = React.useRef(0);
  const playModeMatch = () => {
    toggleRef.current = false;
    scoreRef.current++;
    setscore(scoreRef.current);
    console.log(scoreRef.current);
  };

  async function bindPage() {
    const net = await posenet.load({ architecture: 'ResNet50' } as any);
    guiState.net = net;
    let video;
    try {
      video = await loadVideo();
      setshowContent(true);
    } catch (e) {
      throw e;
    }
    detectPoseInRealTime(video, net);
  }

  React.useEffect(() => {
    bindPage();
  }, []);

  const playerRef = React.useRef(undefined as any);
  const setPlayerRef = (player: ReactPlayer) => {
    playerRef.current = player;
  };
  const overRideRef = React.useRef(false);
  const refVideoPlayPauseToggle = async () => {
    if (keyIndexRef.current === -1) {
      keyIndexRef.current = 0;
    }
    if (overRideRef.current) {
      setisRefVideoPlay(true);
      isPlayRef.current = true;
      overRideRef.current = false;
    } else {
      if (isPlayRef.current) {
        //   refVideo.pause();
        setisRefVideoPlay(false);
        isPlayRef.current = false;
      } else {
        //   refVideo.play();
        setisRefVideoPlay(true);
        isPlayRef.current = true;
      }
    }
  };

  const onVideoStart = () => {
    keyIndexRef.current = 0;
  };

  const onVideoEnd = () => {
    refVideoPlayPauseToggle();
    keyIndexRef.current = -1;
  };
  const onEasyClick = () => {
    defaultHardLevel.current = 0.5;
    setdefaultdifficulty(0.5);
  };
  const onNormalClick = () => {
    defaultHardLevel.current = 0.45;
    setdefaultdifficulty(0.45);
  };
  const onHardClick = () => {
    defaultHardLevel.current = 0.35;
    setdefaultdifficulty(0.35);
  };
  const onChangeModeClick = () => {
    props.history.push('/');
  };
  const [muted] = React.useState<boolean>(isExerciseMode);
  return (
    <div className="simply-dance-container">
      <div className="difficulty-container">
        {!isExerciseMode && (
          <button className="difficulty-button" style={{ marginBottom: 50 }}>
            {`${Math.ceil((100 * score) / newKeys.length)}/100`}
          </button>
        )}
        <button className="difficulty-button" style={{ marginBottom: 50 }} onClick={onChangeModeClick}>
          Change Mode
        </button>
        <button className={`difficulty-button${defaultdifficulty === 0.5 ? ' selected' : ''}`} onClick={onEasyClick}>
          Easy
        </button>
        <button className={`difficulty-button${defaultdifficulty === 0.45 ? ' selected' : ''}`} onClick={onNormalClick}>
          Normal
        </button>
        <button className={`difficulty-button${defaultdifficulty === 0.35 ? ' selected' : ''}`} onClick={onHardClick}>
          Hard
        </button>
      </div>
      <div className="two-video-container" style={{ display: 'flex', margin: '20px 100px' }}>
        {!showContent && <div> loading...Please wait...</div>}
        {showContent && (
          <ReactPlayer
            ref={setPlayerRef}
            width={videoWidth}
            height={videoHeight}
            style={{ background: 'black' }}
            playing={isRefVideoPlay}
            url="https://youtu.be/BIB1QHuEsr4"
            config={{
              file: { attributes: { id: 'refVideo', crossOrigin: 'anonymous', width: videoWidth, height: videoHeight } }
            }}
            onClick={null}
            onStart={onVideoStart}
            muted={muted}
            onEnded={onVideoEnd}
          />
        )}

        {showContent && (
          <button className="start-button" onClick={refVideoPlayPauseToggle}>
            {isRefVideoPlay ? 'Pause' : 'Start'}
          </button>
        )}
        <video className="user-video" id="userVideo" playsInline style={{ display: 'none' }} />
        <canvas id="output" />
      </div>
    </div>
  );
});
