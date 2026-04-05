using System;

namespace Kanban.Application.DTOs
{
    public class KanbanTaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "TODO";
        public Guid? BoardId { get; set; }
        public double SortOrder { get; set; }
        public List<LabelIdDto>? Labels { get; set; } = new();
        public List<CreateChecklistItemDto>? ChecklistItems { get; set; } = new();
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
        public Guid? BoardId { get; set; }
        public List<LabelIdDto>? Labels { get; set; } = new();
    }

    public class CreateChecklistItemDto
    {
        public string Title { get; set; } = string.Empty;
    }
}
