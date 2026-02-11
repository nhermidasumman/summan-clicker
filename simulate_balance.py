import math

# --- Game Data ---
BUILDINGS = [
    {'id': 'intern', 'baseCost': 15, 'baseDps': 0.5, 'growthRate': 1.15},
    {'id': 'laptop', 'baseCost': 100, 'baseDps': 5, 'growthRate': 1.15},
    {'id': 'junior', 'baseCost': 1100, 'baseDps': 40, 'growthRate': 1.15},
    {'id': 'senior', 'baseCost': 12000, 'baseDps': 200, 'growthRate': 1.15},
    {'id': 'server', 'baseCost': 130000, 'baseDps': 1200, 'growthRate': 1.15},
    {'id': 'architect', 'baseCost': 1400000, 'baseDps': 6000, 'growthRate': 1.15},
    {'id': 'datacenter', 'baseCost': 20000000, 'baseDps': 35000, 'growthRate': 1.15},
    {'id': 'devops', 'baseCost': 330000000, 'baseDps': 200000, 'growthRate': 1.15},
    {'id': 'ailab', 'baseCost': 5100000000, 'baseDps': 1500000, 'growthRate': 1.15},
    {'id': 'quantum', 'baseCost': 75000000000, 'baseDps': 10000000, 'growthRate': 1.15},
]

UPGRADES = [
    # Click Upgrades
    {'id': 'click_1', 'cost': 100, 'type': 'click_mult', 'value': 2, 'req_click': 100},
    {'id': 'click_2', 'cost': 500, 'type': 'click_mult', 'value': 2, 'req_click': 500},
    {'id': 'click_3', 'cost': 5000, 'type': 'click_add', 'value': 5, 'req_data': 3000},
    {'id': 'click_4', 'cost': 50000, 'type': 'click_mult', 'value': 3, 'req_data': 25000},
    
    # Building Upgrades (Simplified: just checking cost/req)
    {'id': 'intern_1', 'cost': 100, 'type': 'build_mult', 'target': 'intern', 'value': 2, 'req_build': 'intern', 'req_count': 1},
    {'id': 'intern_2', 'cost': 1000, 'type': 'build_mult', 'target': 'intern', 'value': 2, 'req_build': 'intern', 'req_count': 10},
    {'id': 'laptop_1', 'cost': 1000, 'type': 'build_mult', 'target': 'laptop', 'value': 2, 'req_build': 'laptop', 'req_count': 1},
    {'id': 'laptop_2', 'cost': 10000, 'type': 'build_mult', 'target': 'laptop', 'value': 2, 'req_build': 'laptop', 'req_count': 10},
    {'id': 'junior_1', 'cost': 11000, 'type': 'build_mult', 'target': 'junior', 'value': 2, 'req_build': 'junior', 'req_count': 1},
    {'id': 'junior_2', 'cost': 110000, 'type': 'build_mult', 'target': 'junior', 'value': 2, 'req_build': 'junior', 'req_count': 10},
    {'id': 'senior_1', 'cost': 120000, 'type': 'build_mult', 'target': 'senior', 'value': 2, 'req_build': 'senior', 'req_count': 1},
    {'id': 'senior_2', 'cost': 1200000, 'type': 'build_mult', 'target': 'senior', 'value': 2, 'req_build': 'senior', 'req_count': 10},
    {'id': 'server_1', 'cost': 1300000, 'type': 'build_mult', 'target': 'server', 'value': 2, 'req_build': 'server', 'req_count': 1},
    {'id': 'server_2', 'cost': 13000000, 'type': 'build_mult', 'target': 'server', 'value': 2, 'req_build': 'server', 'req_count': 10},
    {'id': 'architect_1', 'cost': 14000000, 'type': 'build_mult', 'target': 'architect', 'value': 2, 'req_build': 'architect', 'req_count': 1},
    
    # Global
    {'id': 'global_1', 'cost': 10000, 'type': 'global_mult', 'value': 1.10, 'req_data': 5000},
    {'id': 'global_2', 'cost': 100000, 'type': 'global_mult', 'value': 1.25, 'req_data': 50000},
    {'id': 'global_3', 'cost': 1000000, 'type': 'global_mult', 'value': 1.50, 'req_data': 500000},
]

# --- State ---
data_points = 0
total_data_earned = 0
clicks = 0
buildings = {b['id']: 0 for b in BUILDINGS}
upgrades_owned = []
start_time = 0
time_elapsed = 0

# --- Logic ---

def get_building_cost(b_id, count):
    b = next(x for x in BUILDINGS if x['id'] == b_id)
    return math.ceil(b['baseCost'] * (b['growthRate'] ** count))

def get_dps():
    dps = 0
    global_mult = 1
    
    # Calculate multipliers
    b_mults = {b['id']: 1 for b in BUILDINGS}
    
    for u_id in upgrades_owned:
        u = next(x for x in UPGRADES if x['id'] == u_id)
        if u['type'] == 'global_mult':
            global_mult *= u['value']
        elif u['type'] == 'build_mult':
            b_mults[u['target']] *= u['value']
            
    for b in BUILDINGS:
        count = buildings[b['id']]
        dps += b['baseDps'] * count * b_mults[b['id']]
        
    return dps * global_mult

def get_click_power(dps):
    power = 1
    click_mult = 1
    click_add = 0
    percent_dps = 0
    
    for u_id in upgrades_owned:
        u = next(x for x in UPGRADES if x['id'] == u_id)
        if u['type'] == 'click_mult':
            click_mult *= u['value']
        elif u['type'] == 'click_add':
            click_add += u['value']
        # Simplified: ignoring percent dps for now as it's late game
        
    return (power + click_add) * click_mult

def can_buy_upgrade(u):
    if u['id'] in upgrades_owned: return False
    if data_points < u['cost']: return False
    
    # Check reqs
    if 'req_click' in u and clicks < u['req_click']: return False
    if 'req_data' in u and total_data_earned < u['req_data']: return False
    if 'req_build' in u and buildings[u['req_build']] < u['req_count']: return False
    
    return True

# --- Simulation Loop ---
print("Starting Simulation (Goal: 1 Billion Data in 3 Hours = 10800s)")

TARGET_DATA = 1_000_000_000
MAX_TIME = 10800 # 3 hours
sim_step = 1 # seconds
clicks_per_sec = 5

while time_elapsed < MAX_TIME:
    # 1. Earn DPS
    current_dps = get_dps()
    earned = current_dps * sim_step
    data_points += earned
    total_data_earned += earned
    
    # 2. Click
    click_pow = get_click_power(current_dps)
    click_earn = click_pow * clicks_per_sec * sim_step
    data_points += click_earn
    total_data_earned += click_earn
    clicks += clicks_per_sec * sim_step
    
    # 3. Buy Upgrades (Prioritize cheap ones)
    purchased_upgrade = False
    for u in sorted(UPGRADES, key=lambda x: x['cost']):
        if can_buy_upgrade(u):
            data_points -= u['cost']
            upgrades_owned.append(u['id'])
            # print(f"[{time_elapsed}s] Bought Upgrade: {u['id']}")
            purchased_upgrade = True
            
    # 4. Buy Buildings (Simple strategy: Buy cheapest if ROI is okay)
    # Actually, let's just buy whatever is affordable and gives best DPS/Cost ratio
    best_b = None
    best_ratio = 0
    
    for b in BUILDINGS:
        cost = get_building_cost(b['id'], buildings[b['id']])
        if data_points >= cost:
            # Calculate potential dps gain (approx)
            gain = b['baseDps'] # simplified
            ratio = gain / cost
            if ratio > best_ratio:
                best_ratio = ratio
                best_b = b
    
    if best_b:
        # Buy as many as reasonable? No, just one per tick for sim simplicity
        cost = get_building_cost(best_b['id'], buildings[best_b['id']])
        data_points -= cost
        buildings[best_b['id']] += 1
        # print(f"[{time_elapsed}s] Bought Building: {best_b['id']} (Total: {buildings[best_b['id']]})")

    # Check milestones
    if total_data_earned >= TARGET_DATA:
        print(f"SUCCESS! Reached {TARGET_DATA} data in {time_elapsed} seconds ({time_elapsed/60:.1f} minutes)")
        break
        
    if time_elapsed % 900 == 0: # Every 15 mins
        print(f"T={time_elapsed/60}m | Data: {data_points:.0f} | Total: {total_data_earned:.0f} | DPS: {current_dps:.1f} | Buildings: {sum(buildings.values())}")
        
    time_elapsed += sim_step

if total_data_earned < TARGET_DATA:
    print(f"FAILED. Reached {total_data_earned:.0f} data in {MAX_TIME} seconds.")
