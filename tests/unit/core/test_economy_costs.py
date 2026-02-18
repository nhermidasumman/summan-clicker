import math


def cost_next(base_cost, growth_rate, owned):
    return math.ceil(base_cost * (growth_rate ** owned))


def bulk_cost(base_cost, growth_rate, owned, amount):
    if amount <= 0:
        return 0
    first = base_cost * (growth_rate ** owned)
    geometric = ((growth_rate ** amount) - 1) / (growth_rate - 1)
    return math.ceil(first * geometric)


def max_affordable(base_cost, growth_rate, owned, budget):
    if budget <= 0:
        return 0, 0

    first = cost_next(base_cost, growth_rate, owned)
    if first > budget:
        return 0, 0

    estimate = math.floor(math.log(1 + (budget * (growth_rate - 1)) / (base_cost * (growth_rate ** owned))) / math.log(growth_rate))
    estimate = max(0, estimate)

    total = bulk_cost(base_cost, growth_rate, owned, estimate)
    while estimate > 0 and total > budget:
        estimate -= 1
        total = bulk_cost(base_cost, growth_rate, owned, estimate)

    while bulk_cost(base_cost, growth_rate, owned, estimate + 1) <= budget:
        estimate += 1
        total = bulk_cost(base_cost, growth_rate, owned, estimate)

    return estimate, total


def test_economy_cost_next_formula():
    assert cost_next(15, 1.15, 0) == 15
    assert cost_next(15, 1.15, 1) == 18


def test_economy_bulk_cost_formula():
    assert bulk_cost(15, 1.15, 0, 4) == 75


def test_economy_max_affordable_formula():
    count, total = max_affordable(15, 1.15, 0, 100)
    assert count == 4
    assert total == 75
