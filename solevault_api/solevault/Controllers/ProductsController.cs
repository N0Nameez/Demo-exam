using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using solevault.Models;
using System;

namespace solevault.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(SoleVaultContext db, IWebHostEnvironment env) : ControllerBase
{
    // GET /api/products?search=nike&supplier=ООО СпортОпт&sort=stock_asc
    // Доступен всем, включая гостей
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] string? supplier = null,
        [FromQuery] string? sort = null)
    {
        var query = db.Products
            .Include(p => p.Category)
            .Include(p => p.Manufacturer)
            .Include(p => p.Supplier)
            .AsQueryable();

        // Поиск по нескольким полям сразу
        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                p.Category.Name.ToLower().Contains(q) ||
                p.Manufacturer.Name.ToLower().Contains(q) ||
                p.Supplier.Name.ToLower().Contains(q) ||
                (p.Description != null && p.Description.ToLower().Contains(q))
            );
        }

        if (!string.IsNullOrWhiteSpace(supplier))
            query = query.Where(p => p.Supplier.Name == supplier);

        query = sort switch
        {
            "stock_asc" => query.OrderBy(p => p.Stock),
            "stock_desc" => query.OrderByDescending(p => p.Stock),
            _ => query.OrderBy(p => p.Id)
        };

        var list = await query.ToListAsync();

        return Ok(list.Select(p => new
        {
            p.Id,
            p.Name,
            category = p.Category.Name,
            p.Description,
            manufacturer = p.Manufacturer.Name,
            supplier = p.Supplier.Name,
            p.Price,
            finalPrice = p.Discount > 0 ? Math.Round(p.Price * (1 - p.Discount / 100m), 2) : p.Price,
            p.Unit,
            p.Stock,
            p.Discount,
            imageUrl = p.ImagePath
        }));
    }

    // GET /api/products/5
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Manufacturer)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return NotFound(new { message = "Товар не найден" });

        return Ok(new
        {
            p.Id,
            p.Name,
            category = p.Category.Name,
            p.Description,
            manufacturer = p.Manufacturer.Name,
            supplier = p.Supplier.Name,
            p.Price,
            finalPrice = p.Discount > 0 ? Math.Round(p.Price * (1 - p.Discount / 100m), 2) : p.Price,
            p.Unit,
            p.Stock,
            p.Discount,
            imageUrl = p.ImagePath
        });
    }

    // POST /api/products  — только admin
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] ProductBody body)
    {
        if (body.Price < 0)
            return BadRequest(new { message = "Цена не может быть отрицательной" });
        if (body.Stock < 0)
            return BadRequest(new { message = "Количество не может быть отрицательным" });
        if (body.Discount < 0 || body.Discount > 100)
            return BadRequest(new { message = "Скидка должна быть от 0 до 100" });

        var product = new Product
        {
            Name = body.Name,
            CategoryId = body.CategoryId,
            Description = body.Description,
            ManufacturerId = body.ManufacturerId,
            SupplierId = body.SupplierId,
            Price = body.Price,
            Unit = body.Unit,
            Stock = body.Stock,
            Discount = body.Discount,
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();
        return Ok(new { message = "Товар добавлен", id = product.Id });
    }

    // PUT /api/products/5  — только admin
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductBody body)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Товар не найден" });

        if (body.Price < 0) return BadRequest(new { message = "Цена не может быть отрицательной" });
        if (body.Stock < 0) return BadRequest(new { message = "Количество не может быть отрицательным" });

        product.Name = body.Name;
        product.CategoryId = body.CategoryId;
        product.Description = body.Description;
        product.ManufacturerId = body.ManufacturerId;
        product.SupplierId = body.SupplierId;
        product.Price = body.Price;
        product.Unit = body.Unit;
        product.Stock = body.Stock;
        product.Discount = body.Discount;

        await db.SaveChangesAsync();
        return Ok(new { message = "Товар обновлён" });
    }

    // POST /api/products/5/image  — только admin
    [HttpPost("{id}/image")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Товар не найден" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Файл не выбран" });

        // Удаляем старое фото
        if (!string.IsNullOrEmpty(product.ImagePath))
        {
            var oldPath = Path.Combine(env.WebRootPath, product.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        // Сохраняем новое в wwwroot/images
        var folder = Path.Combine(env.WebRootPath, "images");
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var savePath = Path.Combine(folder, fileName);

        await using var stream = System.IO.File.Create(savePath);
        await file.CopyToAsync(stream);

        product.ImagePath = $"/images/{fileName}";
        await db.SaveChangesAsync();
        return Ok(new { imageUrl = product.ImagePath });
    }

    // DELETE /api/products/5  — только admin
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Товар не найден" });

        var inOrder = await db.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (inOrder)
            return BadRequest(new { message = $"Нельзя удалить «{product.Name}» — товар есть в заказах" });

        if (!string.IsNullOrEmpty(product.ImagePath))
        {
            var imgPath = Path.Combine(env.WebRootPath, product.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(imgPath))
                System.IO.File.Delete(imgPath);
        }

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Ok(new { message = $"Товар «{product.Name}» удалён" });
    }
}

public record ProductBody(
    string Name,
    int CategoryId,
    string? Description,
    int ManufacturerId,
    int SupplierId,
    decimal Price,
    string Unit,
    int Stock,
    int Discount
);