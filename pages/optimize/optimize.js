Page({
    data: {
      themeClass: '',
      originalText: '',
      optimizeStyle: 'professional',
      optimizeFocus: ['grammar', 'style'],
      lengthControl: 'keep',
      targetAudience: 'students',
      isOptimizing: false,
      optimizedContent: '',
      optimizationNotes: '',
      optimizationHistory: [],
      vipStatus: null,
      optimizeRemaining: 0
    },
  
    onLoad() {
      this.updateThemeClass();
      const app = getApp();
      this._onTheme = (t) => this.updateThemeClass();
      app.subscribeTheme(this._onTheme);
      this.loadHistory();
    },
  
    onShow() {
      this.updateThemeClass();
      this.refreshVipInfo();
    },
  
    updateThemeClass() {
      const app = getApp();
      const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
      this.setData({ currentTheme: theme, themeClass: theme });
    },
  
    onUnload() {
      const app = getApp();
      if (this._onTheme) app.unsubscribeTheme(this._onTheme);
    },
  
    // 文本输入
    onTextInput(e) {
      this.setData({
        originalText: e.detail.value
      });
    },
  
    // 选择风格
    selectStyle(e) {
      const style = e.currentTarget.dataset.style;
      this.setData({
        optimizeStyle: style
      });
    },
  
    // 切换优化重点
    toggleFocus(e) {
      const focus = e.currentTarget.dataset.focus;
      let focusList = [...this.data.optimizeFocus];
      
      if (focusList.includes(focus)) {
        focusList = focusList.filter(item => item !== focus);
      } else {
        focusList.push(focus);
      }
      
      this.setData({
        optimizeFocus: focusList
      });
    },
  
    // 选择字数控制
    selectLength(e) {
      const length = e.currentTarget.dataset.length;
      this.setData({
        lengthControl: length
      });
    },
  
    // 选择目标受众
    selectAudience(e) {
      const audience = e.currentTarget.dataset.audience;
      this.setData({
        targetAudience: audience
      });
    },
  
    // 优化内容
    optimizeContent() {
      const { originalText } = this.data;
      
      if (!originalText.trim()) {
        wx.showToast({
          title: '请输入需要优化的文案',
          icon: 'none'
        });
        return;
      }
  
      const ok = this.checkQuotaAndConsume('optimize');
      if (!ok) return;
  
      this.setData({ isOptimizing: true });
      this.callOptimizeAPI();
    },
  
    // 调用优化API
    callOptimizeAPI() {
      const { originalText, optimizeStyle, optimizeFocus, lengthControl, targetAudience } = this.data;
      wx.request({
        url: 'http://127.0.0.1:8000/api/chatglm/optimize/',
        method: 'POST',
        data: {
          original_text: originalText,
          style: optimizeStyle,
          focus: optimizeFocus,
          length_control: lengthControl,
          target_audience: targetAudience,
          temperature: 0.8
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data && res.data.success) {
            this.setData({
              optimizedContent: res.data.data.optimized_content,
              optimizationNotes: res.data.data.notes || '',
              isOptimizing: false
            });
            this.updateStats();
            this.saveToHistory();
            wx.showToast({ title: '优化完成', icon: 'success' });
          } else {
            this.setData({ isOptimizing: false });
            wx.showToast({ title: '优化失败', icon: 'none' });
          }
        },
        fail: (err) => {
          this.setData({ isOptimizing: false });
          wx.showToast({ title: `调用失败：${err.errMsg}`, icon: 'none', duration: 3000 });
        }
      });
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
      const limit = s.isVip ? (s.dailyQuota.optimize || 50) : (s.dailyQuota.optimize || 10);
      const used = s.usedToday.optimize || 0;
      this.setData({ vipStatus: s, optimizeRemaining: Math.max(0, limit - used) });
    },
  
    navigateToVip() {
      wx.navigateTo({ url: '/pages/vip/vip' });
    },
  
    // 生成優化內容
    generateOptimizedContent(originalText, options) {
      const { style, focus, length, audience } = options;
      
      let optimizedText = originalText;
      let notes = '';
  
      // 根据风格优化
      switch (style) {
        case 'professional':
          optimizedText = this.makeProfessional(optimizedText);
          notes += '• 采用专业用词，提升正式感\n';
          break;
        case 'creative':
          optimizedText = this.makeCreative(optimizedText);
          notes += '• 增加创意表达，提升吸引力\n';
          break;
        case 'emotional':
          optimizedText = this.makeEmotional(optimizedText);
          notes += '• 增强情感表达，提升感染力\n';
          break;
        case 'humorous':
          optimizedText = this.makeHumorous(optimizedText);
          notes += '• 加入幽默元素，提升趣味性\n';
          break;
      }
  
      // 根据优化重点调整
      if (focus.includes('grammar')) {
        optimizedText = this.fixGrammar(optimizedText);
        notes += '• 修正语法错误，提升准确性\n';
      }
      
      if (focus.includes('style')) {
        optimizedText = this.improveStyle(optimizedText);
        notes += '• 优化表达方式，提升流畅度\n';
      }
      
      if (focus.includes('structure')) {
        optimizedText = this.optimizeStructure(optimizedText);
        notes += '• 调整结构层次，提升逻辑性\n';
      }
      
      if (focus.includes('vocabulary')) {
        optimizedText = this.enrichVocabulary(optimizedText);
        notes += '• 丰富词汇表达，提升多样性\n';
      }
  
      // 根据字数控制调整
      switch (length) {
        case 'expand':
          optimizedText = this.expandContent(optimizedText);
          notes += '• 适当扩展内容，增加详细度\n';
          break;
        case 'compress':
          optimizedText = this.compressContent(optimizedText);
          notes += '• 精简表达，突出重点\n';
          break;
      }
  
      // 根据目标受众调整
      switch (audience) {
        case 'students':
          optimizedText = this.adaptForStudents(optimizedText);
          notes += '• 针对学生群体，使用亲切语言\n';
          break;
        case 'teachers':
          optimizedText = this.adaptForTeachers(optimizedText);
          notes += '• 针对教师群体，使用专业术语\n';
          break;
        case 'general':
          optimizedText = this.adaptForGeneral(optimizedText);
          notes += '• 面向一般公众，使用通俗语言\n';
          break;
      }
  
      return {
        content: optimizedText,
        notes: notes.trim()
      };
    },
  
    // 各种优化方法
    makeProfessional(text) {
      return text.replace(/很/g, '非常').replace(/好/g, '优秀').replace(/棒/g, '出色');
    },
  
    makeCreative(text) {
      return text.replace(/活动/g, '精彩活动').replace(/学习/g, '探索学习').replace(/生活/g, '美好生活');
    },
  
    makeEmotional(text) {
      return text.replace(/重要/g, '至关重要').replace(/喜欢/g, '热爱').replace(/开心/g, '欣喜若狂');
    },
  
    makeHumorous(text) {
      return text.replace(/学习/g, '快乐学习').replace(/考试/g, '知识大考验').replace(/作业/g, '智慧挑战');
    },
  
    fixGrammar(text) {
      // 简单的语法修正
      return text.replace(/的的/g, '的').replace(/了了/g, '了').replace(/，，/g, '，');
    },
  
    improveStyle(text) {
      return text.replace(/然后/g, '接着').replace(/所以/g, '因此').replace(/但是/g, '然而');
    },
  
    optimizeStructure(text) {
      // 添加段落分隔
      if (text.length > 100 && !text.includes('\n')) {
        const mid = Math.floor(text.length / 2);
        const spaceIndex = text.indexOf(' ', mid);
        if (spaceIndex > 0) {
          text = text.substring(0, spaceIndex) + '\n\n' + text.substring(spaceIndex + 1);
        }
      }
      return text;
    },
  
    enrichVocabulary(text) {
      return text.replace(/好/g, '优秀').replace(/大/g, '宏大').replace(/小/g, '精致');
    },
  
    expandContent(text) {
      if (text.length < 200) {
        return text + '\n\n更多精彩内容，敬请期待！';
      }
      return text;
    },
  
    compressContent(text) {
      return text.replace(/\s+/g, ' ').replace(/，\s*，/g, '，').trim();
    },
  
    adaptForStudents(text) {
      return text.replace(/同学们/g, '小伙伴们').replace(/请注意/g, '记得注意');
    },
  
    adaptForTeachers(text) {
      return text.replace(/同学们/g, '各位同学').replace(/记得/g, '请务必');
    },
  
    adaptForGeneral(text) {
      return text.replace(/同学们/g, '大家');
    },
  
    // 复制优化结果
    copyOptimized() {
      wx.setClipboardData({
        data: this.data.optimizedContent,
        success: () => {
          wx.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
  
    // 重新优化
    regenerateOptimized() {
      this.setData({ 
        optimizedContent: '',
        optimizationNotes: ''
      });
      this.optimizeContent();
    },
  
    // 保存优化结果
    saveOptimized() {
      const content = {
        id: Date.now(),
        title: this.data.originalText.substring(0, 20) + '...',
        original: this.data.originalText,
        optimized: this.data.optimizedContent,
        time: new Date().toLocaleString(),
        type: 'optimized'
      };
  
      // 保存到收藏
      let favorites = wx.getStorageSync('favorites') || [];
      favorites.unshift(content);
      wx.setStorageSync('favorites', favorites);
  
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    },
  
    // 更新统计
    updateStats() {
      const count = wx.getStorageSync('optimizedCount') || 0;
      wx.setStorageSync('optimizedCount', count + 1);
    },
  
    // 保存到历史
    saveToHistory() {
      const historyItem = {
        id: Date.now(),
        title: this.data.originalText.substring(0, 20) + '...',
        original: this.data.originalText,
        optimized: this.data.optimizedContent,
        time: new Date().toLocaleString()
      };
  
      let history = wx.getStorageSync('optimizationHistory') || [];
      history.unshift(historyItem);
      
      // 只保留最近20条
      if (history.length > 20) {
        history = history.slice(0, 20);
      }
      
      wx.setStorageSync('optimizationHistory', history);
      this.setData({ optimizationHistory: history });
    },
  
    // 加载历史记录
    loadHistory() {
      const history = wx.getStorageSync('optimizationHistory') || [];
      this.setData({ optimizationHistory: history });
    },
  
    // 加载历史项目
    loadHistoryItem(e) {
      const item = e.currentTarget.dataset.item;
      this.setData({
        originalText: item.original,
        optimizedContent: item.optimized
      });
    }
  });