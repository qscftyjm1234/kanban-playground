using System;
using System.Collections.Generic;

namespace Kanban.Domain.Entities
{
    public class Board
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 導航屬性
        public virtual ICollection<KanbanTask> Tasks { get; set; } = new List<KanbanTask>();
    }
}
