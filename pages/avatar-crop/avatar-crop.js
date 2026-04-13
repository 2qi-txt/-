Page({
  data: {
    themeClass: '',
    src: '',
    areaSize: 300,
    baseWidth: 300,
    baseHeight: 300,
    // 图像展示与位移
    dispW: 300,
    dispH: 300,
    x: 0,
    y: 0,
    circleSize: 240,
    scale: 1,
    imgW: 0,
    imgH: 0
  },

  onLoad(options) {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = () => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);

    const src = decodeURIComponent(options.src || '');
    if (!src) {
      wx.showToast({ title: '未选择图片', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 300);
      return;
    }
    const sys = wx.getSystemInfoSync();
    const size = Math.min(sys.windowWidth - 40, 320);
    const circle = Math.round(size * 0.8);
    this.setData({ src, areaSize: size, baseWidth: size, baseHeight: size, dispW: size, dispH: size, x: (size - size)/2, y: (size - size)/2, circleSize: circle, scale: 1 });

    wx.getImageInfo({
      src,
      success: (info) => {
        const ratio = info.height / info.width;
        const bh = this.data.baseWidth * ratio;
        const dispW = this.data.baseWidth * this.data.scale;
        const dispH = bh * this.data.scale;
        const { x, y } = this._clampXY((this.data.areaSize - dispW)/2, (this.data.areaSize - dispH)/2, dispW, dispH);
        this.setData({ imgW: info.width, imgH: info.height, baseHeight: bh, dispW, dispH, x, y });
      },
      fail: () => {
        wx.showToast({ title: '图片加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 300);
      }
    });
  },

  onShow() {
    this.updateThemeClass();
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'light';
    const cls = theme === 'dark' ? 'dark-theme' : theme === 'colorful' ? 'colorful-theme' : 'light-theme';
    this.setData({ themeClass: cls });
  },

  onUnload() {
    const app = getApp();
    if (this._onTheme) app.unsubscribeTheme(this._onTheme);
  },

  onMoveChange(e) {
    const { x, y } = e.detail;
    const clamped = this._clampXY(x, y, this.data.dispW, this.data.dispH);
    this.setData({ x: clamped.x, y: clamped.y });
  },


  onScaleSlider(e) {
    const v = e.detail.value;
    const s = Math.max(1, Math.min(3, v / 100));
    const dispW = this.data.baseWidth * s;
    const dispH = this.data.baseHeight * s;
    const clamped = this._clampXY(this.data.x, this.data.y, dispW, dispH);
    this.setData({ scale: s, dispW, dispH, x: clamped.x, y: clamped.y });
  },

  zoomIn() {
    const s = Math.min(3, this.data.scale + 0.1);
    const dispW = this.data.baseWidth * s;
    const dispH = this.data.baseHeight * s;
    const clamped = this._clampXY(this.data.x, this.data.y, dispW, dispH);
    this.setData({ scale: parseFloat(s.toFixed(2)), dispW, dispH, x: clamped.x, y: clamped.y });
  },

  zoomOut() {
    const s = Math.max(1, this.data.scale - 0.1);
    const dispW = this.data.baseWidth * s;
    const dispH = this.data.baseHeight * s;
    const clamped = this._clampXY(this.data.x, this.data.y, dispW, dispH);
    this.setData({ scale: parseFloat(s.toFixed(2)), dispW, dispH, x: clamped.x, y: clamped.y });
  },

  confirmCrop() {
    const { x, y, dispW, dispH, circleSize, imgW, imgH, src, areaSize } = this.data;
    const ctx = wx.createCanvasContext('cropCanvas', this);

    // 计算源图裁剪区域（圆框对应的矩形）
    const mc = areaSize / 2;
    const r = circleSize / 2;
    const sx = Math.max(0, Math.min(imgW, ((mc - r - x) / dispW) * imgW));
    const sy = Math.max(0, Math.min(imgH, ((mc - r - y) / dispH) * imgH));
    const sWidth = Math.max(1, Math.min(imgW - sx, (circleSize / dispW) * imgW));
    const sHeight = Math.max(1, Math.min(imgH - sy, (circleSize / dispH) * imgH));

    // 在圆形裁剪路径下绘制源图裁剪矩形到目标
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(src, sx, sy, sWidth, sHeight, 0, 0, circleSize, circleSize);
    ctx.restore();
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'cropCanvas',
        width: circleSize,
        height: circleSize,
        success: (res) => {
          const temp = res.tempFilePath;
          const ec = this.getOpenerEventChannel();
          if (ec) ec.emit('cropped', temp);
          wx.navigateBack();
        }
      }, this);
    });
  },

  _clampXY(px, py, w, h) {
    const mc = this.data.areaSize / 2;
    const r = this.data.circleSize / 2;
    const minX = mc + r - w;
    const maxX = mc - r;
    const minY = mc + r - h;
    const maxY = mc - r;
    return {
      x: Math.max(minX, Math.min(maxX, px)),
      y: Math.max(minY, Math.min(maxY, py))
    };
  },

  cancel() {
    wx.navigateBack();
  }
});
