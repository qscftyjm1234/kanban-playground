# E2E 測試規格: 拖拉移動 (Kanban: Drag and Drop)

- **ID**: `KANBAN_02_DND_MOVE`
- **目標**: 驗證待辦事項卡片能在不同分欄間自由滑動，並成功持久化至後端。

## 1. 前置條件 (Prerequisites)
- [ ] 已通過 `AUTH_01_LOGIN`。
- [ ] 「待處理 (To Do)」中有至少一張卡片。

## 2. 測試步驟 (Execution)

| 步驟 | 動作 (Action) | 元素定位器 (Selector) | 預期結果 (Expected) |
| :--- | :--- | :--- | :--- |
| 1 | 抓取卡片 | Mousedown / Drag | `.kanban-card:contains("AI 架構重修")` | 卡片出現移動視覺反饋 |
| 2 | 拖曳至目標 | Mousemove | `.column-doing` | 「進行中 (Doing)」欄位高亮顯示 |
| 3 | 釋放滑鼠 | Mouseup / Drop | `Drop target: .column-doing` | 卡片 A 動畫進入新欄位 |
| 4 | 驗證異動 | 重新載入頁面 | `Local URL: /kanban` | 卡片 A 依然在「進行中」 |

## 3. 系統級驗證 (System Assertions)
- [ ] **API**: `PUT /api/tasks/{id}` 回饋狀態碼應為 `200` 或 `204`。
- [ ] **Payload**: 提交的 `status` 欄位值應已變更為 `Doing`。
- [ ] **DB**: 確認 `Tasks` 資料表中 `Status` 與 `SortOrder` 已同步。

---
> [!NOTE]
> 必須確保前端框架 (如 `react-beautiful-dnd`) 已正確綁定拖拉事件。
