/// <reference path="..\..\typings\main\ambient\node\index.d.ts" />

declare module "scoped" {
    import { Agent, RequestOptions, ServerResponse } from "http";

    type RequestCallback = (cb: (err: any, response: ServerResponse, body: string) => void) => ScopedClient;

    interface Options extends RequestOptions {
        encoding: string;
        httpAgent: Agent|boolean;
        httpsAgent: Agent|boolean;
        query: any;
        pathname: string;
        slashes: any;
        hash: string;
    }

    interface ScopedClient {
        new(url: string, options: Options): ScopedClient;
        fullPath(p: string): string;
        scope(callback: Function): ScopedClient;
        scope(url: string, callback: Function): ScopedClient;
        scope(url: string, options: Options, callback: Function): ScopedClient;
        join(suffix: string): string;
        path(p: string): ScopedClient;
        query(key: any, value?: any): ScopedClient;
        host(h: string): ScopedClient;
        port(p: string|number): ScopedClient;
        protocol(p: string): ScopedClient;
        encoding(e?: string): ScopedClient;
        timeout(time: any): ScopedClient;
        auth(user?: string, pass?: string): ScopedClient;
        header(name: string, value: string): ScopedClient;
        headers(h: any): ScopedClient;

        request(method: string): RequestCallback;
        request(method: string, callback: Function): RequestCallback;
        request(method: string, reqBody: string, callback: Function): RequestCallback;

        get(): RequestCallback;
        get(callback: Function): RequestCallback;
        get(reqBody: string, callback: Function): RequestCallback;

        post(): RequestCallback;
        post(callback: Function): RequestCallback;
        post(reqBody: string, callback: Function): RequestCallback;

        patch(): RequestCallback;
        patch(callback: Function): RequestCallback;
        patch(reqBody: string, callback: Function): RequestCallback;

        put(): RequestCallback;
        put(callback: Function): RequestCallback;
        put(reqBody: string, callback: Function): RequestCallback;

        delete(): RequestCallback;
        delete(callback: Function): RequestCallback;
        delete(reqBody: string, callback: Function): RequestCallback;

        del(): RequestCallback;
        del(callback: Function): RequestCallback;
        del(reqBody: string, callback: Function): RequestCallback;

        head(): RequestCallback;
        head(callback: Function): RequestCallback;
        head(reqBody: string, callback: Function): RequestCallback;

    }

    export function create(url: string, options: Options): ScopedClient;
}