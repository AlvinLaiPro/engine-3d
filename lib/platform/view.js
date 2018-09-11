import { vec2 } from '../vmath';
import enums from './enums';
import sys from './sys';
// /**
//  * View is used to controll the layout of dom element, it is responsible for orientation support, retina, and canvas creating
//  * todo: add retina support
//  */
// const WEB_ORIENTATION_PORTRAIT = 0;
// const WEB_ORIENTATION_LANDSCAPE_LEFT = -90;
// const WEB_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 180;
// const WEB_ORIENTATION_LANDSCAPE_RIGHT = 90;

var _browserGetter = {
  availWidth: function (frame) {
    if (!frame) {
      return window.innerWidth || document.documentElement.clientWidth;
    } else {
      return frame.clientWidth;
    }
  },
  availHeight: function (frame) {
    if (!frame) {
      return window.innerHeight || document.documentElement.clientHeight;
    } else {
      return frame.clientHeight;
    }
  },
  adaptationType: sys.browserType
};

(function () {
  switch (_browserGetter.adaptationType) {
    case sys.BROWSER_TYPE_WECHAT_GAME:
      _browserGetter.availWidth = function () {
        return window.innerWidth;
      };

      _browserGetter.availHeight = function () {
        return window.innerHeight;
      };

      break;
    case sys.BROWSER_TYPE_WECHAT_GAME_SUB:
      let sharedCanvas = window.sharedCanvas ? window.sharedCanvas : wx.getSharedCanvas();
      _browserGetter.availWidth = function () {
        return sharedCanvas.width;
      };

      _browserGetter.availHeight = function () {
        return sharedCanvas.height;
      };

      break;
    case sys.BROWSER_TYPE_SOUGOU:
      _browserGetter.availWidth = function (frame) {
        return frame.clientWidth;
      };
      _browserGetter.availHeight = function (frame) {
        return frame.clientHeight;
      };

      break;
  }
})();

export default class View {
  constructor(app, canvas) {
    this._app = app;
    let isWeChatGame = sys.platform === enums.PLATFORM_WECHAT_GAME;
    this._container = document.createElement('div');
    if (isWeChatGame) {
      if (sys.browserType === enums.BROWSER_TYPE_WECHAT_GAME_SUB) {
        this._canvas = wx.getSharedCanvas();
      } else {
        this._canvas = canvas;
      }
    } else {
      this._canvas = canvas;
      if (this._canvas.parentNode) {
        this._canvas.parentNode.insertBefore(this._container, this._canvas);
      }
      this._container.setAttribute('id', 'cocos3dContainer');
      this._container.style.position = 'absolute';
      // -1 element's focus function takes effect!!!
      this._container.tabIndex = '-1';
      this._container.appendChild(this._canvas);
    }

    this._orientation = enums.ORIENTATION_AUTO;

    this._frame = this._container.parentNode === document.body ? document.documentElement : this._container.parentNode;
    this._frameSize = new vec2();
    // comment this because orientationchange event will always couples with resize event
    // window.addEventListener('orientationchange', () => {
    //   this.resize();
    //   console.log('orientationchange event happens');
    // });

    this._resizeFunc = () => {
      this.resize();
      app.input.resize();
    };

    window.addEventListener('resize', this._resizeFunc);
  }

  get canvas() {
    return this._canvas;
  }

  get canvasContainer() {
    return this._container;
  }

  resize() {
    // container.ParentNode.GetBoundingClientRect() is replaced by clientwidth
    // because here not on parentNode design scrollbar and border set to 0,
    // also in setting on the two practices consistent

    let w = _browserGetter.availWidth(this._frame);
    let h = _browserGetter.availHeight(this._frame);
    let isLandscape = w >= h;
    let containerStyle = this._container.style;
    if (
      !sys.isMobile ||
      (isLandscape && this._orientation & enums.ORIENTATION_LANDSCAPE) ||
      (!isLandscape && this._orientation & enums.ORIENTATION_PORTRAIT)
    ) {
      this._frameSize.width = w;
      this._frameSize.height = h;
      containerStyle['-webkit-transform'] = 'rotate(0deg)';
      containerStyle.transform = 'rotate(0deg)';
      containerStyle.margin = '0px';
    } else {
      this._frameSize.width = h;
      this._frameSize.height = w;
      containerStyle['-webkit-transform'] = 'rotate(90deg)';
      containerStyle.transform = 'rotate(90deg)';
      containerStyle['-webkit-transform-origin'] = '0px 0px 0px';
      containerStyle.transformOrigin = '0px 0px 0px';
      containerStyle.margin = '0 0 0 ' + this._frameSize.height + 'px';
    }

    let localCanvas = this._canvas;
    if (sys.platform !== enums.PLATFORM_WECHAT_GAME) {
      containerStyle.width = localCanvas.style.width = w + 'px';
      containerStyle.height = localCanvas.style.height = h + 'px';
    }

    localCanvas.width = w;
    localCanvas.height = h;
    containerStyle.padding = '0px';

    // ???whether to actively update the rotation value of the input module
    this._app.input.rotateDeg = this.calculateDeg();
  }

  destroy() {
    window.removeEventListener('resize', this._resizeFunc);
  }

  setOrientation(orientation) {
    if (!orientation) {
      return;
    }

    orientation = orientation & enums.ORIENTATION_AUTO;
    if (orientation && this._orientation !== orientation) {
      this._orientation = orientation;
      this.resize();
    }
  }

  calculateDeg() {
    let rotate = this._container.style.transform;
    let deg = rotate && rotate.match(/[-|\d]\d{1,}/);
    if (!deg) {
      deg = '0';
    } else {
      deg = deg.join('');
    }

    return deg;
  }
}