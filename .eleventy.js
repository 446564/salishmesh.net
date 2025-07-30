
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css/");
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addPassthroughCopy({
    "./node_modules/ol": "/assets/js/ol"
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addPlugin(eleventyNavigationPlugin, {
    navigationOptions: {
      activeListItemClass: "focus",
    },
  });
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: ["webp", "jpeg"],

    // output image widths
    widths: [880],

    // optional, attributes assigned on <img> nodes override these values
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
      pictureAttributes: {}
    },
  },
  );

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
