from playwright.sync_api import Page
import json


def test_save_migration_legacy_to_extended_runtime(page: Page):
    legacy_state = {
        'version': 1,
        'dataPoints': 1234,
        'buildings': {
            'intern': 2,
            'laptop': 3,
        },
        'stats': {
            'totalDataEarned': 5000,
            'totalDataAllTime': 9000,
        },
    }

    encoded = json.dumps(json.dumps(legacy_state))
    page.add_init_script(f"localStorage.setItem('summan_clicker_save', {encoded});")

    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    state = page.evaluate('window.__SUMMAN_TEST_API__.getState()')

    assert state['version'] == 2
    assert 'bugs' in state
    assert 'efficiency' in state
    assert 'crash' in state
    assert state['buildings'].get('intern') == 2
    assert state['buildings'].get('python_script') == 3
