var TT = Object.seal({
    orderType: Object.freeze({
        BUY: 0,
        SELL: 1,
        SHORT: 2
    }),
    positionType: Object.freeze({
        LONG: 0,
        SHORT: 1
    }),
    stockSymbols: Object.freeze({
        AAA: 0,
        BBB: 1,
        CCC: 2,
        DDD: 3
    }),
    mainCharts: [],
    volumeCharts: [],
    stocks: [],
    pendingOrders: [],
    positions: [],
    currentCashBalance: 10000,
    brokerage: 15,
    currentDay: 0,
    daysVisible: 30,
    isPaused: false,
    init: function () {
        'use strict';

        this.mainCharts = [];
        this.volumeCharts = [];
        this.stocks = [];
        this.pendingOrders = [];
        this.positions = [];
        this.currentCashBalance = 10000;
        this.brokerage = 15;
        this.currentDay = 0;
        this.daysVisible = 30;
        this.isPaused = false;
    },
    redrawAll: function () {
        'use strict';

        var i;
        var horizontalRange = {
            minValue: this.currentDay,
            maxValue: this.currentDay + this.daysVisible,
            range: this.daysVisible
        };

        for (i = 0; i < this.mainCharts.length; i++) {
            var stockVerticalRange = this.stocks[i].getHighLowRange(horizontalRange.minValue, horizontalRange.range);
            
            this.mainCharts[i].drawAll(horizontalRange, stockVerticalRange);
            this.volumeCharts[i].drawAll(horizontalRange);
        }
    },
    placeOrder: function (stockIndex, volume, orderType) {
        'use strict';

        if (this.positions[stockIndex] != undefined &&
            this.positions[stockIndex].positionType == this.positionType.LONG &&
            (orderType == this.orderType.BUY || orderType == this.orderType.SHORT)) {
            throw 'Cant place a buy or short order on a stock that has a long position';
        }

        if (this.positions[stockIndex] != undefined &&
            this.positions[stockIndex].positionType == this.positionType.SHORT &&
            (orderType == this.orderType.SHORT || orderType == this.orderType.SELL)) {
            throw 'Cant place a short or sell order on a stock that has a short position';
        }

        this.pendingOrders.push({
            stockIndex: stockIndex,
            orderType: orderType,
            volume: volume
        });
    },
    processDay: function() {
        'use strict';
        this.processOrders();
        this.processFees();
    },
    processOrders: function () {
        'use strict';

        var i;
        while (this.pendingOrders.length > 0) {
            var order = this.pendingOrders.shift();
            var stockIndex = order.stockIndex;
            var stock = this.stocks[stockIndex];
            var stockPrice = stock.openPrices[this.currentDay];

            if (order.orderType == this.orderType.BUY) {
                var tradePrice = stockPrice * order.volume;
                tradePrice += this.brokerage;
  
                this.currentCashBalance -= tradePrice;
                this.positions[stockIndex] = {
                    openPrice: stock.openPrices[this.currentDay],
                    volume: order.volume,
                    dayOpened: this.currentDay,
                    positionType: this.positionType.LONG
                };

            //    this.mainCharts[stockIndex].priceSeriesList.push( {
              //      draw: Chart.prototype.drawCloseFilledLineSeries,
                //    stock: );
              
            } else if (order.orderType == this.orderType.SHORT) {
                var tradePrice = stockPrice * order.volume;

                // todo: can you short at exactly the market price?
                // will the broker make a margin call if the price goes up?
                // is there a maximum volume you can short?
                this.currentCashBalance -= this.brokerage;
                this.currentCashBalance += tradePrice;
                this.positions[stockIndex] = {
                    openPrice: stockPrice,
                    volume: order.volume,
                    dayOpened: this.currentDay,
                    positionType: this.positionType.SHORT
                };
            }
        }  
    },
    processFees: function () {
        'use strict';
        // 100 dollar dishonor fee per day. 
        if (this.currentCashBalance < 0) {
            this.currentCashBalance -= 100;
        }
    }
});
