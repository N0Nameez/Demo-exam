using Microsoft.Win32;
using retail.Models;
using System;
using System.Collections.Generic;
using System.IO;
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
using System.Xml.Linq;

namespace retail.View
{
    /// <summary>
    /// Логика взаимодействия для ProductEditWindow.xaml
    /// </summary>
    public partial class ProductEditWindow : Window
    {
        private Product _product;
        private bool _isNew;
        private byte[] _photoBytes;
        private readonly string _defaultPhotoPath;

        public bool IsNew => _isNew;

        public ProductEditWindow(Product product)
        {
            InitializeComponent();
            _product = product ?? new Product();
            _isNew = product == null;
            _defaultPhotoPath = "Resources/Picture.png";

            DataContext = this;

            LoadComboBoxes();
            LoadProductData();
        }

        public ProductEditWindow()
        {
            InitializeComponent();
            _defaultPhotoPath = "Resources/Picture.png";
            _isNew = true;

            DataContext = this;

            LoadComboBoxes();
            LoadProductData();
        }

        private void LoadComboBoxes()
        {
            using (var db = new RetailDbContext())
            {
                cbxCategory.ItemsSource = db.ProductCategories.ToList();
                cbxManufacturer.ItemsSource = db.Manufacturers.ToList();
                cbxSupplier.ItemsSource = db.Suppliers.ToList();
            }
        }

        private void LoadProductData()
        {
            if (!_isNew)
            {
                txtArticle.Text = _product.Article;
                txtProductName.Text = _product.ProductName;
                cbxUnit.Text = _product.Unit ?? "шт.";
                cbxCategory.SelectedValue = _product.CategoryId;
                cbxManufacturer.SelectedValue = _product.ManufacturerId;
                cbxSupplier.SelectedValue = _product.SupplierId;
                txtPrice.Text = _product.Price.ToString();
                txtStockQuantity.Text = _product.StockQuantity.ToString();
                txtDiscount.Text = _product.CurrentDiscount?.ToString() ?? "0";
                txtDescription.Text = _product.Description ?? string.Empty;

                if (_product.Photo != null && _product.Photo.Length > 0)
                {
                    _photoBytes = _product.Photo;
                    DisplayPhoto(_photoBytes);
                }
                else
                {
                    LoadDefaultPhoto();
                }
            }
            else
            {
                cbxUnit.Text = "шт.";
                LoadDefaultPhoto();
            }
        }

        private void LoadDefaultPhoto()
        {
            if (File.Exists(_defaultPhotoPath))
            {
                _photoBytes = File.ReadAllBytes(_defaultPhotoPath);
                DisplayPhoto(_photoBytes);
            }
        }

        private void DisplayPhoto(byte[] photoData)
        {
            try
            {
                var bitmap = new BitmapImage();
                bitmap.BeginInit();
                bitmap.StreamSource = new MemoryStream(photoData);
                bitmap.CacheOption = BitmapCacheOption.OnLoad;
                bitmap.EndInit();
                bitmap.Freeze();

                if (bitmap.Height > 300)
                {
                    MessageBox.Show("Разрешение должно быть 300х200");
                    return;
                }
                if (bitmap.Width > 200)
                {
                    MessageBox.Show("Разрешение должно быть 300х200");
                    return;
                }

                imgPreview.Source = bitmap;
            }
            catch
            {
                LoadDefaultPhoto();
            }
        }

        private void Btn_Save_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtArticle.Text))
            {
                MessageBox.Show("Введите артикул!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtArticle.Focus();
                return;
            }

            if (txtArticle.Text.Length > 20)
            {
                MessageBox.Show("Артикул не должен превышать 20 символов!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtArticle.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(txtProductName.Text))
            {
                MessageBox.Show("Введите название товара!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtProductName.Focus();
                return;
            }

            if (string.IsNullOrWhiteSpace(cbxUnit.Text))
            {
                MessageBox.Show("Введите единицу измерения!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxUnit.Focus();
                return;
            }

            if (cbxUnit.Text.Length > 10)
            {
                MessageBox.Show("Единица измерения не должна превышать 10 символов!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxUnit.Focus();
                return;
            }

            if (!float.TryParse(txtPrice.Text, out float price) || price <= 0)
            {
                MessageBox.Show("Введите корректную цену!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtPrice.Focus();
                return;
            }

            if (!int.TryParse(txtStockQuantity.Text, out int quantity) || quantity <= 0)
            {
                MessageBox.Show("Введите корректное количество!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtStockQuantity.Focus();
                return;
            }

            if (!int.TryParse(txtDiscount.Text, out int discount) || discount <= 0 || discount >= 99)
            {
                MessageBox.Show("Введите корректную скидку (1-99)!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                txtDiscount.Focus();
                return;
            }

            if (cbxCategory.SelectedValue == null)
            {
                MessageBox.Show("Выберите категорию!", "Ошибка валидации",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                cbxCategory.Focus();
                return;
            }

            try
            {
                using (var db = new RetailDbContext())
                {
                    if (_isNew)
                    {
                        var existingProduct = db.Products.Find(txtArticle.Text);
                        if (existingProduct != null)
                        {
                            MessageBox.Show("Товар с таким артикулом уже существует!", "Ошибка",
                                MessageBoxButton.OK, MessageBoxImage.Error);
                            txtArticle.Focus();
                            return;
                        }

                        _product = new Product
                        {
                            Article = txtArticle.Text,
                            ProductName = txtProductName.Text,
                            Unit = cbxUnit.Text,
                            CategoryId = (int)cbxCategory.SelectedValue,
                            ManufacturerId = (int)cbxManufacturer.SelectedValue,
                            SupplierId = (int)cbxSupplier.SelectedValue,
                            Price = price,
                            StockQuantity = quantity,
                            CurrentDiscount = discount,
                            Description = txtDescription.Text,
                            Photo = _photoBytes
                        };

                        db.Products.Add(_product);
                    }
                    else
                    {
                        var existingProduct = db.Products.Find(_product.Article);
                        if (existingProduct == null)
                        {
                            MessageBox.Show("Товар не найден!", "Ошибка",
                                MessageBoxButton.OK, MessageBoxImage.Error);
                            return;
                        }

                        existingProduct.ProductName = txtProductName.Text;
                        existingProduct.Unit = cbxUnit.Text;
                        existingProduct.CategoryId = (int)cbxCategory.SelectedValue;
                        existingProduct.ManufacturerId = (int)cbxManufacturer.SelectedValue;
                        existingProduct.SupplierId = (int)cbxSupplier.SelectedValue;
                        existingProduct.Price = price;
                        existingProduct.StockQuantity = quantity;
                        existingProduct.CurrentDiscount = discount;
                        existingProduct.Description = txtDescription.Text;
                        existingProduct.Photo = _photoBytes;
                    }

                    db.SaveChanges();

                    MessageBox.Show("Товар успешно сохранён",
                    "Сохранение", MessageBoxButton.OK, MessageBoxImage.Information);
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

        private void Btn_SelectPhoto_Click(object sender, RoutedEventArgs e)
        {
            var openFileDialog = new OpenFileDialog
            {
                Filter = "Изображения|*.jpg;*.jpeg;*.png;*.bmp;*.gif|Все файлы|*.*",
                Title = "Выберите изображение товара"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                _photoBytes = File.ReadAllBytes(openFileDialog.FileName);
                DisplayPhoto(_photoBytes);
            }
        }

        private void Btn_RemovePhoto_Click(object sender, RoutedEventArgs e)
        {
            _photoBytes = null;
            imgPreview.Source = null;
            LoadDefaultPhoto();
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
