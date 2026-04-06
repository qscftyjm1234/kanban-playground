using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Kanban.Domain.Entities
{
    public class KanbanTask
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "TODO";
        public double SortOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // 外鍵與導航屬性
        public Guid BoardId { get; set; }
        
        [JsonIgnore]
        public virtual Board? Board { get; set; }

        public virtual ICollection<Label>? Labels { get; set; } = new List<Label>();
    }
}
