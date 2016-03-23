/// <reference path="..\..\typings\main.d.ts" />

import { Robot, Adapter, TextMessage, User, Envelope } from "hubot";
import { Stateless as groupme } from "groupme";
import * as promisify from "es6-promisify";
import { Request, Response } from "express-serve-static-core";

class GroupMeAdapter extends Adapter {
    private _maxLen: number;
    private _token: string;
    private _botId: string;

    constructor(robot: Robot) {
        super(robot);
        this.robot.logger.info("Initialize GroupMe Adapter");

        this._maxLen = 1000;
        this._token = process.env.HUBOT_GROUPME_TOKEN;
        this._botId = process.env.HUBOT_GROUPME_BOT_ID;
    }

    public async run(): Promise<void> {
        this.robot.logger.info("Run GroupMe Adapter");
        try {
            let bots = await promisify(groupme.Bots.index)(this._token);
            let bot = bots.filter((bot) => bot.bot_id === this._botId)[0];
            let group = await promisify(groupme.Groups.show)(this._token, bot.group_id);
            for (let member of group.members) {
                this.robot.brain.userForId(member.user_id, {
                    room: group.id,
                    name: member.nickname
                });
            }

            this.robot.router.post("/hubot/incoming", (req: Request, res: Response) => {
                if (req.body.sender_type !== "bot") {
                    let user = this.robot.brain.userForId(req.body.user_id);
                    this.receive(new TextMessage(user, req.body.text, req.body.id));
                }
                res.writeHead(200, { "Content-Type": "text/plain "});
                res.end();
            });
        } catch (e) {
            this._logError(e);
        }
    }

    public async send(envelope: Envelope, ...strings: string[]): Promise<void> {
        let delay = this._delay(2000);
        let messages = this._chunkStrings(strings);
        let botPost = promisify(groupme.Bots.post);
        try {
            await delay;
            for (let message of messages) {
                await botPost(this._token, this._botId, message, {});
                await this._delay(1000);
            }
        } catch (e) {
            this._logError(e);
        }
    }

    public async reply(envelope: Envelope, ...strings: string[]): Promise<void> {
        return this.send(envelope, `@${envelope.user.name} ${strings[0]}`, ...(strings.slice(1)));
    }

    public async topic(envelope: Envelope, ...strings: string[]): Promise<void> {
        return this.send(envelope, `/topic ${strings[0]}`);
    }

    private _logError(e: any): void {
        if (e.body) {
            this.robot.logger.error(e.body);
        } else {
            this.robot.logger.error(e);
        }
    }

    private async _delay(ms: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    private _chunkStrings(strings: string[]): string[] {
        // First pass break on new lines
        let result = [].concat(strings.map((s) => this._wrapWith(s, [], "\n")));
        // Second pass break on words
        result = [].concat(strings.map((s) => this._wrapWith(s, [], " ")));
        // Third pass break on chars
        return [].concat(strings.map((s) => this._wrapWith(s, [], "")));
    }

    private _wrapWith(text: string, seed: string[], delimiter: string): string[] {
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

export function use(robot: Robot): Adapter {
    return new GroupMeAdapter(robot);
}