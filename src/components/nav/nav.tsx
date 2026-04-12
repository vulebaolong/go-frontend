"use client";

import { NavBody } from "@/components/nav/nav-body/nav-body";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { ActionIcon, AppShell, Group, Transition } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconLayoutSidebarLeftCollapse } from "@tabler/icons-react";
import { Logo } from "../logo/Logo";

type TProps = {
    desktopOpened: boolean;
    toggleDesktop: () => void;
    mobileOpened: boolean;
    toggleMobile: () => void;
};

export default function Nav({ desktopOpened, toggleDesktop, mobileOpened, toggleMobile }: TProps) {
    const { hovered, ref } = useHover();
    const isDesktop = useIsDesktop();

    const canAnimate = hovered && desktopOpened && isDesktop;

    return (
        <AppShell.Navbar ref={ref}>
            <Group
                sx={{
                    height: "var(--height-header)",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
                wrap="nowrap"
                gap={0}
            >
                <Group
                    gap={0}
                    sx={{
                        width: "56px",
                        height: "56px",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Transition mounted={!canAnimate} enterDelay={150} transition="fade" duration={150} timingFunction="ease">
                        {(styles) => (
                            <div style={styles}>
                                <Logo width={24} />
                            </div>
                        )}
                    </Transition>
                    <Transition mounted={canAnimate} enterDelay={150} transition="fade" duration={150} timingFunction="ease">
                        {(styles) => (
                            <div style={styles}>
                                <ActionIcon w={24} onClick={toggleDesktop} variant="subtle" color="gray">
                                    <IconLayoutSidebarLeftCollapse size={18} />
                                </ActionIcon>
                            </div>
                        )}
                    </Transition>
                </Group>

                {isDesktop && !desktopOpened && (
                    <ActionIcon onClick={toggleDesktop} variant="subtle" color="gray" mr={"xs"}>
                        <IconLayoutSidebarLeftCollapse size={18} />
                    </ActionIcon>
                )}
                {!isDesktop && (
                    <ActionIcon onClick={toggleMobile} variant="subtle" hiddenFrom="sm" color="gray" mr={"xs"}>
                        <IconLayoutSidebarLeftCollapse size={18} />
                    </ActionIcon>
                )}
            </Group>

            <NavBody collapsed={isDesktop ? desktopOpened : !mobileOpened} toggleDesktop={toggleDesktop} />
        </AppShell.Navbar>
    );
}
