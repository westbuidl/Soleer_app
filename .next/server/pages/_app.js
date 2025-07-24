"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _solana_wallet_adapter_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @solana/wallet-adapter-base */ \"@solana/wallet-adapter-base\");\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"@solana/wallet-adapter-react\");\n/* harmony import */ var _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui */ \"@solana/wallet-adapter-react-ui\");\n/* harmony import */ var _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @solana/wallet-adapter-wallets */ \"@solana/wallet-adapter-wallets\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @solana/web3.js */ \"@solana/web3.js\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_base__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__]);\n([_solana_wallet_adapter_base__WEBPACK_IMPORTED_MODULE_2__, _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n//import type { AppProps } from 'next/app';\n\n\n\n\n\n\n\n// Default styles that can be overridden by your app\n__webpack_require__(/*! @solana/wallet-adapter-react-ui/styles.css */ \"(pages-dir-node)/./node_modules/@solana/wallet-adapter-react-ui/styles.css\");\nfunction MyApp({ Component, pageProps: { session, ...pageProps } }) {\n    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.\n    const network = _solana_wallet_adapter_base__WEBPACK_IMPORTED_MODULE_2__.WalletAdapterNetwork.Devnet;\n    // You can also provide a custom RPC endpoint.\n    const endpoint = (0,react__WEBPACK_IMPORTED_MODULE_7__.useMemo)({\n        \"MyApp.useMemo[endpoint]\": ()=>(0,_solana_web3_js__WEBPACK_IMPORTED_MODULE_6__.clusterApiUrl)(network)\n    }[\"MyApp.useMemo[endpoint]\"], [\n        network\n    ]);\n    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --\n    // Only the wallets you configure here will be compiled into your application, and only the dependencies\n    // of wallets that your users connect to will be loaded.\n    const wallets = (0,react__WEBPACK_IMPORTED_MODULE_7__.useMemo)({\n        \"MyApp.useMemo[wallets]\": ()=>[\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__.PhantomWalletAdapter(),\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__.SolflareWalletAdapter({\n                    network\n                }),\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__.TorusWalletAdapter()\n            ]\n    }[\"MyApp.useMemo[wallets]\"], [\n        network\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.ConnectionProvider, {\n        endpoint: endpoint,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.WalletProvider, {\n            wallets: wallets,\n            autoConnect: true,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_auth_react__WEBPACK_IMPORTED_MODULE_1__.SessionProvider, {\n                session: session,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__.WalletModalProvider, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"/Users/okekehyacinthafam/Solana/Soleer_app/src/pages/_app.tsx\",\n                        lineNumber: 39,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/Users/okekehyacinthafam/Solana/Soleer_app/src/pages/_app.tsx\",\n                    lineNumber: 38,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/okekehyacinthafam/Solana/Soleer_app/src/pages/_app.tsx\",\n                lineNumber: 37,\n                columnNumber: 7\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/okekehyacinthafam/Solana/Soleer_app/src/pages/_app.tsx\",\n            lineNumber: 36,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/okekehyacinthafam/Solana/Soleer_app/src/pages/_app.tsx\",\n        lineNumber: 35,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNrRDtBQUNsRCwyQ0FBMkM7QUFDd0I7QUFDTDtBQUNJO0FBQ0k7QUFDMkM7QUFDakU7QUFDaEI7QUFFaEMsb0RBQW9EO0FBQ3BEVSxtQkFBT0EsQ0FBQyw4SEFBNEM7QUFFcEQsU0FBU0MsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsT0FBTyxFQUFFLEdBQUdELFdBQVcsRUFBWTtJQUMxRSxvRUFBb0U7SUFDcEUsTUFBTUUsVUFBVWQsNkVBQW9CQSxDQUFDZSxNQUFNO0lBRTNDLDhDQUE4QztJQUM5QyxNQUFNQyxXQUFXUiw4Q0FBT0E7bUNBQUMsSUFBTUQsOERBQWFBLENBQUNPO2tDQUFVO1FBQUNBO0tBQVE7SUFFaEUseUdBQXlHO0lBQ3pHLHdHQUF3RztJQUN4Ryx3REFBd0Q7SUFDeEQsTUFBTUcsVUFBVVQsOENBQU9BO2tDQUNyQixJQUFNO2dCQUNKLElBQUlKLGdGQUFvQkE7Z0JBQ3hCLElBQUlDLGlGQUFxQkEsQ0FBQztvQkFBRVM7Z0JBQVE7Z0JBQ3BDLElBQUlSLDhFQUFrQkE7YUFDdkI7aUNBQ0Q7UUFBQ1E7S0FBUTtJQUdYLHFCQUNFLDhEQUFDWiw0RUFBa0JBO1FBQUNjLFVBQVVBO2tCQUM1Qiw0RUFBQ2Ysd0VBQWNBO1lBQUNnQixTQUFTQTtZQUFTQyxXQUFXO3NCQUM3Qyw0RUFBQ25CLDREQUFlQTtnQkFBQ2MsU0FBU0E7MEJBQ3hCLDRFQUFDVixnRkFBbUJBOzhCQUNsQiw0RUFBQ1E7d0JBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNbEM7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL29rZWtlaHlhY2ludGhhZmFtL1NvbGFuYS9Tb2xlZXJfYXBwL3NyYy9wYWdlcy9fYXBwLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xuaW1wb3J0IHsgU2Vzc2lvblByb3ZpZGVyIH0gZnJvbSAnbmV4dC1hdXRoL3JlYWN0Jztcbi8vaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCB7IFdhbGxldEFkYXB0ZXJOZXR3b3JrIH0gZnJvbSAnQHNvbGFuYS93YWxsZXQtYWRhcHRlci1iYXNlJztcbmltcG9ydCB7IFdhbGxldFByb3ZpZGVyIH0gZnJvbSAnQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdCc7XG5pbXBvcnQgeyBDb25uZWN0aW9uUHJvdmlkZXIgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0JztcbmltcG9ydCB7IFdhbGxldE1vZGFsUHJvdmlkZXIgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0LXVpJztcbmltcG9ydCB7IFBoYW50b21XYWxsZXRBZGFwdGVyLCBTb2xmbGFyZVdhbGxldEFkYXB0ZXIsIFRvcnVzV2FsbGV0QWRhcHRlciB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItd2FsbGV0cyc7XG5pbXBvcnQgeyBjbHVzdGVyQXBpVXJsIH0gZnJvbSAnQHNvbGFuYS93ZWIzLmpzJztcbmltcG9ydCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5cbi8vIERlZmF1bHQgc3R5bGVzIHRoYXQgY2FuIGJlIG92ZXJyaWRkZW4gYnkgeW91ciBhcHBcbnJlcXVpcmUoJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItcmVhY3QtdWkvc3R5bGVzLmNzcycpO1xuXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzOiB7IHNlc3Npb24sIC4uLnBhZ2VQcm9wcyB9IH06IEFwcFByb3BzKSB7XG4gIC8vIFRoZSBuZXR3b3JrIGNhbiBiZSBzZXQgdG8gJ2Rldm5ldCcsICd0ZXN0bmV0Jywgb3IgJ21haW5uZXQtYmV0YScuXG4gIGNvbnN0IG5ldHdvcmsgPSBXYWxsZXRBZGFwdGVyTmV0d29yay5EZXZuZXQ7XG5cbiAgLy8gWW91IGNhbiBhbHNvIHByb3ZpZGUgYSBjdXN0b20gUlBDIGVuZHBvaW50LlxuICBjb25zdCBlbmRwb2ludCA9IHVzZU1lbW8oKCkgPT4gY2x1c3RlckFwaVVybChuZXR3b3JrKSwgW25ldHdvcmtdKTtcblxuICAvLyBAc29sYW5hL3dhbGxldC1hZGFwdGVyLXdhbGxldHMgaW5jbHVkZXMgYWxsIHRoZSBhZGFwdGVycyBidXQgc3VwcG9ydHMgdHJlZSBzaGFraW5nIGFuZCBsYXp5IGxvYWRpbmcgLS1cbiAgLy8gT25seSB0aGUgd2FsbGV0cyB5b3UgY29uZmlndXJlIGhlcmUgd2lsbCBiZSBjb21waWxlZCBpbnRvIHlvdXIgYXBwbGljYXRpb24sIGFuZCBvbmx5IHRoZSBkZXBlbmRlbmNpZXNcbiAgLy8gb2Ygd2FsbGV0cyB0aGF0IHlvdXIgdXNlcnMgY29ubmVjdCB0byB3aWxsIGJlIGxvYWRlZC5cbiAgY29uc3Qgd2FsbGV0cyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gW1xuICAgICAgbmV3IFBoYW50b21XYWxsZXRBZGFwdGVyKCksXG4gICAgICBuZXcgU29sZmxhcmVXYWxsZXRBZGFwdGVyKHsgbmV0d29yayB9KSxcbiAgICAgIG5ldyBUb3J1c1dhbGxldEFkYXB0ZXIoKSxcbiAgICBdLFxuICAgIFtuZXR3b3JrXVxuICApO1xuXG4gIHJldHVybiAoXG4gICAgPENvbm5lY3Rpb25Qcm92aWRlciBlbmRwb2ludD17ZW5kcG9pbnR9PlxuICAgICAgPFdhbGxldFByb3ZpZGVyIHdhbGxldHM9e3dhbGxldHN9IGF1dG9Db25uZWN0PlxuICAgICAgPFNlc3Npb25Qcm92aWRlciBzZXNzaW9uPXtzZXNzaW9ufT5cbiAgICAgICAgPFdhbGxldE1vZGFsUHJvdmlkZXI+XG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICA8L1dhbGxldE1vZGFsUHJvdmlkZXI+XG4gICAgICAgIDwvU2Vzc2lvblByb3ZpZGVyPlxuICAgICAgPC9XYWxsZXRQcm92aWRlcj5cbiAgICA8L0Nvbm5lY3Rpb25Qcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7Il0sIm5hbWVzIjpbIlNlc3Npb25Qcm92aWRlciIsIldhbGxldEFkYXB0ZXJOZXR3b3JrIiwiV2FsbGV0UHJvdmlkZXIiLCJDb25uZWN0aW9uUHJvdmlkZXIiLCJXYWxsZXRNb2RhbFByb3ZpZGVyIiwiUGhhbnRvbVdhbGxldEFkYXB0ZXIiLCJTb2xmbGFyZVdhbGxldEFkYXB0ZXIiLCJUb3J1c1dhbGxldEFkYXB0ZXIiLCJjbHVzdGVyQXBpVXJsIiwidXNlTWVtbyIsInJlcXVpcmUiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInNlc3Npb24iLCJuZXR3b3JrIiwiRGV2bmV0IiwiZW5kcG9pbnQiLCJ3YWxsZXRzIiwiYXV0b0Nvbm5lY3QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "@solana/wallet-adapter-base":
/*!**********************************************!*\
  !*** external "@solana/wallet-adapter-base" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = import("@solana/wallet-adapter-base");;

/***/ }),

/***/ "@solana/wallet-adapter-react":
/*!***********************************************!*\
  !*** external "@solana/wallet-adapter-react" ***!
  \***********************************************/
/***/ ((module) => {

module.exports = import("@solana/wallet-adapter-react");;

/***/ }),

/***/ "@solana/wallet-adapter-react-ui":
/*!**************************************************!*\
  !*** external "@solana/wallet-adapter-react-ui" ***!
  \**************************************************/
/***/ ((module) => {

module.exports = import("@solana/wallet-adapter-react-ui");;

/***/ }),

/***/ "@solana/wallet-adapter-wallets":
/*!*************************************************!*\
  !*** external "@solana/wallet-adapter-wallets" ***!
  \*************************************************/
/***/ ((module) => {

module.exports = import("@solana/wallet-adapter-wallets");;

/***/ }),

/***/ "@solana/web3.js":
/*!**********************************!*\
  !*** external "@solana/web3.js" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@solana/web3.js");

/***/ }),

/***/ "next-auth/react":
/*!**********************************!*\
  !*** external "next-auth/react" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("next-auth/react");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@solana"], () => (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();