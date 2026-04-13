Page({
  data: {
    currentTheme: '',
    featuredPlanId: 'pro-year',
    plans: [
      {
        id: 'student-month',
        name: '新秀特权',
        priceText: '¥15.9/月',
        originPriceText: '原价 ¥29.9',
        promoPriceText: '¥6.9/月',
        isPromo: true,
        discountText: '限时 5 折',
        isAutoRenew: true,
        firstMonthPrice: '¥4.9',
        quota: { generate: 80, optimize: 80 },
        benefits: ['每日 80 次生成/优化', '平台口吻自动适配', '热门标签智能补全'],
        vipLevelId: 1
      },
      {
        id: 'single-month',
        name: '月度通行证',
        priceText: '¥9.9/月',
        originPriceText: '原价 ¥19.9',
        promoPriceText: '¥7.9/月',
        isPromo: true,
        quota: { generate: 70, optimize: 70 },
        benefits: ['每日 70 次生成/优化', '不自动续费，月底到期'],
        vipLevelId: 2
      },
      {
        id: 'club-season',
        name: '钻石特权',
        priceText: '¥39.9/季',
        originPriceText: '原价 ¥79.9',
        promoPriceText: '¥19.9/季',
        isPromo: true,
        discountText: '立减 ¥40',
        quota: { generate: 120, optimize: 120 },
        benefits: ['每日 120 次生成/优化', '多账号共享额度', '活动海报文案套餐'],
        vipLevelId: 3
      },
      {
        id: 'pro-year',
        name: '王者通行证',
        priceText: '¥159/年',
        originPriceText: '原价 ¥299',
        promoPriceText: '¥69/年',
        isPromo: true,
        discountText: '新人专享',
        quota: { generate: 150, optimize: 150 },
        benefits: ['每日 150 次生成/优化', '优先队列加速', '高级模型与长上下文'],
        vipLevelId: 4
      }
    ],
    recommendTips: [],
    promoEndsAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
    countdownText: '',
    promoCountdownVisible: true,
    subscription: { autoRenew: false, cancelled: false, nextBillingAt: 0, nextText: '', planId: '' },
    oneOffEndAt: 0,
    oneOffText: '',
    vipStatus: {
      isVip: false,
      vipLevel: '',  // 新增：显示VIP等级名称
      expireTime: '', // 新增：VIP过期时间
      dailyQuota: { generate: 10, optimize: 10 },
      usedToday: { generate: 0, optimize: 0 },
      lastDate: ''
    },
    // ===== 新增：后端配置 =====
    baseUrl: 'http://127.0.0.1:8000', // 后端地址
    userId: '', // 登录后的用户ID
    _timer: null, // 定时器初始化
    currentOrder: null // 当前订单
  },

  // ===== 核心新增：微信登录 + 后端验证 =====
  wxLogin() {
    wx.showLoading({ title: '登录中...' });
    // 1. 获取微信临时登录凭证
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.hideLoading();
          wx.showToast({ title: '登录失败：未获取凭证', icon: 'none' });
          return;
        }

        // 2. 调用后端登录接口
        wx.request({
          url: `${this.data.baseUrl}/api/user/login/`,
          method: 'POST',
          header: { 'content-type': 'application/json' },
          data: { code: loginRes.code, anonymous: true },
          timeout: 10000,
          success: (res) => {
            wx.hideLoading();
            console.log('后端登录返回：', res.data);
            // 兼容后端返回格式
            const isSuccess = res.data.success || res.data.code === 200;
            const userId = res.data.user_id || res.data.data?.user_id;
            
            if (isSuccess && userId) {
              // 登录成功：缓存用户ID + 更新状态
              wx.setStorageSync('user_id', userId);
              this.setData({ userId });
              // 同步用户VIP状态
              this.syncUserVIPStatus();
              wx.showToast({ title: '登录成功', icon: 'success' });
            } else {
              // 登录失败：降级本地模式
              const localUserId = 'local_' + Date.now();
              wx.setStorageSync('user_id', localUserId);
              this.setData({ userId: localUserId });
              wx.showToast({ title: '离线模式登录', icon: 'none' });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            // 网络失败：强制本地模式
            const localUserId = 'local_' + Date.now();
            wx.setStorageSync('user_id', localUserId);
            this.setData({ userId: localUserId });
            wx.showToast({ title: '网络异常，离线模式', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '微信登录失败', icon: 'none' });
      }
    });
  },

  // ===== 核心新增：同步用户VIP状态（从后端/本地缓存） =====
  syncUserVIPStatus() {
    const userId = this.data.userId;
    if (!userId) return;

    // 优先调用后端接口
    wx.request({
      url: `${this.data.baseUrl}/api/vip/info/`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { user_id: userId },
      success: (res) => {
        if (res.data && (res.data.code === 200 || res.data.is_vip !== undefined)) {
          const vipInfo = res.data.data || res.data;
          const newVipStatus = {
            ...this.data.vipStatus,
            isVip: vipInfo.is_vip || false,
            vipLevel: vipInfo.vip_level || '',
            expireTime: vipInfo.expire_time || '',
            dailyQuota: vipInfo.daily_quota || { generate: 10, optimize: 10 },
            usedToday: vipInfo.used_today || { generate: 0, optimize: 0 }
          };
          wx.setStorageSync('vipStatus', newVipStatus);
          this.setData({ vipStatus: newVipStatus });
          this.updateRecommendTips();
        }
      },
      fail: () => {
        // 后端失败：读取本地缓存
        const localVip = wx.getStorageSync('vipStatus');
        if (localVip) {
          this.setData({ vipStatus: localVip });
        }
      }
    });
  },

  // ===== 核心新增：生成VIP订单（对接后端） =====
  createRechargeOrder(vipLevelId) {
    const userId = this.data.userId;
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      this.wxLogin();
      return;
    }

    wx.showLoading({ title: '生成订单中...' });
    // 调用后端生成订单接口
    wx.request({
      url: `${this.data.baseUrl}/api/vip/recharge/`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { user_id: userId, vip_level_id: vipLevelId },
      success: (res) => {
        wx.hideLoading();
        if (res.data && (res.data.code === 200 || res.data.order_num)) {
          const order = res.data.data || res.data;
          this.setData({ currentOrder: order });
          // 模拟支付确认
          wx.showModal({
            title: '订单生成成功',
            content: `订单号：${order.order_num || 'MOCK' + Date.now()}\n金额：¥${order.pay_amount || this.data.plans.find(p=>p.vipLevelId===vipLevelId).priceText}\n套餐：${order.vip_name || this.data.plans.find(p=>p.vipLevelId===vipLevelId).name}`,
            confirmText: '模拟支付',
            success: (r) => {
              if (r.confirm) this.payOrder(order, vipLevelId);
            }
          });
        } else {
          wx.showToast({ title: res.data?.msg || '订单生成失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        // 后端失败：纯前端模拟
        const plan = this.data.plans.find(p => p.vipLevelId === vipLevelId);
        if (plan) {
          wx.showModal({
            title: '离线模式',
            content: `将模拟开通【${plan.name}】（演示环境不扣费）`,
            confirmText: '确认开通',
            success: (r) => {
              if (r.confirm) this.openVipWithPlan(plan);
            }
          });
        }
      }
    });
  },

  // ===== 核心修改：模拟支付（新增调用后端支付回调接口） =====
  payOrder(order, vipLevelId) {
    wx.showLoading({ title: '支付中...' });
    
    // 调用后端支付回调接口，自动改is_paid为True
    wx.request({
      url: `${this.data.baseUrl}/api/vip/pay/callback/`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        order_num: order.order_num,  // 传订单号给后端
        user_id: this.data.userId    // 传用户ID给后端
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          // 后端改状态成功，更新前端VIP
          const plan = this.data.plans.find(p => p.vipLevelId === vipLevelId);
          if (plan) {
            this.openVipWithPlan(plan);
          }
          this.syncUserVIPStatus(); // 同步最新VIP状态
          wx.showToast({ title: '支付成功！订单已改为已支付', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.msg || '支付失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        // 后端接口调用失败，纯前端模拟
        const plan = this.data.plans.find(p => p.vipLevelId === vipLevelId);
        if (plan) {
          this.openVipWithPlan(plan);
        }
        wx.showToast({ title: '网络异常，模拟支付成功', icon: 'success' });
      }
    });
  },

  // ===== 原有逻辑：保留所有UI/交互 =====
  showOpenDialog() {
    // 先登录再开通
    if (!this.data.userId) {
      this.wxLogin();
      return;
    }
    wx.showModal({
      title: '立即开通',
      content: '当前未接入支付，点击确认将模拟开通VIP用于体验界面与权益。',
      confirmText: '模拟开通',
      success: (r) => { 
        if (r.confirm) {
          const plan = this.data.plans.find(p => p.id === this.data.featuredPlanId);
          this.createRechargeOrder(plan.vipLevelId);
        }
      }
    });
  },

  showLearnMore() {
    wx.showModal({
      title: 'VIP权益说明',
      content: '更高配额：每日生成50次、优化50次\n更快响应：VIP加速通道，优先处理\n更多模板：公告通知/活动事务/社交平台模板\n更强模型：支持更长上下文与更细粒度风格',
      showCancel: false
    });
  },

  onShow() {
    // 优先检查登录状态
    const userId = wx.getStorageSync('user_id');
    if (userId) {
      this.setData({ userId });
      this.syncUserVIPStatus();
    } else {
      this.wxLogin(); // 自动登录
    }

    const now = new Date().toDateString();
    let s = wx.getStorageSync('vipStatus') || {
      isVip: false,
      vipLevel: '',
      expireTime: '',
      dailyQuota: { generate: 10, optimize: 10 },
      usedToday: { generate: 0, optimize: 0 },
      lastDate: now
    };
    if (s.lastDate !== now) {
      s.usedToday = { generate: 0, optimize: 0 };
      s.lastDate = now;
      wx.setStorageSync('vipStatus', s);
    }
    const sub = wx.getStorageSync('vipSubscription') || { autoRenew: false, cancelled: false, nextBillingAt: 0, planId: '' };
    const oneOffEndAt = wx.getStorageSync('vipOneOffEndAt') || 0;
    this.setData({ 
      vipStatus: s, 
      subscription: this._withNextText(sub), 
      oneOffEndAt, 
      oneOffText: this._formatDate(oneOffEndAt) 
    });
    this.checkRenewal();
    this.updateCountdown();
    this.updateRecommendTips();
  },

  onLoad() {
    this.updateCountdown();
    if (this.data._timer) clearInterval(this.data._timer);
    this.data._timer = setInterval(() => this.updateCountdown(), 1000);
    this.setData({ _timer: this.data._timer });
  },

  onUnload() {
    if (this.data._timer) clearInterval(this.data._timer);
  },

  updateCountdown() {
    const t = this.data.promoEndsAt - Date.now();
    if (t <= 0) {
      this.setData({ promoCountdownVisible: false });
      return;
    }
    const d = Math.floor(t / (24*60*60*1000));
    const h = Math.floor((t % (24*60*60*1000)) / (60*60*1000));
    const m = Math.floor((t % (60*60*1000)) / (60*1000));
    const s = Math.floor((t % (60*1000)) / 1000);
    const txt = `限时优惠倒计时 ${d}天 ${h}时 ${m}分 ${s}秒`;
    this.setData({ countdownText: txt, promoCountdownVisible: true });
  },

  updateRecommendTips() {
    const s = this.data.vipStatus;
    const tips = [];
    
    // 新增：显示当前VIP等级
    if (s.isVip) {
      tips.push(`当前VIP：${s.vipLevel || '高级会员'}`);
      if (s.expireTime) tips.push(`有效期至：${s.expireTime}`);
    }

    const student = this.data.plans.find(p => p.id === 'student-month');
    const firstUsed = wx.getStorageSync('vipFirstMonthUsed') === true;
    if (student) {
      if (student.firstMonthPrice && !firstUsed) tips.push(`新人首月 ${student.firstMonthPrice}`);
      tips.push(student.isAutoRenew ? '连续包月可随时退订' : '支持月度购买');
    }
    const single = this.data.plans.find(p => p.id === 'single-month');
    if (single) tips.push('仅本月月卡：不自动续费，到期自动结束');
    const season = this.data.plans.find(p => p.id === 'club-season');
    if (season && season.discountText) tips.push(`季卡${season.discountText}`);
    const year = this.data.plans.find(p => p.id === 'pro-year');
    if (year) tips.push(`年卡低至 ${year.promoPriceText || year.priceText}`);
    const gr = Math.max(0, (s.dailyQuota.generate || 0) - (s.usedToday.generate || 0));
    const or = Math.max(0, (s.dailyQuota.optimize || 0) - (s.usedToday.optimize || 0));
    tips.push(`今日剩余：生成 ${gr} / 优化 ${or}`);
    this.setData({ recommendTips: tips.slice(0, 5) });
  },

  _formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  _withNextText(sub) {
    const ss = Object.assign({}, sub);
    ss.nextText = sub.nextBillingAt ? this._formatDate(sub.nextBillingAt) : '';
    return ss;
  },

  checkRenewal() {
    const now = Date.now();
    let sub = wx.getStorageSync('vipSubscription') || { autoRenew: false };
    let s = wx.getStorageSync('vipStatus') || this.data.vipStatus;
    const oneOffEndAt = wx.getStorageSync('vipOneOffEndAt') || 0;
    
    if (sub.autoRenew && sub.nextBillingAt && now >= sub.nextBillingAt) {
      if (sub.cancelled) {
        s.isVip = false;
        s.vipLevel = '';
        s.expireTime = '';
        s.dailyQuota = { generate: 10, optimize: 10 };
        sub.autoRenew = false;
        wx.showToast({ title: '已取消续费', icon: 'none' });
      } else {
        const next = new Date(sub.nextBillingAt);
        next.setMonth(next.getMonth() + 1);
        sub.nextBillingAt = next.getTime();
        wx.showToast({ title: '已续费（演示）', icon: 'success' });
      }
      wx.setStorageSync('vipSubscription', sub);
      wx.setStorageSync('vipStatus', s);
      this.setData({ subscription: this._withNextText(sub), vipStatus: s });
    }
    
    if (oneOffEndAt && now >= oneOffEndAt) {
      s.isVip = false;
      s.vipLevel = '';
      s.expireTime = '';
      s.dailyQuota = { generate: 10, optimize: 10 };
      wx.removeStorageSync('vipOneOffEndAt');
      wx.setStorageSync('vipStatus', s);
      this.setData({ vipStatus: s, oneOffEndAt: 0, oneOffText: '' });
      wx.showToast({ title: '月卡已到期', icon: 'none' });
    }
  },

  selectPlan(e) {
    const id = e.currentTarget.dataset.id;
    const plan = this.data.plans.find(p => p.id === id);
    if (!plan) {
      wx.showToast({ title: '套餐不存在', icon: 'none' });
      return;
    }

    // 先登录再选择套餐
    if (!this.data.userId) {
      this.wxLogin();
      return;
    }

    const firstUsed = wx.getStorageSync('vipFirstMonthUsed') === true;
    let priceText = plan.promoPriceText || plan.priceText;
    if (plan.isAutoRenew && plan.firstMonthPrice && !firstUsed) {
      priceText = `首月 ${plan.firstMonthPrice}，次月起 ${plan.promoPriceText || plan.priceText}`;
    }
    wx.showModal({
      title: '确认开通',
      content: `将开通【${plan.name}】（${priceText}，${plan.originPriceText}）。${plan.isAutoRenew ? '连续包月：自动续费（演示环境不扣费）' : ''}`,
      confirmText: '确认',
      success: (r) => { 
        if (r.confirm) this.createRechargeOrder(plan.vipLevelId); 
      }
    });
  },

  openVipWithPlan(plan) {
    const s = this.data.vipStatus;
    s.isVip = true;
    s.vipLevel = plan.name;
    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + (plan.duration || 30));
    s.expireTime = this._formatDate(expireTime.getTime());
    
    s.dailyQuota = { generate: plan.quota.generate, optimize: plan.quota.optimize };
    s.lastDate = new Date().toDateString();
    wx.setStorageSync('vipStatus', s);
    
    if (plan.isAutoRenew && plan.firstMonthPrice) {
      wx.setStorageSync('vipFirstMonthUsed', true);
    }
    
    if (plan.isAutoRenew) {
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      const sub = { autoRenew: true, cancelled: false, nextBillingAt: next.getTime(), planId: plan.id };
      wx.setStorageSync('vipSubscription', sub);
      this.setData({ subscription: this._withNextText(sub) });
    } else {
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      wx.setStorageSync('vipOneOffEndAt', end.getTime());
      this.setData({ oneOffEndAt: end.getTime(), oneOffText: this._formatDate(end.getTime()) });
    }
    
    wx.setStorageSync('vipPlanId', plan.id);
    this.setData({ vipStatus: s });
    this.updateRecommendTips();
    wx.showToast({ title: '已开通VIP，权益已生效', icon: 'success', duration: 2000 });
  },

  openVip() {
    const plan = this.data.plans.find(p => p.id === this.data.featuredPlanId) || this.data.plans[0];
    this.openVipWithPlan(plan);
  },

  cancelAutoRenew() {
    let sub = wx.getStorageSync('vipSubscription') || { autoRenew: false };
    if (!sub.autoRenew) {
      wx.showToast({ title: '未启用连续包月', icon: 'none' });
      return;
    }
    sub.cancelled = true;
    wx.setStorageSync('vipSubscription', sub);
    this.setData({ subscription: this._withNextText(sub) });
    this.updateRecommendTips();
    wx.showToast({ title: '已取消，下月不续费', icon: 'none' });
  },

  resumeAutoRenew() {
    let sub = wx.getStorageSync('vipSubscription') || { autoRenew: false };
    sub.autoRenew = true;
    sub.cancelled = false;
    if (!sub.nextBillingAt) {
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      sub.nextBillingAt = next.getTime();
    }
    wx.setStorageSync('vipSubscription', sub);
    this.setData({ subscription: this._withNextText(sub) });
    this.updateRecommendTips();
    wx.showToast({ title: '连续包月已恢复', icon: 'success' });
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ currentTheme: theme });
  },

  closeVip() {
    const s = this.data.vipStatus;
    s.isVip = false;
    s.vipLevel = '';
    s.expireTime = '';
    wx.setStorageSync('vipStatus', s);
    this.setData({ vipStatus: s });
    wx.showToast({ title: '已关闭VIP，恢复基础额度', icon: 'none' });
  }
});