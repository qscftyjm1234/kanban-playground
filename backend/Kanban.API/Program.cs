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

// --- 資料庫連線：對齊成功範例的解析引擎 ---
var rawConn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
              ?? Environment.GetEnvironmentVariable("MYSQL_URL");

string? connectionString = null;
string source = "Default";

if (!string.IsNullOrEmpty(rawConn) && rawConn.StartsWith("mysql://"))
{
    try {
        var uri = new Uri(rawConn);
        var dbName = uri.PathAndQuery.TrimStart('/');
        var userInfo = uri.UserInfo.Split(':');
        var userPart = userInfo[0];
        var passPart = userInfo.Length > 1 ? userInfo[1] : "";
        connectionString = $"Server={uri.Host};Port={uri.Port};Database={dbName};User={userPart};Password={passPart};AllowPublicKeyRetrieval=True;SSL Mode=None;Charset=utf8mb4;";
        source = "Environment URL (Parsed)";
    } catch { /* parse failure fallback */ }
}

if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    source = "Configuration/Individual Vars";
    
    // 如果還是空的，嘗試組合個別變數
    var host = Environment.GetEnvironmentVariable("MYSQLHOST");
    if (!string.IsNullOrEmpty(host))
    {
        var port = Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";
        var db = Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";
        var user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
        var pass = Environment.GetEnvironmentVariable("MYSQLPASSWORD");
        connectionString = $"Server={host};Port={port};Database={db};User={user};Password={pass};AllowPublicKeyRetrieval=True;SSL Mode=None;";
        source = "Individual Env Vars";
    }
}

Console.WriteLine($"[Backend] 連線來源: {source}");
if (!string.IsNullOrEmpty(connectionString))
{
    var masked = connectionString.Contains("Password=") 
        ? connectionString.Substring(0, connectionString.IndexOf("Password=") + 9) + "********;" 
        : connectionString;
    Console.WriteLine($"[Backend] 連線資訊: {masked}");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString!, ServerVersion.AutoDetect(connectionString!),
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
        Console.WriteLine("[Backend] 啟動中... 版本 V6 (Bruteforce Clean Mode)");
        Console.WriteLine("[Backend] 正在執行資料庫暴力重置與遷移...");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.EnsureDeleted(); // 強制清空現有表格殘骸
        context.Database.Migrate();       // 重新建立正確結構
        Console.WriteLine("[Backend] 資料庫遷移成功。");
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
