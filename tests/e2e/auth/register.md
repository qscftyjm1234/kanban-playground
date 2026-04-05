# E2E 測試規格: 使用者註冊 (Auth: Register)

- **ID**: `AUTH_02_REGISTER`
- **目標**: 驗證新使用者能完成註冊流程並返回登入頁。

## 1. 前置條件 (Prerequisites)
- [ ] 後端伺服器運行中 (`http://localhost:5003`)。
- [ ] 前端伺服器運行中 (`http://localhost:5174`)。
- [ ] 測試用的電子郵件帳號目前不得存在於資料庫。

## 2. 測試步驟 (Execution)

| 步驟 | 動作 (Action) | 元素定位器 (Selector) | 預期結果 (Expected) |
| :--- | :--- | :--- | :--- |
| 1 | 進入註冊頁面 | 導航至 `/register` | 頁面標題顯示「新會員註冊」 |
| 2 | 輸入姓名 | Type: `GuestUser` | `input[name="username"]` | 欄位顯示正確姓名 |
| 3 | 輸入電子郵件 | Type: `new-guest@test.com` | `input[name="email"]` | 欄位顯示電子郵件 |
| 4 | 輸入密碼 | Type: `Password123` | `input[name="password"]` | 欄位顯示遮蓋字元 |
| 5 | 確認密碼 | Type: `Password123` | `input[name="confirmPassword"]` | 欄位顯示遮蓋字元 |
| 6 | 點擊註冊按鈕 | Click | `button#register-btn` | 按鈕進入 loading 狀態 |
| 7 | 驗證結果 | 自動等待 | URL 跳轉至 `/login` | 看到註冊成功提示 |

## 3. 系統級驗證 (System Assertions)
- [ ] **API**: `POST /api/auth/register` 回饋狀態碼應為 `201` 或 `200`。
- [ ] **DB**: 確認資料庫中已寫入 `new-guest@test.com` 紀錄。

---
> [!NOTE]
> 建議在測試執行前，先清空資料庫中的測試用帳號。
