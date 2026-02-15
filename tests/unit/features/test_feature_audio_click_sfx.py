from playwright.sync_api import Page


def test_feature_audio_click_sfx_press_release_and_variation(page: Page):
    page.add_init_script(
        """
        (() => {
            window.__audioPlays = [];
            const originalPlay = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function (...args) {
                const src = this.currentSrc || this.src || '';
                window.__audioPlays.push(src);
                return originalPlay.apply(this, args);
            };
        })();
        """
    )

    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    orb = page.locator('#click-orb')
    box = orb.bounding_box()
    assert box is not None

    x = box['x'] + (box['width'] / 2)
    y = box['y'] + (box['height'] / 2)

    for _ in range(6):
        page.mouse.move(x, y)
        page.mouse.down()
        page.wait_for_timeout(40)
        page.mouse.up()
        page.wait_for_timeout(90)

    result = page.evaluate(
        """
        () => {
            const plays = window.__audioPlays || [];
            const pressSources = plays.filter((src) => src.includes('_press.wav'));
            const releaseSources = plays.filter((src) => src.includes('_release.wav'));
            const uniquePressVariants = new Set(
                pressSources.map((src) => (src.split('/').pop() || '').replace('_press.wav', ''))
            );
            const uniqueReleaseVariants = new Set(
                releaseSources.map((src) => (src.split('/').pop() || '').replace('_release.wav', ''))
            );
            return {
                total: plays.length,
                pressCount: pressSources.length,
                releaseCount: releaseSources.length,
                uniquePressVariants: uniquePressVariants.size,
                uniqueReleaseVariants: uniqueReleaseVariants.size,
            };
        }
        """
    )

    assert result['total'] >= 10
    assert result['pressCount'] >= 5
    assert result['releaseCount'] >= 5
    assert result['uniquePressVariants'] >= 3
    assert result['uniqueReleaseVariants'] >= 3
