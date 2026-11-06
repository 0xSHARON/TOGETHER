const LOOP_MODES = new Set(["none", "track", "queue"]);

function applyLoop(player, mode) {
  if (!LOOP_MODES.has(mode)) throw new TypeError(`Invalid loop mode: ${mode}`);
  if (typeof player.setLoop === "function") player.setLoop(mode);
  else player.loop = mode;
}

function setAutoplay(player, enabled, client = null) {
  if (!player.data) player.data = new Map();
  const autoplay = Boolean(enabled);
  const disabledLoop = autoplay && (player.loop || "none") !== "none";
  if (autoplay) applyLoop(player, "none");
  player.data.set("autoplay", autoplay);

  // When autoplay enabled and queue is empty, proactively prefetch upcoming recommendation
  if (autoplay && (player.queue?.length || player.queue?.size || 0) === 0) {
    const currentClient = client || player.manager?.client || player.client;
    if (currentClient) {
      try {
        const { attemptAutoplay } = require("./playerUtils");
        attemptAutoplay(currentClient, player).catch(() => {});
      } catch {}
    }
  } else if (!autoplay && player.queue?.length > 0) {
    // When autoplay disabled, purge any pending autoplay recommendation tracks from queue
    for (let i = player.queue.length - 1; i >= 0; i--) {
      if (player.queue[i]?.isAutoplay) {
        if (typeof player.queue.remove === "function") player.queue.remove(i);
        else player.queue.splice(i, 1);
      }
    }
  }

  return { autoplay, disabledLoop };
}

function setLoopMode(player, mode) {
  applyLoop(player, mode);
  const disabledAutoplay = mode !== "none" && Boolean(player.data?.get("autoplay"));
  if (disabledAutoplay) player.data.set("autoplay", false);
  return { mode, disabledAutoplay };
}

function reconcilePlaybackModes(player) {
  if (!player.data?.get("autoplay") || (player.loop || "none") === "none") return false;
  applyLoop(player, "none");
  return true;
}

function stopPlaybackModes(player) {
  if (!player.data) player.data = new Map();
  player.data.set("autoplay", false);
  applyLoop(player, "none");
}

module.exports = { reconcilePlaybackModes, setAutoplay, setLoopMode, stopPlaybackModes };
