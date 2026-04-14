"use client";

import Header from "@/components/header/header-client/HeaderClient_v2";
import Nav from "@/components/nav/nav";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode } from "react";

type TProps = {
    children: ReactNode;
};

export function CollapseDesktopLayout({ children }: TProps) {
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

    return (
        <AppShell
            layout="alt"
            navbar={{
                width: desktopOpened ? "var(--width-nav-close)" : "var(--width-nav-open)",
                breakpoint: "sm",
                collapsed: {
                    mobile: !mobileOpened,
                },
            }}
            sx={{
                ".mantine-AppShell-navbar": {
                    transition: "all 300ms",
                },
            }}
        >
            <Nav desktopOpened={desktopOpened} toggleDesktop={toggleDesktop} mobileOpened={mobileOpened} toggleMobile={toggleMobile} />

            <AppShell.Main>
                <Header toggleMobile={toggleMobile} />

                {/* <Container size={"xl"} py={"xl"}> */}
                {children}
                {/* </Container> */}
            </AppShell.Main>
        </AppShell>
    );
}
