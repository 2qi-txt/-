Page({
    data: {
      themeClass: '',
      currentTheme: 'skin-libai',
      currentTab: 'official',
      selectedScene: '',
      selectedCharacter: 'libai',
      isGenerating: false,
      generatedContent: '',
      vipStatus: null,
      generateRemaining: 0,
      previewPrompt: '',
      formData: {
        title: '',
        keywords: '',
        style: 'formal',
        length: 'medium',
        description: ''
      }
    },
  
    onLoad(options) {
      this.updateThemeClass();
      const app = getApp();
      this._onTheme = (t) => this.updateThemeClass();
      app.subscribeTheme(this._onTheme);
      if (options.type) {
        // 如果是社交类型，切换到社交标签并选择小红书
        if (options.type === 'social') {
          this.setData({ currentTab: 'social', selectedScene: 'xiaohongshu' });
        } else {
          this.selectScene({ currentTarget: { dataset: { scene: options.type } } });
        }
      }
    },
  
    switchTab(e) {
      wx.vibrateShort({ type: 'light' });
      const tab = e.currentTarget.dataset.tab;
      this.setData({ 
        currentTab: tab,
        selectedScene: '',
        generatedContent: ''
      });
    },
  
    onShow() {
      this.updateThemeClass();
      this.refreshVipInfo();
    },
  
    updateThemeClass() {
      const app = getApp();
      const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
      this.setData({ 
        currentTheme: theme,
        themeClass: theme 
      });
    },
  
    onUnload() {
      const app = getApp();
      if (this._onTheme) app.unsubscribeTheme(this._onTheme);
    },
  
    // 选择人物口吻
    selectCharacter(e) {
      wx.vibrateShort({ type: 'light' });
      const character = e.currentTarget.dataset.character;
      this.setData({ selectedCharacter: character });
    },
  
    // 选择场景
    selectScene(e) {
      wx.vibrateShort({ type: 'light' });
      const scene = e.currentTarget.dataset.scene;
      this.setData({ selectedScene: scene });
    },
  
    // 输入框变化监听
    onInputChange(e) {
      const field = e.currentTarget.dataset.field;
      const value = e.detail.value;
      this.setData({
        [`formData.${field}`]: value
      });
    },
  
    // 获取人物口吻描述
    getCharacterPrompt(character) {
      const prompts = {
        libai: '以李白潇洒飘逸的诗词风格，文采飞扬、意境深远，带有古代诗人的浪漫与豪迈',
        diaochan: '以貂蝉柔美动人的风格，婉约细腻、情深意切，带有古典美人的优雅与柔情',
        lan: '以澜冷酷神秘的风格，简洁有力、神秘深邃，带有刺客的冷峻与果断',
        caiwenji: '以蔡文姬可爱萌系的风格，温暖治愈、活泼可爱，带有萝莉的童真与治愈'
      };
      return prompts[character] || prompts.libai;
    },
  
    // 生成文案
    generateContent() {
      wx.vibrateShort({ type: 'heavy' });
      const { selectedScene, formData, selectedCharacter } = this.data;
      
      if (!selectedScene) {
        wx.showToast({
          title: '请先选择场景',
          icon: 'none'
        });
        return;
      }
  
      if (!formData.title.trim()) {
        wx.showToast({
          title: '请输入主题内容',
          icon: 'none'
        });
        return;
      }
  
      const ok = this.checkQuotaAndConsume('generate');
      if (!ok) return;
  
      this.setData({ isGenerating: true });
      this.callGenerateAPI();
    },
  
    // 调用后端接口
    callGenerateAPI() {
      const { selectedScene, formData, selectedCharacter } = this.data;
      
      const characterPrompt = this.getCharacterPrompt(selectedCharacter);
      
      let userPrompt = `请以${characterPrompt}的风格，生成一条【${selectedScene || '电竞'}】场景的文案，标题：${formData.title || '默认标题'}，关键词：${formData.keywords || '电竞文案'}，风格：${formData.style || '简洁有力'}，长度：${formData.length || '适中'}，描述：${formData.description || ''}`;
      
      this.setData({ previewPrompt: userPrompt });
  
      wx.request({
        url: 'http://127.0.0.1:8000/api/chatglm/generate/',
        method: 'POST',
        data: {
          user_prompt: userPrompt,
          temperature: 0.8
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          this.setData({ isGenerating: false });
          if (res.data.success) {
            this.setData({ generatedContent: res.data.data.ai_content });
            this.updateStats();
            this.saveToRecent();
            wx.showToast({ title: 'AI生成成功', icon: 'success' });
          } else {
            wx.showToast({
              title: `生成失败：${res.data.error}`,
              icon: 'none',
              duration: 3000
            });
          }
        },
        fail: (err) => {
          this.setData({ isGenerating: false });
          wx.showToast({
            title: `调用失败：${err.errMsg}`,
            icon: 'none',
            duration: 3000
          });
          console.error('接口调用异常详情：', err);
        }
      });
    },
  
    // 复制文案
    copyContent() {
      wx.setClipboardData({
        data: this.data.generatedContent,
        success: () => {
          wx.showToast({ title: '复制成功', icon: 'success' });
        },
        fail: () => {
          wx.showToast({ title: '复制失败', icon: 'none' });
        }
      });
    },
  
    // 重新生成
    regenerateContent() {
      this.setData({ generatedContent: '' });
      this.generateContent();
    },
  
    // 保存文案
    saveContent() {
      const content = {
        id: Date.now(),
        title: this.data.formData.title,
        content: this.data.generatedContent,
        scene: this.data.selectedScene,
        time: new Date().toLocaleString(),
        type: 'generated'
      };
  
      let favorites = wx.getStorageSync('favorites') || [];
      favorites.unshift(content);
      wx.setStorageSync('favorites', favorites);
      wx.showToast({ title: '保存成功', icon: 'success' });
    },
  
    // 更新统计
    updateStats() {
      const count = wx.getStorageSync('generatedCount') || 0;
      wx.setStorageSync('generatedCount', count + 1);
    },
  
    // 保存到最近
    saveToRecent() {
      const recentItem = {
        id: Date.now(),
        title: this.data.formData.title,
        type: 'generate',
        time: new Date().toLocaleString(),
        params: `type=${this.data.selectedScene}`
      };
  
      let recentItems = wx.getStorageSync('recentItems') || [];
      recentItems.unshift(recentItem);
      if (recentItems.length > 10) recentItems = recentItems.slice(0, 10);
      wx.setStorageSync('recentItems', recentItems);
    },
  
    getVipStatus() {
      const now = new Date().toDateString();
      let s = wx.getStorageSync('vipStatus') || {
        isVip: false,
        dailyQuota: { generate: 10, optimize: 10 },
        usedToday: { generate: 0, optimize: 0 },
        lastDate: now
      };
      if (s.lastDate !== now) {
        s.usedToday = { generate: 0, optimize: 0 };
        s.lastDate = now;
        wx.setStorageSync('vipStatus', s);
      }
      return s;
    },
  
    checkQuotaAndConsume(kind) {
      const s = this.getVipStatus();
      const limit = s.isVip ? (s.dailyQuota[kind] || 50) : (s.dailyQuota[kind] || 10);
      const used = s.usedToday[kind] || 0;
      if (used >= limit) {
        wx.showModal({
          title: '额度已用完',
          content: '开通VIP可提升每日额度与速度',
          confirmText: '去开通',
          success: (r) => {
            if (r.confirm) wx.navigateTo({ url: '/pages/vip/vip' });
          }
        });
        return false;
      }
      s.usedToday[kind] = used + 1;
      wx.setStorageSync('vipStatus', s);
      this.refreshVipInfo();
      return true;
    },
  
    refreshVipInfo() {
      const s = this.getVipStatus();
      const limit = s.isVip ? (s.dailyQuota.generate || 50) : (s.dailyQuota.generate || 10);
      const used = s.usedToday.generate || 0;
      this.setData({ vipStatus: s, generateRemaining: Math.max(0, limit - used) });
    },
  
    navigateToVip() {
      wx.navigateTo({ url: '/pages/vip/vip' });
    }
  });
