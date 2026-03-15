

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
                <article className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-400 hover:prose-a:text-blue-300">
                    {children}
                </article>
            </div>
        </main>
    );
}
