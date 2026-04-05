using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Kanban.Application.Interfaces;

namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly IGeminiService _geminiService;

        public AIController(IGeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("refine-description")]
        public async Task<IActionResult> RefineDescription([FromBody] RefineRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description cannot be empty.");

            var refined = await _geminiService.RefineTaskDescriptionAsync(request.Description);
            return Ok(new { RefinedDescription = refined });
        }
    }

    public class RefineRequest
    {
        public string Description { get; set; } = string.Empty;
    }
}
