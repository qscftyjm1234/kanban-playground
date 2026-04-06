using System;

namespace Kanban.Application.DTOs
{
    /// <summary>
    /// 待辦事項的資料傳輸物件 (Data Transfer Object)
    /// 這支檔案定義了 API 回傳給前端展示、或是前端新增資料時「長什麼樣子」。
    /// </summary>
    public class KanbanTaskDto
{
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid BoardId { get; set; }
        public List<LabelDto>? Labels { get; set; } = new();
    }

    public class LabelDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "TODO";
        public Guid BoardId { get; set; }
        public double SortOrder { get; set; }
        public List<LabelIdDto>? Labels { get; set; } = new();
    }

    public class LabelIdDto
    {
        public Guid Id { get; set; }
    }

    public class UpdateTaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double SortOrder { get; set; }
        public Guid BoardId { get; set; }
        public List<LabelIdDto>? Labels { get; set; } = new();
    }
}
