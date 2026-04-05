using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Kanban.Domain.Entities;
using Kanban.Application.Interfaces;
using Kanban.Application.Services;
using Kanban.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 註冊服務到容器
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "請在下方欄位輸入 'Bearer {Your_JWT_Token}'"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// 設定 JWT 驗證
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "super_secret_key_that_is_at_least_32_chars_long"))
        };
    });

builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddHttpClient<IGeminiService, GeminiService>();

// 設定 CORS（允許前端存取）
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 資料庫設定（等待 MySQL 啟動）
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 45))));

var app = builder.Build();

// 自動建立資料庫與資料表（具備重試機制）
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // 簡單的連線重試邏輯，適合 Docker 環境
    int retryCount = 10;
    while (retryCount > 0)
    {
        try 
        {
            context.Database.Migrate();
            Console.WriteLine("[Backend] 資料庫遷移成功。");
            break;
        }
        catch (Exception ex)
        {
            // 如果報錯是 "資料表已存在"，代表可能是手動建立或同步問題，此時應該繼續啟動而非卡死
            if (ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"[Backend] 警告: 資料表已存在，跳過自動遷移並繼續啟動：{ex.Message}");
                break;
            }

            retryCount--;
            if (retryCount == 0) 
            {
                Console.WriteLine($"[Backend] 嚴重錯誤: 資料庫連線或遷移失敗: {ex.Message}");
                // 即使失敗也嘗試讓伺服器啟動，以便開發者能透過 API 或 Swagger 診斷
                break;
            }
            Console.WriteLine($"[Backend] 等待資料庫啟動或遷移中... ({ex.Message}) 剩餘重試次數: {retryCount}");
            Thread.Sleep(3000); // 等待 3 秒再重試
        }
    }
}

// 設定 HTTP 請求管道
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// JWT 憑證生成器介面與實作
public interface IJwtTokenGenerator { string GenerateToken(User user); }
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;
    public JwtTokenGenerator(IConfiguration config) { _config = config; }
    public string GenerateToken(User user)
    {
        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim("role", user.Role)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "default_secret_key_long_enough"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
            _config["Jwt:Issuer"], _config["Jwt:Audience"], claims,
            expires: DateTime.Now.AddDays(7), signingCredentials: creds);
        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
    }
}
