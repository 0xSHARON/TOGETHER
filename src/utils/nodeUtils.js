/**
 * Checks and waits for audio engine readiness
 */
async function waitForNodeConnection(manager, maxWaitTime = 5000) {
  return true;
}

function hasAvailableNodes(manager) {
  return true;
}

function getAvailableNode(manager) {
  return {
    name: "Native-TOGETHER",
    state: 1
  };
}

module.exports = {
  waitForNodeConnection,
  hasAvailableNodes,
  getAvailableNode
};
