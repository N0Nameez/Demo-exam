using System;
using System.Collections.Generic;

namespace solevault.Models;

public partial class Order
{
    public int Id { get; set; }

    public string Article { get; set; } = null!;

    public int StatusId { get; set; }

    public string Address { get; set; } = null!;

    public DateOnly OrderDate { get; set; }

    public DateOnly? DeliveryDate { get; set; }

    public int? ClientId { get; set; }

    public virtual User? Client { get; set; }
    
    public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public virtual OrderStatus Status { get; set; } = null!;
}
