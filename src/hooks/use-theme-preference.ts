"use client";

import { useMantineColorScheme } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

// Các lựa chọn theme hỗ trợ
export type ThemePreference = "dark" | "light" | "classic-dark" | "system";

const STORAGE_KEY = "theme-preference";

// Map theme preference -> Mantine color scheme
function toMantineScheme(pref: ThemePreference): "dark" | "light" | "auto" {
    switch (pref) {
        case "light":
            return "light";
        case "dark":
        case "classic-dark":
            return "dark";
        case "system":
            return "auto";
    }
}

function readStored(): ThemePreference {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(STORAGE_KEY) as ThemePreference) || "dark";
}

export function useThemePreference() {
    const { setColorScheme } = useMantineColorScheme();
    const [preference, setPreference] = useState<ThemePreference>(readStored);

    // Đồng bộ Mantine color scheme khi preference thay đổi
    useEffect(() => {
        setColorScheme(toMantineScheme(preference));
    }, [preference, setColorScheme]);

    const changeTheme = useCallback(
        (pref: ThemePreference) => {
            localStorage.setItem(STORAGE_KEY, pref);
            setPreference(pref);
        },
        []
    );

    return { preference, changeTheme } as const;
}
