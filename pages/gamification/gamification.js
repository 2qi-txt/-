Page({
  data: {
    themeClass: '',
    currentTab: 'profile',
    userProfile: {
      level: 1,
      experience: 150,
      points: 1250,
      streak: 7,
      achievements: []
    },
    achievements: [],
    leaderboard: [],
    dailyTasks: [],
    weeklyChallenges: [],
    stats: {
      totalGenerated: 0,
      totalOptimized: 0,
      totalShared: 0,
      totalFavorites: 0
    }
  },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = (t) => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);
    this.loadUserProfile();
    this.loadAchievements();
    this.loadLeaderboard();
    this.loadDailyTasks();
    this.loadWeeklyChallenges();
    this.loadUserStats();
  },

  onShow() {
    this.updateThemeClass();
  },

  // 加載用戶資料
  loadUserProfile() {
    const userProfile = wx.getStorageSync('userProfile') || {
      level: 1,
      experience: 150,
      points: 1250,
      streak: 7,
      achievements: []
    };
    this.setData({ userProfile });
  },

  // 加载成就系统
  loadAchievements() {
    const achievements = [
      {
        id: 'first_generation',
        title: '初出茅庐',
        description: '完成第一次文案生成',
        icon: '🎯',
        points: 50,
        isUnlocked: true,
        unlockedAt: '2024-01-15'
      },
      {
        id: 'generation_master',
        title: '文案大师',
        description: '生成100篇文案',
        icon: '📝',
        points: 200,
        isUnlocked: false,
        progress: 45,
        target: 100
      },
      {
        id: 'optimization_expert',
        title: '优化专家',
        description: '优化50篇文案',
        icon: '✨',
        points: 150,
        isUnlocked: false,
        progress: 12,
        target: 50
      },
      {
        id: 'social_butterfly',
        title: '社交达人',
        description: '分享20篇文案',
        icon: '📤',
        points: 100,
        isUnlocked: false,
        progress: 8,
        target: 20
      },
      {
        id: 'streak_keeper',
        title: '坚持不懈',
        description: '连续使用7天',
        icon: '🔥',
        points: 100,
        isUnlocked: true,
        unlockedAt: '2024-01-20'
      },
      {
        id: 'template_collector',
        title: '模板收藏家',
        description: '收藏30个模板',
        icon: '📚',
        points: 120,
        isUnlocked: false,
        progress: 15,
        target: 30
      },
      {
        id: 'creative_genius',
        title: '创意天才',
        description: '获得50个赞',
        icon: '💡',
        points: 180,
        isUnlocked: false,
        progress: 23,
        target: 50
      },
      {
        id: 'level_master',
        title: '等级达人',
        description: '达到10级',
        icon: '🏆',
        points: 300,
        isUnlocked: false,
        progress: 1,
        target: 10
      }
    ];

    this.setData({ achievements });
  },

  // 加载排行榜
  loadLeaderboard() {
    const leaderboard = [
      { rank: 1, name: '张同学', avatar: '/images/avatar1.png', points: 2850, level: 8 },
      { rank: 2, name: '李同学', avatar: '/images/avatar2.png', points: 2650, level: 7 },
      { rank: 3, name: '王同学', avatar: '/images/avatar3.png', points: 2450, level: 7 },
      { rank: 4, name: '刘同学', avatar: '/images/avatar4.png', points: 2250, level: 6 },
      { rank: 5, name: '陈同学', avatar: '/images/avatar5.png', points: 2050, level: 6 },
      { rank: 6, name: '你', avatar: '/images/my-avatar.png', points: 1250, level: 3, isCurrentUser: true },
      { rank: 7, name: '赵同学', avatar: '/images/avatar6.png', points: 1150, level: 3 },
      { rank: 8, name: '孙同学', avatar: '/images/avatar7.png', points: 1050, level: 3 }
    ];

    this.setData({ leaderboard });
  },

  // 加载每日任务
  loadDailyTasks() {
    const dailyTasks = [
      {
        id: 'daily_generate',
        title: '生成一篇文案',
        description: '使用任意模板生成一篇新文案',
        icon: '📝',
        points: 20,
        isCompleted: false,
        progress: 0,
        target: 1
      },
      {
        id: 'daily_optimize',
        title: '优化一篇文案',
        description: '对现有文案进行优化',
        icon: '✨',
        points: 15,
        isCompleted: true,
        progress: 1,
        target: 1
      },
      {
        id: 'daily_share',
        title: '分享一篇文案',
        description: '将文案分享到社交平台',
        icon: '📤',
        points: 25,
        isCompleted: false,
        progress: 0,
        target: 1
      },
      {
        id: 'daily_browse',
        title: '浏览5篇文案',
        description: '在浏览页面查看5篇文案',
        icon: '👀',
        points: 10,
        isCompleted: false,
        progress: 3,
        target: 5
      }
    ];

    this.setData({ dailyTasks });
  },

  // 加载周挑战
  loadWeeklyChallenges() {
    const weeklyChallenges = [
      {
        id: 'weekly_creative',
        title: '创意周',
        description: '本周生成10篇创意文案',
        icon: '🎨',
        points: 100,
        isCompleted: false,
        progress: 6,
        target: 10,
        deadline: '2024-01-28'
      },
      {
        id: 'weekly_social',
        title: '社交达人',
        description: '本周分享15篇文案',
        icon: '📱',
        points: 150,
        isCompleted: false,
        progress: 8,
        target: 15,
        deadline: '2024-01-28'
      },
      {
        id: 'weekly_optimizer',
        title: '优化大师',
        description: '本周优化20篇文案',
        icon: '🔧',
        points: 200,
        isCompleted: false,
        progress: 12,
        target: 20,
        deadline: '2024-01-28'
      }
    ];

    this.setData({ weeklyChallenges });
  },

  // 加载用户统计
  loadUserStats() {
    const stats = {
      totalGenerated: wx.getStorageSync('generatedCount') || 0,
      totalOptimized: wx.getStorageSync('optimizedCount') || 0,
      totalShared: wx.getStorageSync('sharedCount') || 0,
      totalFavorites: wx.getStorageSync('favoritesCount') || 0
    };
    this.setData({ stats });
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
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

  // 領取成就獎勵
  claimAchievement(e) {
    const achievementId = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.isUnlocked) {
      return;
    }

    // 检查是否达到解锁条件
    if (this.checkAchievementCondition(achievement)) {
      this.unlockAchievement(achievement);
    } else {
      wx.showToast({
        title: '尚未达到解锁条件',
        icon: 'none'
      });
    }
  },

  // 检查成就条件
  checkAchievementCondition(achievement) {
    const { stats } = this.data;
    
    switch (achievement.id) {
      case 'generation_master':
        return stats.totalGenerated >= achievement.target;
      case 'optimization_expert':
        return stats.totalOptimized >= achievement.target;
      case 'social_butterfly':
        return stats.totalShared >= achievement.target;
      case 'template_collector':
        return stats.totalFavorites >= achievement.target;
      default:
        return false;
    }
  },

  // 解锁成就
  unlockAchievement(achievement) {
    const achievements = this.data.achievements.map(a => {
      if (a.id === achievement.id) {
        return {
          ...a,
          isUnlocked: true,
          unlockedAt: new Date().toLocaleDateString()
        };
      }
      return a;
    });

    // 更新用户资料
    const userProfile = { ...this.data.userProfile };
    userProfile.points += achievement.points;
    userProfile.achievements.push(achievement.id);

    this.setData({
      achievements,
      userProfile
    });

    // 保存到本地存储
    wx.setStorageSync('userProfile', userProfile);

    // 显示成就解锁动画
    this.showAchievementUnlocked(achievement);
  },

  // 显示成就解锁动画
  showAchievementUnlocked(achievement) {
    wx.showModal({
      title: '🎉 成就解锁！',
      content: `恭喜获得成就「${achievement.title}」\n获得 ${achievement.points} 积分！`,
      showCancel: false,
      confirmText: '太棒了！'
    });
  },

  // 完成每日任务
  completeDailyTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.dailyTasks.find(t => t.id === taskId);
    
    if (!task || task.isCompleted) {
      return;
    }

    // 更新任务状态
    const dailyTasks = this.data.dailyTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: true,
          progress: t.target
        };
      }
      return t;
    });

    // 更新用户积分
    const userProfile = { ...this.data.userProfile };
    userProfile.points += task.points;

    this.setData({
      dailyTasks,
      userProfile
    });

    // 保存到本地存储
    wx.setStorageSync('userProfile', userProfile);

    wx.showToast({
      title: `获得 ${task.points} 积分！`,
      icon: 'success'
    });
  },

  // 领取周挑战奖励
  claimWeeklyChallenge(e) {
    const challengeId = e.currentTarget.dataset.id;
    const challenge = this.data.weeklyChallenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.isCompleted) {
      return;
    }

    // 检查是否完成挑战
    if (challenge.progress >= challenge.target) {
      const weeklyChallenges = this.data.weeklyChallenges.map(c => {
        if (c.id === challengeId) {
          return { ...c, isCompleted: true };
        }
        return c;
      });

      // 更新用户积分
      const userProfile = { ...this.data.userProfile };
      userProfile.points += challenge.points;

      this.setData({
        weeklyChallenges,
        userProfile
      });

      // 保存到本地存储
      wx.setStorageSync('userProfile', userProfile);

      wx.showToast({
        title: `挑战完成！获得 ${challenge.points} 积分！`,
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '挑战尚未完成',
        icon: 'none'
      });
    }
  },

  // 查看成就详情
  viewAchievementDetail(e) {
    const achievementId = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === achievementId);
    
    wx.showModal({
      title: achievement.title,
      content: achievement.description + `\n\n奖励积分：${achievement.points}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 分享成就
  shareAchievement(e) {
    const achievementId = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === achievementId);
    
    return {
      title: `我在校小撰获得了成就「${achievement.title}」！`,
      path: '/pages/gamification/gamification',
      imageUrl: '/images/achievement-share.png'
    };
  },

  // 查看排行榜详情
  viewLeaderboardDetail() {
    wx.showModal({
      title: '排行榜说明',
      content: '排行榜根据用户积分进行排名，积分通过完成任务、解锁成就等方式获得。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 刷新数据
  refreshData() {
    wx.showLoading({
      title: '刷新中...'
    });

    setTimeout(() => {
      this.loadUserProfile();
      this.loadAchievements();
      this.loadLeaderboard();
      this.loadDailyTasks();
      this.loadWeeklyChallenges();
      this.loadUserStats();
      wx.hideLoading();
      wx.showToast({
        title: '数据已更新',
        icon: 'success'
      });
    }, 1500);
  }
});

