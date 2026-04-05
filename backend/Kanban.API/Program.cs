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

// --- 資料庫連線：三層防護解析邏輯 ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
string? source = "appsettings.json";

// 1. 優先嘗試解析 MYSQL_URL 
var mysqlUrl = Environment.GetEnvironmentVariable("MYSQL_URL");
if (!string.IsNullOrEmpty(mysqlUrl))
{
    try 
    {
        var uri = new Uri(mysqlUrl);
        var db = uri.PathAndQuery.TrimStart('/');
        var userInfo = uri.UserInfo.Split(':');
        connectionString = $"Server={uri.Host};Port={uri.Port};Database={db};User={userInfo[0]};Password={(userInfo.Length > 1 ? userInfo[1] : "")};SSL Mode=None;";
        source = "MYSQL_URL";
    }
    catch { /* 忽略解析錯誤，交給下一層處理 */ }
}

// 2. 如果沒抓到 URL，嘗試組合個別變項 (Railway 常用)
if (source == "appsettings.json" && !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("MYSQLHOST")))
{
    var host = Environment.GetEnvironmentVariable("MYSQLHOST");
    var port = Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";
    var db = Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? Environment.GetEnvironmentVariable("MYSQL_DATABASE");
    var user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? Environment.GetEnvironmentVariable("MYSQL_USER");
    var pass = Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? Environment.GetEnvironmentVariable("MYSQL_PASSWORD");
    connectionString = $"Server={host};Port={port};Database={db};User={user};Password={pass};SSL Mode=None;";
    source = "Railway Individual Variables";
}

// 輸出診斷資訊 (遮蔽密碼)
var maskedConn = string.IsNullOrEmpty(connectionString) ? "NULL" : connectionString.Substring(0, Math.Min(connectionString.Length, connectionString.IndexOf("Password=") + 9)) + "********;";
Console.WriteLine($"[Backend] 資料庫連線來源: {source}");
Console.WriteLine($"[Backend] 連線資訊診斷: {maskedConn}");

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("無法獲取資料庫連線字串。請檢查雲端環境變數。");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

var app = builder.Build();

// 自動建立資料庫與資料表
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("[Backend] 資料庫遷移完成。");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Backend] 資料庫遷移失敗: {ex.Message}");
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
