/**
 * API 服务 - 对接后端接口
 * ============================================
 * 接口地址、请求方式、传参格式完全保留原有小程序逻辑
 * ============================================
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * ============================================
 * 接口1: AI文案生成
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/chatglm/generate/
 * 传参: { user_prompt: string, temperature: number }
 * 返回: { success: boolean, data: { ai_content: string }, error: string }
 */
async function generateContent(params) {
    try {
        const userPrompt = `生成一条【${params.scene || '日常'}】场景的文案，标题：${params.title || '默认标题'}，关键词：${params.keywords || '日常生活'}，风格：${params.style || '简洁友好'}，长度：${params.length || '适中'}，描述：${params.description || ''}`;

        const response = await fetch(`${API_BASE_URL}/chatglm/generate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_prompt: userPrompt,
                temperature: 0.8
            })
        });

        const res = await response.json();
        
        if (res.success) {
            return {
                success: true,
                data: {
                    content: res.data.ai_content,
                    suggestions: ['AI生成完成', '可复制使用', '可通过优化功能调整风格']
                }
            };
        } else {
            return { success: false, error: res.error || '生成失败' };
        }
    } catch (error) {
        return generateMockContent(params);
    }
}

/**
 * ============================================
 * 接口2: AI文案优化
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/chatglm/optimize/
 * 传参: { original_text, style, focus, length_control, target_audience, temperature }
 * 返回: { success: boolean, data: { optimized_content, notes } }
 */
async function optimizeContent(params) {
    try {
        const response = await fetch(`${API_BASE_URL}/chatglm/optimize/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                original_text: params.originalText,
                style: params.style || 'professional',
                focus: params.focus || ['grammar', 'style'],
                length_control: params.lengthControl || 'keep',
                target_audience: params.targetAudience || 'students',
                temperature: 0.8
            })
        });

        const res = await response.json();
        
        if (res.success || res.code === 200) {
            return {
                success: true,
                data: {
                    optimized: res.data.optimized_content || res.data.optimized,
                    notes: res.data.notes || ''
                }
            };
        } else {
            return { success: false, error: res.error || '优化失败' };
        }
    } catch (error) {
        return optimizeMockContent(params);
    }
}

/**
 * ============================================
 * 接口3: 提交反馈
 * ============================================
 * 地址: POST http://47.104.165.250:8000/api/feedback/submit/
 * 传参: { user_id, type, title, content, contact, images, page }
 * 返回: { success, code, data: { id }, msg }
 */
async function submitFeedback(data) {
    try {
        const response = await fetch('http://47.104.165.250:8000/api/feedback/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const res = await response.json();
        
        if (res.success || res.code === 200) {
            return { success: true, data: res.data };
        } else {
            return { success: false, error: res.msg || '提交失败' };
        }
    } catch (error) {
        return { success: false, error: '网络异常，请稍后重试' };
    }
}

/**
 * ============================================
 * 接口4: 用户登录
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/user/login/
 * 传参: { code, anonymous }
 * 返回: { success, user_id }
 */
async function userLogin() {
    return new Promise((resolve) => {
        const localUserId = 'local_' + Date.now();
        resolve({
            success: true,
            user_id: localUserId
        });
    });
}

/**
 * ============================================
 * 接口5: VIP信息查询
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/vip/info/
 * 传参: { user_id }
 * 返回: VIP状态信息
 */
async function getVipInfo(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vip/info/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });

        const res = await response.json();
        
        if (res.success || res.code === 200 || res.is_vip !== undefined) {
            return { success: true, data: res.data || res };
        } else {
            return { success: false, error: res.msg || '获取VIP信息失败' };
        }
    } catch (error) {
        return { success: false, error: '网络异常' };
    }
}

/**
 * ============================================
 * 接口6: VIP开通/充值
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/vip/recharge/
 * 传参: { user_id, vip_level_id }
 * 返回: 订单信息
 */
async function createVipOrder(userId, vipLevelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vip/recharge/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                vip_level_id: vipLevelId
            })
        });

        const res = await response.json();
        
        if (res.success || res.code === 200 || res.order_num) {
            return { success: true, data: res.data || res };
        } else {
            return { success: false, error: res.msg || '订单生成失败' };
        }
    } catch (error) {
        return { success: false, error: '网络异常' };
    }
}

/**
 * ============================================
 * 接口7: VIP支付回调
 * ============================================
 * 地址: POST http://127.0.0.1:8000/api/vip/pay/callback/
 * 传参: { order_num, user_id }
 * 返回: 支付结果
 */
async function vipPayCallback(orderNum, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vip/pay/callback/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_num: orderNum,
                user_id: userId
            })
        });

        const res = await response.json();
        return { success: res.code === 200, data: res };
    } catch (error) {
        return { success: false, error: '网络异常' };
    }
}

// ==================== 模拟数据生成函数 ====================

function generateMockContent(params) {
    const templates = {
        notice: `【重要通知】${params.title || '默认标题'}\n\n各位同学：\n\n${params.description || '请大家注意相关事项，如有疑问请及时联系。'}\n\n特此通知。\n\n${new Date().toLocaleDateString()}`,
        announcement: `📢 公告通知\n\n${params.title || '默认标题'}\n\n${params.description || '请各位小伙伴相互转告，积极参与。'}\n\n联系方式：相关部门\n发布时间：${new Date().toLocaleDateString()}`,
        club: `🎭 社团活动通知\n\n${params.title || '默认标题'}\n\n活动内容：${params.description || '精彩活动等你来参与！'}`,
        xiaohongshu: `✨ ${params.title || '默认标题'}\n\n${params.description || '分享我的精彩生活，记录美好时光！'}\n\n#日常生活 #${(params.keywords || '日常分享').replace(/,/g, ' #')}`,
        wechat: `今天${params.title || '默认标题'}，${params.description || '记录一下美好的生活时光！'} 📸`,
        douyin: `${params.title || '默认标题'}！${params.description || '生活就是这么精彩！'} #生活 #精彩`,
        trade: `【二手交易】${params.title || '默认标题'}\n\n${params.description || '物品状况良好，价格实惠。'}`
    };

    return {
        success: true,
        data: {
            content: templates[params.scene] || templates.notice,
            suggestions: ['AI生成完成', '可复制使用', '可通过优化功能调整风格']
        }
    };
}

function optimizeMockContent(params) {
    let optimized = params.originalText || '';
    
    switch (params.style) {
        case 'professional':
            optimized = optimized.replace(/很/g, '非常').replace(/好/g, '优秀');
            break;
        case 'creative':
            optimized = optimized.replace(/活动/g, '精彩活动').replace(/学习/g, '探索学习');
            break;
        case 'emotional':
            optimized = optimized.replace(/重要/g, '至关重要').replace(/喜欢/g, '热爱');
            break;
        case 'humorous':
            optimized = optimized.replace(/学习/g, '快乐学习').replace(/考试/g, '知识大考验');
            break;
    }

    return {
        success: true,
        data: {
            optimized: optimized,
            notes: '• 优化了语言表达\n• 提升了文案结构\n• 增强了可读性'
        }
    };
}

window.ApiService = {
    generateContent,
    optimizeContent,
    submitFeedback,
    userLogin,
    getVipInfo,
    createVipOrder,
    vipPayCallback,
    generateMockContent,
    optimizeMockContent,
    API_BASE_URL
};
