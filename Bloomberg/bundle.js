/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _App = __webpack_require__(1);
	
	var _App2 = _interopRequireDefault(_App);
	
	var _Sidebar = __webpack_require__(5);
	
	var _Sidebar2 = _interopRequireDefault(_Sidebar);
	
	var _ContentDisplay = __webpack_require__(6);
	
	var _ContentDisplay2 = _interopRequireDefault(_ContentDisplay);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var app = document.getElementById('app');
	
	new _App2.default();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _EventManager = __webpack_require__(2);
	
	var _EventManager2 = _interopRequireDefault(_EventManager);
	
	var _Events = __webpack_require__(3);
	
	var _Events2 = _interopRequireDefault(_Events);
	
	var _DisplayTypes = __webpack_require__(4);
	
	var _DisplayTypes2 = _interopRequireDefault(_DisplayTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var App = function () {
	    function App() {
	        _classCallCheck(this, App);
	
	        this.displayType = _DisplayTypes2.default.LIST_TYPE;
	
	        this.el = document.getElementById('app');
	
	        this.addListeners();
	    }
	
	    _createClass(App, [{
	        key: 'addListeners',
	        value: function addListeners() {
	            _EventManager2.default.on(_Events2.default.CHANGE_DISPLAY_TYPE, this.onChangeDisplayType.bind(this));
	        }
	    }, {
	        key: 'removeListeners',
	        value: function removeListeners() {
	            //
	        }
	    }, {
	        key: 'onChangeDisplayType',
	        value: function onChangeDisplayType(data) {
	            this.el.classList.remove(this.displayType);
	            this.el.classList.add(data.type);
	            this.displayType = data.type;
	        }
	    }]);
	
	    return App;
	}();
	
	exports.default = App;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	var Callbacks = {};
	
	function guid() {
	    function s4() {
	        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	    }
	    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
	
	var EventManager = {
	    on: function on(at, callback) {
	        if (at == '') return false;
	        //var id = callback.__reactBoundContext._reactInternalInstance._rootNodeID;
	        var id = guid();
	        if (at in Callbacks) {
	            Callbacks[at][id] = callback;
	        } else {
	            Callbacks[at] = {};
	            Callbacks[at][id] = callback;
	        }
	        return id;
	    },
	    trigger: function trigger(at, data) {
	        //data = data || '';
	        var obj = Callbacks[at];
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop)) {
	                obj[prop](data);
	            }
	        }
	    },
	    remove: function remove(at, id) {
	        if (Callbacks[at] && Callbacks[at][id]) delete Callbacks[at][id];
	    },
	    removeAll: function removeAll(at) {
	        delete Callbacks[at];
	    }
	};
	
	module.exports = EventManager;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	var Events = {
	    CHANGE_DISPLAY_TYPE: "changeDisplayType"
	};
	
	module.exports = Events;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	var DisplayTypes = {
	    LIST_TYPE: "list-type",
	    GRID_TYPE: "grid-type",
	    METRO_TYPE: "metro-type"
	};
	
	module.exports = DisplayTypes;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _EventManager = __webpack_require__(2);
	
	var _EventManager2 = _interopRequireDefault(_EventManager);
	
	var _Events = __webpack_require__(3);
	
	var _Events2 = _interopRequireDefault(_Events);
	
	var _DisplayTypes = __webpack_require__(4);
	
	var _DisplayTypes2 = _interopRequireDefault(_DisplayTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Sidebar = function () {
	    function Sidebar() {
	        _classCallCheck(this, Sidebar);
	
	        this.timeout = 0;
	        this.secondKeypressTimeout = 0;
	        this.isOpen = false;
	        this.isAltKeyPressed = false;
	        this.isModifierKeyPressed = false;
	
	        this.openedWithMouse = true;
	        this.openedWithAltKey = true;
	
	        this.body = document.body;
	        this.sidebar = document.getElementById('side-menu');
	        this.sidebarButtons = document.getElementsByClassName("sidebar-button");
	        this.spotter = document.getElementById('side-menu-spotter');
	
	        this.addListeners();
	    }
	
	    _createClass(Sidebar, [{
	        key: 'addListeners',
	        value: function addListeners() {
	            this.body.addEventListener("keydown", this.onKeyDown.bind(this));
	            this.body.addEventListener("keyup", this.onKeyUp.bind(this));
	            this.sidebar.addEventListener("mouseleave", this.onMouseLeaveSidebar.bind(this));
	            this.spotter.addEventListener("mouseover", this.onMouseOverSpotter.bind(this));
	            this.spotter.addEventListener("mouseleave", this.onMouseLeaveSpotter.bind(this));
	
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = this.sidebarButtons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var btn = _step.value;
	
	                    btn.addEventListener("click", this.onClickSidebarButton.bind(this));
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'removeListeners',
	        value: function removeListeners() {
	            this.body.removeEventListener("keydown", this.onKeyDown);
	            this.body.removeEventListener("keyup", this.onKeyUp);
	            this.sidebar.removeEventListener("mouseleave", this.onMouseLeaveSidebar);
	            this.spotter.removeEventListener("mouseover", this.onMouseOverSpotter);
	            this.spotter.removeEventListener("mouseleave", this.onMouseLeaveSpotter);
	
	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;
	
	            try {
	                for (var _iterator2 = this.sidebarButtons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var button = _step2.value;
	
	                    button.removeEventListener("onclick", this.onClickSidebarButton);
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                        _iterator2.return();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'onClickSidebarButton',
	        value: function onClickSidebarButton(evt) {
	            var type = evt.target.getAttribute('data-type');
	            this.changeDisplayType(type);
	            this.setSidebarButtonState(type);
	        }
	    }, {
	        key: 'onKeyDown',
	        value: function onKeyDown(evt) {
	            var _this = this;
	
	            //if(this.isOpen) return;
	            if (this.openedWithMouse && this.isOpen) return;
	
	            if (evt.altKey && this.isOpen && this.openedWithAltKey) {
	                this.close();
	                return;
	            }
	
	            if (evt.altKey || this.isAltKeyPressed || this.isOpen) {
	                this.isAltKeyPressed = true;
	                this.openedWithAltKey = true;
	                this.openedWithMouse = false;
	
	                console.log(evt.keyCode);
	
	                var type = undefined;
	                if (evt.keyCode === 71) {
	                    type = _DisplayTypes2.default.GRID_TYPE;
	                } else if (evt.keyCode === 76) {
	                    type = _DisplayTypes2.default.LIST_TYPE;
	                } else if (evt.keyCode === 77) {
	                    type = _DisplayTypes2.default.METRO_TYPE;
	                }
	
	                if (type) {
	                    this.clearSecondKeypressTimeout();
	                    this.isModifierKeyPressed = true;
	                    this.changeDisplayType(type);
	                } else {
	                    this.secondKeypressTimeout = setTimeout(function () {
	                        _this.open();
	                    }, 500);
	                }
	            }
	        }
	    }, {
	        key: 'onKeyUp',
	        value: function onKeyUp(evt) {
	            if (this.isAltKeyPressed && !this.isModifierKeyPressed) {
	                this.open();
	            }
	            this.isModifierKeyPressed = false;
	            this.isAltKeyPressed = false;
	        }
	    }, {
	        key: 'onMouseLeaveSidebar',
	        value: function onMouseLeaveSidebar(evt) {
	            if (!this.openedWithMouse) return;
	            this.openedWithMouse = false;
	            this.openedWithAltKey = true;
	            this.close();
	        }
	    }, {
	        key: 'onMouseOverSpotter',
	        value: function onMouseOverSpotter(evt) {
	            var _this2 = this;
	
	            this.timeout = setTimeout(function () {
	                _this2.openedWithMouse = true;
	                _this2.openedWithAltKey = false;
	                _this2.open();
	            }, 1000);
	        }
	    }, {
	        key: 'onMouseLeaveSpotter',
	        value: function onMouseLeaveSpotter(evt) {
	            clearTimeout(this.timeout);
	            this.timeout = 0;
	        }
	    }, {
	        key: 'clearSecondKeypressTimeout',
	        value: function clearSecondKeypressTimeout() {
	            clearTimeout(this.secondKeypressTimeout);
	            this.secondKeypressTimeout = 0;
	        }
	    }, {
	        key: 'open',
	        value: function open() {
	            if (this.isOpen) return;
	            this.clearSecondKeypressTimeout();
	            this.isOpen = true;
	            this.sidebar.classList.add("open");
	        }
	    }, {
	        key: 'close',
	        value: function close() {
	            this.isOpen = false;
	            this.sidebar.classList.remove("open");
	        }
	    }, {
	        key: 'setSidebarButtonState',
	        value: function setSidebarButtonState(type) {
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;
	
	            try {
	                for (var _iterator3 = this.sidebarButtons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var button = _step3.value;
	
	                    if (button.getAttribute("data-type") === type) {
	                        button.classList.add("selected");
	                    } else {
	                        button.classList.remove("selected");
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                        _iterator3.return();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'changeDisplayType',
	        value: function changeDisplayType(type) {
	            this.clearSecondKeypressTimeout();
	            this.setSidebarButtonState(type);
	            _EventManager2.default.trigger(_Events2.default.CHANGE_DISPLAY_TYPE, { type: type });
	        }
	    }]);
	
	    return Sidebar;
	}();
	
	exports.default = new Sidebar();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _ContentItem = __webpack_require__(7);
	
	var _ContentItem2 = _interopRequireDefault(_ContentItem);
	
	var _EventManager = __webpack_require__(2);
	
	var _EventManager2 = _interopRequireDefault(_EventManager);
	
	var _Events = __webpack_require__(3);
	
	var _Events2 = _interopRequireDefault(_Events);
	
	var _DisplayTypes = __webpack_require__(4);
	
	var _DisplayTypes2 = _interopRequireDefault(_DisplayTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ContentDisplay = function () {
	    function ContentDisplay() {
	        _classCallCheck(this, ContentDisplay);
	
	        this.displayType = _DisplayTypes2.default.LIST_TYPE;
	
	        this.el = document.getElementById('content-display');
	
	        this.addListeners();
	        this.render();
	    }
	
	    _createClass(ContentDisplay, [{
	        key: 'addListeners',
	        value: function addListeners() {
	            _EventManager2.default.on(_Events2.default.CHANGE_DISPLAY_TYPE, this.onChangeDisplayType.bind(this));
	        }
	    }, {
	        key: 'removeListeners',
	        value: function removeListeners() {
	            //
	        }
	    }, {
	        key: 'onChangeDisplayType',
	        value: function onChangeDisplayType(data) {
	            this.el.classList.remove(this.displayType);
	            this.el.classList.add(data.type);
	            this.displayType = data.type;
	        }
	    }, {
	        key: 'renderItem',
	        value: function renderItem(data) {
	            var item = new _ContentItem2.default(data);
	            return item.render();
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            for (var i = 0; i < 149; i++) {
	                this.el.appendChild(this.renderItem(i + 1));
	            }
	        }
	    }]);
	
	    return ContentDisplay;
	}();
	
	exports.default = new ContentDisplay();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _EventManager = __webpack_require__(2);
	
	var _EventManager2 = _interopRequireDefault(_EventManager);
	
	var _Events = __webpack_require__(3);
	
	var _Events2 = _interopRequireDefault(_Events);
	
	var _DisplayTypes = __webpack_require__(4);
	
	var _DisplayTypes2 = _interopRequireDefault(_DisplayTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ContentItem = function () {
	    function ContentItem(data) {
	        _classCallCheck(this, ContentItem);
	
	        this.data = data;
	        this.name = "TMP";
	        this.displayType = _DisplayTypes2.default.LIST_TYPE;
	        this.addListeners();
	    }
	
	    _createClass(ContentItem, [{
	        key: 'addListeners',
	        value: function addListeners() {
	            _EventManager2.default.on(_Events2.default.CHANGE_DISPLAY_TYPE, this.onChangeDisplayType.bind(this));
	        }
	    }, {
	        key: 'removeListeners',
	        value: function removeListeners() {
	            //
	        }
	    }, {
	        key: 'onChangeDisplayType',
	        value: function onChangeDisplayType(data) {
	            var items = document.getElementsByClassName("content-item");
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var item = _step.value;
	
	                    item.classList.remove(this.displayType);
	                    item.classList.add(data.type);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	
	            this.displayType = data.type;
	        }
	    }, {
	        key: 'onClickRowHandler',
	        value: function onClickRowHandler(event) {
	            var classList = event.currentTarget.classList;
	            if (classList.contains("active")) {
	                classList.remove("active");
	            } else {
	                classList.add("active");
	            }
	        }
	    }, {
	        key: 'createItem',
	        value: function createItem() {
	            var _this = this;
	
	            var div = document.createElement("div");
	            div.className = "content-item " + _DisplayTypes2.default.LIST_TYPE;
	            div.addEventListener('click', function (evt) {
	                return _this.onClickRowHandler(evt);
	            });
	
	            return div;
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var name = this.data;
	            var item = this.createItem();
	            item.innerHTML = '<p>Item ' + name + '</p>';
	
	            return item;
	        }
	    }]);
	
	    return ContentItem;
	}();
	
	exports.default = ContentItem;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map