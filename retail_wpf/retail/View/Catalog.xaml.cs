using Microsoft.EntityFrameworkCore;
using retail.Models;
using retail.Models;
using retail.View;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace retail
{
    /// <summary>
    /// Логика взаимодействия для Catalog.xaml
    /// </summary>
    public partial class Catalog : Window
    {

        public ObservableCollection<Product> ProductList { get; set; }
        public ObservableCollection<Order> OrderList { get; set; }
        public ObservableCollection<ProductCategory> CategoryList { get; set; }

        public ICollectionView ProductView { get; set; }

        private User _user;

        public Catalog()
        {
            InitializeComponent();

            DataContext = this;

            ProductList = new ObservableCollection<Product>();
            CategoryList = new ObservableCollection<ProductCategory>();

            LoadProduct();
            InitializeProductView();
            product_lv.ItemsSource = ProductView;

            LoadCategories();

            lblUserFullName.Text = "Гость";
        }

        public Catalog(User user)
        {
            InitializeComponent();

            _user = user;

            DataContext = this;

            ProductList = new ObservableCollection<Product>();
            CategoryList = new ObservableCollection<ProductCategory>();

            LoadProduct();
            InitializeProductView();
            product_lv.ItemsSource = ProductView;

            LoadCategories();

            CheckRole();

            if (user != null)
            {
                lblUserFullName.Text = $"{user.Surname} {user.Name} {user.Patronimyc}";
            }
            else
            {
                lblUserFullName.Text = "Гость";
            }
        }

        private void CheckRole()
        {
            if (_user.Role != "Авторизированный клиент")
                sort_grid.Visibility = Visibility.Visible;

            if (_user.Role == "Администратор")
            {
                OrderList = new ObservableCollection<Order>();

                LoadOrder();

                Order_tab.Visibility = Visibility.Visible;
                add_btn.Visibility = Visibility.Visible;
            }
        }

        private void InitializeProductView()
        {
            ProductView = CollectionViewSource.GetDefaultView(ProductList);
            ProductView.Filter = ProductFilter;
        }

        private void LoadOrder()
        {
            using (var db = new RetailDbContext())
            {
                var orders = db.Orders.OrderByDescending(o => o.OrederDate)
                    .Include(o => o.ArticleNavigation)
                    .Include(o => o.Customer)
                    .Include(o => o.PickupPoint)
                    .ToList();

                foreach (var order in orders)
                {
                    OrderList.Add(order);
                }



            }
        }

        private void LoadProduct()
        {
            using (var db = new RetailDbContext())
            {
                 var products = db.Products
                    .Include(p => p.Category)
                    .Include(p => p.Manufacturer)
                    .Include(p => p.Supplier)
                    .ToList();

                foreach (var product in products)
                {
                    ProductList.Add(product);
                }
            }
        }

        private void LoadCategories()
        {
            using (var db = new RetailDbContext())
            {
                var categories = db.ProductCategories.ToList();

                CategoryList.Add(new ProductCategory
                {
                    CategoryId = 0,
                    CategoryName = "Все категории"
                });

                foreach (var category in categories)
                {
                    CategoryList.Add(category);
                }
            }

            filter_cbx.ItemsSource = CategoryList;
            filter_cbx.DisplayMemberPath = "CategoryName";
            filter_cbx.SelectedValuePath = "CategoryId";
            filter_cbx.SelectedIndex = 0;
        }

        private bool ProductFilter(object item)
        {
            Product product = item as Product;
            if (product == null)
                return false;

            if (!string.IsNullOrEmpty(txtSearch?.Text))
            {
                if (!product.ProductName.Contains(txtSearch.Text, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            if (filter_cbx?.SelectedValue != null)
            {
                int selectedCategoryId = Convert.ToInt32(filter_cbx.SelectedValue);

                if (selectedCategoryId != 0 && product.CategoryId != selectedCategoryId)
                    return false;
            }

            return true;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            ProductView?.Refresh();

            if (ProductView.IsEmpty)
                unknown_tbx.Visibility = Visibility.Visible;
            else
                unknown_tbx.Visibility = Visibility.Collapsed;
        }

        private void filter_cbx_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ProductView?.Refresh();
        }

        private void sort_cbx_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ProductView == null) return;

            ProductView.SortDescriptions.Clear();

            if (sort_cbx.SelectedIndex < 0) return;

            switch (sort_cbx.SelectedIndex)
            {
                case 0:
                    ProductView.SortDescriptions.Add(
                        new SortDescription("Price", ListSortDirection.Ascending));
                    break;

                case 1:
                    ProductView.SortDescriptions.Add(
                        new SortDescription("Price", ListSortDirection.Descending));
                    break;

                case 2:
                    ProductView.SortDescriptions.Add(
                        new SortDescription("StockQuantity", ListSortDirection.Ascending));
                    break;

                case 3:
                    ProductView.SortDescriptions.Add(
                        new SortDescription("StockQuantity", ListSortDirection.Descending));
                    break;
            }
        }

        private bool IsEditWindowOpen()
        {
            var windows = Application.Current.Windows;
            foreach (Window w in windows)
            {
                if (w is View.ProductEditWindow && w.IsVisible) return true;
                if (w is View.OrderEditWindow && w.IsVisible) return true;
            }
            return false;
        }

        private void Btn_AddProduct_Click(object sender, RoutedEventArgs e)
        {
            if (IsEditWindowOpen())
            {
                MessageBox.Show("Окно редактирования уже открыто.", "Внимание", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var editWindow = new ProductEditWindow();
            editWindow.Owner = this;
            editWindow.ShowDialog();

            if (editWindow.DialogResult == true)
            {
                RefreshProducts();
            }
        }

        private void MenuItem_EditProduct_Click(object sender, RoutedEventArgs e)
        {
            if (IsEditWindowOpen())
            {
                MessageBox.Show("Окно редактирования уже открыто.", "Внимание", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            if (product_lv.SelectedItem is Product product)
            {
                var editWindow = new ProductEditWindow(product);
                editWindow.Owner = this;
                editWindow.ShowDialog();

                if (editWindow.DialogResult == true)
                {
                    RefreshProducts();
                }
            }
            else
            {
                MessageBox.Show("Выберите товар для редактирования!", "Внимание",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void MenuItem_DeleteProduct_Click(object sender, RoutedEventArgs e)
        {
            if (product_lv.SelectedItem is Product product)
            {
                var result = MessageBox.Show(
                    $"Вы уверены, что хотите удалить товар \"{product.ProductName}\"?",
                    "Подтверждение удаления",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result == MessageBoxResult.Yes)
                {
                    using (var db = new RetailDbContext())
                    {
                        var productToDelete = db.Products.Find(product.Article);
                        if (productToDelete != null)
                        {
                            var hasOrders = db.Orders.Any(o => o.Article == product.Article);
                            if (hasOrders)
                            {
                                MessageBox.Show("Невозможно удалить товар: он присутствует в заказах.",
                                    "Ошибка удаления", MessageBoxButton.OK, MessageBoxImage.Warning);
                                return;
                            }

                            db.Products.Remove(productToDelete);
                            db.SaveChanges();
                        }
                    }

                    RefreshProducts();
                }
            }
            else
            {
                MessageBox.Show("Выберите товар для удаления!", "Внимание",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void Btn_AddOrder_Click(object sender, RoutedEventArgs e)
        {
            if (IsEditWindowOpen())
            {
                MessageBox.Show("Окно редактирования уже открыто.", "Внимание", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var editWindow = new OrderEditWindow(null);
            editWindow.Owner = this;
            editWindow.ShowDialog();

            if (editWindow.DialogResult == true)
            {
                RefreshOrders();
            }
        }

        private void MenuItem_EditOrder_Click(object sender, RoutedEventArgs e)
        {
            if (IsEditWindowOpen())
            {
                MessageBox.Show("Окно редактирования уже открыто.", "Внимание", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            if (orders_lv.SelectedItem is Order order)
            {
                var editWindow = new OrderEditWindow(order);
                editWindow.Owner = this;
                editWindow.ShowDialog();

                if (editWindow.DialogResult == true)
                {
                    RefreshOrders();
                }
            }
            else
            {
                MessageBox.Show("Выберите заказ для редактирования!", "Внимание",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void MenuItem_DeleteOrder_Click(object sender, RoutedEventArgs e)
        {
            if (orders_lv.SelectedItem is Order order)
            {
                var result = MessageBox.Show(
                    $"Вы уверены, что хотите удалить заказ №{order.OrderId}?",
                    "Подтверждение удаления",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result == MessageBoxResult.Yes)
                {
                    using (var db = new RetailDbContext())
                    {
                        var orderToDelete = db.Orders.Find(order.OrderId);
                        if (orderToDelete != null)
                        {
                            db.Orders.Remove(orderToDelete);
                            db.SaveChanges();
                        }
                    }

                    RefreshOrders();
                }
            }
            else
            {
                MessageBox.Show("Выберите заказ для удаления!", "Внимание",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void Btn_Logout_Click(object sender, RoutedEventArgs e)
        {
            var main = new MainWindow();
            main.Show();
            this.Close();
        }

        public void RefreshProducts()
        {
            ProductList.Clear();
            LoadProduct();
            ProductView?.Refresh();
        }

        public void RefreshOrders()
        {
            OrderList?.Clear();
            LoadOrder();
        }
    }
}
