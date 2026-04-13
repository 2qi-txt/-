# 圖片資源說明

## 所需的圖片文件

請在 `images/` 目錄下創建以下圖片文件：

### TabBar 圖標（建議尺寸：40x40px）

1. **home.png** - 首頁圖標（未選中狀態）
2. **home-active.png** - 首頁圖標（選中狀態）
3. **generate.png** - 生成圖標（未選中狀態）
4. **generate-active.png** - 生成圖標（選中狀態）
5. **optimize.png** - 優化圖標（未選中狀態）
6. **optimize-active.png** - 優化圖標（選中狀態）
7. **browse.png** - 瀏覽圖標（未選中狀態）
8. **browse-active.png** - 瀏覽圖標（選中狀態）
9. **settings.png** - 設置圖標（未選中狀態）
10. **settings-active.png** - 設置圖標（選中狀態）

### 其他圖片資源

11. **share.png** - 分享圖片
12. **default-avatar.png** - 默認頭像

## 圖標設計建議

### 顏色方案
- **未選中狀態**：#7A7E83（灰色）
- **選中狀態**：#4A90E2（藍色）

### 設計風格
- 簡潔的線條圖標
- 與小程序整體風格一致
- 清晰易識別

### 圖標含義
- 🏠 首頁：房子圖標
- ✍️ 生成：筆或文檔圖標
- ✨ 優化：魔法棒或星星圖標
- 📚 瀏覽：書本或列表圖標
- ⚙️ 設置：齒輪圖標

## 如何添加圖片

1. 準備好圖片文件
2. 將圖片文件放入 `images/` 目錄
3. 確保文件名與上述列表完全一致
4. 重新編譯小程序

## 臨時解決方案

如果暫時沒有圖片資源，可以使用以下配置（已在app.json中實現）：

```json
"tabBar": {
  "color": "#7A7E83",
  "selectedColor": "#4A90E2",
  "backgroundColor": "#ffffff",
  "borderStyle": "black",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "🏠 首頁"
    },
    {
      "pagePath": "pages/generate/generate", 
      "text": "✍️ 生成"
    },
    {
      "pagePath": "pages/optimize/optimize",
      "text": "✨ 優化"
    },
    {
      "pagePath": "pages/browse/browse",
      "text": "📚 瀏覽"
    },
    {
      "pagePath": "pages/settings/settings",
      "text": "⚙️ 設置"
    }
  ]
}
```

這樣可以使用Emoji圖標作為臨時解決方案，小程序可以正常運行。



