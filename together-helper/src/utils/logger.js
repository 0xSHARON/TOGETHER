const Logger = {
  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  },
  info(msg) { this.log(msg, "info"); },
  ready(msg) { this.log(msg, "ready"); },
  warn(msg) { this.log(msg, "warn"); },
  error(msg) { this.log(msg, "error"); },
  system(msg) { this.log(msg, "system"); }
};

module.exports = Logger;
