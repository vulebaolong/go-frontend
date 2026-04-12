import { TBaseTimestamps } from "./base.type";
import { TUser } from "./user.type";

export type TAllmessage = {
    id: number;
    chatGroupId: number;
    senderId: number;
    messageText: string;
    createdAt: string;
    updatedAt: string;
    edges: {
        ChatGroups: TChatGroup;
        Users: TUser;
    };
};

export type TMessageItem = {
    message: string;
    avatar: string | undefined;
    fullName: string | undefined;
    userId: number;
    roleId: string;
    createdAt: string;
};

export type TStateChat = {
    chatGroupId: number;
    chatGroupName: string;
    chatGroupMembers: TStateChatMember[];
};
export type TStateChatMember = {
    userId: number;
    fullName: TUser["fullName"];
    avatar: TUser["avatar"];
    roleId: string;
};

export type TChatGroup = {
    id: number;
    name?: string;
    ownerId: number;
    edges: {
        ChatGroupMembers: TChatGroupMember[];
        Users: TUser;
    };
} & TBaseTimestamps;

export type TChatGroupMember = {
    id: number;
    userId: number;
    chatGroupId: number;
    edges: {
        Users: TUser;
    };
    createdAt: string;
    updatedAt: string;
} & TBaseTimestamps;

export type TCreateRoomRes = {
    chatGroupId: number;
};

export type TCreateRoomReq = {
    accessToken: string;
    targetUserIds: number[];
    name?: string;
};

export type TSendMessageReq = {
    message: string;
    accessToken: string;
    chatGroupId: number;
};

export type TJoinRoomReq = {
    chatGroupId: number;
    accessToken: string;
};

export type TJoinRoomRes = {
    chatGroupId: number;
};

export type TLeaveRoomReq = {
    chatGroupId: number;
};
