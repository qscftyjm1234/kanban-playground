using System;

namespace Kanban.Domain.Entities
{
    public class ChecklistItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int SortOrder { get; set; } = 0;

        // 導航屬性
        public virtual KanbanTask? Task { get; set; }
    }
}
