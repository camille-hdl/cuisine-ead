module.exports = {
    "globDirectory": "public",
    "globPatterns": [
      "**/*.html",
      "js/system/*.js",
      "js/vendor/*.js",
    ],
    "swDest": "public/js/system/sw.js",
    "swSrc": "./src/sw.js",
    "modifyURLPrefix": {
      "js/": "/js/",
      "index.": "/index."
    }
  };