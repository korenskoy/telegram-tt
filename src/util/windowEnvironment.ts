import {
  IS_TEST,
  IS_ELECTRON,
  SUPPORTED_VIDEO_CONTENT_TYPES,
  VIDEO_MOV_TYPE,
  CONTENT_TYPES_WITH_PREVIEW,
  PRODUCTION_HOSTNAME,
} from '../config';

export * from './environmentWebp';

export * from './environmentSystemTheme';

export function getPlatform() {
  const { userAgent, platform } = window.navigator;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os: 'macOS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | undefined;

  if (iosPlatforms.indexOf(platform) !== -1
    // For new IPads with M1 chip and IPadOS platform returns "MacIntel"
    || (platform === 'MacIntel' && ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 2))) {
    os = 'iOS';
  } else if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'macOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

export const IS_PRODUCTION_HOST = window.location.host === PRODUCTION_HOSTNAME;
export const PLATFORM_ENV = getPlatform();
export const IS_MAC_OS = PLATFORM_ENV === 'macOS';
export const IS_WINDOWS = PLATFORM_ENV === 'Windows';
export const IS_LINUX = PLATFORM_ENV === 'Linux';
export const IS_IOS = PLATFORM_ENV === 'iOS';
export const IS_ANDROID = PLATFORM_ENV === 'Android';
export const IS_MOBILE = IS_IOS || IS_ANDROID;
export const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const IS_YA_BROWSER = navigator.userAgent.includes('YaBrowser');

export enum MouseButton {
  Main = 0,
  Auxiliary = 1,
  Secondary = 2,
  Fourth = 3,
  Fifth = 4,
}

export const IS_PWA = (
  window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone
  || document.referrer.includes('android-app://')
);

export const IS_APP = IS_PWA || IS_ELECTRON;

export const IS_TOUCH_ENV = window.matchMedia('(pointer: coarse)').matches;
export const IS_VOICE_RECORDING_SUPPORTED = Boolean(
  window.navigator.mediaDevices && 'getUserMedia' in window.navigator.mediaDevices && (
    window.AudioContext || (window as any).webkitAudioContext
  ),
);
export const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
export const IS_EMOJI_SUPPORTED = PLATFORM_ENV && (IS_MAC_OS || IS_IOS) && isLastEmojiVersionSupported();
export const IS_SERVICE_WORKER_SUPPORTED = 'serviceWorker' in navigator;
// TODO Consider failed service worker
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;
export const IS_STREAMING_SUPPORTED = 'MediaSource' in window;
export const IS_OPUS_SUPPORTED = Boolean((new Audio()).canPlayType('audio/ogg; codecs=opus'));
export const IS_CANVAS_FILTER_SUPPORTED = (
  !IS_TEST && 'filter' in (document.createElement('canvas').getContext('2d') || {})
);
export const IS_REQUEST_FULLSCREEN_SUPPORTED = 'requestFullscreen' in document.createElement('div');
export const ARE_CALLS_SUPPORTED = !navigator.userAgent.includes('Firefox');
export const LAYERS_ANIMATION_NAME = IS_ANDROID ? 'slideFade' : IS_IOS ? 'slideLayers' : 'pushSlide';

const TEST_VIDEO = document.createElement('video');
// `canPlayType(VIDEO_MOV_TYPE)` returns false negative at least for macOS Chrome and iOS Safari
export const IS_MOV_SUPPORTED = Boolean(
  TEST_VIDEO.canPlayType(VIDEO_MOV_TYPE).replace('no', '') || IS_IOS || IS_MAC_OS,
);

if (IS_MOV_SUPPORTED) {
  SUPPORTED_VIDEO_CONTENT_TYPES.add(VIDEO_MOV_TYPE);
  CONTENT_TYPES_WITH_PREVIEW.add(VIDEO_MOV_TYPE);
}

export const IS_WEBM_SUPPORTED = Boolean(TEST_VIDEO.canPlayType('video/webm; codecs="vp9"').replace('no', ''));

export const ARE_WEBCODECS_SUPPORTED = 'VideoDecoder' in window;

export const DPR = window.devicePixelRatio || 1;

export const MASK_IMAGE_DISABLED = true;
export const IS_OPFS_SUPPORTED = Boolean(navigator.storage?.getDirectory);
if (IS_OPFS_SUPPORTED) {
  // Clear old contents
  (async () => {
    try {
      const directory = await navigator.storage.getDirectory();
      await directory.removeEntry('downloads', { recursive: true });
    } catch {
      // Ignore
    }
  })();
}

export const IS_OFFSET_PATH_SUPPORTED = CSS.supports('offset-rotate: 0deg');
export const IS_BACKDROP_BLUR_SUPPORTED = CSS.supports('backdrop-filter: blur()')
  || CSS.supports('-webkit-backdrop-filter: blur()');
export const IS_INSTALL_PROMPT_SUPPORTED = 'onbeforeinstallprompt' in window;
export const IS_MULTITAB_SUPPORTED = 'BroadcastChannel' in window;
export const IS_OPEN_IN_NEW_TAB_SUPPORTED = IS_MULTITAB_SUPPORTED && !(IS_PWA && IS_MOBILE);
export const IS_TRANSLATION_SUPPORTED = Boolean(Intl.DisplayNames);

export const MESSAGE_LIST_SENSITIVE_AREA = 750;

export const MAX_BUFFER_SIZE = (IS_MOBILE ? 512 : 2000) * 1024 ** 2; // 512 OR 2000 MB

function isLastEmojiVersionSupported() {
  const ALLOWABLE_CALCULATION_ERROR_SIZE = 5;
  const inlineEl = document.createElement('span');
  inlineEl.classList.add('emoji-test-element');
  document.body.appendChild(inlineEl);

  inlineEl.innerText = '🫸🏻'; // Emoji from 15.0 version
  const newEmojiWidth = inlineEl.offsetWidth;
  inlineEl.innerText = '❤️'; // Emoji from 1.0 version
  const legacyEmojiWidth = inlineEl.offsetWidth;

  document.body.removeChild(inlineEl);

  return Math.abs(newEmojiWidth - legacyEmojiWidth) < ALLOWABLE_CALCULATION_ERROR_SIZE;
}
