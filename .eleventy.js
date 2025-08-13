
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css/");
  eleventyConfig.addWatchTarget("./src/css/");

  eleventyConfig.addPassthroughCopy("./src/images/coverage");
  eleventyConfig.addWatchTarget("./src/images/coverage");

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
  eleventyConfig.addPlugin(feedPlugin, {
		type: "rss",
		outputPath: "/feed.xml",
		collection: {
			name: "all",
			limit: 0,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Salish Mesh",
			subtitle: "Salish Sea and surrounding area mesh radio network based on MeshCore. Community operated, free and open.",
			base: "https://salishmesh.net/",
			author: {
				name: "Enot Skelly",
				email: "info@salishmesh.net",
			}
		}
	}
  );

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
