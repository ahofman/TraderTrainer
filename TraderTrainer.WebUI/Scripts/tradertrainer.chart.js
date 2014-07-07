
function ttc_getChartRange(chartValues, startIndex, count) {
    'use strict';

    var result = {
        minValue: Number.MAX_VALUE,
        maxValue: Number.MIN_VALUE
    };

    var index = 0;
    for (index = startIndex; index < count + startIndex; index++) {
        result.minValue = Math.min(chartValues[index], result.minValue);
        result.maxValue = Math.max(chartValues[index], result.maxValue);
    }

    return result;
}

function ttc_getHighLowRange(highValues, lowValues, startIndex, count) {
    'use strict';

    var result = {
        minValue: Number.MAX_VALUE,
        maxValue: Number.MIN_VALUE
    };

    var index = 0;
    for (index = startIndex; index < count + startIndex; index++) {
        result.minValue = Math.min(lowValues[index], result.minValue);
        result.maxValue = Math.max(highValues[index], result.maxValue);
    }

    return result;
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

function ttc_drawAxes(context2d, rect) {
    'use strict';

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    context2d.moveTo(rect.left, rect.top);
    context2d.lineTo(rect.left, rect.bottom);
    context2d.lineTo(rect.right, rect.bottom);
    context2d.stroke();

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

function ttc_drawHorizontalGridLines(context2d,
    rect,
    minDataValue,
    maxDataValue,
    interval) {
    'use strict';

    var dataValueRange = maxDataValue - minDataValue;
    var rectVerticalRange = rect.bottom - rect.top;
    var intervalNormalized = interval / dataValueRange;
    var intervalPixels = intervalNormalized * rectVerticalRange;
    var lineValue = maxDataValue - (maxDataValue % interval);

    var lineValueNormalized; 
    var lineValueY;

    do {
        lineValueNormalized = (lineValue - minDataValue) / dataValueRange;
        lineValueY = (rect.bottom - lineValueNormalized * rectVerticalRange);

        context2d.beginPath();
        context2d.lineWidth = 1;
        context2d.strokeStyle = "#888888";
        context2d.moveTo(rect.left, lineValueY);
        context2d.lineTo(rect.right, lineValueY);
        context2d.stroke();

        context2d.fillText(lineValue, rect.left, lineValueY);

        lineValue -= interval;
    } while (lineValue > minDataValue);
 
}

function ttc_drawLineSeries(context2d, 
    rect, 
    dataSeries, 
    index, 
    count, 
    dataCount,
    minDataValue, 
    maxDataValue) {
    'use strict';

    var dataValueRange = maxDataValue - minDataValue;
    var firstValueNormalized = (dataSeries[index] - minDataValue) / dataValueRange;
    var rectVerticalRange = rect.bottom - rect.top;
    var i;
    var datumWidthPixels = (rect.right - rect.left) / dataCount;

    context2d.beginPath();
    context2d.lineWidth = 1;
    context2d.strokeStyle = "#111111";
    
    context2d.moveTo(rect.left, rect.bottom - (firstValueNormalized * rectVerticalRange));

    for (i = 1; i < count; ++i) {
        var valueNormalized = (dataSeries[i + index] - minDataValue) / dataValueRange;
        context2d.lineTo( rect.left + datumWidthPixels * i, rect.bottom - (valueNormalized * rectVerticalRange));
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
        context2d.fillRect(startX + 1, candleBodyY, datumWidthPixels - 2, candleHeight);

        var wickX = startX + datumWidthPixels / 2;
        context2d.lineWidth = 1;
      
        context2d.strokeStyle = "#111111";

        // top wick
        context2d.beginPath();
        context2d.moveTo(wickX, candleBodyY);
        context2d.lineTo(wickX, rect.bottom - (normalizedHighValue * rectVerticalRange));
        context2d.stroke();

        // bottom wick
        context2d.beginPath();
        context2d.moveTo(wickX, candleBodyY + candleHeight);
        context2d.lineTo(wickX, rect.bottom - (normalizedLowValue * rectVerticalRange));
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

