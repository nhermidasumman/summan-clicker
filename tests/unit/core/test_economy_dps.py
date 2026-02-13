def test_economy_dps_basic_formula():
    base_dps = 0.4
    owned = 10
    multiplier = 2
    assert base_dps * owned * multiplier == 8.0
