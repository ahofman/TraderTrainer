using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TraderTrainer.WebUI.Models
{
    public class StockDataModel
    {
        public string Symbol { get; set; }
        public IEnumerable<StockEodLine> Lines { get; set; }

        public int MaxVolume
        {
            get
            {
                int result = 0;
                foreach(var l in Lines)
                {
                    result = Math.Max(result, l.Volume);
                }
                return result;
            }
        }

        public decimal MinValue
        {
            get
            {
                decimal result = decimal.MaxValue;
                foreach(var l in Lines )
                {
                    result = Math.Min(l.Low, result);
                }
                return result;
            }
        }

        public decimal MaxValue
        {
            get
            {
                decimal result = decimal.MinValue;
                foreach (var l in Lines)
                {
                    result = Math.Max(l.High, result);
                }
                return result;
            }
        }
    }
}