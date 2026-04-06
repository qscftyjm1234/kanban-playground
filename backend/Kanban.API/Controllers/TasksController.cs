using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;
using Kanban.Application.DTOs;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize] // 強制要求請求必須攜帶有效的 JWT Token 才能訪問
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KanbanTaskDto>>> GetTasks([FromQuery] Guid? boardId)
    {
        // 建立查詢基礎，並利用 Include 預先加載 (Eager Loading) 關聯的標籤資料
        var query = _context.Tasks
            .Include(t => t.Labels)
            .AsQueryable();

        if (boardId.HasValue)
        {
            query = query.Where(t => t.BoardId == boardId.Value);
        }

        var tasks = await query.OrderBy(t => t.SortOrder).ToListAsync();
        
        // 手動將 Entity (資料庫實體) 映射為 DTO (傳輸物件)
        // 目的：1. 隱藏敏感欄位 2. 斷開與資料庫框架的直接聯繫 3. 避免 JSON 循環引用的問題
        return tasks.Select(t => new KanbanTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            SortOrder = t.SortOrder,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            BoardId = t.BoardId,
            Labels = t.Labels?.Select(l => new LabelDto
            {
                Id = l.Id,
                Name = l.Name,
                Color = l.Color
            }).ToList()
        }).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<KanbanTaskDto>> CreateTask(CreateTaskDto dto)
    {
        var task = new KanbanTask
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            BoardId = dto.BoardId,
            SortOrder = dto.SortOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Labels = new List<Label>()
        };

        // 處理標籤關聯
        if (dto.Labels != null && dto.Labels.Any())
        {
            var labelIds = dto.Labels.Select(l => l.Id).ToList();
            var existingLabels = await _context.Labels.Where(l => labelIds.Contains(l.Id)).ToListAsync();
            foreach (var label in existingLabels)
            {
                task.Labels.Add(label);
            }
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // 顯性加載標籤以確保映射 DTO 時包含實體數據
        await _context.Entry(task).Collection(t => t.Labels).LoadAsync();

        return Ok(new KanbanTaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            SortOrder = task.SortOrder,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            BoardId = task.BoardId,
            Labels = task.Labels?.Select(l => new LabelDto { Id = l.Id, Name = l.Name, Color = l.Color }).ToList()
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<KanbanTaskDto>> UpdateTask(Guid id, UpdateTaskDto dto)
    {
        if (id != dto.Id) return BadRequest("ID 不一致");
        
        var existing = await _context.Tasks
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (existing == null) return NotFound();

        // 更新基礎欄位
        existing.Title = dto.Title;
        existing.Description = dto.Description;
        existing.Status = dto.Status;
        existing.SortOrder = dto.SortOrder;
        existing.BoardId = dto.BoardId;
        existing.UpdatedAt = DateTime.UtcNow;

        // 更新標籤關聯
        existing.Labels.Clear();
        if (dto.Labels != null && dto.Labels.Any())
        {
            var labelIds = dto.Labels.Select(l => l.Id).ToList();
            var selectedLabels = await _context.Labels.Where(l => labelIds.Contains(l.Id)).ToListAsync();
            foreach (var label in selectedLabels)
            {
                existing.Labels.Add(label);
            }
        }

        await _context.SaveChangesAsync();
        
        return Ok(new KanbanTaskDto
        {
            Id = existing.Id,
            Title = existing.Title,
            Description = existing.Description,
            Status = existing.Status,
            SortOrder = existing.SortOrder,
            CreatedAt = existing.CreatedAt,
            UpdatedAt = existing.UpdatedAt,
            BoardId = existing.BoardId,
            Labels = existing.Labels?.Select(l => new LabelDto { Id = l.Id, Name = l.Name, Color = l.Color }).ToList()
        });
    }

    // --- 子任務管理 (已廢棄) ---

    [HttpPatch("{id}/position")]
    public async Task<IActionResult> UpdatePosition(Guid id, [FromBody] PositionUpdateDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Status = dto.Status;
        task.SortOrder = dto.SortOrder;
        
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class PositionUpdateDto
{
    public string Status { get; set; } = string.Empty;
    public double SortOrder { get; set; }
}
