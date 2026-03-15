
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background">
            <div className="pt-24 px-6 max-w-7xl mx-auto relative z-20">
                <Breadcrumbs
                    className="mb-8"
                    customItems={[]} // Let it auto-generate, or we can customize if needed
                />
            </div>
            {children}
        </main>
    );
}
