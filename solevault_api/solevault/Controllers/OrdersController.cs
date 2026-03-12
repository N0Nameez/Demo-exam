using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using solevault.Models;
using System;
using System.Security.Claims;

namespace solevault.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(SoleVaultContext db) : ControllerBase
{
    // GET /api/orders
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = db.Orders
            .Include(o => o.Status)
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .AsQueryable();

        if (role == "client")
            query = query.Where(o => o.ClientId == userId);

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

        return Ok(orders.Select(o => new
        {
            o.Id,
            o.Article,
            status = o.Status.Name,
            o.Address,
            orderDate = o.OrderDate,
            deliveryDate = o.DeliveryDate,
            clientName = o.Client?.FullName,
            items = o.Items.Select(i => new
            {
                i.ProductId,
                productName = i.Product.Name,
                i.Quantity,
                i.PriceAtOrder,
                lineTotal = i.PriceAtOrder * i.Quantity
            }),
            totalAmount = o.Items.Sum(i => i.PriceAtOrder * i.Quantity)
        }));
    }

    // GET /api/orders/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var o = await db.Orders
            .Include(o => o.Status)
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (o == null) return NotFound(new { message = "Заказ не найден" });

        return Ok(new
        {
            o.Id,
            o.Article,
            status = o.Status.Name,
            o.Address,
            orderDate = o.OrderDate,
            deliveryDate = o.DeliveryDate,
            clientName = o.Client?.FullName,
            items = o.Items.Select(i => new
            {
                i.ProductId,
                productName = i.Product.Name,
                i.Quantity,
                i.PriceAtOrder,
                lineTotal = i.PriceAtOrder * i.Quantity
            }),
            totalAmount = o.Items.Sum(i => i.PriceAtOrder * i.Quantity)
        });
    }

    // POST /api/orders  — admin или client
    [HttpPost]
    [Authorize(Roles = "admin,client")]
    public async Task<IActionResult> Create([FromBody] OrderCreateBody body)
    {
        if (string.IsNullOrWhiteSpace(body.Address))
            return BadRequest(new { message = "Укажите адрес пункта выдачи" });
        if (body.Items == null || body.Items.Count == 0)
            return BadRequest(new { message = "Добавьте хотя бы один товар" });

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var clientId = role == "client" ? userId : body.ClientId;

        // ── Сначала проверяем остатки по ВСЕМ позициям ─────────────────
        foreach (var item in body.Items)
        {
            if (item.Quantity <= 0)
                return BadRequest(new { message = $"Количество товара ID={item.ProductId} должно быть больше 0" });

            var product = await db.Products.FindAsync(item.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Товар ID={item.ProductId} не найден" });

            if (product.Stock < item.Quantity)
                return BadRequest(new
                {
                    message = $"Недостаточно товара «{product.Name}» на складе. " +
                              $"Запрошено: {item.Quantity} {product.Unit}, " +
                              $"доступно: {product.Stock} {product.Unit}"
                });
        }

        // ── Всё проверено — создаём заказ ───────────────────────────────
        var lastId = await db.Orders.MaxAsync(o => (int?)o.Id) ?? 0;
        var article = $"ORD-{(lastId + 1):D3}";

        var order = new Order
        {
            Article = article,
            StatusId = body.StatusId,
            Address = body.Address,
            OrderDate = body.OrderDate,
            DeliveryDate = body.DeliveryDate,
            ClientId = clientId,
        };

        foreach (var item in body.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);

            var finalPrice = product!.Discount > 0
                ? Math.Round(product.Price * (1 - product.Discount / 100m), 2)
                : product.Price;

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                PriceAtOrder = finalPrice,
            });

            // ← Списываем остаток на складе
            product.Stock -= item.Quantity;
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync(); // сохраняем заказ + обновлённые остатки

        return Ok(new { message = "Заказ создан", id = order.Id, article = order.Article });
    }

    // PUT /api/orders/5  — только admin
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] OrderUpdateBody body)
    {
        var order = await db.Orders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Заказ не найден" });

        order.StatusId = body.StatusId;
        order.Address = body.Address;
        order.OrderDate = body.OrderDate;
        order.DeliveryDate = body.DeliveryDate;

        await db.SaveChangesAsync();
        return Ok(new { message = "Заказ обновлён" });
    }

    // DELETE /api/orders/5  — только admin
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await db.Orders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Заказ не найден" });

        db.Orders.Remove(order);
        await db.SaveChangesAsync();
        return Ok(new { message = $"Заказ {order.Article} удалён" });
    }
}

public record OrderItemBody(int ProductId, int Quantity);

public record OrderCreateBody(
    int StatusId,
    string Address,
    DateOnly OrderDate,
    DateOnly? DeliveryDate,
    int? ClientId,
    List<OrderItemBody> Items
);

public record OrderUpdateBody(
    int StatusId,
    string Address,
    DateOnly OrderDate,
    DateOnly? DeliveryDate
);