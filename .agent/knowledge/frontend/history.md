# 前端知識與規範 (Frontend Knowledge & Standards)

## 框架與結構
- **框架**: React + Vite。
- **模組化**: 所有元件必須放置於 `src/components/` 的對應路徑下。

## 視覺與樣式 (Tailwind CSS)
- **核心工具**: 整合 `clsx` 與 `tailwind-merge` 提升樣式覆蓋能力。
- **嚴格設計禁忌**:
  - ❌ 禁止使用 inline-style (`style={{ ... }}`)，所有排版必須使用 Tailwind class。
  - ❌ 禁止直接在 Antd 元件行內設定基礎樣式，須以 `className` 配合 Tailwind 覆寫機制（必要時使用 `!important` 標章）。
  - ❌ 禁止使用原生紅、藍、綠等高飽和度基礎色，預設必須使用 Tailwind 的調和色盤 (如 `slate`, `blue`, `emerald`)。
- **質感設計**: 優先考慮 Dark Mode，適當運用陰影、圓角、與 Hover/Active 互動反饋。
- **字體**: 預設使用 Google Fonts，避免純瀏覽器預設字體。

## 介面詞彙 (UI Terminology)
- Popup / 彈窗 -> **Modal / 互動視窗**
- Login / 登入 -> **SignIn / 登入系統**
- User / 用戶 -> **Member / 團隊成員**

## 品牌化
- 核心品牌文字必須引用自配置檔 (如 `branding.json`)，絕對避免在畫面中硬編碼品牌名。
