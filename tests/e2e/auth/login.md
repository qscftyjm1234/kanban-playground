# E2E 測試規格: 使用者登入 (Auth: Login)

- **ID**: `AUTH_01_LOGIN`
- **目標**: 驗證預設管理員帳號能成功登入。

## 📍 測試數據 (Test Data)
| 欄位 | 預設測試值 |
| :--- | :--- |
| **Email** | `admin` |
| **Password** | `admin1234` |

## 1. 前置條件 (Prerequisites)
- [ ] 後端伺服器與資料庫已啟動。
- [ ] 若為全新環境，請確保資料庫已執行 `SeedData` 或手動建立 `admin` 帳號。

## 2. 測試步驟 (Execution) - Robot Mode

| 步驟 | 動作 (Action) | 元素定位器 (Selector) | 預期結果 (Expected) |
| :--- | :--- | :--- | :--- |
| 1 | 進入登入頁面 | 導航至 `/login` | 頁面標題顯示「登入系統」 |
| 2 | 輸入帳號 | Type: `admin` | `input[type="email"]` | 欄位顯示正確文字 |
| 3 | 輸入密碼 | Type: `admin1234` | `input[type="password"]` | 欄位顯示遮蓋字元 |
| 4 | 點擊登入按鈕 | Click | `button[type="submit"]` | 確認點擊發生 |
| 5 | 驗證跳轉 | 自動等待 | URL 包含 `/kanban` | 看到看板背景與欄位 |

## 3. 系統級驗證 (System Assertions)
- [ ] **UI**: 登入框自動消失，出現主介面。
- [ ] **URL**: 跳轉地址不為 `/login`。

---
> [!IMPORTANT]
> **執行規範**：若步驟 4 點擊後無反應，或步驟 5 未跳轉，請直接回報 `FAIL`。禁止嘗試修復或猜測其它帳密。
