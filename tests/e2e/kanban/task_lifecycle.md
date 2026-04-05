# E2E 測試規格: 待辦事項生命週期 (Kanban: Task Lifecycle)

- **ID**: `KANBAN_01_TASK_LIFECYCLE`
- **目標**: 驗證看板待辦事項的「建立」、「顯示」與「編輯」功能的完整性。
- **測試點**:
    1.  新增待辦事項且不含標籤。
    2.  檢查剛建立的待辦事項是否出現在「待處理」分欄。
    3.  編輯待辦事項與標籤。

## 1. 前置條件 (Prerequisites)
- [ ] 已通過 `AUTH_01_LOGIN` 並處於 `/kanban` 路由。
- [ ] 分欄 (`To Do`, `Doing`, `Done`) 正確呈現。

## 2. 測試步驟 (Execution)

### 流程 A: 新增待辦事項 (Add Task)
| 步驟 | 動作描述 | 工具 | 選取器 | 預期結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 開啟新增 Modal | Click | `button#add-task-btn` | 出現「新增待辦事項」彈窗 |
| 2 | 輸入標題 | Type | `input#task-title` | 輸入「AI 架構重修」 |
| 3 | 選擇看板 | Select | `select#board-id` | 選擇目前的開發看板 |
| 4 | 提交表單 | Click | `button#submit-task` | 彈窗關閉且出現成功通知 |

### 流程 B: 編輯現有待辦事項 (Edit Task)
| 步驟 | 動作描述 | 工具 | 選取器 | 預期結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 開啟編輯 Modal | Click | `.kanban-card:contains("AI 架構重修")` | 出現「待辦事項詳情」彈窗 |
| 2 | 修改描述 | Type | `textarea#task-desc` | 修改為「整合 V3 版本規範」 |
| 3 | 勾選子項目 | Click | `input.checklist-item:first` | 更新子項目完成狀態 |
| 4 | 儲存變更 | Click | `button#save-task` | 資料內容成功更新 |

## 3. 系統級驗證 (System Assertions)
- [ ] **API**: `POST` 與 `PUT` 的回傳狀態碼應為 `200` 或 `204`。
- [ ] **State**: `taskStore` 的 `tasks` 陣列長度應正確增加。

---
> [!NOTE]
> 測試時應確認後端 `Kanban.Domain.Entities.KanbanTask` 之欄位屬性與前端提交的 JSON 相符。
