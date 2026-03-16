module.exports = function(eleventyConfig) {
  // Passthrough copy
  eleventyConfig.addPassthroughCopy({"src/css": "css"});
  eleventyConfig.addPassthroughCopy({"src/js": "js"});
  eleventyConfig.addPassthroughCopy({"src/images": "images"});
  eleventyConfig.addPassthroughCopy({"src/_redirects": "_redirects"});
  
  // Passthrough .well-known for deep linking (Apple/Android app association)
  // Check both locations - root level takes precedence
  eleventyConfig.addPassthroughCopy({".well-known": ".well-known"});
  eleventyConfig.addPassthroughCopy({"src/.well-known": ".well-known"});
  
  // Passthrough CNAME for custom domain
  eleventyConfig.addPassthroughCopy("CNAME");

  // Watch targets
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Date filters
  eleventyConfig.addFilter("dateFormat", function(dateString, format) {
    const date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    if (format === "MMMM D, YYYY") {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    if (format === "YYYY-MM-DD") {
      return date.toISOString().slice(0, 10);
    }
    return dateString;
  });

  eleventyConfig.addFilter("isoDate", function(date) {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  });

  // Blog collection
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByTag("article").sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });

  // Industry landing pages collection
  eleventyConfig.addCollection("industries", function(collectionApi) {
    return collectionApi.getFilteredByTag("industry");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};