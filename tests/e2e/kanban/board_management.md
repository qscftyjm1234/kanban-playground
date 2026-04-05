# E2E 測試規格: 看板管理 (Kanban: Board Management)

- **ID**: `KANBAN_02_BOARD_MANAGEMENT`
- **目標**: 驗證看板群組的「建立」、「編輯」與「刪除」功能。
- **測試點**:
    1.  建立新看板。
    2.  編輯看板名稱。
    3.  刪除看板。

## 1. 前置條件 (Prerequisites)
- [ ] 已登入並處於 `/kanban` 路由。

## 2. 測試步驟 (Execution)

### 流程 A: 建立看板 (Create Board)
| 步驟 | 動作描述 | 工具 | 選取器 | 預期結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 開啟建立 Modal | Click | `button:has(.lucide-plus)` | 出現「建立新看板」彈窗 |
| 2 | 輸入名稱 | Type | `input` | 輸入「測試新專案」 |
| 3 | 提交 | Click | `button:contains("建立")` | 側邊欄出現新看板 |

### 流程 B: 編輯看板 (Edit Board)
| 步驟 | 動作描述 | 工具 | 選取器 | 預期結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 懸停並點擊編輯 | Hover & Click | `.group:contains("測試新專案") .lucide-pencil` | 出現「編輯看板名稱」彈窗 |
| 2 | 修改名稱 | Type | `input` | 改為「已更新專案名稱」 |
| 3 | 儲存 | Click | `button:contains("儲存")` | 側邊欄名稱更新 |

### 流程 C: 刪除看板 (Delete Board)
| 步驟 | 動作描述 | 工具 | 選取器 | 預期結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 懸停並點擊刪除 | Hover & Click | `.group:contains("已更新專案名稱") .lucide-trash-2` | 出現確認視窗 |
| 2 | 確認刪除 | Click | `button:contains("確定刪除")` | 看板從側邊欄消失 |

## 3. 系統級驗證 (System Assertions)
- [ ] **API**: `PUT` 與 `DELETE` 狀態碼為 `200` 或 `204`。
- [ ] **Data**: 資料庫對應的 Board 紀錄應被更新或移除（若為 Cascade，相關 Task 也應消失）。
