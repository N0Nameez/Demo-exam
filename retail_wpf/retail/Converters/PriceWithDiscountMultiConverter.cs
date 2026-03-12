using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Windows.Data;

namespace retail.Converters
{
    public class PriceWithDiscountMultiConverter : IMultiValueConverter
    {
       
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values == null || values.Length < 1) return string.Empty;
            double price = 0;
            int discount = 0;

            if (values[0] != null && double.TryParse(values[0].ToString(), out var p)) price = p;
            if (values.Length > 1 && values[1] != null && int.TryParse(values[1].ToString(), out var d)) discount = d;

            var final = price;
            if (discount > 0) final = price * (100 - discount) / 100.0;

            return $"{final:N2} ₽";
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
            => throw new NotImplementedException();
    }
}
