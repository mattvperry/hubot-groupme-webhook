/// <reference path="..\..\typings\main.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const hubot_1 = require("hubot");
const groupme_1 = require("groupme");
const promisify = require("es6-promisify");
class GroupMeAdapter extends hubot_1.Adapter {
    constructor(robot) {
        super(robot);
        this.robot.logger.info("Initialize GroupMe Adapter");
        this._maxLen = 1000;
        this._token = process.env.HUBOT_GROUPME_TOKEN;
        this._botId = process.env.HUBOT_GROUPME_BOT_ID;
    }
    run() {
        return __awaiter(this, void 0, Promise, function* () {
            this.robot.logger.info("Run GroupMe Adapter");
            try {
                let bots = yield promisify(groupme_1.Stateless.Bots.index)(this._token);
                let bot = bots.filter((bot) => bot.bot_id === this._botId)[0];
                let group = yield promisify(groupme_1.Stateless.Groups.show)(this._token, bot.group_id);
                for (let member of group.members) {
                    this.robot.brain.userForId(member.user_id, {
                        room: group.id,
                        name: member.nickname
                    });
                }
                this.robot.router.post("/hubot/incoming", (req, res) => {
                    if (req.body.sender_type !== "bot") {
                        let user = this.robot.brain.userForId(req.body.user_id);
                        this.receive(new hubot_1.TextMessage(user, req.body.text, req.body.id));
                    }
                    res.writeHead(200, { "Content-Type": "text/plain " });
                    res.end();
                });
            }
            catch (e) {
                this.robot.logger.error(e);
            }
        });
    }
    send(envelope, ...strings) {
        return __awaiter(this, void 0, Promise, function* () {
            let delay = this._delay(2000);
            let messages = this._chunkStrings(strings);
            let botPost = promisify(groupme_1.Stateless.Bots.post);
            try {
                yield delay;
                for (let message of messages) {
                    yield botPost(this._token, this._botId, message, {});
                    yield this._delay(1000);
                }
            }
            catch (e) {
                this.robot.logger.error(e.body);
            }
        });
    }
    reply(envelope, ...strings) {
        return __awaiter(this, void 0, Promise, function* () {
            return this.send(envelope, `@${envelope.user.name} ${strings[0]}`, ...(strings.slice(1)));
        });
    }
    topic(envelope, ...strings) {
        return __awaiter(this, void 0, Promise, function* () {
            return this.send(envelope, `/topic ${strings[0]}`);
        });
    }
    _delay(ms) {
        return __awaiter(this, void 0, Promise, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, ms);
            });
        });
    }
    _chunkStrings(strings) {
        // First pass break on new lines
        let result = [].concat(strings.map((s) => this._wrapWith(s, [], "\n")));
        // Second pass break on words
        result = [].concat(strings.map((s) => this._wrapWith(s, [], " ")));
        // Third pass break on chars
        return [].concat(strings.map((s) => this._wrapWith(s, [], "")));
    }
    _wrapWith(text, seed, delimiter) {
        if (text.length > this._maxLen) {
            let edge = text.slice(0, this._maxLen).lastIndexOf(delimiter);
            if (edge > 0) {
                let line = text.slice(0, edge);
                let remainder = text.slice(edge + 1);
                seed = this._wrapWith(remainder, seed, delimiter);
                return [line].concat(seed);
            }
        }
        return [text].concat(seed);
    }
}
function use(robot) {
    return new GroupMeAdapter(robot);
}
exports.use = use;
