# 全系統健康檢查 (System Health Scan)

**[測試類型]**: 系統級 (System)
**[目標 URL]**: `http://localhost:5174`

## 1. 渲染斷言 (Rendering Assertion)
- [ ] 頁面標題應包含「Kanban AI」。
- [ ] 導航至 `http://localhost:5174` 後，主頁面應成功載入看板側邊欄與導航列。
- [ ] 系統應顯示當前看板名稱（如：[專案名稱] - 作業看板）。

## 2. 物理巡檢規則 (Physical Audit)
> [!IMPORTANT]
> **執行動作**：啟動 `browser_subagent` 執行以下動作：
1. **導覽錄像**: 進入首頁並等待 3 秒確保非同步數據載入。
2. **控制台日誌**: 讀取 Console Log。
3. **錯誤攔截**: 嚴禁發現 `ReferenceError`, `TypeError`, `SyntaxError` 或 `404/500` API 報錯。

## 3. 測試結案範例 (Template)
- **狀態**: PASS/FAIL
- **證據**: [截圖連結]
- **說明**: 頁面渲染正常，無白屏現像，控制台顯示 0 Errors。
