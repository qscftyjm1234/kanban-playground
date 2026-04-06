using Kanban.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Kanban.Domain.Entities;

// ==============================================================================
// >>> [後端核心啟動配置] <<<
// 這裡是程式的進入點 (Entry Point)，負責整台「伺服器實體」的初始化。
// 包含：依賴注入 (DI)、資料庫連線、安全驗證 (JWT) 與 API 路由設定。
// ==============================================================================
// >>> [BACKEND_ULTRA_SYNC_V9_STARTING_NOW] <<<
Console.WriteLine("\n\n#################################################");
Console.WriteLine("#   [BACKEND_ULTRA_SYNC_V9_STARTING_NOW]        #");
Console.WriteLine("#   時間: " + DateTime.UtcNow + " UTC             #");
Console.WriteLine("#################################################\n\n");

// --- [前端對比] 這裡就像 Vite 的 `main.js` 或 React 的 `createRoot` ---
// 它正在準備「伺服器容器」，接下來我們會在這個 builder 裡面註冊各種 Provider (如資料庫、驗證)
var builder = WebApplication.CreateBuilder(args);

// --- 動態 PORT 綁定 (針對雲端部署環境，如 Railway/Heroku 的自動 Port 分配) ---
// --- [前端對比] 這裡就像 Node.js 的 `process.env.PORT` 或 Vite 的 `import.meta.env.VITE_PORT` ---
// 它會去讀取作業系統或雲端平台設定的參數。
var appPort = Environment.GetEnvironmentVariable("PORT") ?? "80";
// --- [前端對比] 就像在 Vite 設定檔中設定 `server: { port: 5173 }` ---
// 它告訴伺服器要在哪一個「埠號 (Port)」聽取請求。如果是雲端平台（如 Railway），它們會自動給一個 $PORT，我們就要動態綁定。
builder.WebHost.UseUrls($"http://*:{appPort}");
// ----------------------------------------------

// 三層連線解析引擎：確保在「本地開發」、「Docker 容器」與「網路上」都能正確連到資料庫
string? connectionString = null;
string source = "Default appsettings.json";

// 1. 優先從環境變數中尋找連線資訊 (就像在 Docker 或 Railway 中設定變數一樣)
var envUrl = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL")
           ?? Environment.GetEnvironmentVariable("MYSQLURL");

// --- [前端對比] 這裡就像是在做「連線字串的尋寶遊戲」 ---
// 1. 先看有沒有人給我們「一把鑰匙」(MYSQL_URL 這樣的單一網址)
if (!string.IsNullOrEmpty(envUrl))
{
    // 如果有這把鑰匙，老實說它就像 `new URL(envUrl)`，需要把它拆開來拿零件 (如 Server, Port)
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

// --- [前端對比] 就像在 React 頂層掛一個 `DatabaseProvider` ---
// 這行是在「註冊」資料庫服務。以後 Controller 只要說「我需要資料庫」，系統就會自動把這個連線傳給它。
// EnableRetryOnFailure 就像是前端的「請求自動重試機制」，如果資料庫還在啟動中或是斷掉，會自動嘗試連線。
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString!, new MySqlServerVersion(new Version(8, 0, 31)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// --- [前端對比] 就像設定 Axios 的 `Response Type` ---
// 這裡設定 API 回傳 JSON 時的規則，例如：自動把 C# 的大寫屬性轉為 JS 的小寫 (camelCase)。
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
// --- [前端對比] 就像產生 `Swagger` 接口文檔 ---
// 自動掃描所有的 Controller 並產出一份互動式的 API 文件，讓前端可以不用看程式碼就知道怎麼打 API。
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- [前端對比] 就像設定 `CORS` 跨域權限 ---
// 如果你沒有這一段，前端 (localhost:5173) 打過來後端時，瀏覽器會因為安全性理由把請求擋掉。
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// --- 依賴注入 (Dependency Injection) 區塊 ---
// 將我們自定義的「功能模組」註冊到系統中，讓控制器 (Controller) 可以直接索取並使用。
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// 設定安全認證 (Authentication)：告訴系統如何解析前端傳來的 JWT 密鑰
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

// --- [前端對比] 就像是在 `useEffect` 裡做「資料初始化」 ---
// 當伺服器啟動時，自動執行資料庫遷移，並確保資料庫裡面有基本的測試資料。
using (var scope = app.Services.CreateScope())
{
    try 
    {
        Console.WriteLine("\n\n>>> [DATABASE_SWEEP_EXECUTING] <<<\n");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // 清掉所有東西
        // context.Database.EnsureDeleted(); // [手動關閉] 為了保留使用者自備的假資料，不再每次啟動都清空資料庫
        // 將設計的實體模型轉移到資料庫
        context.Database.Migrate();       
        Console.WriteLine("[Backend] 資料庫重置與遷移成功。");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Backend] 執行錯誤: {ex.Message}");
    }
}
// REBUILD_ID_V15_FORCE_0406_1505

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- [前端對比] 這裡就像 Axios 的「攔截器 (Interceptors)」或路由守衛 (Guards) ---
// 設定這些 Middleware (中介軟體)，請求會像走流水線一樣，一個個通過這些檢查點。

app.UseCors("AllowAll");      // 1. 檢查這個人能不能跨域打我
app.UseAuthentication();      // 2. 檢查這個人是誰 (驗證 JWT Token)
app.UseAuthorization();       // 3. 檢查這個人有沒有權限做這件事
app.MapControllers();         // 4. 最後才把請求導向對應的 Controller (像 React Router 的映射)

app.Run();                    // 啟動伺服器大循環！ (就像執行一個永不停息的 `while(true)`)

// --- [前端對比] 就像是一個 `Auth Utils` 工具類 ---
// 負責把使用者資訊「加密」成一段 JWT 字串，讓前端可以存在 LocalStorage 裡。
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
