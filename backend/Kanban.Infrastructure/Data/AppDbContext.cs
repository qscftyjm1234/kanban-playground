using Kanban.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        // 建構子：接收外部傳入的資料庫連線參數
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // 定義資料庫中的實體表格 (Tables)
        public DbSet<KanbanTask> Tasks { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<Label> Labels { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 這是資料庫建模的核心：使用 Fluent API 來設定表格欄位的限制與關聯
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Board>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<KanbanTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasColumnType("TEXT");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("TODO");
                entity.Property(e => e.SortOrder).IsRequired().HasDefaultValue(0);
                
                // 關聯配置
                entity.HasOne(e => e.Board)
                      .WithMany(b => b.Tasks)
                      .HasForeignKey(e => e.BoardId)
                      .OnDelete(DeleteBehavior.Cascade);

                // 設定「多對多 (Many-to-Many)」關聯：一個任務可以有多個標籤，一個標籤也可以屬於多個任務
                entity.HasMany(e => e.Labels)
                      .WithMany(l => l.Tasks);
            });


            modelBuilder.Entity<Label>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Color).IsRequired().HasMaxLength(20);

                // 物理種子資料注入
                entity.HasData(
                    new Label { Id = Guid.Parse("2b60949c-ebdf-4c48-bac4-5d49b5d6db31"), Name = "後端研發", Color = "#10b981" },
                    new Label { Id = Guid.Parse("91e131d2-62ab-45a2-957b-bc89cfdb8cf0"), Name = "前端開發", Color = "#3b82f6" },
                    new Label { Id = Guid.Parse("bbb6e551-576a-46d1-bd6f-58203e2983d1"), Name = "AI 整合", Color = "#8b5cf6" },
                    new Label { Id = Guid.Parse("ff393075-0851-4ac1-9084-6f9e8208d353"), Name = "資料庫", Color = "#f59e0b" }
                );
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LoginAccount).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20).HasDefaultValue("User");
            });
        }
    }
}
