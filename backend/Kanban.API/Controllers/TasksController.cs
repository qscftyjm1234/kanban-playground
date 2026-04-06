using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;
using Kanban.Application.DTOs;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KanbanTask>>> GetTasks([FromQuery] Guid? boardId)
    {
        var query = _context.Tasks
            .Include(t => t.Labels)
            .Include(t => t.ChecklistItems)
            .AsQueryable();

        if (boardId.HasValue)
        {
            query = query.Where(t => t.BoardId == boardId.Value);
        }

        return await query.OrderBy(t => t.SortOrder).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<KanbanTask>> CreateTask(CreateTaskDto dto)
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

        // 處理子任務清單
        if (dto.ChecklistItems != null && dto.ChecklistItems.Any())
        {
            foreach (var itemDto in dto.ChecklistItems)
            {
                task.ChecklistItems.Add(new ChecklistItem
                {
                    Id = Guid.NewGuid(),
                    TaskId = task.Id,
                    Title = itemDto.Title,
                    IsCompleted = false
                });
            }
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, UpdateTaskDto dto)
    {
        if (id != dto.Id) return BadRequest("ID 不一致");
        
        var existing = await _context.Tasks
            .Include(t => t.Labels)
            .Include(t => t.ChecklistItems)
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

        // 更新子項目同步 (Diff Sync)
        if (dto.ChecklistItems != null)
        {
            // 1. 刪除不在 DTO 中的項目
            var dtoIds = dto.ChecklistItems.Where(di => di.Id.HasValue).Select(di => di.Id!.Value).ToList();
            var itemsToRemove = existing.ChecklistItems.Where(ei => !dtoIds.Contains(ei.Id)).ToList();
            foreach (var item in itemsToRemove)
            {
                existing.ChecklistItems.Remove(item);
            }

            // 2. 更新或新增項目
            foreach (var itemDto in dto.ChecklistItems)
            {
                if (itemDto.Id.HasValue)
                {
                    // 更新現有項目
                    var existingItem = existing.ChecklistItems.FirstOrDefault(ei => ei.Id == itemDto.Id.Value);
                    if (existingItem != null)
                    {
                        existingItem.Title = itemDto.Title;
                        existingItem.IsCompleted = itemDto.IsCompleted;
                    }
                }
                else
                {
                    // 新增項目
                    existing.ChecklistItems.Add(new ChecklistItem
                    {
                        Id = Guid.NewGuid(),
                        TaskId = existing.Id,
                        Title = itemDto.Title,
                        IsCompleted = itemDto.IsCompleted
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- 子任務管理 (Checklist Hooks) ---

    [HttpPost("{taskId}/checklist")]
    public async Task<ActionResult<ChecklistItem>> AddChecklistItem(Guid taskId, [FromBody] CreateChecklistItemDto dto)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null) return NotFound();

        var item = new ChecklistItem
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            Title = dto.Title,
            IsCompleted = false
        };
        
        _context.ChecklistItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPatch("checklist/{itemId}")]
    public async Task<IActionResult> ToggleChecklistItem(Guid itemId, [FromBody] bool isCompleted)
    {
        var item = await _context.ChecklistItems.FindAsync(itemId);
        if (item == null) return NotFound();

        item.IsCompleted = isCompleted;
        await _context.SaveChangesAsync();
        return NoContent();
    }

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
