/// <reference path="..\..\typings\main.d.ts" />
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var hubot_1 = require("hubot");
var groupme_1 = require("groupme");
var promisify = require("es6-promisify");

var GroupMeAdapter = function (_hubot_1$Adapter) {
    (0, _inherits3.default)(GroupMeAdapter, _hubot_1$Adapter);

    function GroupMeAdapter(robot) {
        (0, _classCallCheck3.default)(this, GroupMeAdapter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(GroupMeAdapter).call(this, robot));

        _this.robot.logger.info("Initialize GroupMe Adapter");
        _this._maxLen = 1000;
        _this._token = process.env.HUBOT_GROUPME_TOKEN;
        _this._botId = process.env.HUBOT_GROUPME_BOT_ID;
        return _this;
    }

    (0, _createClass3.default)(GroupMeAdapter, [{
        key: "run",
        value: function run() {
            return __awaiter(this, void 0, _promise2.default, _regenerator2.default.mark(function _callee() {
                var _this2 = this;

                var bots, bot, group, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, member;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.robot.logger.info("Run GroupMe Adapter");
                                _context.prev = 1;
                                _context.next = 4;
                                return promisify(groupme_1.Stateless.Bots.index)(this._token);

                            case 4:
                                bots = _context.sent;
                                bot = bots.filter(function (bot) {
                                    return bot.bot_id === _this2._botId;
                                })[0];
                                _context.next = 8;
                                return promisify(groupme_1.Stateless.Groups.show)(this._token, bot.group_id);

                            case 8:
                                group = _context.sent;
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 12;

                                for (_iterator = (0, _getIterator3.default)(group.members); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    member = _step.value;

                                    this.robot.brain.userForId(member.user_id, {
                                        room: group.id,
                                        name: member.nickname
                                    });
                                }
                                _context.next = 20;
                                break;

                            case 16:
                                _context.prev = 16;
                                _context.t0 = _context["catch"](12);
                                _didIteratorError = true;
                                _iteratorError = _context.t0;

                            case 20:
                                _context.prev = 20;
                                _context.prev = 21;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 23:
                                _context.prev = 23;

                                if (!_didIteratorError) {
                                    _context.next = 26;
                                    break;
                                }

                                throw _iteratorError;

                            case 26:
                                return _context.finish(23);

                            case 27:
                                return _context.finish(20);

                            case 28:
                                this.robot.router.post("/hubot/incoming", function (req, res) {
                                    if (req.body.sender_type !== "bot") {
                                        var user = _this2.robot.brain.userForId(req.body.user_id);
                                        _this2.receive(new hubot_1.TextMessage(user, req.body.text, req.body.id));
                                    }
                                    res.writeHead(200, { "Content-Type": "text/plain " });
                                    res.end();
                                });
                                this.robot.logger.info("Connected to GroupMe");
                                this.emit("connected");
                                _context.next = 36;
                                break;

                            case 33:
                                _context.prev = 33;
                                _context.t1 = _context["catch"](1);

                                this._logError(_context.t1);

                            case 36:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 33], [12, 16, 20, 28], [21,, 23, 27]]);
            }));
        }
    }, {
        key: "send",
        value: function send(envelope) {
            for (var _len = arguments.length, strings = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                strings[_key - 1] = arguments[_key];
            }

            return __awaiter(this, void 0, _promise2.default, _regenerator2.default.mark(function _callee2() {
                var delay, messages, botPost, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, message;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                delay = this._delay(2000);
                                messages = this._chunkStrings(strings);
                                botPost = promisify(groupme_1.Stateless.Bots.post);
                                _context2.prev = 3;
                                _context2.next = 6;
                                return delay;

                            case 6:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 9;
                                _iterator2 = (0, _getIterator3.default)(messages);

                            case 11:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 20;
                                    break;
                                }

                                message = _step2.value;
                                _context2.next = 15;
                                return botPost(this._token, this._botId, message, {});

                            case 15:
                                _context2.next = 17;
                                return this._delay(1000);

                            case 17:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 11;
                                break;

                            case 20:
                                _context2.next = 26;
                                break;

                            case 22:
                                _context2.prev = 22;
                                _context2.t0 = _context2["catch"](9);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t0;

                            case 26:
                                _context2.prev = 26;
                                _context2.prev = 27;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 29:
                                _context2.prev = 29;

                                if (!_didIteratorError2) {
                                    _context2.next = 32;
                                    break;
                                }

                                throw _iteratorError2;

                            case 32:
                                return _context2.finish(29);

                            case 33:
                                return _context2.finish(26);

                            case 34:
                                _context2.next = 39;
                                break;

                            case 36:
                                _context2.prev = 36;
                                _context2.t1 = _context2["catch"](3);

                                this._logError(_context2.t1);

                            case 39:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[3, 36], [9, 22, 26, 34], [27,, 29, 33]]);
            }));
        }
    }, {
        key: "reply",
        value: function reply(envelope) {
            for (var _len2 = arguments.length, strings = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                strings[_key2 - 1] = arguments[_key2];
            }

            return this.send.apply(this, [envelope, "@" + envelope.user.name + " " + strings[0]].concat((0, _toConsumableArray3.default)(strings.slice(1))));
        }
    }, {
        key: "topic",
        value: function topic(envelope) {
            return this.send(envelope, "/topic " + (arguments.length <= 1 ? undefined : arguments[1]));
        }
    }, {
        key: "_logError",
        value: function _logError(e) {
            if (e.body) {
                this.robot.logger.error(e.body);
            } else {
                this.robot.logger.error(e);
            }
        }
    }, {
        key: "_delay",
        value: function _delay(ms) {
            return new _promise2.default(function (resolve, reject) {
                setTimeout(resolve, ms);
            });
        }
    }, {
        key: "_chunkStrings",
        value: function _chunkStrings(strings) {
            var _this3 = this;

            // First pass break on new lines
            var result = [].concat(strings.map(function (s) {
                return _this3._wrapWith(s, [], "\n");
            }));
            // Second pass break on words
            result = [].concat(strings.map(function (s) {
                return _this3._wrapWith(s, [], " ");
            }));
            // Third pass break on chars
            return [].concat(strings.map(function (s) {
                return _this3._wrapWith(s, [], "");
            }));
        }
    }, {
        key: "_wrapWith",
        value: function _wrapWith(text, seed, delimiter) {
            if (text.length > this._maxLen) {
                var edge = text.slice(0, this._maxLen).lastIndexOf(delimiter);
                if (edge > 0) {
                    var line = text.slice(0, edge);
                    var remainder = text.slice(edge + 1);
                    seed = this._wrapWith(remainder, seed, delimiter);
                    return [line].concat(seed);
                }
            }
            return [text].concat(seed);
        }
    }]);
    return GroupMeAdapter;
}(hubot_1.Adapter);

function use(robot) {
    return new GroupMeAdapter(robot);
}
exports.use = use;