using System;
using System.Collections.Generic;

namespace solevault.Models;

public partial class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int CategoryId { get; set; }

    public string? Description { get; set; }

    public int ManufacturerId { get; set; }

    public int SupplierId { get; set; }

    public decimal Price { get; set; }

    public string Unit { get; set; } = null!;

    public int Stock { get; set; }

    public int Discount { get; set; }

    public string? ImagePath { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Manufacturer Manufacturer { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual Supplier Supplier { get; set; } = null!;
}
