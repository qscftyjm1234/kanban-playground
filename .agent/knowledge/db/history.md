# 資料庫知識 (Database Knowledge)

## Schema 與 遷移紀錄

### [重要] ProSuiteUpgrade 遷移失敗與 Schema Drift (2026-04-01)
- **現象**: 後端啟動失敗或 API 報 500 (Unknown column)。
- **原因**: MySQL 資料庫結構與 EF Core 的 Migration 不同步，手動修復過半。
- **方案**: 
  1. 確保 `Tasks` 表包含 `BoardId`, `SortOrder`, `CreatedAt`, `UpdatedAt`。
  2. 確保 `ChecklistItems` 與 `KanbanTaskLabel` 表存在且欄位校對集為 `ascii_general_ci`。
  3. 手動新增 `__EFMigrationsHistory` 紀錄，避免 EF 試圖重新執行造成 Duplicate table。
- **預防**: 實體層改動後務必產出新的 Migration。
