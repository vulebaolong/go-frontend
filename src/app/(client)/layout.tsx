import { CollapseDesktopLayout } from "@/layouts/collapse-desktop-layout";

type TProps = {
   children: React.ReactNode;
};

export default function layout({ children }: TProps) {
   return <CollapseDesktopLayout>{children}</CollapseDesktopLayout>;
}
