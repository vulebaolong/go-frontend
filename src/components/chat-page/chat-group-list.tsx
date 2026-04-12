import { useFindAllChatGroup } from "@/api/tantask/user.tanstack";
import AvatarChatGroup from "@/components/chat/chat-user-item/avatar-chat-group/AvatarChatGroup";
import ModalCreateChatGroup from "@/components/modal/modal-create-chat-group/ModalCreateChatGroup";
import ChatGroupSkeleton from "@/components/skeletons/ChatGroupSkeleton";
import { buildStateChatFromChatGroup } from "@/helpers/chat.helper";
import { animationList } from "@/helpers/function.helper";
import { TChatGroup } from "@/types/chat.type";
import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { AppendLoading } from "../data-state/append-state/AppendState";
import NodataOverlay from "../no-data/NodataOverlay";

type TProps = {
    setChat: Dispatch<SetStateAction<TChatGroup | null>>;
    activeChatGroupId?: number;
};

export default function ChatGroupList({ setChat, activeChatGroupId }: TProps) {
    const [page, setPage] = useState(1);
    const [chatGroups, setChatGroups] = useState<TChatGroup[]>([]);
    const [openedCreateChatGroup, handleModalCreateChatGroup] = useDisclosure(false);

    const totalPageRef = useRef(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const findAllChatGroup = useFindAllChatGroup({
        pagination: { page: page, pageSize: 5 },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });

    useEffect(() => {
        if (!findAllChatGroup.data?.items) return;

        const newChatGroups = findAllChatGroup.data.items;

        setChatGroups((prev) => {
            if (page === 1) return newChatGroups;
            const prevIds = new Set(prev.map((chatGroup) => chatGroup.id));
            return [...prev, ...newChatGroups.filter((chatGroup) => !prevIds.has(chatGroup.id))];
        });
    }, [findAllChatGroup.data?.items, page]);

    useEffect(() => {
        if (findAllChatGroup.data?.totalPage) totalPageRef.current = findAllChatGroup.data.totalPage;
    }, [findAllChatGroup.data?.totalPage]);

    const totalPage = findAllChatGroup.data?.totalPage ?? 0;
    const isEnd = totalPage === 0 || page >= totalPage;

    const handleEndReached = useCallback(() => {
        if (findAllChatGroup.isFetching || findAllChatGroup.isLoading || isEnd) return;
        setPage((prev) => prev + 1);
    }, [findAllChatGroup.isFetching, findAllChatGroup.isLoading, isEnd]);

    const handleClickChatGroup = (chatGroup: TChatGroup) => {
        setChat(chatGroup);
    };

    return (
        <>
            <Stack gap={0} sx={{ height: "100%", minHeight: 0 }}>
                <Group justify="space-between" p="md" wrap="nowrap">
                    <Box style={{ minWidth: 0 }}>
                        <Title order={3}>Tin nhắn</Title>
                        <Text c="dimmed" fz="sm">
                            Chat riêng và chat nhóm
                        </Text>
                    </Box>
                    <Button leftSection={<IconPlus size={16} />} onClick={handleModalCreateChatGroup.open}>
                        Tạo nhóm
                    </Button>
                </Group>

                <div
                    ref={containerRef}
                    style={{
                        height: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        padding: 12,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            minHeight: "100%",
                            position: "relative",
                        }}
                    >
                        <AppendLoading
                            isLoading={findAllChatGroup.isLoading || findAllChatGroup.isFetching}
                            isEmpty={chatGroups.length === 0}
                            isError={findAllChatGroup.isError}
                            onLoadMore={handleEndReached}
                            isEnd={isEnd}
                            containerRef={containerRef}
                            footerLoadingComponent={<ChatGroupSkeleton sx={{ position: "relative" }} />}
                            initialLoadingComponent={<ChatGroupSkeleton sx={{ position: "relative" }} />}
                            noDataComponent={<NodataOverlay visible />}
                        >
                            {chatGroups.map((chatGroup, i) => {
                                const stateChat = buildStateChatFromChatGroup(chatGroup);
                                const isActive = activeChatGroupId === chatGroup.id;

                                return (
                                    <Box
                                        component="button"
                                        type="button"
                                        key={chatGroup.id}
                                        onClick={() => {
                                            handleClickChatGroup(chatGroup);
                                        }}
                                        sx={{
                                            width: "100%",
                                            padding: 8,
                                            color: "inherit",
                                            textAlign: "left",
                                            background: isActive ? "var(--mantine-primary-color-light)" : "transparent",
                                            border: 0,
                                            borderRadius: "var(--mantine-radius-md)",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease",
                                            "&:hover": {
                                                background: isActive
                                                    ? "var(--mantine-primary-color-light)"
                                                    : "var(--mantine-color-default-hover)",
                                            },
                                        }}
                                        style={animationList(i)}
                                    >
                                        <AvatarChatGroup stateChat={stateChat} isTextName />
                                    </Box>
                                );
                            })}
                        </AppendLoading>
                    </div>
                </div>
            </Stack>
            <ModalCreateChatGroup opened={openedCreateChatGroup} close={handleModalCreateChatGroup.close} />
        </>
    );
}
