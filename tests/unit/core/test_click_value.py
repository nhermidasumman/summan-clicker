def test_click_value_formula_baseline():
    base_click = 1
    click_add = 5
    click_mult = 2
    dps = 100
    dps_percent = 0.01
    value = (base_click + click_add) * click_mult + (dps * dps_percent)
    assert value == 13
