import React from 'react';
import { RouteComponentProps } from 'react-router';
import ReactPlayer from 'react-player';
import * as posenet from '@tensorflow-models/posenet';
import { drawKeypoints, drawSkeleton, drawBoundingBox } from './Utilities/util';
export const SimplyDanceContainer = (props: RouteComponentProps<{ [key: string]: string }>) => {
  const [isRefVideoPlay, setisRefVideoPlay] = React.useState<boolean>(false);
  const videoWidth = 600;
  const videoHeight = 500;
  const defaultQuantBytes = 2;
  const defaultMobileNetMultiplier = 0.75;
  const defaultMobileNetStride = 16;
  const defaultMobileNetInputResolution = 500;
  //   const defaultResNetMultiplier = 1.0;
  //   const defaultResNetStride = 32;
  //   const defaultResNetInputResolution = 250;
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

  async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }

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
      //   if (guiState.changeToArchitecture) {
      //     // Important to purge variables and free up GPU memory
      //     guiState.net.dispose();
      //     toggleLoadingUI(true);
      //     guiState.net = await posenet.load({
      //       architecture: guiState.changeToArchitecture,
      //       outputStride: guiState.outputStride,
      //       inputResolution: guiState.inputResolution,
      //       multiplier: guiState.multiplier
      //     });
      //     toggleLoadingUI(false);
      //     guiState.architecture = guiState.changeToArchitecture;
      //     guiState.changeToArchitecture = null;
      //   }

      //   if (guiState.changeToMultiplier) {
      //     guiState.net.dispose();
      //     toggleLoadingUI(true);
      //     guiState.net = await posenet.load({
      //       architecture: guiState.architecture,
      //       outputStride: guiState.outputStride,
      //       inputResolution: guiState.inputResolution,
      //       multiplier: +guiState.changeToMultiplier,
      //       quantBytes: guiState.quantBytes
      //     });
      //     toggleLoadingUI(false);
      //     guiState.multiplier = +guiState.changeToMultiplier;
      //     guiState.changeToMultiplier = null;
      //   }

      //   if (guiState.changeToOutputStride) {
      //     // Important to purge variables and free up GPU memory
      //     guiState.net.dispose();
      //     toggleLoadingUI(true);
      //     guiState.net = await posenet.load({
      //       architecture: guiState.architecture,
      //       outputStride: +guiState.changeToOutputStride,
      //       inputResolution: guiState.inputResolution,
      //       multiplier: guiState.multiplier,
      //       quantBytes: guiState.quantBytes
      //     });
      //     toggleLoadingUI(false);
      //     guiState.outputStride = +guiState.changeToOutputStride;
      //     guiState.changeToOutputStride = null;
      //   }

      //   if (guiState.changeToInputResolution) {
      //     // Important to purge variables and free up GPU memory
      //     guiState.net.dispose();
      //     toggleLoadingUI(true);
      //     guiState.net = await posenet.load({
      //       architecture: guiState.architecture,
      //       outputStride: guiState.outputStride,
      //       inputResolution: +guiState.changeToInputResolution,
      //       multiplier: guiState.multiplier,
      //       quantBytes: guiState.quantBytes
      //     });
      //     toggleLoadingUI(false);
      //     guiState.inputResolution = +guiState.changeToInputResolution;
      //     guiState.changeToInputResolution = null;
      //   }

      //   if (guiState.changeToQuantBytes) {
      //     // Important to purge variables and free up GPU memory
      //     guiState.net.dispose();
      //     toggleLoadingUI(true);
      //     guiState.net = await posenet.load({
      //       architecture: guiState.architecture,
      //       outputStride: guiState.outputStride,
      //       inputResolution: guiState.inputResolution,
      //       multiplier: guiState.multiplier,
      //       quantBytes: guiState.changeToQuantBytes
      //     });
      //     toggleLoadingUI(false);
      //     guiState.quantBytes = guiState.changeToQuantBytes;
      //     guiState.changeToQuantBytes = null;
      //   }

      // Begin monitoring code for frames per second
      //   stats.begin();

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

  async function estimatePoseOnImage(imageElement: any) {
    // load the posenet model from a checkpoint
    const net = await posenet.load();

    const pose = await net.estimateSinglePose(imageElement, {
      flipHorizontal: false
    });
    return pose;
  }

  async function bindPage() {
    const net = await posenet.load({ architecture: 'ResNet50' } as any);
    guiState.net = net;
    let video;
    try {
      video = await loadVideo();
    } catch (e) {
      throw e;
    }
    detectPoseInRealTime(video, net);
  }

  React.useEffect(() => {
    bindPage();
  }, []);

  const refVideoPlayPauseToggle = async () => {
    const imageElement = document.getElementById('userVideo') as any;
    const pose = await estimatePoseOnImage(imageElement);
    console.log(pose);
    // const refVideo = document.getElementById('refVideo') as any;
    if (isRefVideoPlay) {
      //   refVideo.pause();
      setisRefVideoPlay(false);
    } else {
      //   refVideo.play();
      setisRefVideoPlay(true);
    }
  };
  return (
    <div className="simply-dance-container" style={{ margin: '0 150px' }}>
      <img
        src="https://cdn.pixabay.com/photo/2015/10/29/14/42/dance-1012474_960_720.jpg"
        className="banner"
        style={{ width: '1400px', height: '248px', margin: '0 100px' }}
      />
      <div className="two-video-container" style={{ display: 'flex', margin: '20px 100px' }}>
        <ReactPlayer
          width={videoWidth}
          height={videoHeight}
          style={{ background: 'black' }}
          playing={isRefVideoPlay}
          url="https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4"
          config={{
            file: { attributes: { id: 'refVideo', crossOrigin: 'anonymous', width: videoWidth, height: videoHeight } }
          }}
          onClick={refVideoPlayPauseToggle}
        />
        <button
          className="start-button"
          onClick={refVideoPlayPauseToggle}
          style={{
            width: 160,
            height: 160,
            margin: 'auto 20px',
            background: 'aqua',
            padding: 35,
            borderRadius: '50%',
            boxShadow: '7px 5px 20px navy',
            fontSize: 30
          }}
        >
          {isRefVideoPlay ? 'Pause' : 'Start'}
        </button>
        <video className="user-video" id="userVideo" playsInline style={{ display: 'none' }} />
        <canvas id="output" />
      </div>
    </div>
  );
};
