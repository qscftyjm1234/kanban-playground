# 基礎設施與流程知識 (Infra & Process Knowledge)

## 環境災難紀錄
- **Docker SIGBUS 崩潰 (2026-04-02)**: 因 Windows C 碟 (SSD) 空間不足導致 WSL2 虛擬硬碟分配失敗，會導致 Docker 啟動卡死或容器異常。方案：清理 C 碟空間或將 Docker Image 檔移至 D 碟。預防：確保持續有 >5GB 剩餘空間。
- **Railway 雙重路徑衝突 (2026-04-06)**: 專案根目錄與 `backend/` 目錄同時存在後端源碼，導致佈署時抓到舊版。方案：統一源碼至根目錄或修正 Root Directory。
- **Railway 二進位快取鎖定 (2026-04-06)**: Docker 層快取導致 `Program.cs` 的邏輯變更未生效。方案：在檔案末端加入物理 REBUILD_ID 或執行 Clear Build Cache。

## 架構文件與路由同步 (Documentation & Route Sync)
- **大綱同步**: 系統級大架構的增刪改必須同步登記至 `.agent/index.md`，若專案設有 `dashboard.md`，則必須更新宏觀進度狀態。
- **路由與 E2E 測試**: 修改前端路由邏輯或 API 端點後，必須確認並同步更新 `e2e_routes.md` 以防自動化測試系統中斷。
