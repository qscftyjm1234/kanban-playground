using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;

namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class LabelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LabelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Label>>> GetLabels()
        {
            var labels = await _context.Labels.ToListAsync();
            
            var existingNames = labels.Select(l => l.Name).ToList();
            var requiredLabels = new List<Label>
            {
                new Label { Id = Guid.NewGuid(), Name = "前端", Color = "#3b82f6" },
                new Label { Id = Guid.NewGuid(), Name = "後端", Color = "#10b981" },
                new Label { Id = Guid.NewGuid(), Name = "資料庫", Color = "#8b5cf6" },
                new Label { Id = Guid.NewGuid(), Name = "AI", Color = "#f59e0b" }
            };

            var toAdd = requiredLabels.Where(rl => !existingNames.Contains(rl.Name)).ToList();
            if (toAdd.Any())
            {
                _context.Labels.AddRange(toAdd);
                await _context.SaveChangesAsync();
                labels.AddRange(toAdd);
            }
            
            return labels;
        }

        [HttpPost]
        public async Task<ActionResult<Label>> CreateLabel(Label label)
        {
            label.Id = Guid.NewGuid();
            _context.Labels.Add(label);
            await _context.SaveChangesAsync();
            return Ok(label);
        }
    }
}
