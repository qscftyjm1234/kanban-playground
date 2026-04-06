using System;
using System.Collections.Generic;

namespace Kanban.Domain.Entities
{
    public class KanbanTask
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Status { get; set; }
        public int Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys - 這裡必須保持 Guid (不可為空)，以配合級聯刪除 (Cascade)
        public Guid BoardId { get; set; }
        public Board? Board { get; set; }

        public Guid? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
        public ICollection<Label> Labels { get; set; } = new List<Label>();
    }
}
