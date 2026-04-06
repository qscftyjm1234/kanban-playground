using Kanban.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Board> Boards { get; set; } = null!;
        public DbSet<KanbanTask> Tasks { get; set; } = null!;
        public DbSet<ChecklistItem> ChecklistItems { get; set; } = null!;
        public DbSet<Label> Labels { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Task - Board 關係 (這是最重要的修正：必須是 Cascade 且 IsRequired)
            modelBuilder.Entity<KanbanTask>()
                .HasOne(t => t.Board)
                .WithMany(b => b.Tasks)
                .HasForeignKey(t => t.BoardId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            // Task - User 關係 (可為空)
            modelBuilder.Entity<KanbanTask>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Task - Label 多對多
            modelBuilder.Entity<KanbanTask>()
                .HasMany(t => t.Labels)
                .WithMany(l => l.Tasks)
                .UsingEntity(j => j.ToTable("KanbanTaskLabel"));

            // Task - ChecklistItems 級聯刪除
            modelBuilder.Entity<KanbanTask>()
                .HasMany(t => t.ChecklistItems)
                .WithOne(c => c.Task)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
