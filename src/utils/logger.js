const moment = require("moment-timezone");

/**
 * TOGETHER - Bordered Studio Card Logger (TUI)
 * Clean box-drawing grid aesthetic for professional audio telemetry.
 */
class Logger {
  static _lastLogTime = 0;
  static _started = false;

  static get now() {
    return moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");
  }

  /**
   * Defines the color palette and styles using ANSI codes.
   * Keeping it raw for high performance and zero external dependencies.
   */
  static get style() {
    return {
      reset: "\x1b[0m",
      bold: "\x1b[1m",
      dim: "\x1b[2m",
      italic: "\x1b[3m",

      // Foreground Colors
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      gray: "\x1b[90m",

      // Background Colors
      bgRed: "\x1b[41m",
      bgGreen: "\x1b[42m",
      bgYellow: "\x1b[43m",
      bgBlue: "\x1b[44m",
      bgMagenta: "\x1b[45m",
      bgCyan: "\x1b[46m",
      bgWhite: "\x1b[47m",
    };
  }

  static _print(type, color, message) {
    const s = this.style;
    const now = this.now;
    const isError = type === "ERROR";
    const isNewBlock = !this._started || (Date.now() - this._lastLogTime > 4000);

    let left, mid, right;
    if (isNewBlock) {
      left = "┌";
      mid = "┬";
      right = "──┐";
      this._started = true;
    } else if (isError) {
      left = "└";
      mid = "┴";
      right = "──┘";
      this._started = false;
    } else {
      left = "│";
      mid = "│";
      right = "──┤";
    }

    this._lastLogTime = Date.now();

    const badge = `${color}${s.bold}${type.padEnd(5)}${s.reset}`;
    const timeStr = `${s.white}${now}${s.reset}`;
    const frameLeft = `${s.gray}${left} ${timeStr} ${mid} ${badge} ${right}${s.reset}`;
    const prefixLen = 1 + 1 + now.length + 1 + 1 + 1 + 5 + 1 + 3 + 1;

    const lines = String(message ?? "").split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (idx === 0) {
        console.log(`${frameLeft} ${s.white}${line}${s.reset}`);
      } else {
        const indent = " ".repeat(Math.max(0, prefixLen - 2));
        console.log(`${s.gray}│${s.reset}${indent} ${s.dim}${line}${s.reset}`);
      }
    });
  }

  static log(message, type = "info") {
    switch (type.toLowerCase()) {
      case "info":
      case "log":
        this.info(message);
        break;
      case "warn":
      case "warning":
        this.warn(message);
        break;
      case "error":
      case "err":
        this.error(message);
        break;
      case "debug":
        this.debug(message);
        break;
      case "cmd":
        this.cmd(message);
        break;
      case "event":
        this.event(message);
        break;
      case "ready":
        this.ready(message);
        break;
      case "audio":
        this.audio(message);
        break;
      case "system":
      case "sys":
        this.system(message);
        break;
      default:
        this.info(message);
        break;
    }
  }

  static info(message) {
    this._print("INFO", this.style.cyan, message);
  }

  static warn(message) {
    this._print("WARN", this.style.yellow, message);
  }

  static error(message) {
    this._print("ERROR", this.style.red, message);
  }

  static debug(message) {
    this._print("DEBUG", this.style.gray, message);
  }

  static cmd(message) {
    this._print("CMD", this.style.blue, message);
  }

  static event(message) {
    this._print("EVENT", this.style.magenta, message);
  }

  static ready(message) {
    this._print("READY", this.style.green, message);
  }

  static audio(message) {
    this._print("AUDIO", this.style.cyan, message);
  }

  static system(message) {
    this._print("SYS", this.style.white, message);
  }
}

module.exports = Logger;
