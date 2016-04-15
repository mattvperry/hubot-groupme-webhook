/// <reference path="..\typings\main.d.ts" />

import * as thenify from "thenify";
import { ClientRequest, IncomingMessage } from "http";
import { Robot, Adapter, TextMessage, User, Envelope } from "tsbot";
import { Stateless as groupme, ImageService, ImageServicePayload } from "groupme";
import { Request, Response } from "express-serve-static-core";

class GroupMeAdapter extends Adapter {
    private _maxLen: number;
    private _token: string;
    private _botId: string;
    private _imageSvc: string;

    constructor(robot: Robot) {
        super(robot);
        this.robot.logger.info("Initialize GroupMe Adapter");

        this._maxLen = 1000;
        this._token = process.env.HUBOT_GROUPME_TOKEN;
        this._botId = process.env.HUBOT_GROUPME_BOT_ID;
        this._imageSvc = `https://image.groupme.com/pictures?access_token=${this._token}`;
    }

    public async run(): Promise<void> {
        this.robot.logger.info("Run GroupMe Adapter");
        try {
            let bots = await thenify(groupme.Bots.index)(this._token);
            let bot = bots.filter((bot) => bot.bot_id === this._botId)[0];
            let group = await thenify(groupme.Groups.show)(this._token, bot.group_id);
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

            this.robot.logger.info("Connected to GroupMe");
            this.emit("connected");
        } catch (e) {
            this._logError(e);
        }
    }

    public send(envelope: Envelope, ...strings: string[]): Promise<void> {
        return this._delaySequence(...strings.map(s => {
            return () => this._botPost(s);
        }));
    }

    public reply(envelope: Envelope, ...strings: string[]): Promise<void> {
        return this.send(envelope, `@${envelope.user.name} ${strings[0]}`, ...(strings.slice(1)));
    }

    public topic(envelope: Envelope, ...strings: string[]): Promise<void> {
        return this.send(envelope, `/topic ${strings[0]}`);
    }

    public async emote(envelope: Envelope, ...strings: string[]): Promise<void> {
        let images = await Promise.all<ImageServicePayload>(strings.map(s => this._reuploadImage(s)));
        return this._delaySequence(...images.map(i => {
            return () => this._botPost("", i.picture_url);
        }));
    }

    public close(): void {
    }

    private _logError(e: any): void {
        if (e.body) {
            this.robot.logger.error(e.body);
        } else {
            this.robot.logger.error(e);
        }
    }

    private _delay(ms: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    
    private async _botPost(message: string, picture_url?: string): Promise<{}> {
        let post = thenify(groupme.Bots.post);
        return await post(this._token, this._botId, message, { picture_url: picture_url });
    }
    
    private async _delaySequence(...generators: (() => Promise<any>)[]): Promise<void> {
        try {
            await this._delay(1000);
            for (const generator of generators) {
                await generator();
                await this._delay(1000);
            }
        } catch (e) {
            this._logError(e);
        }
    }

    private _reuploadImage(url: string): Promise<ImageServicePayload> {
        return new Promise<ImageServicePayload>(async (resolve, reject) => {
            try {
                let dlReq = await this._createRequest("GET", url);
                let ulReq = await this._createRequest("POST", this._imageSvc);

                dlReq.on("error", reject);
                dlReq.on("response", (res: IncomingMessage) => {
                    res.pipe(ulReq);
                    res.on("end", () => ulReq.end());
                });
                dlReq.end();

                let body = "";
                ulReq.on("error", reject);
                ulReq.on("response", (res: IncomingMessage) => {
                    res.on("data", (chunk) => body += chunk);
                    res.on("end", () => resolve(JSON.parse(body).payload));
                });
            } catch (e) {
                reject(e);
            }
        });
    }
    
    private _createRequest(method: string, url: string): Promise<ClientRequest> {
        return new Promise<ClientRequest>((resolve, reject) => {
            this.robot.http(url).request(method, (err, req) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(req);
                }
            });
        });
    }

    private _chunkStrings(strings: string[]): string[] {
        // First pass break on new lines
        let result = [].concat(...strings.map((s) => this._wrapWith(s, [], "\n")));
        // Second pass break on words
        result = [].concat(...result.map((s) => this._wrapWith(s, [], " ")));
        // Third pass break on chars
        return [].concat(...result.map((s) => this._wrapWith(s, [], "")));
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