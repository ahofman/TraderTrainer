
    QUnit.test("ttc_roundToHalf", function () {
        QUnit.ok(ttc_roundToHalf(2) == 1.5);
        QUnit.ok(ttc_roundToHalf(1.7) == 1.5);
        QUnit.ok(ttc_roundToHalf(1.2) == 0.5);
        QUnit.ok(ttc_roundToHalf(1.5) == 1.5);
    });

    function createTestStock() {
        'use strict';

        var openValues = [1, 2, 4, 6, 8];
        var highValues = [1, 3, 5, 7, 9];
        var lowValues = [1, 2, 4, 6, 8];
        var closeValues = [1, 3, 5, 7, 9];
        var volumes = [1, 2, 3, 4, 5];

        var sut = new Stock(openValues, highValues, lowValues, closeValues, volumes);

        return sut;
    };

    QUnit.test("Stock.getHighLowRange range happy path", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getHighLowRange(0, 5);

        QUnit.ok(result.minValue == 1);
        QUnit.ok(result.maxValue == 9);
        QUnit.ok(result.range == 8);
    });

    QUnit.test("Stock.getHighLowRange no arguments", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getHighLowRange();

        QUnit.ok(result.minValue == 1);
        QUnit.ok(result.maxValue == 9);
        QUnit.ok(result.range == 8);
    });

    QUnit.test("Stock.getHighLowRange off end of array", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getHighLowRange(3, 5);

        QUnit.ok(result.minValue == 6);
        QUnit.ok(result.maxValue == 9);
        QUnit.ok(result.range == 3);
    });

    QUnit.test("Stock.getVolumeRange range happy path", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getVolumeRange(0, 5);

        QUnit.ok(result.minValue == 1);
        QUnit.ok(result.maxValue == 5);
        QUnit.ok(result.range == 4);
    });

    QUnit.test("Stock.getVolumeRange off end of array", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getVolumeRange(3, 5);

        QUnit.ok(result.minValue == 4);
        QUnit.ok(result.maxValue == 5);
        QUnit.ok(result.range == 1);
    });

    QUnit.test("Stock.getVolumeRange no arguments", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getVolumeRange();

        QUnit.ok(result.minValue == 1);
        QUnit.ok(result.maxValue == 5);
        QUnit.ok(result.range == 4);
    });

    function createStubCanvas() {
        'use strict';

        var stubCanvas = sinon.createStubInstance(HTMLCanvasElement);
        var stubContext = sinon.createStubInstance(CanvasRenderingContext2D);

        stubCanvas.getContext.returns(stubContext);
        stubCanvas.width = 100;
        stubCanvas.height = 100;

        return stubCanvas;
    };

    QUnit.test("Chart.drawAxes strokes once", function () {
        'use strict';

        var stubCanvas = createStubCanvas();

        var sut = new Chart(stubCanvas);
        sut.drawAxes();

        QUnit.ok(stubCanvas.getContext("2d").stroke.calledOnce);
    });
    
    QUnit.test("Chart.drawHorizontalGridLines", function () {
        'use strict';

        var stubCanvas = createStubCanvas();
        var stubContext;

        var sut = new Chart(stubCanvas);

        var range = {
            minValue: 11,
            maxValue: 21,
            range: 10
        };

        sut.drawHorizontalGridLines(range, 2);

        stubContext = stubCanvas.getContext("2d");
        QUnit.ok(stubContext.stroke.callCount == 5);

        // Ensure that lineTo and moveTo were always called with coordinates that are exactly
        // on a half pixel boundary. This ensures nice crisp lines. 

        QUnit.ok(stubContext.moveTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));
        QUnit.ok(stubContext.lineTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));
    });

    function isOnHalf(val) {
        return Math.round(val) - val === 0.5;
    };

    function isOnWhole(val) {
        return Math.round(val) - val === 0;
    }

    QUnit.test("Chart.drawCloseLineSeries", function () {
        'use strict';

        var stubCanvas = createStubCanvas(),
            stubContext = stubCanvas.getContext("2d"),
            sut = new Chart(stubCanvas),
            testStock = createTestStock();

        sut.drawCloseLineSeries(testStock, 0, 5, 30);

        QUnit.ok(stubContext.stroke.called);
        QUnit.ok(stubContext.lineTo.callCount === 4);
        
        // Ensure that lineTo and moveTo were always called with coordinates that are exactly
        // on a half pixel boundary. This ensures nice crisp lines. 

        QUnit.ok(stubContext.moveTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));
        QUnit.ok(stubContext.lineTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));
    });

    QUnit.test("Chart.drawCandlestickSeries", function () {
        'use strict';

        var stubCanvas = createStubCanvas(),
            stubContext = stubCanvas.getContext("2d"),
            sut = new Chart(stubCanvas),
            testStock = createTestStock();

        sut.drawCandlestickSeries(testStock, 0, 5, 30);

        QUnit.ok(stubContext.fillRect.callCount === 5);
       
        // Ensure that the first candlestick body starts on the left edge of the chart area
        QUnit.ok(stubContext.fillRect.firstCall.args[0] == 1);

        // Ensure that lineTo and moveTo were always called with coordinates that are exactly
        // on a half pixel boundary. This ensures nice crisp lines. 

        QUnit.ok(stubContext.moveTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));
        QUnit.ok(stubContext.lineTo.alwaysCalledWithMatch(isOnHalf, isOnHalf));

        QUnit.ok(stubContext.fillRect.alwaysCalledWithMatch(isOnWhole, isOnWhole, isOnWhole, isOnWhole));
    });

    QUnit.test("Chart.drawVolumeColumnSeries", function () {
        'use strict';

        var stubCanvas = createStubCanvas(),
            stubContext = stubCanvas.getContext("2d"),
            sut = new Chart(stubCanvas),
            testStock = createTestStock();

        sut.drawVolumeColumnSeries(testStock, 0, 5, 30);

        QUnit.ok(stubContext.fillRect.callCount === 5);

        // Ensure that lineTo and moveTo were always called with coordinates that are exactly
        // on a half pixel boundary. This ensures nice crisp lines. 
        QUnit.ok(stubContext.fillRect.alwaysCalledWithMatch(isOnWhole, isOnWhole, isOnWhole, isOnWhole));
    });

    QUnit.test("TT.placeOrder buy happy path", function () {
        'use strict';
        TT.init();
        TT.currentCashBalance = 10000;
        TT.brokerage = 15;

        TT.stocks[TT.stockSymbols.AAA] = createTestStock();

        TT.placeOrder(TT.stockSymbols.AAA, 1000, TT.orderType.BUY);

        TT.processOrders();

        QUnit.ok(TT.currentCashBalance == 8985);
        QUnit.ok(TT.positions[TT.stockSymbols.AAA].volume == 1000);
        // Ensure that there are no more pending orders
        QUnit.ok(TT.pendingOrders.length == 0);
    });

    QUnit.test("TT.placeOrder short happy path", function () {
        'use strict';
        TT.init();
        TT.currentCashBalance = 10000;
        TT.brokerage = 15;

        TT.stocks[TT.stockSymbols.AAA] = createTestStock();

        TT.placeOrder(TT.stockSymbols.AAA, 1000, TT.orderType.SHORT);

        TT.processOrders();

        QUnit.ok(TT.currentCashBalance == 10985);
        QUnit.ok(TT.positions[TT.stockSymbols.AAA].volume == 1000);
        // Ensure that there are no more pending orders
        QUnit.ok(TT.pendingOrders.length == 0);
    });


    QUnit.test("TT.placeOrder not enough balance", function () {
        'use strict';
        TT.init();
        TT.currentCashBalance = 10000;
        TT.brokerage = 15;

        TT.stocks[TT.stockSymbols.AAA] = createTestStock();

        TT.placeOrder(TT.stockSymbols.AAA, 10000, TT.orderType.BUY);

        QUnit.throws(function () {
            TT.processOrders();
        });

        QUnit.ok(TT.currentCashBalance == 10000);
        QUnit.ok(TT.positions[TT.stockSymbols.AAA] == undefined);
    });

    QUnit.test("TT.placeOrder twice on same stock", function () {
        'use strict';
        TT.init();
        TT.currentCashBalance = 10000;
        TT.brokerage = 15;

        TT.stocks[TT.stockSymbols.AAA] = createTestStock();

        TT.placeOrder(TT.stockSymbols.AAA, 1000, TT.orderType.BUY);

        TT.processOrders();

        QUnit.throws(function () {
            TT.placeOrder(TT.stockSymbols.AAA, 100, TT.orderType.BUY)
        });

        TT.processOrders();

        QUnit.ok(TT.currentCashBalance == 8985);
       // QUnit.ok(TT.positions[TT.stockSymbols.AAA] == undefined);
    });