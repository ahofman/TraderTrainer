function Stock(openPrices, highPrices, lowPrices, closePrices, volumes) {
    this.openPrices = openPrices;
    this.highPrices = highPrices;
    this.lowPrices = lowPrices;
    this.closePrices = closePrices;
    this.volumes = volumes;
}

Stock.prototype.getHighLowRange = function (startIndex, count) {
    'use strict';

    var result = {
        minValue: Number.MAX_VALUE,
        maxValue: Number.MIN_VALUE
    };

    var index = 0;
    for (index = startIndex; index < count + startIndex; index++) {
        if ((index >= this.lowPrices.length) || (index > this.highPrices.length))
            return result;
        result.minValue = Math.min(this.lowPrices[index], result.minValue);
        result.maxValue = Math.max(this.highPrices[index], result.maxValue);
    }

    return result;
}


