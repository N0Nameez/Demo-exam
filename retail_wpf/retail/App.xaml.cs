using System.Configuration;
using System.Data;
using System.Windows;

namespace retail
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {

        public static string ConnectionString = "Server=10.0.2.2;Port=3306;Database=retail_db;User Id=wpf_user;Password=1234;SslMode=None";

    }

}
