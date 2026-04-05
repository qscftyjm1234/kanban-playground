using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;

namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class BoardsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BoardsController(AppDbContext context)
        {
            _context = context;
        }

        // 獲取所有看板
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Board>>> GetBoards()
        {
            return await _context.Boards.ToListAsync();
        }

        // 獲取單一看板細節（含任務）
        [HttpGet("{id}")]
        public async Task<ActionResult<Board>> GetBoard(Guid id)
        {
            var board = await _context.Boards
                .Include(b => b.Tasks)
                    .ThenInclude(t => t.Labels)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (board == null) return NotFound();
            return board;
        }

        // 建立新看板
        [HttpPost]
        public async Task<ActionResult<Board>> CreateBoard(Board board)
        {
            board.Id = Guid.NewGuid();
            board.CreatedAt = DateTime.UtcNow;
            _context.Boards.Add(board);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, board);
        }

        // 更新看板內容
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBoard(Guid id, Board board)
        {
            if (id != board.Id) return BadRequest();

            _context.Entry(board).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BoardExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 刪除看板
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoard(Guid id)
        {
            var board = await _context.Boards.FindAsync(id);
            if (board == null) return NotFound();

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BoardExists(Guid id)
        {
            return _context.Boards.Any(e => e.Id == id);
        }
    }
}
