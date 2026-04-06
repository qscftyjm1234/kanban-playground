using Kanban.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Kanban.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Kanban.Domain.Entities;

// ==============================================================================
// >>> [BACKEND_ULTRA_SYNC_V9_STARTING_NOW] <<<
// 這行如果沒出現在日誌最前面，代表 Railway 根本沒吃到這份檔案！
// ==============================================================================
Console.WriteLine("\n\n#################################################");
Console.WriteLine("#   [BACKEND_ULTRA_SYNC_V9_STARTING_NOW]        #");
Console.WriteLine("#   時間: " + DateTime.UtcNow + " UTC             #");
Console.WriteLine("#################################################\n\n");

var builder = WebApplication.CreateBuilder(args);

// 三層防護資料庫連線解析引擎
string? connectionString = null;
string source = "Default appsettings.json";

// 1. 優先解析 mysql:// URL 網址變數
var envUrl = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL")
           ?? Environment.GetEnvironmentVariable("MYSQLURL");

if (!string.IsNullOrEmpty(envUrl))
{
    try 
    {
        var uri = new Uri(envUrl);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port;
        var db = uri.AbsolutePath.TrimStart('/');
        connectionString = $"Server={host};Port={port};Database={db};User={user};Password={password};AllowPublicKeyRetrieval=True;SSL Mode=None;Charset=utf8mb4;";
        source = "Environment URL (Parsed)";
    }
    catch { /* 解析失敗則回退 */ }
}

// 2. 如果 URL 解析失敗，則組合個別變數 (Railway 自動注入的變數)
if (string.IsNullOrEmpty(connectionString))
{
    var host = Environment.GetEnvironmentVariable("MYSQLHOST");
    var port = Environment.GetEnvironmentVariable("MYSQLPORT");
    var db = Environment.GetEnvironmentVariable("MYSQLDATABASE");
    var user = Environment.GetEnvironmentVariable("MYSQLUSER");
    var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");
    
    if (!string.IsNullOrEmpty(host))
    {
        connectionString = $"Server={host};Port={port ?? "3306"};Database={db};User={user};Password={password};AllowPublicKeyRetrieval=True;SSL Mode=None;Charset=utf8mb4;";
        source = "Individual Env Vars";
    }
}

// 3. 最後備援：讀取組態檔
if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

Console.WriteLine($"[Backend] 連線來源: {source}");
if (!string.IsNullOrEmpty(connectionString))
{
    var masked = connectionString.Contains("Password=") 
        ? connectionString.Substring(0, connectionString.IndexOf("Password=") + 9) + "********;" 
        : connectionString;
    Console.WriteLine($"[Backend] 連線資訊: {masked}");
}

// 設定資料庫連線 (包含重試機制)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString!, ServerVersion.AutoDetect(connectionString!),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_1234567890")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();

// 【暴力重置邏輯】
using (var scope = app.Services.CreateScope())
{
    try 
    {
        Console.WriteLine("\n\n>>> [DATABASE_SWEEP_EXECUTING] <<<\n");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.EnsureDeleted(); 
        context.Database.Migrate();       
        Console.WriteLine("[Backend] 資料庫重置與遷移成功。");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Backend] 執行錯誤: {ex.Message}");
    }
}

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

// JWT 憑證生成器 (與專案結構對齊)
public interface IJwtTokenGenerator { string GenerateToken(User user); }
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;
    public JwtTokenGenerator(IConfiguration config) { _config = config; }
    public string GenerateToken(User user)
    {
        var claims = new[] { new System.Security.Claims.Claim("id", user.Id.ToString()), new System.Security.Claims.Claim("username", user.Username) };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SUPER_SECRET_KEY_1234567890"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(claims: claims, expires: DateTime.Now.AddDays(7), signingCredentials: creds);
        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
    }
}
