# 看板管理系統 - 全端實作專案

本專案為前後端分離的看板管理系統，支援多看板、標籤分類與待辦事項進度追蹤。

---

## 開發技術

- **後端**：.NET 8 Web API, Entity Framework Core, MySQL 8
- **前端**：React 18 (Vite), Zustand, Tailwind CSS, Ant Design
- **部署**：Docker / Docker-compose

## 核心功能

- **流程管理**：支援待處理、進行中、待驗收、已完成等四步看板切換。
- **待辦事項詳情**：具備子項目檢查表與進度條，支援建立、編輯與搜尋。
- **標籤系統**：實作多對多分類管理（如：前端、後端、資料庫、AI）。
- **安全認證**：採用 JWT 帳號認證，並具備分欄式登入介面。

---

## 快速開始

新人請依照以下步驟建立開發環境並啟動專案。

### 第一步：環境準備
請確保您的電腦已安裝 **Docker Desktop**。

### 第二步：下載專案
使用指令或工具將專案下載至本地目錄。

### 第三步：啟動服務
在專案根目錄開啟終端機（如：PowerShell 或 CMD），執行以下指令：

```bash
docker-compose up -d
```

### 第四步：存取服務
啟動完成後，即可透過瀏覽器存取以下位址：

- **前端網址**：`http://localhost:5174`
- **後端接口**：`http://localhost:5003`
- **接口文檔**：`http://localhost:5003/swagger` (Swagger)

> [!NOTE]
> 若瀏覽器無法連線至 `localhost`，請嘗試改用 `http://127.0.0.1:5174`。

---

## 登入測試

進入登入頁面後，可直接點擊「快速登入」或手動輸入以下資訊：

| 對象 | 資訊 |
| :--- | :--- |
| **測試帳號** | `admin` |
| **測試密碼** | `admin1234` |

---

## 資料庫連線 (MySQL)

若需使用外部工具（如 DBeaver, Navicat）連接資料庫，請使用以下資訊：

| 欄位 | 數值 |
| :--- | :--- |
| **主機 (Host)** | `localhost` |
| **連接埠 (Port)** | `3309` |
| **帳號 (User)** | `root` |
| **密碼 (Password)** | `root` |
| **資料庫 (DB)** | `kanban_db` |

### 進階：使用 Docker 指令進入資料庫

如果您不想安裝 GUI 工具，也可以直接在終端機使用介面：

```bash
docker compose exec kanban_db mysql -u root -proot kanban_db
```

---

## 目錄說明

- **`kanban-api/`**：後端程式碼與資料庫遷移紀錄。
- **`kanban-frontend/`**：前端程式碼與狀態管理邏輯。
- **`.agent/`**：開發規範與協作紀錄手冊。
