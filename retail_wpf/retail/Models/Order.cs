using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace retail.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public string Article { get; set; } = null!;

    public int Quantity { get; set; }

    public DateOnly OrederDate { get; set; }

    public DateOnly DeliveryDate { get; set; }

    public int PickupPointId { get; set; }

    public int CustomerId { get; set; }

    public int PickupCode { get; set; }

    public string Status { get; set; } = null!;

    public virtual Product ArticleNavigation { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;

    public virtual PickupPoint PickupPoint { get; set; } = null!;
}
