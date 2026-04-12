import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { ReactNode } from "react";

type NavItemProps = {
    icon: ReactNode;
    label: string;
    collapsed: boolean;
    active?: boolean;
    onClick?: () => void;
};

export function NavItem({ icon, label, collapsed, active, onClick }: NavItemProps) {
    return (
        <UnstyledButton
            onClick={onClick}
            sx={(theme) => ({
                "--nl-bg": "var(--mantine-color-gray-light)",
                "--nl-hover": "var(--mantine-color-gray-light-hover)",
                "--nl-color": "var(--mantine-color-gray-light-color)",

                "width": collapsed ? "60%" : "94%",
                "borderRadius": theme.radius.md,
                "padding": "4px",
                "backgroundColor": active ? "var(--nl-bg)" : "transparent",
                "transition": "background-color 200ms, width 200ms",
                "&:hover": {
                    backgroundColor: "var(--nl-hover)",
                },
            })}
        >
            <Group gap={collapsed ? 0 : "sm"} wrap="nowrap">
                {/* ICON – luôn hiển thị */}
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>

                {/* LABEL – ẩn khi collapsed */}
                <Box
                    sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: collapsed ? 0 : "auto",
                        opacity: collapsed ? 0 : 1,
                        transition: "opacity 200ms ease, transform 200ms ease, width 200ms ease",
                    }}
                >
                    <Text size="sm" fw={500}>
                        {label}
                    </Text>
                </Box>
            </Group>
        </UnstyledButton>
    );
}
