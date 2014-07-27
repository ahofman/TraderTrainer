﻿
    QUnit.test("ttc_roundToHalf", function () {
        QUnit.ok(ttc_roundToHalf(2) == 1.5);
        QUnit.ok(ttc_roundToHalf(1.7) == 1.5);
        QUnit.ok(ttc_roundToHalf(1.2) == 0.5);
        QUnit.ok(ttc_roundToHalf(1.5) == 1.5);
    });

    function createTestStock() {
        'use strict';

        var openValues = [0, 2, 4, 6, 8];
        var highValues = [1, 3, 5, 7, 9];
        var lowValues = [0, 2, 4, 6, 8];
        var closeValues = [1, 3, 5, 7, 9];
        var volumes = [1, 2, 3, 4, 5];

        var sut = new Stock(openValues, highValues, lowValues, closeValues, volumes);

        return sut;
    }

    QUnit.test("Stock.getHighLowRange range happy path", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getHighLowRange(0, 5);

        QUnit.ok(result.minValue == 0);
        QUnit.ok(result.maxValue == 9);
    })

    QUnit.test("Stock.getHighLowRange off end of array", function () {
        'use strict';

        var sut = createTestStock();

        var result = sut.getHighLowRange(3, 5);

        QUnit.ok(result.minValue == 6);
        QUnit.ok(result.maxValue == 9);
    })

    function createStubCanvas() {
        'use strict';

        var stubCanvas = sinon.createStubInstance(HTMLCanvasElement);
        var stubContext = sinon.createStubInstance(CanvasRenderingContext2D);

        stubCanvas.getContext.returns(stubContext);

        return stubCanvas;
    }

    QUnit.test("Chart.drawAxes strokes once", function () {
        'use strict';

        var stubCanvas = createStubCanvas();
        
        var rect = { left: 0, right: 100, top: 0, bottom: 100 };

        var sut = new Chart(stubCanvas, rect);
        sut.drawAxes();

        QUnit.ok(stubCanvas.getContext("2d").stroke.calledOnce);
    })
    
    QUnit.test("Chart.drawHorizontalGridLines", function () {
        'use strict';

        var stubCanvas = createStubCanvas();
  
        var rect = { left: 0, right: 100, top: 0, bottom: 100 };

        var sut = new Chart(stubCanvas, rect);

        sut.drawHorizontalGridLines(0, 10, 1);

        QUnit.ok(stubCanvas.getContext("2d").stroke.called);
    })