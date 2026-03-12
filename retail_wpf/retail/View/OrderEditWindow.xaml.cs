using Microsoft.EntityFrameworkCore;
using retail.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace retail.View
{
    /// <summary>
    /// Логика взаимодействия для OrderEditWindow.xaml
    /// </summary>
    public partial class OrderEditWindow : Window
    {
        private Order _order;
        private bool _isNew;

        public OrderEditWindow(Order order = null)
        {
            InitializeComponent();
            _order = order ?? new Order();
            _isNew = order == null;

            LoadComboBoxes();
            LoadOrderData();
        }

        private void LoadComboBoxes()
        {
            using (var db = new RetailDbContext())
            {
                cbxProduct.ItemsSource = db.Products
                    .Where(p => p.StockQuantity > 0)
                    .ToList();

                cbxPickupPoint.ItemsSource = db.PickupPoints.ToList();

                cbxCustomer.ItemsSource = db.Users
                    .ToList();
            }

            cbxStatus.SelectedIndex = 0;

            if (_isNew)
            {
                cbxStatus.IsEnabled = false;
                cbxStatus.SelectedIndex = 0;
            }
        }

        private void LoadOrderData()
        {
            if (!_isNew)
            {
                cbxProduct.SelectedValue = _order.Article;
                txtQuantity.Text = _order.Quantity.ToString();
                dpOrderDate.SelectedDate = _order.OrederDate.ToDateTime(TimeOnly.MinValue);
                dpDeliveryDate.SelectedDate = _order.DeliveryDate.ToDateTime(TimeOnly.MinValue);
                cbxPickupPoint.SelectedValue = _order.PickupPointId;
                cbxCustomer.SelectedItem = (cbxCustomer.ItemsSource as List<User>)
            ?.FirstOrDefault(u => u.UserId == _order.CustomerId);
                txtPickupCode.Text = _order.PickupCode.ToString();

                SetStatus(_order.Status);
            }
            else
            {
                dpOrderDate.SelectedDate = DateTime.Today;
                dpDeliveryDate.SelectedDate = DateTime.Today.AddDays(3);
                txtPickupCode.Text = new Random().Next(100000, 999999).ToString();
            }
        }

        private void SetStatus(string status)
        {
            for (int i = 0; i < cbxStatus.Items.Count; i++)
            {
                var item = (ComboBoxItem)cbxStatus.Items[i];
                if (item.Content.ToString() == status)
                {
                    cbxStatus.SelectedIndex = i;
                    return;
                }
            }
            cbxStatus.SelectedIndex = 0;
        }

        private void Btn_Save_Click(object sender, RoutedEventArgs e)
        {
            if (cbxProduct.SelectedValue == null)
            {
                MessageBox.Show("Выберите товар!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxProduct.Focus();
                return;
            }

            if (!int.TryParse(txtQuantity.Text, out int quantity) || quantity <= 0)
            {
                MessageBox.Show("Введите корректное количество!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtQuantity.Focus();
                return;
            }

            if (dpOrderDate.SelectedDate == null)
            {
                MessageBox.Show("Выберите дату заказа!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                dpOrderDate.Focus();
                return;
            }

            if (dpDeliveryDate.SelectedDate == null)
            {
                MessageBox.Show("Выберите дату доставки!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                dpDeliveryDate.Focus();
                return;
            }

            if (dpDeliveryDate.SelectedDate < dpOrderDate.SelectedDate)
            {
                MessageBox.Show("Дата доставки не может быть раньше даты заказа!",
                    "Ошибка валидации", MessageBoxButton.OK, MessageBoxImage.Warning);
                dpDeliveryDate.Focus();
                return;
            }

            if (cbxPickupPoint.SelectedItem == null)
            {
                MessageBox.Show("Выберите пункт выдачи!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxPickupPoint.Focus();
                return;
            }

            if (cbxCustomer.SelectedValue == null)
            {
                MessageBox.Show("Выберите клиента!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxCustomer.Focus();
                return;
            }

            if (!int.TryParse(txtPickupCode.Text, out int pickupCode) || pickupCode <= 0)
            {
                MessageBox.Show("Введите корректный код выдачи!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtPickupCode.Focus();
                return;
            }

            var statusText = ((ComboBoxItem)cbxStatus.SelectedItem).Content.ToString();
            if (statusText.Length > 20)
            {
                MessageBox.Show("Статус не должен превышать 20 символов!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                using (var db = new RetailDbContext())
                {
                    var product = db.Products.Find(cbxProduct.SelectedValue);
                    if (product == null)
                    {
                        MessageBox.Show("Товар не найден!", "Ошибка",
                            MessageBoxButton.OK, MessageBoxImage.Error);
                        return;
                    }

                    if (!_isNew)
                    {
                        var oldOrder = db.Orders.Find(_order.OrderId);
                        if (oldOrder != null)
                        {
                            product.StockQuantity += oldOrder.Quantity;
                        }
                    }

                    if (product.StockQuantity < quantity)
                    {
                        MessageBox.Show(
                            $"Недостаточно товара на складе! Доступно: {product.StockQuantity}",
                            "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                        return;
                    }

                    var maxId = db.Orders.Max(o => o.OrderId);

                    _order.OrderId = maxId+1;
                    _order.Article = cbxProduct.SelectedValue.ToString();
                    _order.Quantity = quantity;
                    _order.OrederDate = DateOnly.FromDateTime(dpOrderDate.SelectedDate.Value);
                    _order.DeliveryDate = DateOnly.FromDateTime(dpDeliveryDate.SelectedDate.Value);
                    _order.PickupPointId = (int)cbxPickupPoint.SelectedValue;
                    _order.CustomerId = (int)cbxCustomer.SelectedValue;
                    _order.PickupCode = pickupCode;
                    _order.Status = statusText;



                    if (_isNew)
                    {
                        product.StockQuantity -= quantity;
                        db.SaveChanges();
                        db.Orders.Add(_order);
                    }
                    else
                    {
                        var existingOrder = db.Orders.Find(_order.OrderId);
                        if (existingOrder == null)
                        {
                            MessageBox.Show("Заказ не найден!", "Ошибка",
                                MessageBoxButton.OK, MessageBoxImage.Error);
                            return;
                        }

                        db.Entry(existingOrder).CurrentValues.SetValues(_order);
                    }

                    db.SaveChanges();
                }

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка сохранения: {ex.Message}", "Ошибка",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Btn_Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void NumberValidation(object sender, TextCompositionEventArgs e)
        {
            e.Handled = !Regex.IsMatch(e.Text, "^[0-9]*$");
        }
    }
}