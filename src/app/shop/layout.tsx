import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background">
            <div className="pt-20 pb-0 px-6 max-w-7xl mx-auto">
                <Breadcrumbs className="mb-2" />
            </div>
            {children}
        </main>
    );
}
