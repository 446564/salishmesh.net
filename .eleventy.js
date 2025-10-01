
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = function (eleventyConfig) {
  // Cache busting: copy CSS with hash in filename
  eleventyConfig.on('eleventy.before', async () => {
    const cssPath = './src/css/style.css';
    const content = fs.readFileSync(cssPath);
    const hash = crypto.createHash("md5").update(content).digest("hex").substring(0, 10);
    const outputDir = './public/css';

    // Store hash for use in filter
    global.cssHash = hash;

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Copy CSS with hashed filename: style-hash.css
    const hashedFilename = `style-${hash}.css`;
    fs.copyFileSync(cssPath, path.join(outputDir, hashedFilename));
  });

  // Filter to get hashed CSS filename
  eleventyConfig.addFilter("cacheBust", function(filepath) {
    if (filepath === '/css/style.css' && global.cssHash) {
      return `/css/style-${global.cssHash}.css`;
    }
    return filepath;
  });

  eleventyConfig.addWatchTarget("./src/css/");

  eleventyConfig.addPassthroughCopy("./src/images/coverage");
  eleventyConfig.addWatchTarget("./src/images/coverage");

  eleventyConfig.addPassthroughCopy("./src/images/salishmesh-logo.svg");

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
