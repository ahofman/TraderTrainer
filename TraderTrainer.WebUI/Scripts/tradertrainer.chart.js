
function Chart(canvas, chartRect) {
    this.canvas = canvas;
    this.chartRect = chartRect;
}

Chart.prototype.drawAxes = function () {
    'use strict';

    var context2d = this.canvas.getContext("2d");

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    context2d.moveTo(ttc_roundToHalf(this.chartRect.left), ttc_roundToHalf(this.chartRect.top));
    context2d.lineTo(ttc_roundToHalf(this.chartRect.left), ttc_roundToHalf(this.chartRect.bottom));
    context2d.lineTo(ttc_roundToHalf(this.chartRect.right), ttc_roundToHalf(this.chartRect.bottom));
    context2d.stroke();
}

Chart.prototype.drawAll = function (stock) {
    'use strict';

    var ctx = this.canvas.getContext("2d");

    ctx.clearRect(this.chartRect.left, this.chartRect.top, this.chartRect.right - this.chartRect.left, this.chartRect.bottom - this.chartRect.top);

    ttc_drawAxes(ctx, this.chartRect);

    ctx.save();
    ttc_clipRect(ctx, this.chartRect);

    chartRange = ttc_getHighLowRange(highPrices, lowPrices, currentDay, daysVisible);

    ttc_drawHorizontalGridLines(ctx, this.chartRect, chartRange.minValue, chartRange.maxValue, 1);

    chartRange.valueRange = chartRange.maxValue - chartRange.minValue;

    ttc_drawCandlestickSeries(ctx, this.chartRect, openPrices, highPrices, lowPrices, closePrices, currentDay, daysVisible, daysVisible, chartRange.minValue, chartRange.maxValue);

    ttc_drawLineSeries(ctx, this.chartRect, closePrices, currentDay, daysVisible, daysVisible, chartRange.minValue, chartRange.maxValue);

    ctx.restore();

}


function ttc_getRectFromElement(el, padding) {
    'use strict';
    return {
        left: padding,
        right: el.width - padding,
        top: padding,
        bottom: el.height - padding
    };
}

function ttc_clipRect(context2d, rect) {
    'use strict';

    context2d.beginPath();
    context2d.moveTo(rect.left, rect.top);
    context2d.lineTo(rect.left, rect.bottom);
    context2d.lineTo(rect.right, rect.bottom);
    context2d.lineTo(rect.right, rect.top);
    context2d.closePath();
    context2d.clip();
}

function ttc_roundToHalf(val) {
    return Math.round(val) - 0.5;
}

Chart.prototype.drawHorizontalGridLines = function(minDataValue,
    maxDataValue,
    interval) {
    'use strict';

    var context2d = this.canvas.getContext("2d");

    var dataValueRange = maxDataValue - minDataValue;
    var rectVerticalRange = this.chartRect.bottom - this.chartRect.top;
    var intervalNormalized = interval / dataValueRange;
    var intervalPixels = intervalNormalized * rectVerticalRange;
    var lineValue = maxDataValue - (maxDataValue % interval);

    var lineValueNormalized; 
    var lineValueY;

    do {
        lineValueNormalized = (lineValue - minDataValue) / dataValueRange;
        lineValueY = ttc_roundToHalf((this.chartRect.bottom - lineValueNormalized * rectVerticalRange));

        context2d.beginPath();
        context2d.lineWidth = 1;
        context2d.strokeStyle = "#888888";
        context2d.moveTo(this.chartRect.left, lineValueY);
        context2d.lineTo(this.chartRect.right, lineValueY);
        context2d.stroke();

        context2d.fillText(lineValue, this.chartRect.left, lineValueY);

        lineValue -= interval;
    } while (lineValue > minDataValue);
 
}

Chart.prototype.drawLineSeries = function(dataSeries, 
    index, 
    count, 
    dataCount,
    minDataValue, 
    maxDataValue) {
    'use strict';

    var context2d = this.canvas.getContext("2d");

    var dataValueRange = maxDataValue - minDataValue;
    var firstValueNormalized = (dataSeries[index] - minDataValue) / dataValueRange;
    var rectVerticalRange = this.chartRect.bottom - this.chartRect.top;
    var i;
    var datumWidthPixels = (this.chartRect.right - this.chartRect.left) / dataCount;

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    
    context2d.moveTo(this.chartRect.left, ttc_roundToHalf(this.chartRect.bottom - (firstValueNormalized * rectVerticalRange)));

    for (i = 1; i < count; ++i) {
        var valueNormalized = (dataSeries[i + index] - minDataValue) / dataValueRange;
        context2d.lineTo(this.chartRect.left + datumWidthPixels * i, ttc_roundToHalf(this.chartRect.bottom - (valueNormalized * rectVerticalRange)));
    }

    context2d.stroke();
}

function ttc_drawCandlestickSeries( context2d, 
    rect,
    openSeries,
    highSeries,
    lowSeries,
    closeSeries,
    index,
    count,
    dataCount,
    minDataValue,
    maxDataValue ) {
    'use strict';

    var dataValueRange = maxDataValue - minDataValue;
    var rectVerticalRange = rect.bottom - rect.top;
    var datumWidthPixels = (rect.right - rect.left) / dataCount;
    var i;

    function normalizeValue( val ) {
        return (val - minDataValue) / dataValueRange;
    }

    for (i = 0; i < count; ++i) {
        var normalizedOpenValue = normalizeValue( openSeries[i + index] );
        var normalizedCloseValue = normalizeValue( closeSeries[i + index] );
        var normalizedHighValue = normalizeValue( highSeries[i + index] );
        var normalizedLowValue = normalizeValue(lowSeries[i + index]);

        var candleBodyY = rect.bottom - Math.max(normalizedCloseValue, normalizedOpenValue) * rectVerticalRange;
        var candleHeight = Math.abs(normalizedCloseValue - normalizedOpenValue) * rectVerticalRange;

        var startX = i * datumWidthPixels;

        context2d.fillStyle = normalizedCloseValue > normalizedOpenValue ? "#229922" : "#992222";
        context2d.fillRect(startX + 1, ttc_roundToHalf(candleBodyY), datumWidthPixels - 2, candleHeight);

        var wickX = ttc_roundToHalf(startX + datumWidthPixels / 2);
        context2d.lineWidth = 1;
      
        context2d.strokeStyle = "#111111";

        // top wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY));
        context2d.lineTo(wickX, ttc_roundToHalf(rect.bottom - (normalizedHighValue * rectVerticalRange)));
        context2d.stroke();

        // bottom wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY + candleHeight));
        context2d.lineTo(wickX, ttc_roundToHalf(rect.bottom - (normalizedLowValue * rectVerticalRange)));
        context2d.stroke();
    }
}

function ttc_drawColumnSeries(context2d,
    rect,
    dataSeries,
    index,
    count,
    dataCount,
    minDataValue,
    maxDataValue) {
    'use strict';

    var dataValueRange = maxDataValue - minDataValue;
    var rectVerticalRange = rect.bottom - rect.top;
    var i;
    var datumWidthPixels = (rect.right - rect.left) / dataCount;

    for (i = 0; i < count; ++i) {
        var t = (dataSeries[i + index] - minDataValue) / dataValueRange;
        context2d.beginPath();
        context2d.lineWidth = datumWidthPixels - 2;
        context2d.strokeStyle = "#111111";
       
        context2d.moveTo(rect.left + i * datumWidthPixels, rect.bottom);
        context2d.lineTo(rect.left + i * datumWidthPixels, rect.bottom - (t * rectVerticalRange));
        context2d.stroke();
    }
}

