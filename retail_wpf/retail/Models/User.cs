using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace retail.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Role { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Surname { get; set; } = null!;

    public string Patronimyc { get; set; } = null!;

    public string Login { get; set; } = null!;

    public string Password { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [NotMapped]

    public string FullName =>
        $"{Surname} {Name} {Patronimyc}";
}
