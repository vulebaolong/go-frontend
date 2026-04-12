"use client";

import { ThemePreference, useThemePreference } from "@/hooks/use-theme-preference";
import { Menu, Text } from "@mantine/core";
import { IconCheck, IconDeviceDesktop, IconMoon, IconMoonStars, IconSun } from "@tabler/icons-react";
import { memo } from "react";

const ICON_SIZE = 16;

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: "Dark", icon: <IconMoon size={ICON_SIZE} /> },
    { value: "light", label: "Light", icon: <IconSun size={ICON_SIZE} /> },
    { value: "classic-dark", label: "Classic Dark", icon: <IconMoonStars size={ICON_SIZE} /> },
    { value: "system", label: "System", icon: <IconDeviceDesktop size={ICON_SIZE} /> },
];
function UserTheme() {
    const { preference, changeTheme } = useThemePreference();
    return (
        <>
            {THEME_OPTIONS.map((opt) => (
                <Menu.Item style={{borderRadius: "10px"}} key={opt.value} leftSection={opt.icon} rightSection={preference === opt.value ? <IconCheck size={14} /> : null} onClick={() => changeTheme(opt.value)}>
                    <Text size="sm" fw={preference === opt.value ? 600 : 400}>
                        {opt.label}
                    </Text>
                </Menu.Item>
            ))}
        </>
    );
}

export default memo(UserTheme);
