module.exports = {
  "globDirectory": "public",
  "globPatterns": [
    "**/*.html",
    "css/*.css",
    "js/esm/*.js",
    "js/vendor/*.js",
  ],
  "swDest": "public/js/esm/sw.js",
  "swSrc": "./src/sw.js",
  "maximumFileSizeToCacheInBytes": 5000000,
  "modifyURLPrefix": {
    "js/": "/js/",
    "css/": "/css/",
    "index.": "/index."
  }
};