---
description: 需求開發流程
---

# 需求開發流程

**[待辦事項執行者]**: 本工作流啟動後，AI 強制載入 **系統架構師 (Architect Persona)** 內置邏輯。

## 1. 需求分析階段 (Analysis & Align)
- **進度追蹤師**: 使用 [`./.agent/skills/progress_tracker/SKILL.md`](./.agent/skills/progress_tracker/SKILL.md) 並實時更新待辦事項狀態。
- **環境與規範對標**:
    - **進度管理**: 參考 [`./.agent/skills/progress_tracker/SKILL.md`](./.agent/skills/progress_tracker/SKILL.md) 並更新待辦事項狀態。
- **代碼規約**:
    - **技術基準**: 必須查閱 [`./.agent/core/stack.md`](./.agent/core/stack.md) 確定技術實作基準。
    - **開發規則**: 必須查閱 [`./.agent/core/code_rules.md`](./.agent/core/code_rules.md) 確定代碼風格。
- **預警分析**:
    - **避坑指南**: 開發前查閱 [`./.agent/knowledge/gotchas.md`](./.agent/knowledge/gotchas.md) 做地雷預警。
    - **架構模式**: 參考 [`./.agent/knowledge/patterns/`](./.agent/knowledge/patterns/) 進行指令優化。

## 2. 計畫與核准 (Plan & Approve)
- **技術計畫**: 依照架構師規範產出細節計畫 (Artifact)。
- **[核准斷點] (User Approval Gate)**: 
    > [!IMPORTANT]
    > **禁止跳過**：計畫書產出後，必須暫停動作，直到使用者明確回覆「執行」或「同意」後方可進入實作執行。

## 3. 實作執行階段 (Execute)
- **實作原則**: 不得在未核准的情況下修改任何邏輯。
- **進度回報**: 動作前後務必更新待辦事項清單 / 待辦事項結案。
- **開發檢核**: 實作完畢後必須確保編譯通過且無明顯代碼壞味道。

## 4. 品質驗收階段 (Quality Gate)
> [!IMPORTANT]
> **結案前必經門禁**：
- **端對端測試**: 必須啟動 [**`/test_n2n`**](./.agent/workflows/test_n2n.md) 對異動功能進行物理環境驗收。
- **控制台巡檢**: 使用 `browser_subagent` 或 `read_browser_page` 檢查瀏覽器 Console 是否有任何紅字 `Error` 日誌。
- **零殘留義務**: 若測試失敗或有報表錯誤，AI **嚴禁結案**，必須自動回溯修復至第 3 階段。
- **結案**: 只有在品質驗收通過後，方可執行回顧歸檔與任務結案。
