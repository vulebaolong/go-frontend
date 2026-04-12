"use client";

import { useFindAllChatGroup } from "@/api/tantask/user.tanstack";
import AvatarChatGroup from "@/components/chat/chat-user-item/avatar-chat-group/AvatarChatGroup";
import ModalCreateChatGroup from "@/components/modal/modal-create-chat-group/ModalCreateChatGroup";
import NodataOverlay from "@/components/no-data/NodataOverlay";
import ChatGroupSkeleton from "@/components/skeletons/ChatGroupSkeleton";
import { addChatOpened, buildStateChatFromChatGroup } from "@/helpers/chat.helper";
import { animationList } from "@/helpers/function.helper";
import { TChatGroup } from "@/types/chat.type";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

type TProps = {
    onClose?: () => void;
};

export default function HomeRight({ onClose }: TProps) {
    const findAllChatGroup = useFindAllChatGroup({
        pagination: { page: 1, pageSize: 9999 },
        filters: {},
        sort: { sortBy: `createdAt`, isDesc: true },
    });
    const queryClient = useQueryClient();
    const [openedCreateChatGroup, handleModalCreateChatGroup] = useDisclosure(false);

    const handleClickChatGroup = (chatGroup: TChatGroup) => {
        if (onClose) onClose();
        addChatOpened(
            buildStateChatFromChatGroup(chatGroup),
            () => {
                queryClient.invalidateQueries({ queryKey: [`chat-list-user-item`] });
                queryClient.invalidateQueries({ queryKey: [`chat-list-user-bubble`] });
            },
        );
    };

    const handleCreateChatGroup = () => {
        handleModalCreateChatGroup.open();
    };

    return (
        <>
            <Stack style={{ height: `calc(100vh - ( 20px + 20px + var(--height-header))` }}>
                {/* chat 1-1 */}
                <Box
                    onClick={handleCreateChatGroup}
                    sx={{
                        cursor: "pointer",
                        ...animationList(0),
                        "&:hover": { backgroundColor: `var(--mantine-color-gray-light-hover)` },
                        transition: `background-color 0.2s ease`,
                        padding: `5px`,
                        borderRadius: `10px`,
                    }}
                >
                    <Group wrap="nowrap" gap={5}>
                        <Box
                            sx={{
                                width: `38px`,
                                height: `38px`,
                                position: `relative`,
                                flexShrink: 0,
                                display: `flex`,
                                alignItems: `center`,
                                justifyContent: `center`,
                                borderRadius: `50%`,
                                backgroundColor: `var(--mantine-color-gray-light-hover)`,
                            }}
                        >
                            <IconPlus style={{ width: "60%", height: "60%" }} stroke={2.5} />
                        </Box>
                        <Text truncate>Create Group</Text>
                    </Group>
                </Box>

                <Stack
                    sx={{
                        overflow: "auto",
                        height: `100%`,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        position: `relative`,
                        gap: 5,
                    }}
                >
                    {findAllChatGroup.isPending && <ChatGroupSkeleton />}
                    <NodataOverlay
                        width={50}
                        visible={
                            !findAllChatGroup.isPending &&
                            (!findAllChatGroup.data || findAllChatGroup.data?.items?.length === 0 || findAllChatGroup.isError)
                        }
                    />
                    {(findAllChatGroup.data?.items || []).map((chatGroup, i) => {
                        const stateChat = buildStateChatFromChatGroup(chatGroup);

                        return (
                            <Box
                                key={chatGroup.id}
                                onClick={() => {
                                    handleClickChatGroup(chatGroup);
                                }}
                                sx={{
                                    cursor: "pointer",
                                    ...animationList(i),
                                    "&:hover": { backgroundColor: `var(--mantine-color-gray-light-hover)` },
                                    transition: `background-color 0.2s ease`,
                                    padding: `5px`,
                                    borderRadius: `10px`,
                                }}
                            >
                                <AvatarChatGroup stateChat={stateChat} isTextName />
                            </Box>
                        );
                    })}
                </Stack>
            </Stack>
            <ModalCreateChatGroup opened={openedCreateChatGroup} close={handleModalCreateChatGroup.close} />
        </>
    );
}
