import { getClickSfxVariantsCatalog } from '../../content/click-sfx-variants.js';

function sanitizeVariant(variant) {
  return Object.freeze({
    id: String(variant.id || ''),
    label: String(variant.label || ''),
    description: String(variant.description || ''),
    pressSrc: String(variant.pressSrc || ''),
    releaseSrc: String(variant.releaseSrc || ''),
    pressDurationMs: Number(variant.pressDurationMs || 0),
    releaseDurationMs: Number(variant.releaseDurationMs || 0),
  });
}

const VARIANTS = Object.freeze(
  getClickSfxVariantsCatalog()
    .map((variant) => sanitizeVariant(variant))
    .filter((variant) => variant.id && variant.pressSrc && variant.releaseSrc),
);
const HAS_VARIANTS = VARIANTS.length > 0;

const DEFAULT_CONFIG = Object.freeze({
  poolSize: 6,
  masterVolume: 0.42,
  pressVolume: 0.84,
  releaseVolume: 0.82,
  volumeJitter: 0.07,
  playbackRateJitter: 0.035,
  cooldownPressMs: 9,
  cooldownReleaseMs: 7,
  preloadMode: 'metadata',
  warmupVariantCount: 4,
  warmupDelayStepMs: 45,
});

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function randomCentered(scale) {
  return (Math.random() * 2 - 1) * scale;
}

function pointerKey(pointerId) {
  if (pointerId === null || pointerId === undefined) return 'default';
  return String(pointerId);
}

function findVariantById(variantId) {
  return VARIANTS.find((variant) => variant.id === variantId) || null;
}

function createAudioPool(src, poolSize, preloadMode) {
  const channels = [];
  for (let index = 0; index < poolSize; index += 1) {
    const audio = new Audio(src);
    audio.preload = preloadMode;
    channels.push(audio);
  }
  return { channels, cursor: 0 };
}

function shuffleIndices(indices) {
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }
  return indices;
}

function pickPlayableChannel(pool) {
  for (const channel of pool.channels) {
    if (channel.paused || channel.ended) return channel;
  }

  const channel = pool.channels[pool.cursor];
  pool.cursor = (pool.cursor + 1) % pool.channels.length;
  return channel;
}

export function getClickSfxVariants() {
  if (!HAS_VARIANTS) return [];
  return VARIANTS.map((variant) => ({
    id: variant.id,
    label: variant.label,
    description: variant.description,
    pressDurationMs: variant.pressDurationMs,
    releaseDurationMs: variant.releaseDurationMs,
  }));
}

export function createClickSfx(config = {}) {
  if (!HAS_VARIANTS) {
    const noop = () => null;
    return {
      play: noop,
      playPress: noop,
      playRelease: noop,
      playPair: noop,
    };
  }

  const options = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const pointerVariants = new Map();
  const soundPools = new Map();
  let variantBag = [];
  let lastVariantId = null;
  let lastPressAtMs = 0;
  let lastReleaseAtMs = 0;
  let warmupScheduled = false;

  function getPool(src) {
    if (!soundPools.has(src)) {
      soundPools.set(src, createAudioPool(src, options.poolSize, options.preloadMode));
    }
    return soundPools.get(src);
  }

  function primeSource(src) {
    const pool = getPool(src);
    for (const channel of pool.channels) {
      channel.load();
    }
  }

  function scheduleWarmup() {
    if (warmupScheduled) return;
    warmupScheduled = true;

    const warmupCount = Math.max(1, Math.min(VARIANTS.length, Number(options.warmupVariantCount) || 1));
    const warmupVariants = VARIANTS.slice(0, warmupCount);

    warmupVariants.forEach((variant, index) => {
      window.setTimeout(() => {
        primeSource(variant.pressSrc);
        primeSource(variant.releaseSrc);
      }, Math.max(0, Number(options.warmupDelayStepMs) || 0) * index);
    });
  }

  function refillVariantBag() {
    const indices = shuffleIndices(Array.from({ length: VARIANTS.length }, (_, index) => index));
    if (indices.length > 1 && lastVariantId) {
      const firstVariant = VARIANTS[indices[indices.length - 1]];
      if (firstVariant.id === lastVariantId) {
        const swapIndex = indices.length - 2;
        const temp = indices[indices.length - 1];
        indices[indices.length - 1] = indices[swapIndex];
        indices[swapIndex] = temp;
      }
    }
    variantBag = indices;
  }

  function pickVariant(forcedVariantId) {
    if (forcedVariantId) {
      const forced = findVariantById(forcedVariantId);
      if (forced) {
        lastVariantId = forced.id;
        return forced;
      }
    }

    if (variantBag.length === 0) {
      refillVariantBag();
    }

    const variantIndex = variantBag.pop();
    const variant = VARIANTS[variantIndex] || VARIANTS[0];
    lastVariantId = variant.id;
    return variant;
  }

  function playOneShot(src, baseVolume) {
    scheduleWarmup();
    const pool = getPool(src);
    const channel = pickPlayableChannel(pool);

    channel.pause();
    channel.currentTime = 0;
    channel.playbackRate = 1 + randomCentered(options.playbackRateJitter);

    // Cookie Clicker style: perceptual taper by squaring effective gain.
    const jitteredVolume = clamp01(baseVolume * (1 + randomCentered(options.volumeJitter)));
    const effectiveVolume = clamp01(jitteredVolume * options.masterVolume);
    channel.volume = effectiveVolume * effectiveVolume;

    channel.play().catch(() => {});
  }

  function playPress(pointerId, forcedVariantId) {
    const nowMs = performance.now();
    if ((nowMs - lastPressAtMs) < options.cooldownPressMs) return null;
    lastPressAtMs = nowMs;

    const variant = pickVariant(forcedVariantId);
    const key = pointerKey(pointerId);
    pointerVariants.set(key, variant.id);
    playOneShot(variant.pressSrc, options.pressVolume);
    return variant.id;
  }

  function playRelease(pointerId, forcedVariantId) {
    const nowMs = performance.now();
    if ((nowMs - lastReleaseAtMs) < options.cooldownReleaseMs) return null;
    lastReleaseAtMs = nowMs;

    const key = pointerKey(pointerId);
    const variantId = forcedVariantId || pointerVariants.get(key);
    if (pointerVariants.has(key)) pointerVariants.delete(key);

    const variant = findVariantById(variantId) || pickVariant();
    playOneShot(variant.releaseSrc, options.releaseVolume);
    return variant.id;
  }

  function playPair(pointerId, forcedVariantId, holdMs = 38) {
    const variantId = playPress(pointerId, forcedVariantId);
    if (!variantId) return null;
    window.setTimeout(() => {
      playRelease(pointerId, variantId);
    }, holdMs);
    return variantId;
  }

  function play(variantId) {
    return playPress('manual', variantId);
  }

  return {
    play,
    playPress,
    playRelease,
    playPair,
  };
}

