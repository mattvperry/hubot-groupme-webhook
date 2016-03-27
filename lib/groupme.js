/// <reference path="..\typings\main.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const thenify = require("thenify");
const tsbot_1 = require("tsbot");
const groupme_1 = require("groupme");
class GroupMeAdapter extends tsbot_1.Adapter {
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
                let bots = yield thenify(groupme_1.Stateless.Bots.index)(this._token);
                let bot = bots.filter((bot) => bot.bot_id === this._botId)[0];
                let group = yield thenify(groupme_1.Stateless.Groups.show)(this._token, bot.group_id);
                for (let member of group.members) {
                    this.robot.brain.userForId(member.user_id, {
                        room: group.id,
                        name: member.nickname
                    });
                }
                this.robot.router.post("/hubot/incoming", (req, res) => {
                    if (req.body.sender_type !== "bot") {
                        let user = this.robot.brain.userForId(req.body.user_id);
                        this.receive(new tsbot_1.TextMessage(user, req.body.text, req.body.id));
                    }
                    res.writeHead(200, { "Content-Type": "text/plain " });
                    res.end();
                });
                this.robot.logger.info("Connected to GroupMe");
                this.emit("connected");
            }
            catch (e) {
                this._logError(e);
            }
        });
    }
    send(envelope, ...strings) {
        return __awaiter(this, void 0, Promise, function* () {
            let delay = this._delay(2000);
            let messages = this._chunkStrings(strings);
            let botPost = thenify(groupme_1.Stateless.Bots.post);
            try {
                yield delay;
                for (let message of messages) {
                    yield botPost(this._token, this._botId, message, {});
                    yield this._delay(1000);
                }
            }
            catch (e) {
                this._logError(e);
            }
        });
    }
    reply(envelope, ...strings) {
        return this.send(envelope, `@${envelope.user.name} ${strings[0]}`, ...(strings.slice(1)));
    }
    topic(envelope, ...strings) {
        return this.send(envelope, `/topic ${strings[0]}`);
    }
    close() {
    }
    _logError(e) {
        if (e.body) {
            this.robot.logger.error(e.body);
        }
        else {
            this.robot.logger.error(e);
        }
    }
    _delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdyb3VwbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDOzs7Ozs7Ozs7O0FBRTdDLE1BQVksT0FBTyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBQ25DLHdCQUE0RCxPQUFPLENBQUMsQ0FBQTtBQUNwRSwwQkFBcUMsU0FBUyxDQUFDLENBQUE7QUFHL0MsNkJBQTZCLGVBQU87SUFLaEMsWUFBWSxLQUFZO1FBQ3BCLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7UUFDOUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO0lBQ25ELENBQUM7SUFFWSxHQUFHOztZQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQztnQkFDRCxJQUFJLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxtQkFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELElBQUksS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDLG1CQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxRSxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0JBQ3ZDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTt3QkFDZCxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVE7cUJBQ3hCLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUVELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQVksRUFBRSxHQUFhO29CQUNsRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLG1CQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDcEUsQ0FBQztvQkFDRCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO29CQUNyRCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0IsQ0FBRTtZQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRVksSUFBSSxDQUFDLFFBQWtCLEVBQUUsR0FBRyxPQUFpQjs7WUFDdEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxtQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxLQUFLLENBQUM7Z0JBQ1osR0FBRyxDQUFDLENBQUMsSUFBSSxPQUFPLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDckQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QixDQUFDO1lBQ0wsQ0FBRTtZQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRU0sS0FBSyxDQUFDLFFBQWtCLEVBQUUsR0FBRyxPQUFpQjtRQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFrQixFQUFFLEdBQUcsT0FBaUI7UUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sS0FBSztJQUNaLENBQUM7SUFFTyxTQUFTLENBQUMsQ0FBTTtRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBRU8sTUFBTSxDQUFDLEVBQVU7UUFDckIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDckMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxhQUFhLENBQUMsT0FBaUI7UUFDbkMsZ0NBQWdDO1FBQ2hDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLDZCQUE2QjtRQUM3QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsNEJBQTRCO1FBQzVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sU0FBUyxDQUFDLElBQVksRUFBRSxJQUFjLEVBQUUsU0FBaUI7UUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlELEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7QUFDTCxDQUFDO0FBRUQsYUFBb0IsS0FBWTtJQUM1QixNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUZlLFdBQUcsTUFFbEIsQ0FBQSIsImZpbGUiOiJncm91cG1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uXFx0eXBpbmdzXFxtYWluLmQudHNcIiAvPlxyXG5cclxuaW1wb3J0ICogYXMgdGhlbmlmeSBmcm9tIFwidGhlbmlmeVwiO1xyXG5pbXBvcnQgeyBSb2JvdCwgQWRhcHRlciwgVGV4dE1lc3NhZ2UsIFVzZXIsIEVudmVsb3BlIH0gZnJvbSBcInRzYm90XCI7XHJcbmltcG9ydCB7IFN0YXRlbGVzcyBhcyBncm91cG1lIH0gZnJvbSBcImdyb3VwbWVcIjtcclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tIFwiZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZVwiO1xyXG5cclxuY2xhc3MgR3JvdXBNZUFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcclxuICAgIHByaXZhdGUgX21heExlbjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfdG9rZW46IHN0cmluZztcclxuICAgIHByaXZhdGUgX2JvdElkOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9ib3Q6IFJvYm90KSB7XHJcbiAgICAgICAgc3VwZXIocm9ib3QpO1xyXG4gICAgICAgIHRoaXMucm9ib3QubG9nZ2VyLmluZm8oXCJJbml0aWFsaXplIEdyb3VwTWUgQWRhcHRlclwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5fbWF4TGVuID0gMTAwMDtcclxuICAgICAgICB0aGlzLl90b2tlbiA9IHByb2Nlc3MuZW52LkhVQk9UX0dST1VQTUVfVE9LRU47XHJcbiAgICAgICAgdGhpcy5fYm90SWQgPSBwcm9jZXNzLmVudi5IVUJPVF9HUk9VUE1FX0JPVF9JRDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgcnVuKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMucm9ib3QubG9nZ2VyLmluZm8oXCJSdW4gR3JvdXBNZSBBZGFwdGVyXCIpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBib3RzID0gYXdhaXQgdGhlbmlmeShncm91cG1lLkJvdHMuaW5kZXgpKHRoaXMuX3Rva2VuKTtcclxuICAgICAgICAgICAgbGV0IGJvdCA9IGJvdHMuZmlsdGVyKChib3QpID0+IGJvdC5ib3RfaWQgPT09IHRoaXMuX2JvdElkKVswXTtcclxuICAgICAgICAgICAgbGV0IGdyb3VwID0gYXdhaXQgdGhlbmlmeShncm91cG1lLkdyb3Vwcy5zaG93KSh0aGlzLl90b2tlbiwgYm90Lmdyb3VwX2lkKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbWVtYmVyIG9mIGdyb3VwLm1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9ib3QuYnJhaW4udXNlckZvcklkKG1lbWJlci51c2VyX2lkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm9vbTogZ3JvdXAuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbWVtYmVyLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5yb2JvdC5yb3V0ZXIucG9zdChcIi9odWJvdC9pbmNvbWluZ1wiLCAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVxLmJvZHkuc2VuZGVyX3R5cGUgIT09IFwiYm90XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHRoaXMucm9ib3QuYnJhaW4udXNlckZvcklkKHJlcS5ib2R5LnVzZXJfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjZWl2ZShuZXcgVGV4dE1lc3NhZ2UodXNlciwgcmVxLmJvZHkudGV4dCwgcmVxLmJvZHkuaWQpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpbiBcIn0pO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucm9ib3QubG9nZ2VyLmluZm8oXCJDb25uZWN0ZWQgdG8gR3JvdXBNZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY29ubmVjdGVkXCIpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9nRXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBzZW5kKGVudmVsb3BlOiBFbnZlbG9wZSwgLi4uc3RyaW5nczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgZGVsYXkgPSB0aGlzLl9kZWxheSgyMDAwKTtcclxuICAgICAgICBsZXQgbWVzc2FnZXMgPSB0aGlzLl9jaHVua1N0cmluZ3Moc3RyaW5ncyk7XHJcbiAgICAgICAgbGV0IGJvdFBvc3QgPSB0aGVuaWZ5KGdyb3VwbWUuQm90cy5wb3N0KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBkZWxheTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbWVzc2FnZSBvZiBtZXNzYWdlcykge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgYm90UG9zdCh0aGlzLl90b2tlbiwgdGhpcy5fYm90SWQsIG1lc3NhZ2UsIHt9KTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX2RlbGF5KDEwMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2dFcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlcGx5KGVudmVsb3BlOiBFbnZlbG9wZSwgLi4uc3RyaW5nczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKGVudmVsb3BlLCBgQCR7ZW52ZWxvcGUudXNlci5uYW1lfSAke3N0cmluZ3NbMF19YCwgLi4uKHN0cmluZ3Muc2xpY2UoMSkpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9waWMoZW52ZWxvcGU6IEVudmVsb3BlLCAuLi5zdHJpbmdzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQoZW52ZWxvcGUsIGAvdG9waWMgJHtzdHJpbmdzWzBdfWApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9zZSgpOiB2b2lkIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2dFcnJvcihlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAoZS5ib2R5KSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9ib3QubG9nZ2VyLmVycm9yKGUuYm9keSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yb2JvdC5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RlbGF5KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaHVua1N0cmluZ3Moc3RyaW5nczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcGFzcyBicmVhayBvbiBuZXcgbGluZXNcclxuICAgICAgICBsZXQgcmVzdWx0ID0gW10uY29uY2F0KHN0cmluZ3MubWFwKChzKSA9PiB0aGlzLl93cmFwV2l0aChzLCBbXSwgXCJcXG5cIikpKTtcclxuICAgICAgICAvLyBTZWNvbmQgcGFzcyBicmVhayBvbiB3b3Jkc1xyXG4gICAgICAgIHJlc3VsdCA9IFtdLmNvbmNhdChzdHJpbmdzLm1hcCgocykgPT4gdGhpcy5fd3JhcFdpdGgocywgW10sIFwiIFwiKSkpO1xyXG4gICAgICAgIC8vIFRoaXJkIHBhc3MgYnJlYWsgb24gY2hhcnNcclxuICAgICAgICByZXR1cm4gW10uY29uY2F0KHN0cmluZ3MubWFwKChzKSA9PiB0aGlzLl93cmFwV2l0aChzLCBbXSwgXCJcIikpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF93cmFwV2l0aCh0ZXh0OiBzdHJpbmcsIHNlZWQ6IHN0cmluZ1tdLCBkZWxpbWl0ZXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiB0aGlzLl9tYXhMZW4pIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0ZXh0LnNsaWNlKDAsIHRoaXMuX21heExlbikubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcclxuICAgICAgICAgICAgaWYgKGVkZ2UgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZSA9IHRleHQuc2xpY2UoMCwgZWRnZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVtYWluZGVyID0gdGV4dC5zbGljZShlZGdlICsgMSk7XHJcbiAgICAgICAgICAgICAgICBzZWVkID0gdGhpcy5fd3JhcFdpdGgocmVtYWluZGVyLCBzZWVkLCBkZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtsaW5lXS5jb25jYXQoc2VlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0ZXh0XS5jb25jYXQoc2VlZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2Uocm9ib3Q6IFJvYm90KTogQWRhcHRlciB7XHJcbiAgICByZXR1cm4gbmV3IEdyb3VwTWVBZGFwdGVyKHJvYm90KTtcclxufSJdLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=