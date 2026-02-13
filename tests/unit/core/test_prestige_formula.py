import math


def calc_innovation_points(total_lifetime_data):
    if total_lifetime_data < 1e9:
        return 0
    return math.floor((total_lifetime_data / 1e9) ** 0.5)


def test_prestige_formula():
    assert calc_innovation_points(1e9) == 1
    assert calc_innovation_points(25e9) == 5
