
function Chart(canvas, chartRect) {
    this.canvas = canvas;
    this.chartRect = {
        left: chartRect.left,
        right: chartRect.right,
        top: chartRect.top,
        bottom: chartRect.bottom
    };
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

Chart.prototype.setClip = function () {
    'use strict';

    var context2d = this.canvas.getContext("2d"),
        rect = this.chartRect;

    context2d.save();

    context2d.beginPath();
    context2d.moveTo(rect.left, rect.top);
    context2d.lineTo(rect.left, rect.bottom);
    context2d.lineTo(rect.right, rect.bottom);
    context2d.lineTo(rect.right, rect.top);
    context2d.closePath();
    context2d.clip();
}

Chart.prototype.clearClip = function () {
    'use strict';

    var context2d = this.canvas.getContext("2d");

    context2d.restore();
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

Chart.prototype.drawCloseLineSeries = function(stock, 
    index, 
    count, 
    dataCount,
    stockRange) {
    'use strict';

    if (stockRange == undefined) {
        stockRange = stock.getHighLowRange(index, count);
    }

    var context2d = this.canvas.getContext("2d");

    var firstValueNormalized = (stock.closePrices[index] - stockRange.minValue) / stockRange.range;
    var rectVerticalRange = this.chartRect.bottom - this.chartRect.top;
    var i;
    var datumWidthPixels = (this.chartRect.right - this.chartRect.left) / dataCount;

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    
    context2d.moveTo(ttc_roundToHalf(this.chartRect.left), ttc_roundToHalf(this.chartRect.bottom - (firstValueNormalized * rectVerticalRange)));

    for (i = 1; i < count; ++i) {
        var valueNormalized = (stock.closePrices[i + index] - stockRange.minValue) / stockRange.range;
        context2d.lineTo(ttc_roundToHalf(this.chartRect.left + datumWidthPixels * i), ttc_roundToHalf(this.chartRect.bottom - (valueNormalized * rectVerticalRange)));
    }

    context2d.stroke();
}

Chart.prototype.drawCandlestickSeries = function ( stock,
    index,
    count,
    dataCount,
    stockRange) {
    'use strict';

    var context2d = this.canvas.getContext("2d");
    var rectVerticalRange = this.chartRect.bottom - this.chartRect.top;
    var datumWidthPixels = Math.round((this.chartRect.right - this.chartRect.left) / dataCount);
    var i;

    if (stockRange == undefined) {
        stockRange = stock.getHighLowRange( index, count );
    }

    function normalizeValue( val ) {
        return (val - stockRange.minValue) / stockRange.range;
    }

    for (i = 0; i < count; ++i) {
        var normalizedOpenValue = normalizeValue( stock.openPrices[i + index] );
        var normalizedCloseValue = normalizeValue( stock.closePrices[i + index] );
        var normalizedHighValue = normalizeValue( stock.highPrices[i + index] );
        var normalizedLowValue = normalizeValue( stock.lowPrices[i + index]);

        var candleBodyY = this.chartRect.bottom - Math.max(normalizedCloseValue, normalizedOpenValue) * rectVerticalRange;
        var candleHeight = Math.round(Math.abs(normalizedCloseValue - normalizedOpenValue) * rectVerticalRange);

        var startX = ttc_roundToHalf(i * datumWidthPixels);

        context2d.fillStyle = normalizedCloseValue > normalizedOpenValue ? "#229922" : "#992222";
        context2d.fillRect(startX + 1, ttc_roundToHalf(candleBodyY), datumWidthPixels - 2, candleHeight);

        var wickX = ttc_roundToHalf(startX + datumWidthPixels / 2);
        context2d.lineWidth = 1;
      
        context2d.strokeStyle = "#111111";

        // top wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY));
        context2d.lineTo(wickX, ttc_roundToHalf(this.chartRect.bottom - (normalizedHighValue * rectVerticalRange)));
        context2d.stroke();

        // bottom wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY + candleHeight));
        context2d.lineTo(wickX, ttc_roundToHalf(this.chartRect.bottom - (normalizedLowValue * rectVerticalRange)));
        context2d.stroke();
    }
}

Chart.prototype.drawVolumeColumnSeries = function( stock,
    index,
    count,
    dataCount) {
    'use strict';

    var stockRange = stock.getVolumeRange(index, count);
    var context2d = this.canvas.getContext("2d");
    var rectVerticalRange = this.chartRect.bottom - this.chartRect.top;
    var i;
    var datumWidthPixels = (this.chartRect.right - this.chartRect.left) / dataCount;

    for (i = 0; i < count; ++i) {
        var t = (stock.volumes[i + index] - stockRange.minValue) / stockRange.range;
        context2d.beginPath();
        context2d.lineWidth = datumWidthPixels - 2;
        context2d.strokeStyle = "#111111";
        
        var xCoord = ttc_roundToHalf(this.chartRect.left + i * datumWidthPixels);
        context2d.moveTo(xCoord, ttc_roundToHalf(this.chartRect.bottom));
        context2d.lineTo(xCoord, ttc_roundToHalf(this.chartRect.bottom - (t * rectVerticalRange)));
        context2d.stroke();
    }
}

