import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function useIsDesktop() {
    const theme = useMantineTheme();
    return useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
}
