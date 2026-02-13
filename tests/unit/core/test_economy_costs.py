import math


def building_cost(base_cost, owned, growth_rate=1.18):
    return math.ceil(base_cost * (growth_rate ** owned))


def test_economy_costs_growth_is_monotonic():
    costs = [building_cost(20, i) for i in range(12)]
    assert all(costs[i] < costs[i + 1] for i in range(len(costs) - 1))


def test_economy_costs_known_value():
    assert building_cost(20, 0) == 20
    assert building_cost(20, 1) == 24
