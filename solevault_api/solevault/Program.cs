using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using solevault.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5244");

// Подключение к MySQL/MariaDB
var conn = builder.Configuration.GetConnectionString("Default")!;
builder.Services.AddDbContext<SoleVaultContext>(opt =>
    opt.UseMySql(conn, ServerVersion.AutoDetect(conn))
);

// JWT аутентификация
var secret = builder.Configuration["Jwt:Secret"]!;
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    });

builder.Services.AddAuthorization();

// CORS для React
builder.Services.AddCors(opt => opt.AddPolicy("Frontend", p =>
    p.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://192.168.1.100:3000",
            "http://192.168.1.100:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
));

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();