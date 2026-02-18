import math


def stock_options(total_loc):
    return math.floor(150 * math.pow(total_loc / 1e9, 1 / 3))


def test_prestige_formula_stock_options():
    assert stock_options(1e9) == 150
    assert stock_options(8e9) == 300
    assert stock_options(0) == 0
