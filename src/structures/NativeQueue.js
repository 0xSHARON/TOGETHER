class NativeQueue extends Array {
  constructor() {
    super();
    this.current = null;
    this.previous = null;
  }

  add(track) {
    if (Array.isArray(track)) {
      this.push(...track);
    } else if (track) {
      this.push(track);
    }
    return this;
  }

  clear() {
    this.length = 0;
    return this;
  }

  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }

  remove(index) {
    if (index >= 0 && index < this.length) {
      return this.splice(index, 1)[0];
    }
    return null;
  }

  get size() {
    return this.length;
  }

  get totalSize() {
    return this.length + (this.current ? 1 : 0);
  }

  get duration() {
    return this.reduce((acc, cur) => acc + (Number(cur.length || cur.duration) || 0), 0);
  }
}

module.exports = NativeQueue;
