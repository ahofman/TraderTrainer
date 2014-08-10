
var ChartUtils = Object.seal({
    roundToHalf: function (val) {
        'use strict';
        return Math.round(val) - 0.5;
    },

    getSeriesRange: function (dataSeries, horizontalRange) {
        'use strict';
        var slicedSeries = dataSeries.slice(horizontalRange.minValue, horizontalRange.range);
        var mx = Math.max.apply(null, slicedSeries);
        var mn = Math.min.apply(null, slicedSeries);

        var verticalRange = {
            minValue: mn, 
            maxValue: mx,
            range: mx - mn
        };

        return verticalRange;
    }
});

function Chart(canvas) {
    'use strict';

    if (arguments.length != 1) {
        throw 'Illegal argument count';
    }

    this.canvas = canvas;
    this.dataSeriesList = [];
    this.horizontalGridLinesEnabled = false;
    this.axesEnabled = false;
}

Chart.prototype.drawAll = function (horizontalRange, verticalRange) {
    'use strict';

    var i;
    var context2d = this.canvas.getContext('2d');
    context2d.fillStyle = '#FFFFFF';
    context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.axesEnabled) {
        this.drawAxes();
    }
    
    if (this.horizontalGridLinesEnabled) {
        this.drawHorizontalGridLines( verticalRange, 1 );
    }

    for (i = 0; i < this.dataSeriesList.length; i++) {
        this.dataSeriesList[i].drawFunction.call(this, this.dataSeriesList[i].dataSeries, horizontalRange, verticalRange);
    }
}

Chart.prototype.drawAxes = function () {
    'use strict';

    var context2d = this.canvas.getContext('2d');

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = '#111111';
    context2d.moveTo(0.5, 0.5);
    context2d.lineTo(0.5, ChartUtils.roundToHalf(this.canvas.height));
    context2d.lineTo(this.canvas.width, ChartUtils.roundToHalf(this.canvas.bottom));
    context2d.stroke();
}

Chart.prototype.drawHorizontalGridLines = function(stockVerticalRange,
    interval) {
    'use strict';

    if (arguments.length != 2) {
        throw 'Illegal argument count';
    }
        
    var context2d = this.canvas.getContext('2d');

    var rectVerticalRange = this.canvas.height;
    var intervalNormalized = interval / stockVerticalRange.range;
    var intervalPixels = intervalNormalized * rectVerticalRange;
    var lineValue = stockVerticalRange.maxValue - (stockVerticalRange.maxValue % interval);

    var lineValueNormalized; 
    var lineValueY;
    
    var x2 = ChartUtils.roundToHalf(this.canvas.width);

    do {
        lineValueNormalized = (lineValue - stockVerticalRange.minValue) / stockVerticalRange.range;
        lineValueY = ChartUtils.roundToHalf(this.canvas.height - lineValueNormalized * rectVerticalRange);

        context2d.beginPath();
        context2d.lineWidth = 1;
        context2d.strokeStyle = '#888888';
        context2d.moveTo(0.5, lineValueY);
        context2d.lineTo(x2, lineValueY);
        context2d.stroke();

        context2d.fillText(lineValue, 0, lineValueY);

        lineValue -= interval;
    } while (lineValue > stockVerticalRange.minValue);
}

Chart.prototype.drawLineSeriesCore = function (dataSeries,
    horizontalRange,
    verticalRange,
    fill) {
    'use strict';
  
    if (fill == undefined) {
        fill = false;
    }

    if (verticalRange == undefined) {
        verticalRange = ChartUtils.getSeriesRange(dataSeries, horizontalRange);
    }

    // fill is allowed to be undefined; it will just evaluate to false.
    var context2d = this.canvas.getContext('2d');

    var firstValueNormalized = (dataSeries[horizontalRange.minValue] - verticalRange.minValue) / verticalRange.range;
    var rectVerticalRange = this.canvas.height;
    var i;
    var datumWidthPixels = Math.round((this.canvas.width) / horizontalRange.range);
    var halfDatumWidthPixels = datumWidthPixels / 2;

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = '#111111';

    context2d.moveTo(ChartUtils.roundToHalf(halfDatumWidthPixels), ChartUtils.roundToHalf(this.canvas.height - (firstValueNormalized * rectVerticalRange)));

    var pointsToDraw = Math.min(horizontalRange.range, dataSeries.length - horizontalRange.minValue);

    for (i = 1; i < pointsToDraw; ++i) {
        var valueNormalized = (dataSeries[i + horizontalRange.minValue] - verticalRange.minValue) / verticalRange.range;
        context2d.lineTo(ChartUtils.roundToHalf(halfDatumWidthPixels + (datumWidthPixels * i)), ChartUtils.roundToHalf(this.canvas.height - (valueNormalized * rectVerticalRange)));
    }

    if (fill) {
        context2d.fillStyle = '#991111';
        context2d.globalAlpha = 0.5;

        var veryFirstValueNormalized = (dataSeries[0] - verticalRange.minValue) / verticalRange.range;
        var lastYValue = ChartUtils.roundToHalf(this.canvas.height - (veryFirstValueNormalized * rectVerticalRange));
        context2d.lineTo(ChartUtils.roundToHalf(halfDatumWidthPixels + (datumWidthPixels * horizontalRange.range)), lastYValue);
        context2d.lineTo(ChartUtils.roundToHalf(halfDatumWidthPixels), lastYValue);
        context2d.fill();
        context2d.globalAlpha = 1.0;
    } else {
        context2d.stroke();
    }
}

Chart.prototype.drawLineSeries = function(stock, 
    horizontalRange,
    verticalRange) {
    'use strict';

    return this.drawLineSeriesCore(stock, horizontalRange, verticalRange, false);
}

Chart.prototype.drawFilledLineSeries = function(stock, 
    horizontalRange,
    verticalRange) {
    'use strict';

    return this.drawLineSeriesCore(stock, horizontalRange, verticalRange, true);
}

Chart.prototype.drawCandlestickSeries = function ( stock,
    horizontalRange,
    stockVerticalRange,
    columnGapPixels) {
    'use strict';

    var context2d = this.canvas.getContext('2d');
    var rectVerticalRange = this.canvas.height;
    var datumWidthPixels = Math.round((this.canvas.width) / horizontalRange.range);
    var i;

    if (stockVerticalRange == undefined) {
        stockVerticalRange = stock.getHighLowRange( horizontalRange.minValue, horizontalRange.range);
    }

    if (columnGapPixels == undefined) {
        columnGapPixels = 1;
    }

    function normalizeValue( val ) {
        return (val - stockVerticalRange.minValue) / stockVerticalRange.range;
    }

    for (i = 0; i < horizontalRange.range; ++i) {
        var normalizedOpenValue = normalizeValue( stock.openPrices[i + horizontalRange.minValue] );
        var normalizedCloseValue = normalizeValue( stock.closePrices[i + horizontalRange.minValue] );
        var normalizedHighValue = normalizeValue( stock.highPrices[i + horizontalRange.minValue] );
        var normalizedLowValue = normalizeValue( stock.lowPrices[i + horizontalRange.minValue]);

        var candleBodyY = this.canvas.height - Math.max(normalizedCloseValue, normalizedOpenValue) * rectVerticalRange;
        var candleHeight = Math.round(Math.abs(normalizedCloseValue - normalizedOpenValue) * rectVerticalRange);

        var startX = Math.round(i * datumWidthPixels);

        context2d.fillStyle = normalizedCloseValue > normalizedOpenValue ? '#229922' : '#992222';
        context2d.fillRect(startX + columnGapPixels, Math.round(candleBodyY), datumWidthPixels - columnGapPixels, candleHeight);

        var wickX = ChartUtils.roundToHalf(startX + datumWidthPixels / 2);
        context2d.lineWidth = 1;
      
        context2d.strokeStyle = '#111111';

        // top wick
        context2d.beginPath();
        context2d.moveTo(wickX, ChartUtils.roundToHalf(candleBodyY));
        context2d.lineTo(wickX, ChartUtils.roundToHalf(this.canvas.height - (normalizedHighValue * rectVerticalRange)));
        context2d.stroke();

        // bottom wick
        context2d.beginPath();
        context2d.moveTo(wickX, ChartUtils.roundToHalf(candleBodyY + candleHeight));
        context2d.lineTo(wickX, ChartUtils.roundToHalf(this.canvas.height - (normalizedLowValue * rectVerticalRange)));
        context2d.stroke();
    }
}

Chart.prototype.drawColumnSeries = function( dataSeries,
    horizontalRange,
    verticalRange,
    columnGapPixels,
    columnFillStyle) {
    'use strict';

    if (columnGapPixels == undefined) {
        columnGapPixels = 1;
    }

    if (columnFillStyle == undefined) {
        columnFillStyle = '#111111';
    }

    if (verticalRange == undefined) {
        verticalRange = ChartUtils.getSeriesRange(dataSeries, horizontalRange);
    }
    
    var context2d = this.canvas.getContext('2d');
    var rectVerticalRange = this.canvas.height;
    var i;
    var datumWidthPixels = Math.round((this.canvas.width) / horizontalRange.range);

    for (i = 0; i < horizontalRange.range; ++i) {
        var t = (dataSeries[i + horizontalRange.minValue] - verticalRange.minValue) / verticalRange.range;
  
        context2d.fillStyle = columnFillStyle;
        
        var xCoord = Math.round(i * datumWidthPixels);
        context2d.fillRect(xCoord + columnGapPixels, Math.round(this.canvas.height - (t * rectVerticalRange)), datumWidthPixels - columnGapPixels, Math.round(t * rectVerticalRange));
    }
}
