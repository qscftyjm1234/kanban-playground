---
description: 統一測試入口：自動化驗收工作流 2.0
---

# 測試自動化工作流 (N2N 2.0)

**[待辦事項執行者]**: 本工作流啟動後，AI 強制載入 **測試自動化工程師 (SDET Persona)** 內置邏輯。

## 1. 測試模式 (Operating Modes)
- **[A] 隨選測試 (Specified Flow)**: 通過指令 `test_n2n [filename]` 執行 `tests/e2e/flows/` 下的特定腳本。
- **[B] 全量巡檢 (System Scan)**: 掃描 `tests/e2e/system/` 與 `flows/` 下所有已定義之腳本，產出全系統健康報告。
- **[C] 異動自維護 (Auto-Maintenance)**: 當 [/feature] 異動流程時，AI **義務** 將變更邏輯寫入實體檔案儲存於 `tests/e2e/`。

## 2. 瀏覽器物理檢測基準 (Execution)
> [!IMPORTANT]
> **執行動作**：啟動 `browser_subagent` 執行以下檢核：
- **環境初始化**: 預設目標 `http://localhost:5174` (前端 Port)。
- **持久化腳本執行**: AI 必須讀取 `tests/e2e/` 下的對應 `.md` 檔案指令進行操作。
- **[品質紅線] 控制台與白屏巡檢**: 
    - **動作**: 讀取實體瀏覽器之 Console Log。
    - **規則**: 嚴禁發現紅字 `Error`、`Fatal` 或 `Cannot find module` 等導致白屏之日誌。

## 3. 測試腳本儲存庫標準 (Persistence)
- 腳本位置：`D:\我的文件\Desktop\kanban-playground\tests\e2e/`
- **flows/**: 保存業務流程測試（如：登入、待辦事項建立、看板切換）。
- **system/**: 保存全域系統測試（如：路由檢測、數據同步檢測）。

## 4. 測試報告回報要求 (Reporting)
測試完成後，AI 產出的回報必須包含：
1. **[N2N 測試證據]**: 截圖或各步驟之 PASS 紀錄。
2. **[控制台淨空證明]**: 證明現狀無任何導致崩潰之日誌。
3. **[腳本更新日誌]**: 註明本次待辦事項同步更新/新增了哪些 `tests/e2e/` 檔案。

---
> [!IMPORTANT]
> **測試官守則**：代碼離手前，[**`tests/e2e`**](./tests/e2e) 的同步更新與 N2N 物理巡檢是法定結案要件。
