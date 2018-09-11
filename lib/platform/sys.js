import enums from './enums';

function sysInit() {
  let sys = {};
  let _global = typeof window === 'undefined' ? global : window;
  let isWeChatGame = _global['wx'] && wx.getSystemInfoSync;
  sys.isBrowser = _checkIsBrowser();
  sys.supportWebGL = _checkWebGLSupport();
  sys.isMobile = _checkMobile();
  sys.supportWebAudio = _checkWebAudioSupport();
  let browserTypeAndVersion = _checkBrowserTypeAndVersion();
  sys.browserType = browserTypeAndVersion.browserType;
  sys.browserVersion = browserTypeAndVersion.browserVersion;
  let platformAndOS = _checkPlatformAndOS();
  sys.platform = platformAndOS.platform;
  sys.os = platformAndOS.os;
  return sys;

  // isBrowser
  function _checkIsBrowser() {
    return typeof window === 'object' && typeof document === 'object' && !isWeChatGame;
  }

  // todo: some platform may diff here
  function _createCanvas() {
    if (_checkIsBrowser()) {
      return document.createElement('canvas');
    } else {
      return null;
    }
  }

  // todo: some platform may diff here
  function _checkWebGLSupport() {
    let canvas = _createCanvas();
    if (canvas === null) {
      return false;
    } else {
      let webGLIDs = ['webgl', 'experimental-webgl'];
      let result = false;
      for (let i = 0; i < webGLIDs.length; ++i) {
        if (canvas.getContext(webGLIDs[i])) {
          return true;
        }
      }
      return result;
    }
  }

  // todo: some platform may diff here
  function _checkMobile() {
    if (isWeChatGame) {
      let env = wx.getSystemInfoSync();
      if (env.platform === 'devtools') {
        return false;
      }

      return true;
    } else {
      let nav = window.navigator;
      let ua = nav.userAgent.toLowerCase();
      return /mobile|android|iphone|ipad/.test(ua);
    }
  }

  // whether Web Audio API is available
  function _checkWebAudioSupport() {
    if (!_checkIsBrowser()) {
      return false;
    } else {
      let audioConextNames = ['AudioContext', 'webkitAudioContext', 'mozAudioContext'];
      for (let i = 0; i < audioConextNames.length; ++i) {
        if (window[audioConextNames[i]]) return true;
      }
      return false;
    }
  }

  function _checkBrowserTypeAndVersion() {
    if (typeof window === 'object') {
      let nav = window.navigator;
      let ua = nav.userAgent.toLowerCase();
      let typeReg1 = /mqqbrowser|micromessenger|qq|sogou|qzone|liebao|maxthon|ucbs|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|miuibrowser/i;
      let typeReg2 = /qqbrowser|ucbrowser/i;
      let typeReg3 = /chrome|crios|safari|firefox|trident|opera|opr\/|oupeng/i;

      let versionReg1 = /(mqqbrowser|micromessenger|qq|sogou|qzone|liebao|maxthon|uc|ucbs|360 aphone|360|baiduboxapp|baidu|maxthon|mxbrowser|miui)(mobile)?(browser)?\/?([\d.]+)/i;
      let versionReg2 = /(qqbrowser|chrome|crios|safari|firefox|trident|opera|opr\/|oupeng)(mobile)?(browser)?\/?([\d.]+)/i;
      let browserVersions = ua.match(versionReg1);
      if (!browserVersions) {
        browserVersions = ua.match(versionReg2);
      }

      let browserVersion = browserVersions ? browserVersions[4] : '';
      let browserTypes = typeReg1.exec(ua);
      if (!browserTypes) {
        browserTypes = typeReg2.exec(ua);
      }

      if (!browserTypes) {
        browserTypes = typeReg3.exec(ua);
      }

      let browserType = browserTypes ? browserTypes[0].toLowerCase() : enums.BROWSER_TYPE_UNKNOWN;
      if (isWeChatGame) {
        if (!wx.getFileSystemManager) {
          browserType = sys.BROWSER_TYPE_WECHAT_GAME_SUB;
        }
        else {
          browserType = sys.BROWSER_TYPE_WECHAT_GAME;
        }

        let env = wx.getSystemInfoSync();
        browserVersions = env.version;
      } else if (browserType === 'micromessenger') {
        browserType = enums.BROWSER_TYPE_WECHAT;
      } else if (browserType === 'qq' && ua.match(/android.*applewebkit/i)) {
        browserType = enums.BROWSER_TYPE_ANDROID;
      } else if (browserType === 'crios') {
        browserType = enums.BROWSER_TYPE_CHROME;
      } else if (browserType === 'trident') {
        browserType = enums.BROWSER_TYPE_IE;
      } else if (browserType === '360 aphone') {
        browserType = enums.BROWSER_TYPE_360;
      } else if (browserType === 'mxbrowser') {
        browserType = enums.BROWSER_TYPE_MAXTHON;
      } else if (browserType === 'opr/') {
        browserType = enums.BROWSER_TYPE_OPERA;
      }

      return { browserType, browserVersion };
    } else {
      let browserType = enums.BROWSER_TYPE_UNKNOWN;
      let browserVersion = '';
      return { browserType, browserVersion };
    }
  }

  function _checkPlatformAndOS() {
    let platform = enums.PLATFORM_UNKNOWN, os = enums.OS_UNKNOWN;
    if (isWeChatGame) {
      let env = wx.getSystemInfoSync();
      let system = env.system.toLowerCase();
      platform = enums.PLATFORM_WECHAT_GAME;
      if (env.platform === 'android') {
        os = enums.OS_ANDROID;
      } else if (env.platform === 'ios') {
        os = enums.OS_IOS;
      } else if (env.platform === 'devtools') {
        if (system.indexOf('android') > -1) {
          os = enums.OS_ANDROID;
        } else if (system.indexOf('ios') > -1) {
          os = enums.OS_IOS;
        }
      }
    } else {
      // browser and runtime
      let nav = window.navigator, ua = nav.userAgent.toLowerCase();
      platform = sys.isMobile ? enums.PLATFORM_MOBILE_BROWSER : enums.PLATFORM_DESKTOP_BROWSER;
      // Get the os of system
      let isAndroid = false, iOS = false;
      let uaResult = /android (\d+(?:\.\d+)+)/i.exec(ua) || /android (\d+(?:\.\d+)+)/i.exec(nav.platform);
      if (uaResult) {
        isAndroid = true;
      }

      uaResult = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(ua);
      if (uaResult) {
        iOS = true;
      } else if (/(iPhone|iPad|iPod)/.exec(nav.platform)) {
        iOS = true;
      }

      if (nav.appVersion.indexOf('Win') !== -1) {
        os = enums.OS_WINDOWS;
      } else if (iOS) {
        os = enums.OS_IOS;
      } else if (nav.appVersion.indexOf('Mac') !== -1) {
        os = enums.OS_OSX;
      } else if (isAndroid) {
        os = enums.OS_ANDROID;
      } else if (nav.appVersion.indexOf('Linux') !== -1 || ua.indexOf('ubuntu') !== -1) {
        os = enums.OS_LINUX;
      }
    }

    return { platform, os };
  }
}

let _sys = sysInit();

export default {
  isBrowser: _sys.isBrowser,
  supportWebGL: _sys.supportWebGL,
  isMobile: _sys.isMobile,
  supportWebAudio: _sys.supportWebAudio,
  browserType: _sys.browserType,
  browserVersion: _sys.browserVersion,
  platform: _sys.platform,
  os: _sys.os
};
