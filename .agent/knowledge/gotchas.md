# 地雷檢索工具 (Gotcha Tool)

本文件定義專案開發中曾遇到的技術地雷、環境限制與邏輯陷阱清單。AI 在進行相關模組開發前，**必須優先檢索此工具清單**。

---

## 1. 輸出規範 (地雷檢索報告)

當實作計畫涉及清單中的模組或曾觸發過的 Bug 領域時，**AI 必須輸出以下格式的報告**：

> [!WARNING]
> **地雷檢索報告**
> - **觸發雷區**: 目前操作可能踩到的技術陷阱（如：Docker 容器連線）。
> - **防禦性建議**: 我將採取的防禦性代碼實作（如：HasDefaultValue(0)）。

---

## 2. 環境與基礎建設 (Environment)

### 2.1 Docker / WSL2 連線問題
- **現象**: 後端容器無法連線到主機上的資料庫或反之。
- **解法**: 確保 `connection string` 使用 `host.docker.internal` 而非 `localhost`；檢查 Windows 防火牆是否允許 WSL 流量。

---

## 3. 後端邏輯地雷 (Backend Logic)

### 3.1 任務排序預設值 (SortOrder Default)
- **現象**: 新增 Task 時，若未指定 `SortOrder` 可能導致資料庫拋出 NULL 異常 (HTTP 500)。
- **實作標準**: 
    - Database 層級必須設有 `DEFAULT (0)`。
    - Entity Framework Core 模型中必須顯性設定 `HasDefaultValue(0)`。
    - **防禦行動**: 在撰寫 `TasksController` 的 Create 方法時，應主動賦予預設值或從資料庫中計算下一位序。

### 3.2 看板刪除與資料關聯 (Cascade Delete)
- **現象**: 預設的 EF Core 配置可能為 `SetNull`，導致看板刪除後留在資料庫中的「孤兒卡片」無法被查詢到。
- **實作標準**: 
    - 在 `AppDbContext.OnModelCreating` 中，顯性將關聯設為 `.OnDelete(DeleteBehavior.Cascade)`。

---

## 4. 前端 UI 地雷 (Frontend UI)

### 4.1 毛玻璃濾鏡失效 (Glassmorphism Issues)
- **現象**: 在某些特定佈局下，`backdrop-blur` 因父層 `overflow` 或 `transform` 屬性而失效。
- **鎖定規範**: 確保毛玻璃組件具備正確的 `z-index` 並避免在包含 `transform: scale()` 的容器內使用。

### 4.2 事件冒泡與導航衝突 (Event Bubbling)
- **現象**: 在按鈕巢狀結構中（如：看板項目的編輯按鈕），點擊子按鈕會同時觸發父層的 `onClick` 事件（如：切換看板）。
- **實作規範**: 在所有 Sidebar 的操作按鈕點擊函式中，必須呼叫 `e.stopPropagation()`。
