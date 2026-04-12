"use client";

import { Box, Center, Group, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { CSSProperties } from "react";
import { useState } from "react";
import ChatGroupList from "./chat-group-list";
import ChatUser from "./chat-user";
import { TChatGroup } from "@/types/chat.type";

export default function ChatPage() {
    const [chat, setChat] = useState<TChatGroup | null>(null);
    const isMobile = useMediaQuery("(max-width: 48em)");

    const styles: Record<string, CSSProperties> = {
        page: {
            height: "calc(100vh - var(--height-header))",
            padding: isMobile ? 0 : 16,
        },
        shell: {
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
            borderLeft: isMobile ? 0 : undefined,
            borderRight: isMobile ? 0 : undefined,
            borderRadius: isMobile ? 0 : "var(--mantine-radius-lg)",
        },
        sidebar: {
            width: isMobile ? "100%" : 360,
            minWidth: isMobile ? undefined : 280,
            height: "100%",
            minHeight: 0,
            borderRight: "1px solid var(--mantine-color-default-border)",
        },
        chatPanel: {
            flex: 1,
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            display: isMobile ? "none" : undefined,
        },
        emptyChat: {
            height: "100%",
        },
    };

    return (
        <Box style={styles.page}>
            <Paper style={styles.shell} radius="lg">
                <Group h="100%" gap={0} wrap="nowrap" align="stretch">
                    <Box style={styles.sidebar}>
                        <ChatGroupList setChat={setChat} activeChatGroupId={chat?.id} />
                    </Box>

                    <Box style={styles.chatPanel}>
                        {chat ? (
                            <ChatUser key={chat.id} chatGroup={chat} />
                        ) : (
                            <Center style={styles.emptyChat}>
                                <Text c="dimmed">Chọn một cuộc trò chuyện để bắt đầu.</Text>
                            </Center>
                        )}
                    </Box>
                </Group>
            </Paper>
        </Box>
    );
}
