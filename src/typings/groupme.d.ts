/// <reference path="..\..\typings\main\ambient\node\index.d.ts" />

declare module "groupme" {
    import { IncomingMessage } from "http";
    import { EventEmitter } from "events";
    
    type ImageServiceCallback = (err: any, data: { url: string }) => void;
    type ApiCallback<T> = (err: IncomingMessage, data: T) => void;
    
    interface Attachment {
        type: string;
        url?: string;
        lat?: string;
        long?: string;
        name?: string;
        token: string;
        placeholder?: string;
        charmap?: number[][];
    }
    
    interface MessageParams {
        text: string;
        attachments: Attachment[];
    }
    
    interface Message extends MessageParams {
        id: string;
        source_guid: string;
        created_at: number;
        user_id: string;
        group_id: string;
        name: string;
        avatar_url: string;
        system: boolean;
        favorited_by: string[];
    }
    
    interface MessageWrapper<T extends MessageParams> {
        message: T;
    }
    
    interface Messages {
        count: number;
        messages: Message[];
    }
    
    interface DirectMessageParams extends MessageParams {
        recipient_id: string;
    }
    
    interface DirectMessage extends DirectMessageParams, Message {
    }
    
    interface DirectMessageWrapper<T extends DirectMessageParams> {
        direct_message: T;
    }
    
    interface DirectMessages {
        count: number;
        direct_messages: Message[];
    }

    interface MemberParams {
        nickname: string;
        user_id?: string;
        phone_number?: string;
        email?: string;
        guid?: string;
    }
    
    interface Member extends MemberParams {
        id?: string;
        muted?: boolean;
        image_url?: string;
        autokicked?: boolean;
        app_installed?: boolean;
    }
    
    interface Members<T extends MemberParams> {
        members: T[];
    }
    
    interface GroupShared {
        name: string;
        description?: string;
        image_url?: string;
    }
    
    interface GroupParams extends GroupShared {
        share?: boolean;
        office_mode?: boolean;
    }
    
    interface Group extends GroupShared, Members<Member> {
        id: string;
        type: string;
        creator_user_id: string;
        created_at: number;
        updated_at: number;
        share_url: string;
        messages: {
            count: number;
            last_message_id: string;
            last_message_created_at: number;
            preview: Message;
        }        
    }
    
    interface BotParams {
        avatar_url?: string;
        callback_url?: string;        
    }
        
    interface Bot extends BotParams {
        bot_id: string;
        group_id: string;
        name: string;
        dm_notification: boolean;
    }
    
    interface MessageOpts {
        before_id?: string;
        after_id?: string;
    }
    
    interface StatelessGroups {
        index(token: string, callback: ApiCallback<Group[]>): void;
        former(token: string, callback: ApiCallback<Group[]>): void;
        show(token: string, id: string, callback: ApiCallback<Group>): void;
        create(token: string, opts: GroupParams, callback: ApiCallback<Group>): void;
        update(token: string, id: string, opts: GroupParams, callback: ApiCallback<Group>): void;
        destroy(token: string, id: string, callback: ApiCallback<{}>): void;
    }
    
    interface StatelessMembers {
        add(token: string, groupId: string, opts: Members<MemberParams>, callback: ApiCallback<{ results_id: string }>): void;
        results(token: string, groupId: string, resultsId: string, callback: ApiCallback<Members<Member>>): void;
    }
    
    interface StatelessMessages {
        index(token: string, groupId: string, opts: MessageOpts, callback: ApiCallback<Messages>): void;
        create(token: string, groupId: string, opts: MessageWrapper<MessageParams>, callback: ApiCallback<MessageWrapper<Message>>): void;
    }
    
    interface StatelessDirectMessages {
        index(token: string, opts: { other_user_id: string } & MessageOpts, callback: ApiCallback<DirectMessages>): void;
        create(token: string, opts: DirectMessageWrapper<DirectMessageParams>, callback: ApiCallback<MessageWrapper<DirectMessage>>): void;
    }
    
    interface StatelessLikes {
        create(token: string, groupId: string, messageId: string, callback: ApiCallback<{}>): void;
        destroy(token: string, groupId: string, messageId: string, callback: ApiCallback<{}>): void;
    }
    
    interface StatelessBots {
        create(token: string, name: string, groupId: string, opts: BotParams, callback: ApiCallback<Bot>): void;
        post(token: string, botId: string, text: string, opts: { picture_url?: string }, callback: ApiCallback<{}>): void;
        index(token: string, callback: ApiCallback<Bot[]>): void;
        destroy(token: string, botId: string, callback: ApiCallback<{}>): void;
    }
    
    interface StatelessUsers {
        me(token: string, callback: ApiCallback<Member>): void;
    }
    
    interface Stateless {
        Groups: StatelessGroups;
        Members: StatelessMembers;
        Messages: StatelessMembers;
        DirectMessages: StatelessDirectMessages;
        Likes: StatelessLikes;
        Bots: StatelessBots;
        Users: StatelessUsers;
    }
    
    interface ImageService {
        post(path: string, callback: ImageServiceCallback): void;
    }
    
    export class IncomingStream extends EventEmitter {
        constructor(token: string, userId: string, groupIds?: string[]);
        connect();
        disconnect();
        
        on(event: string, listener: Function): this;
        on(event: "connected", listener: () => void): this;
        on(event: "pending", listener: () => void): this;
        on(event: "disconnected", listener: () => void): this;
        on(event: "message", listener: (data: any) => void): this;
        on(event: "error", listener: (message: string, payload: any) => void): this;
        on(event: "status", listener: (message: string, payload: any) => void): this;
    }
    
    export let version: string;
    export let Stateless: Stateless;
    export let ImageService: ImageService;
}