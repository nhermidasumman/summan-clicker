def test_effects_stack_multiplicative():
    dps = 100
    effects = [2, 0.5, 1.25]
    result = dps
    for mult in effects:
        result *= mult
    assert result == 125
