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
    chatGroupId: string;
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
    id: string;
    name?: string;
    ownerId: string;
    edges: {
        ChatGroupMembers: TChatGroupMember[];
        Users: TUser;
    };
} & TBaseTimestamps;

export type TChatGroupMember = {
    id: string;
    userId: string;
    chatGroupId: string;
    edges: {
        Users: TUser;
    };
    createdAt: string;
    updatedAt: string;
} & TBaseTimestamps;

export type TCreateRoomRes = {
    chatGroupId: string;
};

export type TCreateRoomReq = {
    accessToken: string;
    targetUserIds: string[];
    name?: string;
};

export type TSendMessageReq = {
    message: string;
    accessToken: string;
    chatGroupId: string;
};

export type TJoinRoomReq = {
    chatGroupId: string;
    accessToken: string;
};

export type TJoinRoomRes = {
    chatGroupId: string;
};

export type TLeaveRoomReq = {
    chatGroupId: string;
};
