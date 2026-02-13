def migrate_to_v2(state):
    migrated = dict(state)
    if not migrated.get('version') or migrated['version'] < 2:
        migrated['version'] = 2
    if 'stats' not in migrated:
        migrated['stats'] = {}
    if 'settings' not in migrated:
        migrated['settings'] = {'language': 'es', 'buyAmount': 1}
    return migrated


def test_save_migrations_to_v2():
    state = {'version': 1, 'dataPoints': 10}
    migrated = migrate_to_v2(state)
    assert migrated['version'] == 2
    assert 'stats' in migrated
    assert 'settings' in migrated
