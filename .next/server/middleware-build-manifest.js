self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [
    "static/chunks/webpack.js",
    "static/chunks/main-app.js"
  ],
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/dashboard.js"
    ],
    "/inbox": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/inbox.js"
    ],
    "/privacy-policy": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/privacy-policy.js"
    ],
    "/profile": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/profile.js"
    ],
    "/terms-of-service": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/terms-of-service.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];