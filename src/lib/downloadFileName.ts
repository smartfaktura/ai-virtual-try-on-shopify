function sanitize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

export function buildLibraryFileName(item: {
  id: string;
  productName?: string;
  sceneName?: string;
  modelName?: string;
  workflowSlug?: string;
  label?: string;
}): string {
  const parts: string[] = [];

  if (item.productName) {
    parts.push(sanitize(item.productName));
  }

  if (item.sceneName) {
    parts.push(sanitize(item.sceneName));
  } else if (item.workflowSlug) {
    parts.push(sanitize(item.workflowSlug));
  }

  if (item.modelName) {
    parts.push(sanitize(item.modelName));
  }

  if (parts.length === 0 && item.label) {
    parts.push(sanitize(item.label));
  }

  parts.push(item.id.slice(0, 8));

  return parts.join('-');
}
