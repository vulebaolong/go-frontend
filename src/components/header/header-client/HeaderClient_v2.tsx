"use client";

import { Logo } from "@/components/logo/Logo";
import UserControl from "@/components/user-control/UserControl";
import { ActionIcon, Box, Button, Divider, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutSidebarLeftCollapse, IconSearch } from "@tabler/icons-react";

type TProps = {
    toggleMobile: () => void;
};

export default function Header({ toggleMobile }: TProps) {
    const [openedSearchUser, handleSearchUser] = useDisclosure(false);

    return (
        <Box
            component={"header"}
            sx={{
                position: "sticky",
                top: "0",
                zIndex: 300,
                backgroundColor: "var(--mantine-color-body)",
            }}
        >
            <Group h={"var(--height-header)"} px="md" justify="space-between">
                <Group>
                    <ActionIcon onClick={toggleMobile} variant="subtle" color="gray" hiddenFrom="sm">
                        <IconLayoutSidebarLeftCollapse size={18} />
                    </ActionIcon>
                    <Group>
                        <Button
                            onClick={handleSearchUser.open}
                            c={"dimmed"}
                            leftSection={<IconSearch size={16} />}
                            variant="default"
                            radius="xl"
                            size="xs"
                        >
                            <Text size="sm" fw={400}>
                                Tìm kiếm người dùng
                            </Text>
                        </Button>
                    </Group>
                </Group>

                <Box>
                    <UserControl type="client" />
                </Box>
            </Group>
            <Divider />
        </Box>
    );
}
