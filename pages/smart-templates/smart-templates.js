Page({
  data: {
    currentTab: 'recommend',
    templates: [],
    categories: [],
    searchKeyword: '',
    isSearching: false,
    searchResults: [],
    userProfile: {
      major: '',
      grade: '',
      interests: []
    },
    personalizedTemplates: [],
    hotTemplates: [],
    seasonalTemplates: []
  },

  onLoad() {
    this.loadUserProfile();
    this.loadTemplates();
    this.loadPersonalizedRecommendations();
  },

  // 加载用户资料
  loadUserProfile() {
    const stored = wx.getStorageSync('userProfile');
    const userProfile = {
      major: typeof stored?.major === 'string' ? stored.major : '计算机科学',
      grade: typeof stored?.grade === 'string' ? stored.grade : '大三',
      interests: Array.isArray(stored?.interests) ? stored.interests : ['科技', '音乐', '运动']
    };
    this.setData({ userProfile });
  },

  // 加载模板数据
  loadTemplates() {
    const templates = [
      {
        id: 1,
        title: '社团招新通知',
        category: '社团活动',
        content: '【社团招新】欢迎加入我们！\n\n我们是一个充满活力的社团，致力于...',
        tags: ['招新', '社团', '活动'],
        usage: 156,
        rating: 4.8,
        isHot: true,
        isSeasonal: false
      },
      {
        id: 2,
        title: '期末考试提醒',
        category: '学习通知',
        content: '【考试通知】期末考试即将来临\n\n请各位同学做好复习准备...',
        tags: ['考试', '学习', '提醒'],
        usage: 89,
        rating: 4.6,
        isHot: false,
        isSeasonal: true
      },
      {
        id: 3,
        title: '精彩活动宣传',
        category: '活动宣传',
        content: '🎉 精彩活动等你来！\n\n时间：本周六下午2点\n地点：学校礼堂...',
        tags: ['活动', '宣传', '娱乐'],
        usage: 234,
        rating: 4.9,
        isHot: true,
        isSeasonal: false
      }
    ];

    this.setData({ templates });
    this.loadCategories();
  },

  // 加载分类
  loadCategories() {
    const categories = [
      { name: '全部', count: this.data.templates.length },
      { name: '社团活动', count: 12 },
      { name: '学习通知', count: 8 },
      { name: '活动宣传', count: 15 },
      { name: '生活服务', count: 6 }
    ];
    this.setData({ categories });
  },

  // 加载个性化推荐
  loadPersonalizedRecommendations() {
    // 基於用戶資料生成個性化推薦
    const personalizedTemplates = this.generatePersonalizedTemplates();
    const hotTemplates = this.getHotTemplates();
    const seasonalTemplates = this.getSeasonalTemplates();

    this.setData({
      personalizedTemplates,
      hotTemplates,
      seasonalTemplates
    });
  },

  // 生成个性化模板
  generatePersonalizedTemplates() {
    const { userProfile } = this.data;
    const major = typeof userProfile?.major === 'string' ? userProfile.major : '';
    const grade = typeof userProfile?.grade === 'string' ? userProfile.grade : '';
    const interests = Array.isArray(userProfile?.interests) ? userProfile.interests : [];
    const personalizedTemplates = [];

    // 根据专业推荐
    if (major.includes('计算机')) {
      personalizedTemplates.push({
        id: 'p1',
        title: '编程竞赛通知',
        content: '【编程竞赛】ACM竞赛报名开始\n\n欢迎各位编程爱好者参加...',
        reason: '基于您的计算机专业推荐',
        matchScore: 95
      });
    }

    // 根据年级推荐
    if (grade.includes('大三')) {
      personalizedTemplates.push({
        id: 'p2',
        title: '实习招聘信息',
        content: '【实习机会】知名企业实习岗位\n\n适合大三学生的实习机会...',
        reason: '基于您的大三年级推荐',
        matchScore: 88
      });
    }

    // 根据兴趣推荐
    if (interests.includes('音乐')) {
      personalizedTemplates.push({
        id: 'p3',
        title: '音乐社团活动',
        content: '🎵 音乐社团周末音乐会\n\n欢迎音乐爱好者参加...',
        reason: '基于您的音乐兴趣推荐',
        matchScore: 92
      });
    }

    return personalizedTemplates;
  },

  // 获取热门模板
  getHotTemplates() {
    return this.data.templates
      .filter(template => template.isHot)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  },

  // 获取季节性模板
  getSeasonalTemplates() {
    const currentMonth = new Date().getMonth() + 1;
    let seasonalType = '';

    if (currentMonth >= 2 && currentMonth <= 4) {
      seasonalType = '春季';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      seasonalType = '夏季';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      seasonalType = '秋季';
    } else {
      seasonalType = '冬季';
    }

    return this.data.templates
      .filter(template => template.isSeasonal)
      .map(template => ({
        ...template,
        seasonalType
      }));
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 搜索功能
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  performSearch() {
    const { searchKeyword, templates } = this.data;
    
    if (!searchKeyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSearching: true });

    // 模拟搜索
    setTimeout(() => {
      const searchResults = templates.filter(template => 
        template.title.includes(searchKeyword) ||
        template.content.includes(searchKeyword) ||
        template.tags.some(tag => tag.includes(searchKeyword))
      );

      this.setData({
        searchResults,
        isSearching: false
      });
    }, 1000);
  },

  // 选择模板
  selectTemplate(e) {
    const template = e.currentTarget.dataset.template;
    
    wx.showModal({
      title: '使用模板',
      content: `确定要使用"${template.title}"模板吗？`,
      success: (res) => {
        if (res.confirm) {
          this.useTemplate(template);
        }
      }
    });
  },

  // 使用模板
  useTemplate(template) {
    // 跳转到生成页面并带入模板内容
    wx.navigateTo({
      url: `/pages/generate/generate?template=${encodeURIComponent(JSON.stringify(template))}`
    });
  },

  // 收藏模板
  favoriteTemplate(e) {
    const template = e.currentTarget.dataset.template;
    
    let favorites = wx.getStorageSync('templateFavorites') || [];
    const existingIndex = favorites.findIndex(fav => fav.id === template.id);
    
    if (existingIndex > -1) {
      favorites.splice(existingIndex, 1);
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      favorites.push(template);
      wx.showToast({
        title: '已添加收藏',
        icon: 'success'
      });
    }
    
    wx.setStorageSync('templateFavorites', favorites);
  },

  // 分享模板
  shareTemplate(e) {
    const template = e.currentTarget.dataset.template;
    
    return {
      title: `校小撰模板：${template.title}`,
      path: `/pages/smart-templates/smart-templates?templateId=${template.id}`,
      imageUrl: '/images/template-share.png'
    };
  },

  // 查看模板详情
  viewTemplateDetail(e) {
    const template = e.currentTarget.dataset.template;
    
    wx.navigateTo({
      url: `/pages/template-detail/template-detail?templateId=${template.id}`
    });
  },

  // 更新用户资料
  updateUserProfile() {
    wx.navigateTo({
      url: '/pages/user-profile/user-profile'
    });
  },

  // 刷新推荐
  refreshRecommendations() {
    wx.showLoading({
      title: '刷新推荐中...'
    });

    setTimeout(() => {
      this.loadPersonalizedRecommendations();
      wx.hideLoading();
      wx.showToast({
        title: '推荐已更新',
        icon: 'success'
      });
    }, 1500);
  }
});

