using retail.Models;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace retail
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Guest_BTN_Click(object sender, RoutedEventArgs e)
        {
            Catalog catalog = new Catalog();
            catalog.Show();
            this.Close();
        }

        private void Auth_BTN_Click(object sender, RoutedEventArgs e)
        {
            string login = Login_TBX.Text;
            string pass = Pass_TBX.Text;

            if (string.IsNullOrEmpty(login) ||  string.IsNullOrEmpty(pass))
            {
                MessageBox.Show("Введите логин и пароль!");
                return;
            }

            using (var db = new RetailDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.Login == login);

                if (user == null)
                {
                    MessageBox.Show("Пользователь не найден!");
                    return;
                }

                if (user.Password != pass)
                {
                    MessageBox.Show("Неверный пароль");
                    return;
                }

                MessageBox.Show("Успешная авторизация!");

                Catalog catalog = new Catalog(user);
                catalog.Show();
                this.Close();
            }
        }
    }
}