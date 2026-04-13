const app = getApp();

Page({
  data: {
    themeClass: '',
    typeOptions: ['功能建议', '体验问题', 'BUG反馈', '其他'],
    typeIndex: 0,
    title: '',
    content: '',
    contact: '',
    images: [],
    pageOptions: ['首页', '文案生成', '文案优化', '设置', 'VIP中心'],
    pageIndex: -1,
    recent: []
  },

  onLoad() {
    this.updateThemeClass();
    this._onTheme = () => this.updateThemeClass();
    app.subscribeTheme && app.subscribeTheme(this._onTheme);
    this.loadRecent();
  },

  onShow() {
    this.updateThemeClass();
  },

  onUnload() {
    if (this._onTheme) app.unsubscribeTheme && app.unsubscribeTheme(this._onTheme);
  },

  updateThemeClass() {
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'light';
    const cls = theme === 'dark' ? 'dark-theme' : theme === 'colorful' ? 'colorful-theme' : 'light-theme';
    this.setData({ themeClass: cls });
  },

  onTypeChange(e) {
    this.setData({ typeIndex: Number(e.detail.value) || 0 });
  },

  onPageChange(e) {
    this.setData({ pageIndex: Number(e.detail.value) });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  chooseImage() {
    wx.chooseImage({
      count: 3 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const imgs = (this.data.images || []).concat(res.tempFilePaths.slice(0, 3 - this.data.images.length));
        this.setData({ images: imgs });
      }
    });
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index;
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images });
  },

  resetForm() {
    this.setData({ title: '', content: '', contact: '', images: [], typeIndex: 0, pageIndex: -1 });
  },

  submitFeedback() {
    const { typeOptions, typeIndex, title, content, contact, images, pageOptions, pageIndex } = this.data;
    const type = typeOptions[typeIndex];
    const page = pageIndex >= 0 ? pageOptions[pageIndex] : '';
    const text = String(content || '').trim();
    
    // 前端校验：内容不少于10字
    if (text.length < 10) {
      wx.showToast({ title: '请至少填写10个字的描述', icon: 'none' });
      return;
    }

    // 去掉登录校验，直接构造数据（user_id给空值，后端兼容）
    const submitData = {
      user_id: '', // 无登录，传空字符串
      type: type,
      title: String(title || '').trim(),
      content: text,
      contact: String(contact || '').trim(),
      images: images.slice(0, 3),
      page: page
    };

    // 显示加载中
    wx.showLoading({ title: '提交中...', mask: true });

    // 调用Django后端接口
    wx.request({
      url: 'http://47.104.165.250:8000/api/feedback/submit/',
      method: 'POST',
      data: submitData,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        
        // 后端返回成功
        if (res.data && res.data.code === 200) {
          // 构造本地存储的反馈记录（使用后端返回的ID）
          const item = {
            id: res.data.data.id, // 后端数据库ID
            type,
            title: String(title || '').trim(),
            content: text,
            contact: String(contact || '').trim(),
            images: images.slice(0, 3),
            page,
            time: new Date().toLocaleString(),
            status: '待处理'
          };

          // 更新本地缓存
          let list = wx.getStorageSync('feedbackItems') || [];
          list.unshift(item);
          if (list.length > 20) list = list.slice(0, 20);
          wx.setStorageSync('feedbackItems', list);
          this.setData({ recent: list });

          wx.showToast({ title: '提交成功', icon: 'success' });
          this.resetForm();
        } else {
          // 后端返回错误
          wx.showToast({ title: res.data?.msg || '提交失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        // 网络错误
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        console.error('反馈提交失败：', err);
        
        // 降级处理：仅保存到本地
        const item = {
          id: Date.now(),
          type,
          title: String(title || '').trim(),
          content: text,
          contact: String(contact || '').trim(),
          images: images.slice(0, 3),
          page,
          time: new Date().toLocaleString(),
          status: '待处理（未同步到服务器）'
        };
        let list = wx.getStorageSync('feedbackItems') || [];
        list.unshift(item);
        if (list.length > 20) list = list.slice(0, 20);
        wx.setStorageSync('feedbackItems', list);
        this.setData({ recent: list });
        this.resetForm();
      }
    });
  },

  loadRecent() {
    const list = wx.getStorageSync('feedbackItems') || [];
    this.setData({ recent: list });
  }
});