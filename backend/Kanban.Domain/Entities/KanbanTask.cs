using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Kanban.Domain.Entities
{
    /// <summary>
    /// 待辦事項 (看板卡片) 的原始領域實體
    /// 這裡定義了資料庫表格的結構欄位
    /// </summary>
    public class KanbanTask
{
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "TODO";
        public double SortOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // --- 導覽屬性 (Navigation Properties) ---
        // 這些屬性用來在程式碼中表達資料表之間的關聯，EF Core 會自動處理這些關聯的讀取。
        
        // 此任務屬於哪個看板 (外鍵與關聯物件)
        public Guid BoardId { get; set; }
        
        [JsonIgnore]
        public virtual Board? Board { get; set; }

        // 此任務擁有的多個標籤 (Many-to-Many 關聯)
        public virtual ICollection<Label>? Labels { get; set; } = new List<Label>();
    }
}
