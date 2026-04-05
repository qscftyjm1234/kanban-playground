using System;
using System.Collections.Generic;

namespace Kanban.Domain.Entities
{
    public class Label
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty; // Hex color

        // 多對多導航屬性
        public virtual ICollection<KanbanTask>? Tasks { get; set; } = new List<KanbanTask>();
    }
}
