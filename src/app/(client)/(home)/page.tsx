import RootPage from "@/components/root-page/RootPage";
import Home_v2 from "@/page/home/Home _v2";

export default async function page() {
    return (
        <RootPage protect>
            <Home_v2 />
        </RootPage>
    );
}
