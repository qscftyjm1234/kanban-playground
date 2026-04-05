# 後端控制器實作標準 (Backend Controller Pattern)

本文件定義專案中 .NET Web API 控制器的實作標準，確保後端技術架構的一致性。

---

## 1. 控制器結構規範 (Standard Structure)

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;

namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ControllerName : ControllerBase
    {
        private readonly AppDbContext _context;

        public ControllerName(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET (Read)
        // 2. POST (Create)
        // 3. PUT (Update)
        // 4. DELETE (Delete)
    }

    /* 數據傳輸模型 (DTOs) 若規模較小，優先定義在 Controller 底部 */
}
```

---

## 2. 關鍵實踐 (Key Practices)
- **非同步操作**: 所有的 DB 存取 (ToListAsync, AnyAsync, SaveChangesAsync) 必須使用 `async/await`。
- **錯誤處理**: 驗證失敗應回傳 `BadRequest()`，權限失敗回傳 `Unauthorized()`，成功回傳 `Ok()`。
- **依賴注入**: 嚴禁在方法內部實施實例化，所有服務必須透過 `Constructor Injection`。
- **排序與狀態**: 在處理 Task 模型時，必須顯性處理 `SortOrder` 邏輯。
