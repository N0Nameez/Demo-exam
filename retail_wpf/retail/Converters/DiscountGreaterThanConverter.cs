using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Windows.Data;

namespace retail.Converters
{
    public class DiscountGreaterThanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return false;
            if (!int.TryParse(value.ToString(), out int d)) return false;
            int threshold = 15;
            if (parameter != null && int.TryParse(parameter.ToString(), out int p)) threshold = p;
            return d > threshold;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
            => throw new NotImplementedException();
    }
}
