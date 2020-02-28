module.exports = {
  "globDirectory": "public",
  "globPatterns": [
    "**/*.html",
    "js/esm/*.js",
    "js/vendor/*.js",
  ],
  "swDest": "public/js/esm/sw.js",
  "swSrc": "./src/sw.js",
  "modifyURLPrefix": {
    "js/": "/js/",
    "index.": "/index."
  }
};