"use client";

import { ICON_SIZE, NAV_ITEMS, NavConfigItem } from "@/constant/nav.constant";
import { Box, NavLink, Stack, Tooltip } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";

function buildHref(basePath: string, href?: string) {
    if (!href) return undefined;
    return `${basePath}${href}`;
}

function isItemActive(pathname: string, fullHref?: string, children?: NavConfigItem[], basePath?: string) {
    if (fullHref && (pathname === fullHref || pathname.startsWith(fullHref + "/"))) {
        return true;
    }

    if (children && basePath) {
        return children.some((child) => {
            const childHref = buildHref(basePath, child.href);
            return childHref ? pathname === childHref || pathname.startsWith(childHref + "/") : false;
        });
    }

    return false;
}

function RenderNavItem({ item, pathname, router, collapsed, toggleDesktop, level = 0 }: { item: NavConfigItem; pathname: string; router: ReturnType<typeof useRouter>; collapsed: boolean; toggleDesktop: () => void; level?: number }) {
    const active = isItemActive(pathname, item.href, item.children, "");
    const hasChildren = !!item.children?.length;

    const nav = (
        <NavLink
            label={collapsed ? undefined : item.label}
            leftSection={item.icon}
            active={active}
            defaultOpened={active}
            childrenOffset={28}
            onClick={() => {
                if (!hasChildren && item.href) {
                    router.push(item.href);
                }
                if (hasChildren && collapsed) {
                    console.log(123);
                    toggleDesktop();
                }
            }}
            styles={(theme) => ({
                root: {
                    borderRadius: theme.radius.md,
                    justifyContent: collapsed ? "center" : undefined,
                },
                body: {
                    display: collapsed ? "none" : "block",
                    height: ICON_SIZE,
                    lineHeight: `${ICON_SIZE}px`,
                },
                label: {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: `${ICON_SIZE}px`,
                    fontSize: ICON_SIZE - 6,
                },

                section: {
                    marginRight: collapsed ? 0 : undefined,
                },
            })}
        >
            {!collapsed && item.children?.map((child) => <RenderNavItem key={`${item.label}-${child.label}`} item={child} pathname={pathname} router={router} collapsed={collapsed} toggleDesktop={toggleDesktop} level={level + 1} />)}
        </NavLink>
    );

    if (collapsed) {
        return (
            <Tooltip key={`${level}-${item.label}`} label={item.label} position="right">
                <Box>{nav}</Box>
            </Tooltip>
        );
    }

    return <Box key={`${level}-${item.label}`}>{nav}</Box>;
}

type TProps = {
    collapsed: boolean;
    toggleDesktop: () => void;
};

export function NavBody({ collapsed, toggleDesktop }: TProps) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <Stack gap={2} px="sm" py="md">
            {NAV_ITEMS.map((item) => (
                <RenderNavItem key={item.label} item={item} pathname={pathname} router={router} collapsed={collapsed} toggleDesktop={toggleDesktop} />
            ))}
        </Stack>
    );
}
