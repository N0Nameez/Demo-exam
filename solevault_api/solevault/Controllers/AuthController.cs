using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using solevault.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace solevault.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(SoleVaultContext db, IConfiguration config) : ControllerBase
{
    // POST /api/auth/login
    // Тело: { "login": "admin", "password": "admin123" }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Login == req.Login);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Неверный логин или пароль" });

        var token = CreateToken(user.Id, user.FullName, user.Role.Name);

        return Ok(new
        {
            token = token,
            userId = user.Id,
            fullName = user.FullName,
            role = user.Role.Name
        });
    }

    // POST /api/auth/seed — прогнать один раз, чтобы записать BCrypt хэши в БД
    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        var accounts = new Dictionary<string, string>
        {
            { "admin",   "admin123"   },
            { "manager", "manager123" },
            { "client",  "client123"  }
        };

        foreach (var (login, password) in accounts)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Login == login);
            if (user != null)
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Пароли обновлены" });
    }

    private string CreateToken(int userId, string fullName, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.GivenName,      fullName),
            new Claim(ClaimTypes.Role,           role),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest(string Login, string Password);