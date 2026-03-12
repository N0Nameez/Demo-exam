using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace retail.Models;

public partial class PickupPoint
{
    public int PointId { get; set; }

    public string PostalCode { get; set; } = null!;

    public string City { get; set; } = null!;

    public string Street { get; set; } = null!;

    public string? Building { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [NotMapped]
    public string Address =>
        $"{City}  {Street}  {Building}";
}
