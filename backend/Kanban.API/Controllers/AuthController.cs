using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;

namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IJwtTokenGenerator _jwtGenerator;

        public AuthController(AppDbContext context, IJwtTokenGenerator jwtGenerator)
        {
            _context = context;
            _jwtGenerator = jwtGenerator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.LoginAccount == request.LoginAccount))
                return BadRequest("此帳號已被註冊");

            var user = new User
            {
                LoginAccount = request.LoginAccount,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Role = user.Role });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.LoginAccount == request.LoginAccount);
            
            if (user == null || user.PasswordHash != HashPassword(request.Password))
                return Unauthorized("帳號或密碼錯誤");

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Role = user.Role });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public class RegisterRequest
    {
        public string LoginAccount { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string LoginAccount { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
