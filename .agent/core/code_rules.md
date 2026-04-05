# 程式碼規範

本文件定義專案中的代碼風格與工程規範，確保 AI 產出的代碼具備高度的一致性與工藝質感。

---

## 1. 後端開發規範 (.NET / C#)

### 1.1 命名規範 (Naming)
- **Class / Method**: 必須採用 `PascalCase`。
- **Private Fields**: 必須採用 `_camelCase` (底線掛首)。
- **Namespace**: 採用實體路徑對應，如 `namespace Kanban.API.Controllers`。

### 1.2 檔案結構 (Structure)
- **Controller**:
    - 繼承 `ControllerBase` 並標註 `[ApiController]`。
    - 路由標準化：`[Route("api/[controller]")]`。
    - 依賴注入：一律使用構造函數注入 (Constructor Injection)。
- **Models**: 小型 Request/Response 類別優先定義在 Controller 檔案底部；大型模型則存放於 `Kanban.Domain`。

---

## 2. 前端開發規範 (React / JSX)

### 2.1 命名規範 (Naming)
- **檔案命名**: `PascalCase.jsx`。
- **組件命名**: `export default function ComponentName`。
- **變數命名**: `camelCase`。

### 2.2 實作慣例 (Patterns)
- **狀態管理**: 優先使用 **Zustand** (`useTaskStore`) 並實施資料分發模式。
- **樣式處理**: 使用 Tailwind CSS，並結合 `cn` 工具進行動態變體管理。
- **程式碼註解**: 導出組件必須包含 JSDoc 風格的用途說明。

---

## 3. 全局提交規範 (Git)
- 提交訊息必須具備清晰的前綴：`feat:`, `fix:`, `refactor:`, `docs:`。
- 嚴禁在未透過 `dotnet build` 核驗前提交後端代碼。
