Page({
  data: {
    themeClass: '',
    content: {},
    recommendList: [],
    commentList: [],
    newComment: ''
  },

  onLoad(options) {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = (t) => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);

    const id = options && options.id;
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel();

    if (eventChannel && eventChannel.on) {
      eventChannel.on('content', (item) => {
        this.setData({ content: item });
        this.loadRecommendList();
        this.loadCommentList();
        this.incrementViews(item.id);
      });
    }

    if (id && !this.data.content.id) {
      this.loadContent(id);
      this.loadRecommendList();
      this.loadCommentList();
    }
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

  // 加载内容详情
  loadContent(id) {
    // 模拟加载内容
    const mockContent = {
      id: id,
      title: '春季活动通知',
      content: '各位小伙伴，我们将于下周举行春季活动，请大家积极组织参与。活动时间：4月15日-16日，地点：活动中心。\n\n请大家于4月10日前将参与名单提交至负责人。\n\n特此通知。\n\n活动部\n2024年3月20日',
      type: '通知',
      scene: '公告通知',
      time: '2024-03-20 14:30',
      views: 156,
      likes: 23,
      comments: 8,
      isFavorite: false
    };
    
    this.setData({ content: mockContent });
    
    // 增加浏览次数
    this.incrementViews(id);
  },

  // 加载推荐列表
  loadRecommendList() {
    const mockRecommend = [
      {
        id: 2,
        title: '社团招新活动',
        desc: '欢迎加入我们的社团！我们有丰富的活动和精彩的体验等着你。'
      },
      {
        id: 3,
        title: '学习心得分享',
        desc: '今天在图书馆学习了一整天，感觉收获满满！分享一些学习心得。'
      }
    ];
    
    this.setData({ recommendList: mockRecommend });
  },

  // 加载评论列表
  loadCommentList() {
    const mockComments = [
      {
        id: 1,
        name: '张三',
        avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        content: '这个通知写得很清楚，格式也很规范！',
        time: '2024-03-20 15:30',
        likes: 5
      },
      {
        id: 2,
        name: '李四',
        avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        content: '运动会时间安排得很合理，期待参与！',
        time: '2024-03-20 16:45',
        likes: 3
      }
    ];
    
    this.setData({ commentList: mockComments });
  },

  // 复制内容
  copyContent() {
    wx.setClipboardData({
      data: this.data.content.content,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  // 分享内容
  shareContent() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 切换收藏状态
  toggleFavorite() {
    const isFavorite = !this.data.content.isFavorite;
    this.setData({
      'content.isFavorite': isFavorite
    });
    
    wx.showToast({
      title: isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 编辑内容
  editContent() {
    wx.showModal({
      title: '编辑内容',
      content: '此功能正在开发中，敬请期待！',
      showCancel: false
    });
  },

  // 打开推荐内容
  openRecommend(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/content-detail/content-detail?id=${item.id}`
    });
  },

  // 点赞评论
  likeComment(e) {
    const id = e.currentTarget.dataset.id;
    const commentList = this.data.commentList.map(comment => {
      if (comment.id === id) {
        return { ...comment, likes: (comment.likes || 0) + 1 };
      }
      return comment;
    });
    
    this.setData({ commentList });
    
    wx.showToast({
      title: '点赞成功',
      icon: 'success'
    });
  },

  // 回复评论
  replyComment(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '回复评论',
      content: '此功能正在开发中，敬请期待！',
      showCancel: false
    });
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({
      newComment: e.detail.value
    });
  },

  // 提交评论
  submitComment() {
    const { newComment } = this.data;
    
    if (!newComment.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }
    
    const newCommentItem = {
      id: Date.now(),
      name: '我',
      avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
      content: newComment,
      time: new Date().toLocaleString(),
      likes: 0
    };
    
    const commentList = [newCommentItem, ...this.data.commentList];
    this.setData({
      commentList,
      newComment: ''
    });
    
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
  },

  // 增加浏览次数
  incrementViews(id) {
    // 这里可以调用API更新浏览次数
    console.log('增加浏览次数:', id);
  },

  onUnload() {
    const app = getApp();
    if (this._onTheme) app.unsubscribeTheme(this._onTheme);
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: this.data.content.title,
      path: `/pages/content-detail/content-detail?id=${this.data.content.id}`,
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.content.title,
      imageUrl: '/images/share.png'
    };
  }
});



