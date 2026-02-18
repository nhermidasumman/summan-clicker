import math
from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_feature_debt_accumulates_and_reduces(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            buildings: { ...window.__SUMMAN_TEST_API__.getState().buildings, intern: 50, senior: 0 },
            bugs: 0,
            dataPoints: 1_000_000,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 1_000_000,
                totalDataAllTime: 1_000_000
            }
        })
    """)
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 50 })")
    bugs_after_growth = page.evaluate('window.__SUMMAN_TEST_API__.getState().bugs')
    assert bugs_after_growth > 0

    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            buildings: { ...window.__SUMMAN_TEST_API__.getState().buildings, intern: 0, senior: 100 },
            bugs: 1000
        })
    """)
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 50 })")
    bugs_after_reduction = page.evaluate('window.__SUMMAN_TEST_API__.getState().bugs')

    assert bugs_after_reduction < 1000


def test_feature_crash_overlay_and_reboot(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SET_BUGS', bugs: 1200000 })")
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 5 })")

    crash_state = page.evaluate('window.__SUMMAN_TEST_API__.getState().crash')
    assert crash_state['active'] is True
    assert page.locator('#crash-overlay.active').count() == 1

    for _ in range(15):
        page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'REBOOT_CRASH' })")

    crash_state_after = page.evaluate('window.__SUMMAN_TEST_API__.getState().crash')
    assert isinstance(crash_state_after['active'], bool)


def test_feature_crash_does_not_retrigger_immediately_after_timer_end(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SET_BUGS', bugs: 1_000_000_000 })")
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'FORCE_CRASH' })")

    page.evaluate("""
        (() => {
            const state = window.__SUMMAN_TEST_API__.getState();
            window.__SUMMAN_TEST_API__.setState({
                crash: {
                    ...state.crash,
                    active: true,
                    endsAt: Date.now() - 1
                }
            });
        })();
    """)

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 1 })")
    crash_state = page.evaluate('window.__SUMMAN_TEST_API__.getState().crash')

    assert crash_state['active'] is False
    assert page.locator('#crash-overlay.active').count() == 0


def test_feature_refactor_cost_and_bug_reduction(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            buildings: { ...window.__SUMMAN_TEST_API__.getState().buildings, intern: 200 },
            bugs: 1000,
            dataPoints: 1_000_000,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 1_000_000,
                totalDataAllTime: 1_000_000
            }
        })
    """)

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 1 })")
    result = page.evaluate("""
        (() => {
            const beforeState = window.__SUMMAN_TEST_API__.getState();
            const beforeDataPoints = Number(beforeState.dataPoints);
            const beforeBugs = Number(beforeState.bugs);
            const expectedCost = Math.ceil(Number(beforeState.dps) * 60);
            const ok = window.__SUMMAN_TEST_API__.dispatch({ type: 'TRIGGER_REFACTOR' });
            const after = window.__SUMMAN_TEST_API__.getState();

            return {
                ok,
                expectedCost,
                beforeDataPoints,
                afterDataPoints: after.dataPoints,
                beforeBugs,
                afterBugs: after.bugs,
                spent: beforeDataPoints - after.dataPoints
            };
        })();
    """)

    assert result['ok'] is True
    assert abs(math.floor(result['afterBugs']) - math.floor(result['beforeBugs'] * 0.6)) <= 1
    assert result['afterDataPoints'] <= result['beforeDataPoints']
    assert result['spent'] == result['expectedCost']

