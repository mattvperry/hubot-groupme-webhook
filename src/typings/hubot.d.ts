/// <reference path="..\..\typings\main\ambient\node\index.d.ts" />
/// <reference path="..\..\typings\main\ambient\express-serve-static-core\index.d.ts" />
/// <reference path="node-scoped-http-client.d.ts" />

declare module "hubot" {
    import * as scoped from "scoped";
    import * as events from "events";
    import * as express from "express-serve-static-core";

    type Matcher = (message: Message) => any;
    type ResponseCallback = (response: Response) => void;
    type ListenerCallback = (matcher: boolean) => void;

    interface Logger {
        debug: Function;
        info: Function;
        warning: Function;
        error: Function;
    }

    interface Envelope {
        message?: Message;
        user?: User;
        room?: string;
    }

    export interface User extends Object {
        id: string;
        name: string;
        room?: string;
    }

    export class Brain {
        constructor(robot: Robot);
        set(key: any): void;
        set(key: string, value: any): void;
        get(key: any): any;
        remove(key: any): void;
        save(): void;
        close(): void;
        setAutoSave(enabled: boolean): void;
        resetSaveInterval(seconds: number): void;
        mergeData(data: any): void;
        users(): User[];
        userForId(id: string, options?: any): User;
        userForName(name: string): User;
        usersForRawFuzzyName(fuzzyName: string): User[];
        usersForFuzzyName(fuzzyName: string): User[];
    }

    export class Robot extends events.EventEmitter {
        name: string;
        brain: Brain;
        alias: string;
        adapter: Adapter;
        logger: Logger;
        router: express.Router;

        constructor(adapterPath: string, adapter: string, http: boolean, name?: string, alias?: boolean);
        hear(regex: RegExp, callback: ResponseCallback): void;
        hear(regex: RegExp, options: any, callback: ResponseCallback): void;
        respond(regex: RegExp, callback: ResponseCallback): void;
        respond(regex: RegExp, options: any, callback: ResponseCallback): void;
        enter(callback: ResponseCallback): void;
        enter(options: any, callback: ResponseCallback): void;
        leave(callback: ResponseCallback): void;
        leave(options: any, callback: ResponseCallback): void;
        topic(callback: ResponseCallback): void;
        topic(options: any, callback: ResponseCallback): void;
        error(callback: ResponseCallback): void;
        catchAll(callback: ResponseCallback): void;
        catchAll(options: any, callback: ResponseCallback): void;
        run(): void;
        shutdown(): void;
        http(url: string, options: scoped.Options): scoped.ScopedClient;
        
        on(event: string, listener: Function): this;
        on(event: "error", listener: (err: any) => void): this;
        on(event: "running", listener: () => void);
    }

    export class Adapter extends events.EventEmitter {
        robot: Robot;
        
        constructor(robot: Robot);
        send(envelope: Envelope, ...strings: string[]): void;
        emote(envelope: Envelope, ...strings: string[]): void;
        reply(envelope: Envelope, ...strings: string[]): void;
        topic(envelope: Envelope, ...strings: string[]): void;
        play(envelope: Envelope, ...strings: string[]): void;
        run(): void;
        close(): void;
        receive(message: Message): void;
        users(): User[];
        userForId(id: string, options?: any): User;
        userForName(name: string): User;
        usersForRawFuzzyName(fuzzyName: string): User[];
        usersForFuzzyName(fuzzyName: string): User[];
        http(url: string): scoped.ScopedClient;
    }

    export class Response {
        robot: Robot;
        message: Message;
        match: RegExpMatchArray;

        constructor(robot: Robot, message: Message, match: RegExpMatchArray);
        send(...strings: string[]): void;
        emote(...strings: string[]): void;
        reply(...strings: string[]): void;
        topic(...strings: string[]): void;
        play(...strings: string[]): void;
        locked(...strings: string[]): void;
        random<T>(items: T[]): T;
        finish(): void;
        http(url: string, options?: scoped.Options): scoped.ScopedClient;
    }

    export class Listener {
        constructor(robot: Robot, matcher: Matcher, callback: ResponseCallback);
        constructor(robot: Robot, matcher: Matcher, options: any, callback: ResponseCallback);
        call(message: Message, callback: ListenerCallback): boolean;
    }

    export class TextListener extends Listener {
        constructor(robot: Robot, regex: RegExp, callback: ResponseCallback);
        constructor(robot: Robot, regex: RegExp, options: any, callback: ResponseCallback);
    }

    export class Message {
        user: User;
        room: string;
        constructor(user: User, done?: boolean);
        finish(): void;
    }

    export class TextMessage extends Message {
        constructor(user: User, text: string, id: string);
        match(regex: RegExp): RegExpMatchArray;
        toString(): string;
    }

    export class EnterMessage extends Message {
    }

    export class LeaveMessage extends Message {
    }

    export class TopicMessage extends Message {
    }

    export class CatchAllMessage extends Message {
        constructor(message: Message);
    }
}