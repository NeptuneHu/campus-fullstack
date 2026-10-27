function normalizeTags(input) {
  const list = Array.isArray(input) ? input : String(input || '').split(/[,，]/);
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))].slice(0, 5);
}

function readTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

module.exports = { normalizeTags, readTags };
