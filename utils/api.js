// API 工具類
const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  // 生成文案
  static async generateContent(params) {
    try {
      // 模擬API調用
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              content: this.generateMockContent(params),
              suggestions: this.generateSuggestions(params)
            }
          });
        }, 2000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 優化文案
  static async optimizeContent(params) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              optimized: this.optimizeMockContent(params),
              notes: this.generateOptimizationNotes(params)
            }
          });
        }, 2500);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 分析圖片
  static async analyzeImage(imagePath) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              keywords: ['校園', '學習', '生活'],
              description: '這是一張校園生活相關的圖片',
              suggestions: ['可以生成學習相關的文案', '適合分享到朋友圈']
            }
          });
        }, 3000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 搜索文案
  static async searchContent(keyword, filters = {}) {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = this.getMockSearchResults(keyword, filters);
          resolve({
            success: true,
            data: results
          });
        }, 1000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 生成模拟内容
  static generateMockContent(params) {
    const { scene, title, keywords, style, length } = params;
    
    const templates = {
      notice: `【重要通知】${title}\n\n各位同学：\n\n${keywords ? `关键词：${keywords}\n\n` : ''}请大家注意相关事项，如有疑问请及时联系。\n\n特此通知。\n\n${new Date().toLocaleDateString()}`,
      
      announcement: `📢 公告通知\n\n${title}\n\n${keywords ? `相关关键词：${keywords}\n\n` : ''}请各位小伙伴相互转告，积极参与。\n\n联系方式：相关部门\n发布时间：${new Date().toLocaleDateString()}`,
      
      club: `🎭 社团活动通知\n\n${title}\n\n${keywords ? `活动关键词：${keywords}\n\n` : ''}精彩活动等你来参与！\n\n报名方式：联系社团负责人\n活动时间：待定`,
      
      xiaohongshu: `✨ ${title}\n\n${keywords ? `#${keywords.replace(/,/g, ' #')}` : '#日常生活'}\n\n分享我的精彩生活，记录美好时光！`,
      
      wechat: `今天${title}，${keywords ? `关键词：${keywords}` : '记录一下美好的生活时光！'} 📸`,
      
      douyin: `${title}！${keywords ? `#${keywords.replace(/,/g, ' #')}` : '#生活 #精彩'} 生活就是这么精彩！`,
      
      trade: `【二手交易】${title}\n\n${keywords ? `关键词：${keywords}\n\n` : ''}物品状况良好，价格实惠。\n\n联系方式：私信\n价格：面议`
    };

    return templates[scene] || '生成内容出错，请重试。';
  }

  // 生成建议
  static generateSuggestions(params) {
    const suggestions = [
      '可以尝试调整风格',
      '可以增加更多关键词',
      '可以修改字数要求'
    ];
    return suggestions;
  }

  // 优化模拟内容
  static optimizeMockContent(params) {
    const { originalText, style, focus } = params;
    let optimized = originalText;
    
    // 根據風格優化
    if (style === 'professional') {
      optimized = optimized.replace(/很/g, '非常').replace(/好/g, '优秀');
    } else if (style === 'creative') {
      optimized = optimized.replace(/活动/g, '精彩活动').replace(/学习/g, '探索学习');
    } else if (style === 'emotional') {
      optimized = optimized.replace(/重要/g, '至关重要').replace(/喜欢/g, '热爱');
    } else if (style === 'humorous') {
      optimized = optimized.replace(/学习/g, '快乐学习').replace(/考试/g, '知识大考验');
    }
    
    return optimized;
  }

  // 生成优化说明
  static generateOptimizationNotes(params) {
    const notes = [
      '• 优化了语言表达',
      '• 提升了文案结构',
      '• 增强了可读性'
    ];
    return notes.join('\n');
  }

  // 获取模拟搜索结果
  static getMockSearchResults(keyword, filters) {
    const mockResults = [
      {
        id: 1,
        title: `包含"${keyword}"的文案1`,
        content: `这是包含关键词"${keyword}"的文案内容...`,
        type: '通知',
        time: '2024-03-20',
        views: 156,
        likes: 23
      },
      {
        id: 2,
        title: `包含"${keyword}"的文案2`,
        content: `另一个包含关键词"${keyword}"的文案内容...`,
        type: '活动',
        time: '2024-03-19',
        views: 89,
        likes: 15
      }
    ];
    
    return mockResults;
  }
  static async generateContentByAI(params) {
    try {
      // 适配你原有页面的参数（scene/title/keywords），拼接成智谱AI能理解的完整需求
      const userPrompt = `生成一条【${params.scene || '日常'}】场景的文案，标题：${params.title || '默认标题'}，关键词：${params.keywords || '日常生活'}，风格：${params.style || '简洁友好'}，长度：${params.length || '适中'}`;

      return new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/chatglm/generate/`,  // 后端智谱AI接口地址（必须和Django配置一致）
          method: 'POST',
          data: {
            user_prompt: userPrompt,  // 传给后端的完整需求（和Django接口参数对应）
            temperature: 0.8  // 生成温度（0-2，值越大越有创意，可自定义）
          },
          header: {
            'Content-Type': 'application/json'  // 必须指定JSON格式，否则后端无法解析
          },
          success: (res) => {
            // 后端返回格式：{ success: true/false, data: { ai_content: '' }, error: '' }
            if (res.data.success) {
              // 适配原有页面的返回格式（data包含content和suggestions），页面无需修改太多
              resolve({
                success: true,
                data: {
                  content: res.data.data.ai_content,  // 智谱AI生成的文案
                  suggestions: ['AI生成完成', '可复制使用', '可通过优化功能调整风格']  // 配套建议
                }
              });
            } else {
              // 接口调用成功但AI生成失败（如密钥无效）
              resolve({ success: false, error: `AI生成失败：${res.data.error}` });
            }
          },
          fail: (err) => {
            // 接口调用失败（如后端未启动、网络错误）
            reject(new Error(`接口连接失败：${err.errMsg}（请检查后端服务是否启动）`));
          }
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ApiService;


