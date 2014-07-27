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
        maxValue: Number.MIN_VALUE,
        range: 0
    };

    var index = 0;

    if (startIndex == undefined) {
        startIndex = 0;
    }

    if (count == undefined) {
        count = this.lowPrices.length;
    }

    for (index = startIndex; index < count + startIndex; index++) {
        if ((index >= this.lowPrices.length) || (index > this.highPrices.length)) {
            result.range = result.maxValue - result.minValue;
            return result;
        }
        result.minValue = Math.min(this.lowPrices[index], result.minValue);
        result.maxValue = Math.max(this.highPrices[index], result.maxValue);
    }

    result.range = result.maxValue - result.minValue;
    return result;
}

Stock.prototype.getVolumeRange = function (startIndex, count) {
    'use strict';

    var result = {
        minValue: Number.MAX_VALUE,
        maxValue: Number.MIN_VALUE,
        range: 0
    };

    var index = 0;

    if (startIndex == undefined) {
        startIndex = 0;
    }

    if (count == undefined) {
        count = this.volumes.length;
    }

    for (index = startIndex; index < count + startIndex; index++) {
        if (index >= this.volumes.length) {
            result.range = result.maxValue - result.minValue;
            return result;
        }
        result.minValue = Math.min(this.volumes[index], result.minValue);
        result.maxValue = Math.max(this.volumes[index], result.maxValue);
    }

    result.range = result.maxValue - result.minValue;
    return result;
}
