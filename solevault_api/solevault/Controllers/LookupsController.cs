using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using solevault.Models;
using System;

namespace solevault.Controllers;

[ApiController]
[Route("api/lookups")]
public class LookupsController(SoleVaultContext db) : ControllerBase
{
    // GET /api/lookups — все справочники для выпадающих списков
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(new
        {
            categories = await db.Categories.Select(c => new { c.Id, c.Name }).ToListAsync(),
            manufacturers = await db.Manufacturers.Select(m => new { m.Id, m.Name }).ToListAsync(),
            suppliers = await db.Suppliers.Select(s => new { s.Id, s.Name }).ToListAsync(),
            orderStatuses = await db.OrderStatuses.Select(s => new { s.Id, s.Name }).ToListAsync(),
        });
    }
}