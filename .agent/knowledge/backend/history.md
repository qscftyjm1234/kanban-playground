# 後端知識與規範 (Backend Knowledge & Standards)

## 邏輯架構與安全機制
- **狀態管理參考**: 後端的 Models/Entities（如 `Board.cs`）應持續作為前端 TypeScript 型別與 Store 的架構標準。
- **資料保護 (Soft Delete)**: 必須保證資料庫操作具備防呆機制，避免發生「硬刪除」(Delete)，移除操作一律改為 Archive (封存)。
- **分頁安全**: 前端與後端的分頁、搜尋等列表 API 必須預設帶有安全限制（如：最大返回筆數）。

## 序列化與 API 端點
- **循環引用 (JsonIgnore)**: 避免 Entity Framework 導航屬性 (如 Tasks 與 Board/Labels 雙向參考) 造成 JSON 序列化迴圈，需適時在 Entity 添加 `[JsonIgnore]` (2026-04-02 紀錄)。
- **端點依據**: 呼叫 API 前需以專案 Swagger 或現有 Controller 源碼為準，不可自行發明未定義的路徑。

## 權限與詞彙
- 認證: 統一使用 `SignIn` 邏輯。
- 資料庫欄位: 團隊成員相關表統一使用 **Member** 而非 User。
