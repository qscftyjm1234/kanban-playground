using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Kanban.Domain.Entities;
using Kanban.Infrastructure.Data;

// namespace是
namespace Kanban.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // --- [前端對比] 這裡就像是「領取」全域狀態或 API 配置 ---
        // 透過建構子注入，我們直接向系統要「資料庫工具」跟「JWT 令牌工具」，不需要自己 new。
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
            // --- [前端對比] 這就像是表單提交後的「重複檢查」 ---
            // 1. 先去資料庫（就像一個大的 JSON Array）找看看有沒有重複的帳號。
            if (await _context.Users.AnyAsync(u => u.LoginAccount == request.LoginAccount))
                return BadRequest("此帳號已被註冊");

            // --- [前端對比] 將表單的資料「轉換」成資料庫要儲存的格式 (Entity) ---
            var user = new User
            {
                LoginAccount = request.LoginAccount,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password)
            };

            // --- [前端對比] 就像呼叫 API 存檔或 setState 並更新回遠端 ---
            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // 這一行才是真正「存進硬碟」的動作

            // --- [前端對比] 登冊成功後，直接生一張 Token 給前端存 LocalStorage ---
            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Role = user.Role });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // --- [前端對比] 就像是在 Array 中做 .find() ---
            var user = await _context.Users.FirstOrDefaultAsync(u => u.LoginAccount == request.LoginAccount);
            
            // --- [前端對比] 密碼比對 (注意：我們不能存明文密碼，必須存雜湊值) ---
            if (user == null || user.PasswordHash != HashPassword(request.Password))
                return Unauthorized("帳號或密碼錯誤");

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Role = user.Role });
        }

        private string HashPassword(string password)
        {
            // --- [前端對比] 就像是一個加密的小工具 (Crypto Utils) ---
            // 把「123456」變成「aB2#...」這種沒人看得懂的字串。
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    // --- [前端對比] 這些 Request 類別就像是 TypeScript 的 `Interface` ---
    // 定義了前端打這支 API 時，「Body」一定要傳哪些欄位過來。
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
