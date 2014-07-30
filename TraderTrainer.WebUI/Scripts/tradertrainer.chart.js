
function Chart(canvas) {
    "use strict";

    if (arguments.length != 1) {
        throw "Illegal argument count";
    }

    this.canvas = canvas;
    this.priceSeriesList = [];
    this.volumeSeriesList = [];
    this.horizontalGridLinesEnabled = false;
    this.axesEnabled = false;
}

Chart.prototype.drawAll = function (stock, currentDay, daysToDraw, daysVisible) {
    "use strict";

    var stockRange = stock.getHighLowRange(currentDay, daysToDraw);
    var i;

    var context2d = this.canvas.getContext("2d");
    context2d.fillStyle = "#FFFFFF";
    context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.axesEnabled) {
        this.drawAxes();
    }
    
    if (this.horizontalGridLinesEnabled) {
        this.drawHorizontalGridLines( stockRange, 1 );
    }

    for (i = 0; i < this.priceSeriesList.length; i++) {
        this.priceSeriesList[i].call(this, stock, currentDay, daysToDraw, daysVisible, stockRange);
    }

    for (i = 0; i < this.volumeSeriesList.length; i++) {
        this.volumeSeriesList[i].call(this, stock, currentDay, daysToDraw, daysVisible);
    }
}

Chart.prototype.drawAxes = function () {
    'use strict';

    var context2d = this.canvas.getContext("2d");

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    context2d.moveTo(0.5, 0.5);
    context2d.lineTo(0.5, ttc_roundToHalf(this.canvas.height));
    context2d.lineTo(this.canvas.width, ttc_roundToHalf(this.canvas.bottom));
    context2d.stroke();
}

function ttc_roundToHalf(val) {
    return Math.round(val) - 0.5;
}

Chart.prototype.drawHorizontalGridLines = function(stockRange,
    interval) {
    'use strict';

    if (arguments.length != 2) {
        throw "Illegal argument count";
    }
        
    var context2d = this.canvas.getContext("2d");

    var rectVerticalRange = this.canvas.height;
    var intervalNormalized = interval / stockRange.range;
    var intervalPixels = intervalNormalized * rectVerticalRange;
    var lineValue = stockRange.maxValue - (stockRange.maxValue % interval);

    var lineValueNormalized; 
    var lineValueY;
    
    var x2 = ttc_roundToHalf(this.canvas.width);

    do {
        lineValueNormalized = (lineValue - stockRange.minValue) / stockRange.range;
        lineValueY = ttc_roundToHalf(this.canvas.height - lineValueNormalized * rectVerticalRange);

        context2d.beginPath();
        context2d.lineWidth = 1;
        context2d.strokeStyle = "#888888";
        context2d.moveTo(0.5, lineValueY);
        context2d.lineTo(x2, lineValueY);
        context2d.stroke();

        context2d.fillText(lineValue, 0, lineValueY);

        lineValue -= interval;
    } while (lineValue > stockRange.minValue);
 
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
    var rectVerticalRange = this.canvas.height;
    var i;
    var datumWidthPixels = Math.round((this.canvas.width) / dataCount);
    var halfDatumWidthPixels = datumWidthPixels / 2;

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    
    context2d.moveTo(ttc_roundToHalf(halfDatumWidthPixels), ttc_roundToHalf(this.canvas.height - (firstValueNormalized * rectVerticalRange)));

    for (i = 1; i < count; ++i) {
        var valueNormalized = (stock.closePrices[i + index] - stockRange.minValue) / stockRange.range;
        context2d.lineTo(ttc_roundToHalf(halfDatumWidthPixels + (datumWidthPixels * i)), ttc_roundToHalf(this.canvas.height - (valueNormalized * rectVerticalRange)));
    }

    context2d.stroke();
}

Chart.prototype.drawCandlestickSeries = function ( stock,
    index,
    count,
    dataCount,
    stockRange,
    columnGapPixels) {
    'use strict';

    var context2d = this.canvas.getContext("2d");
    var rectVerticalRange = this.canvas.height;
    var datumWidthPixels = Math.round((this.canvas.width) / dataCount);
    var i;

    if (stockRange == undefined) {
        stockRange = stock.getHighLowRange( index, count );
    }

    if (columnGapPixels == undefined) {
        columnGapPixels = 1;
    }

    function normalizeValue( val ) {
        return (val - stockRange.minValue) / stockRange.range;
    }

    for (i = 0; i < count; ++i) {
        var normalizedOpenValue = normalizeValue( stock.openPrices[i + index] );
        var normalizedCloseValue = normalizeValue( stock.closePrices[i + index] );
        var normalizedHighValue = normalizeValue( stock.highPrices[i + index] );
        var normalizedLowValue = normalizeValue( stock.lowPrices[i + index]);

        var candleBodyY = this.canvas.height - Math.max(normalizedCloseValue, normalizedOpenValue) * rectVerticalRange;
        var candleHeight = Math.round(Math.abs(normalizedCloseValue - normalizedOpenValue) * rectVerticalRange);

        var startX = Math.round(i * datumWidthPixels);

        context2d.fillStyle = normalizedCloseValue > normalizedOpenValue ? "#229922" : "#992222";
        context2d.fillRect(startX + columnGapPixels, Math.round(candleBodyY), datumWidthPixels - columnGapPixels, candleHeight);

        var wickX = ttc_roundToHalf(startX + datumWidthPixels / 2);
        context2d.lineWidth = 1;
      
        context2d.strokeStyle = "#111111";

        // top wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY));
        context2d.lineTo(wickX, ttc_roundToHalf(this.canvas.height - (normalizedHighValue * rectVerticalRange)));
        context2d.stroke();

        // bottom wick
        context2d.beginPath();
        context2d.moveTo(wickX, ttc_roundToHalf(candleBodyY + candleHeight));
        context2d.lineTo(wickX, ttc_roundToHalf(this.canvas.height - (normalizedLowValue * rectVerticalRange)));
        context2d.stroke();
    }
}

Chart.prototype.drawVolumeColumnSeries = function( stock,
    index,
    count,
    dataCount,
    columnGapPixels,
    columnFillStyle) {
    'use strict';

    if (columnGapPixels == undefined) {
        columnGapPixels = 1;
    }

    if (columnFillStyle == undefined) {
        columnFillStyle = "#111111";
    }

    var stockRange = stock.getVolumeRange(index, count);
    var context2d = this.canvas.getContext("2d");
    var rectVerticalRange = this.canvas.height;
    var i;
    var datumWidthPixels = Math.round((this.canvas.width) / dataCount);

    for (i = 0; i < count; ++i) {
        var t = (stock.volumes[i + index] - stockRange.minValue) / stockRange.range;
  
        context2d.fillStyle = columnFillStyle;
        
        var xCoord = Math.round(i * datumWidthPixels);
        context2d.fillRect(xCoord + columnGapPixels, Math.round(this.canvas.height - (t * rectVerticalRange)), datumWidthPixels - columnGapPixels, Math.round(t * rectVerticalRange));
    }
}

