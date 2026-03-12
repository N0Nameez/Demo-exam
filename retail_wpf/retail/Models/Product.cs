using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace retail.Models;

public partial class Product
{
    public string Article { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public float Price { get; set; }

    public int SupplierId { get; set; }

    public int ManufacturerId { get; set; }

    public int CategoryId { get; set; }

    public int? CurrentDiscount { get; set; }

    public int StockQuantity { get; set; }

    public string? Description { get; set; }

    public byte[]? Photo { get; set; }

    public virtual ProductCategory Category { get; set; } = null!;

    public virtual Manufacturer Manufacturer { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Supplier Supplier { get; set; } = null!;

    [NotMapped]
    public double? DiscountPercent
    {
        get => CurrentDiscount.HasValue ? CurrentDiscount.Value / 100.0 : null;
    }

    [NotMapped]
    public string CategoryAndName =>
        $"{Category?.CategoryName ?? "Без категории"} | {ProductName}";
}
