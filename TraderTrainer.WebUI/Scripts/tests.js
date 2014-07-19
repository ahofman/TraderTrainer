QUnit.test("hello test", function (assert) {
    QUnit.ok(1 == "1", "Passed!");
});

QUnit.test("ttc_getChartRange happy path", function () {
    var chartValues = [0, 2, 4, 6, 8];

    var result = ttc_getChartRange(chartValues, 0, 5);

    QUnit.ok(result.minValue == 0);
    QUnit.ok(result.maxValue == 8);
})

QUnit.test("ttc_getChartRange off end of array", function () {
    var chartValues = [0, 2, 4, 6, 8];

    var result = ttc_getChartRange(chartValues, 3, 5);

    QUnit.ok(result.minValue == 6);
    QUnit.ok(result.maxValue == 8);
})