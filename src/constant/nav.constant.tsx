import { IconDashboard, IconDatabaseImport, IconDimensions, IconFlare, IconMessage, IconNews, IconReportAnalytics, IconTags, IconUpload } from "@tabler/icons-react";
import { ROUTER_CLIENT } from "./router.constant";

export type NavConfigItem = {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: NavConfigItem[];
};

export const ICON_SIZE = 20;

export const NAV_ITEMS: NavConfigItem[] = [
    {
        label: "Dashboard",
        icon: <IconDashboard size={ICON_SIZE} />,
        href: ROUTER_CLIENT.HOME,
    },
    {
        label: "Article Create",
        icon: <IconNews size={ICON_SIZE} />,
        href: ROUTER_CLIENT.ARTICLE_CREATE,
    },
    {
        label: "Chat",
        icon: <IconMessage size={ICON_SIZE} />,
        href: ROUTER_CLIENT.CHAT,
    },
    {
        label: "Data Management",
        icon: <IconDimensions size={ICON_SIZE} />,
        children: [
            {
                label: "Upload Data",
                icon: <IconUpload size={ICON_SIZE} />,
                href: ROUTER_CLIENT.DATA_MANAGEMENT.UPLOAD_DATA,
            },
            {
                label: "Dimensions",
                icon: <IconDatabaseImport size={ICON_SIZE} />,
                href: ROUTER_CLIENT.DATA_MANAGEMENT.DIMENSIONS,
            },
            {
                label: "SKU Master",
                icon: <IconTags size={ICON_SIZE} />,
                href: ROUTER_CLIENT.DATA_MANAGEMENT.SKU_MASTER,
            },
        ],
    },
];
