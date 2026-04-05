# 專案技術基底

本文件定義目前專案使用的「開發引擎」。所有技能必須以此為基準轉譯實作。

## 1. 核心開發工具
- **框架**: `React 18 (Vite)`
- **UI 元件庫**: `Ant Design (antd) ^5.24.0`
- **樣式系統**: `Tailwind CSS ^3.4.17`
- **狀態管理**: `Zustand ^5.0.3`
- **路由**: `React Router Dom ^7.1.5`
- **數據請求**: `Axios`

## 2. 交互整合
- **拖拽引擎**: `@hello-pangea/dnd`
- **圖示庫**: `Lucide React`

## 3. 環境屬性
- **語言**: `TypeScript` (若專案支援) 或 `ES6+`
- **語系**: `zh_TW` (繁體中文)
- **i18n**: 透過 `antd/locale/zh_TW` 控制。

---
> [!NOTE]
> **切換引擎原則**：若未來專案遷移 (如轉向 MUI 或 Next.js)，只需修改此文件的技術連結，Skills 中的「設計思維」將自動適配新技術。
