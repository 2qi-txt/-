Page({
  data: {
    themeClass: '',
    currentTab: 'teams',
    teams: [],
    sharedContent: [],
    comments: [],
    currentTeam: null,
    isCreatingTeam: false,
    isJoiningTeam: false,
    newTeamData: {
      name: '',
      description: '',
      inviteCode: ''
    },
    joinCode: '',
    teamMembers: [],
    teamStats: {
      totalMembers: 0,
      totalContent: 0,
      activeMembers: 0
    }
  },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = (t) => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);
    this.loadUserTeams();
    this.loadSharedContent();
    this.loadComments();
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

  // 加載用戶團隊
  loadUserTeams() {
    const teams = [
      {
        id: 1,
        name: '计算机学院学生会',
        description: '计算机学院官方学生组织',
        avatar: '/images/team1.png',
        memberCount: 25,
        isOwner: true,
        role: 'owner',
        joinTime: '2024-01-01',
        lastActive: '2024-01-20'
      },
      {
        id: 2,
        name: '编程社团',
        description: '热爱编程的同学们',
        avatar: '/images/team2.png',
        memberCount: 15,
        isOwner: false,
        role: 'admin',
        joinTime: '2024-01-10',
        lastActive: '2024-01-19'
      },
      {
        id: 3,
        name: '班级群组',
        description: '2021级计算机1班',
        avatar: '/images/team3.png',
        memberCount: 30,
        isOwner: false,
        role: 'member',
        joinTime: '2024-01-05',
        lastActive: '2024-01-18'
      }
    ];

    this.setData({ teams });
  },

  // 加載共享內容
  loadSharedContent() {
    const sharedContent = [
      {
        id: 1,
        title: '社团招新通知',
        content: '【社团招新】欢迎加入我们！\n\n我们是一个充满活力的社团...',
        author: '张同学',
        authorAvatar: '/images/avatar1.png',
        teamName: '计算机学院学生会',
        teamId: 1,
        createTime: '2024-01-20 14:30',
        updateTime: '2024-01-20 16:45',
        viewCount: 45,
        likeCount: 12,
        commentCount: 8,
        isLiked: false,
        isBookmarked: true,
        tags: ['招新', '社团', '通知'],
        collaborators: [
          { name: '李同学', avatar: '/images/avatar2.png' },
          { name: '王同学', avatar: '/images/avatar3.png' }
        ],
        version: 3,
        status: 'published'
      },
      {
        id: 2,
        title: '编程竞赛宣传',
        content: '🎉 编程竞赛开始报名！\n\n时间：本周六下午2点\n地点：计算机楼...',
        author: '刘同学',
        authorAvatar: '/images/avatar4.png',
        teamName: '编程社团',
        teamId: 2,
        createTime: '2024-01-19 10:15',
        updateTime: '2024-01-19 11:20',
        viewCount: 78,
        likeCount: 23,
        commentCount: 15,
        isLiked: true,
        isBookmarked: false,
        tags: ['竞赛', '编程', '活动'],
        collaborators: [
          { name: '陈同学', avatar: '/images/avatar5.png' }
        ],
        version: 2,
        status: 'draft'
      }
    ];

    this.setData({ sharedContent });
  },

  // 加載評論
  loadComments() {
    const comments = [
      {
        id: 1,
        contentId: 1,
        author: '李同学',
        authorAvatar: '/images/avatar2.png',
        content: '这个通知写得很好，建议在时间部分加个具体日期',
        createTime: '2024-01-20 15:30',
        isAuthor: false,
        likes: 3,
        isLiked: false,
        replies: [
          {
            id: 11,
            author: '张同学',
            authorAvatar: '/images/avatar1.png',
            content: '好的，我来修改一下',
            createTime: '2024-01-20 15:45',
            isAuthor: true
          }
        ]
      },
      {
        id: 2,
        contentId: 1,
        author: '王同学',
        authorAvatar: '/images/avatar3.png',
        content: '可以加个联系方式吗？方便同学们咨询',
        createTime: '2024-01-20 16:00',
        isAuthor: false,
        likes: 5,
        isLiked: true,
        replies: []
      }
    ];

    this.setData({ comments });
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 选择团队
  selectTeam(e) {
    const teamId = e.currentTarget.dataset.id;
    const team = this.data.teams.find(t => t.id === teamId);
    
    this.setData({ currentTeam: team });
    this.loadTeamMembers(teamId);
    this.loadTeamStats(teamId);
  },

  // 加载团队成员
  loadTeamMembers(teamId) {
    const teamMembers = [
      { id: 1, name: '张同学', avatar: '/images/avatar1.png', role: 'owner', joinTime: '2024-01-01', isOnline: true },
      { id: 2, name: '李同学', avatar: '/images/avatar2.png', role: 'admin', joinTime: '2024-01-02', isOnline: true },
      { id: 3, name: '王同学', avatar: '/images/avatar3.png', role: 'member', joinTime: '2024-01-05', isOnline: false },
      { id: 4, name: '刘同学', avatar: '/images/avatar4.png', role: 'member', joinTime: '2024-01-08', isOnline: true },
      { id: 5, name: '陈同学', avatar: '/images/avatar5.png', role: 'member', joinTime: '2024-01-10', isOnline: false }
    ];

    this.setData({ teamMembers });
  },

  // 加载团队统计
  loadTeamStats(teamId) {
    const teamStats = {
      totalMembers: 25,
      totalContent: 12,
      activeMembers: 18
    };

    this.setData({ teamStats });
  },

  // 创建团队
  createTeam() {
    this.setData({ isCreatingTeam: true });
  },

  // 取消创建团队
  cancelCreateTeam() {
    this.setData({ 
      isCreatingTeam: false,
      newTeamData: {
        name: '',
        description: '',
        inviteCode: ''
      }
    });
  },

  // 输入团队信息
  onTeamInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`newTeamData.${field}`]: value
    });
  },

  // 提交创建团队
  submitCreateTeam() {
    const { name, description } = this.data.newTeamData;
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入团队名称',
        icon: 'none'
      });
      return;
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请输入团队描述',
        icon: 'none'
      });
      return;
    }

    // 生成邀请码
    const inviteCode = this.generateInviteCode();
    
    const newTeam = {
      id: Date.now(),
      name,
      description,
      avatar: '/images/team-default.png',
      memberCount: 1,
      isOwner: true,
      role: 'owner',
      joinTime: new Date().toLocaleDateString(),
      lastActive: new Date().toLocaleDateString(),
      inviteCode
    };

    const teams = [...this.data.teams, newTeam];
    this.setData({ 
      teams,
      isCreatingTeam: false,
      newTeamData: {
        name: '',
        description: '',
        inviteCode: ''
      }
    });

    wx.showModal({
      title: '团队创建成功',
      content: `邀请码：${inviteCode}\n\n请将此邀请码分享给团队成员`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 生成邀请码
  generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // 加入团队
  joinTeam() {
    this.setData({ isJoiningTeam: true });
  },

  // 取消加入团队
  cancelJoinTeam() {
    this.setData({ 
      isJoiningTeam: false,
      joinCode: ''
    });
  },

  // 输入邀请码
  onJoinCodeInput(e) {
    this.setData({
      joinCode: e.detail.value
    });
  },

  // 提交加入团队
  submitJoinTeam() {
    const { joinCode } = this.data;
    
    if (!joinCode.trim()) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      });
      return;
    }

    // 模拟验证邀请码
    if (joinCode === 'ABC123') {
      const newTeam = {
        id: Date.now(),
        name: '新加入的团队',
        description: '通过邀请码加入的团队',
        avatar: '/images/team-default.png',
        memberCount: 8,
        isOwner: false,
        role: 'member',
        joinTime: new Date().toLocaleDateString(),
        lastActive: new Date().toLocaleDateString()
      };

      const teams = [...this.data.teams, newTeam];
      this.setData({ 
        teams,
        isJoiningTeam: false,
        joinCode: ''
      });

      wx.showToast({
        title: '加入成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '邀请码无效',
        icon: 'none'
      });
    }
  },

  // 分享内容到团队
  shareToTeam(e) {
    const contentId = e.currentTarget.dataset.id;
    const content = this.data.sharedContent.find(c => c.id === contentId);
    
    wx.showActionSheet({
      itemList: this.data.teams.map(team => team.name),
      success: (res) => {
        const selectedTeam = this.data.teams[res.tapIndex];
        this.performShareToTeam(content, selectedTeam);
      }
    });
  },

  // 执行分享到团队
  performShareToTeam(content, team) {
    wx.showModal({
      title: '分享到团队',
      content: `确定要将「${content.title}」分享到「${team.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          // 更新内容的团队信息
          const sharedContent = this.data.sharedContent.map(c => {
            if (c.id === content.id) {
              return {
                ...c,
                teamName: team.name,
                teamId: team.id,
                updateTime: new Date().toLocaleString()
              };
            }
            return c;
          });

          this.setData({ sharedContent });

          wx.showToast({
            title: '分享成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 点赞内容
  likeContent(e) {
    const contentId = e.currentTarget.dataset.id;
    const sharedContent = this.data.sharedContent.map(content => {
      if (content.id === contentId) {
        return {
          ...content,
          isLiked: !content.isLiked,
          likeCount: content.isLiked ? content.likeCount - 1 : content.likeCount + 1
        };
      }
      return content;
    });

    this.setData({ sharedContent });
  },

  // 收藏内容
  bookmarkContent(e) {
    const contentId = e.currentTarget.dataset.id;
    const sharedContent = this.data.sharedContent.map(content => {
      if (content.id === contentId) {
        return {
          ...content,
          isBookmarked: !content.isBookmarked
        };
      }
      return content;
    });

    this.setData({ sharedContent });
  },

  // 查看内容详情
  viewContentDetail(e) {
    const contentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/content-detail/content-detail?id=${contentId}&from=collaboration`
    });
  },

  // 添加评论
  addComment(e) {
    const contentId = e.currentTarget.dataset.id;
    const content = this.data.sharedContent.find(c => c.id === contentId);
    
    wx.showModal({
      title: '添加评论',
      placeholderText: '输入您的评论...',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newComment = {
            id: Date.now(),
            contentId,
            author: '当前用户',
            authorAvatar: '/images/my-avatar.png',
            content: res.content,
            createTime: new Date().toLocaleString(),
            isAuthor: true,
            likes: 0,
            isLiked: false,
            replies: []
          };

          const comments = [...this.data.comments, newComment];
          this.setData({ comments });

          // 更新内容的评论数
          const sharedContent = this.data.sharedContent.map(c => {
            if (c.id === contentId) {
              return {
                ...c,
                commentCount: c.commentCount + 1
              };
            }
            return c;
          });

          this.setData({ sharedContent });

          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看评论
  viewComments(e) {
    const contentId = e.currentTarget.dataset.id;
    const contentComments = this.data.comments.filter(c => c.contentId === contentId);
    
    wx.navigateTo({
      url: `/pages/comments/comments?contentId=${contentId}`
    });
  },

  // 協作編輯
  collaborateEdit(e) {
    const contentId = e.currentTarget.dataset.id;
    const content = this.data.sharedContent.find(c => c.id === contentId);
    
    wx.showModal({
      title: '协作编辑',
      content: `确定要开始协作编辑「${content.title}」吗？\n\n其他团队成员将能够看到您的编辑。`,
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/collaborative-edit/collaborative-edit?contentId=${contentId}`
          });
        }
      }
    });
  },

  // 查看版本歷史
  viewVersionHistory(e) {
    const contentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/version-history/version-history?contentId=${contentId}`
    });
  },

  // 邀請成員
  inviteMember() {
    if (!this.data.currentTeam) {
      wx.showToast({
        title: '请先选择团队',
        icon: 'none'
      });
      return;
    }

    const team = this.data.currentTeam;
    wx.showModal({
      title: '邀请成员',
      content: `团队邀请码：${team.inviteCode}\n\n请将此邀请码分享给要邀请的成员`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 管理團隊
  manageTeam() {
    if (!this.data.currentTeam) {
      wx.showToast({
        title: '请先选择团队',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/team-management/team-management?teamId=${this.data.currentTeam.id}`
    });
  }
});

