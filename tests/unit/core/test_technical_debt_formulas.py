import math


def debt_efficiency(total_bugs):
    return 1000 / (1000 + math.sqrt(total_bugs))


def crash_sigmoid(bugs):
    return 1 / (1 + math.exp(-0.01 * (bugs - 1000)))


def refactor_cost(dps):
    return math.ceil(dps * 60)


def refactor_benefit(bugs):
    return math.floor(bugs * 0.6)


def test_debt_efficiency_formula():
    assert debt_efficiency(0) == 1
    assert debt_efficiency(1000) < 1


def test_crash_sigmoid_formula():
    assert round(crash_sigmoid(1000), 2) == 0.5
    assert crash_sigmoid(1200) > crash_sigmoid(1000)


def test_refactor_cost_and_benefit_formula():
    assert refactor_cost(250) == 15000
    assert refactor_benefit(1000) == 600
