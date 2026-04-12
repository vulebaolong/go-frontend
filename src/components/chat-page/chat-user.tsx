"use client";

import { SOCKET_CHAT_MES } from "@/constant/chat.constant";
import { emitToEvent, listenToEvent, removeEventListener } from "@/helpers/chat.helper";
import { getAccessToken } from "@/helpers/cookies.helper";
import { resError } from "@/helpers/function.helper";
import { useSocket } from "@/hooks/socket.hook";
import { useAppSelector } from "@/redux/hooks";
import { TSocketRes } from "@/types/base.type";
import { TAllmessage, TChatGroup, TJoinRoomReq, TJoinRoomRes, TLeaveRoomReq } from "@/types/chat.type";
import { Divider, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MessageHeader from "../chat/chat-user-item/message-header/MessageHeader";
import MessageInput from "../chat/chat-user-item/message-input/MessageInput";
import MessageList from "../chat/chat-user-item/message-list/MessageList";

type TProps = {
    chatGroup: TChatGroup;
};

export default function ChatUser({ chatGroup }: TProps) {
    const { socket } = useSocket();
    const userId = useAppSelector((state) => state.user.info?.id);
    const [dataSendMessage, setDataSendMessage] = useState<TAllmessage>();

    useEffect(() => {
        (async () => {
            if (!socket || !userId) return;

            const accessToken = await getAccessToken();
            const payload: TJoinRoomReq = { chatGroupId: chatGroup.id, accessToken: accessToken || "" };

            emitToEvent(socket, SOCKET_CHAT_MES.JOIN_ROOM, payload, (data: TSocketRes<TJoinRoomRes>) => {
                try {
                    if (data.status === "error") throw new Error(data.message);
                } catch (error) {
                    toast.error(resError(error, "Join Room Failed"));
                }
            });
        })();

        return () => {
            if (!socket || !userId) return;

            const payload: TLeaveRoomReq = { chatGroupId: chatGroup.id };
            emitToEvent(socket, SOCKET_CHAT_MES.LEAVE_ROOM, payload);
        };
    }, [socket, chatGroup.id, userId]);

    useEffect(() => {
        if (!socket) return;

        const handleSendMessage = (data: TAllmessage) => {
            console.log({ data });
            if (data.chatGroupId !== chatGroup.id) return;
            setDataSendMessage(data);
        };

        listenToEvent(socket, SOCKET_CHAT_MES.SEND_MESSAGE, handleSendMessage);

        return () => {
            removeEventListener(socket, SOCKET_CHAT_MES.SEND_MESSAGE, handleSendMessage);
        };
    }, [socket, chatGroup.id]);

    return (
        <Stack gap={0} style={{ height: "100%", minHeight: 0 }}>
            <MessageHeader
                stateChat={{
                    chatGroupId: chatGroup.id,
                    chatGroupName: chatGroup.name || "",
                    chatGroupMembers: chatGroup.edges.ChatGroupMembers.map((member) => ({
                        userId: member.userId,
                        fullName: member.edges.Users.fullName,
                        avatar: member.edges.Users.avatar,
                        roleId: member.edges.Users.roleId,
                    })),
                }}
            />
            <Divider />
            <MessageList
                stateChat={{
                    chatGroupId: chatGroup.id,
                    chatGroupName: chatGroup.name || "",
                    chatGroupMembers: chatGroup.edges.ChatGroupMembers.map((member) => ({
                        userId: member.userId,
                        fullName: member.edges.Users.fullName,
                        avatar: member.edges.Users.avatar,
                        roleId: member.edges.Users.roleId,
                    })),
                }}
                dataSendMessage={dataSendMessage}
            />
            <Divider />
            <MessageInput
                stateChat={{
                    chatGroupId: chatGroup.id,
                    chatGroupName: chatGroup.name || "",
                    chatGroupMembers: chatGroup.edges.ChatGroupMembers.map((member) => ({
                        userId: member.userId,
                        fullName: member.edges.Users.fullName,
                        avatar: member.edges.Users.avatar,
                        roleId: member.edges.Users.roleId,
                    })),
                }}
            />
        </Stack>
    );
}
