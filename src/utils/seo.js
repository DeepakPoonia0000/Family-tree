function absoluteUrl(base, maybePath) {
  if (!maybePath) return base;
  if (maybePath.startsWith('http://') || maybePath.startsWith('https://')) {
    return maybePath;
  }
  return `${base}${maybePath.startsWith('/') ? '' : '/'}${maybePath}`;
}

function buildSeo({
  siteName,
  siteUrl,
  defaultOgImage,
  title,
  description,
  path,
  ogImage,
  ogType = 'website',
  robots = 'index,follow'
}) {
  return {
    title: title || siteName,
    description: description || `Discover and preserve the ${siteName} family story across generations.`,
    ogType,
    robots,
    url: absoluteUrl(siteUrl, path || '/'),
    ogImage: absoluteUrl(siteUrl, ogImage || defaultOgImage)
  };
}

module.exports = { buildSeo };
