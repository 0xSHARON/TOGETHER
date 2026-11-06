function isHttpUrl(string) {
  if (!string || typeof string !== "string") return false;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = { isHttpUrl };

