from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_achievement_unlocks_on_threshold_cross(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            dataPoints: 99,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 99,
                totalDataAllTime: 99,
                totalClicks: 0
            },
            achievements: []
        })
    """)

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'CLICK', x: 100, y: 100 })")
    achievements = page.evaluate('window.__SUMMAN_TEST_API__.getState().achievements')

    assert 'prod_1' in achievements
    assert achievements.count('prod_1') == 1
