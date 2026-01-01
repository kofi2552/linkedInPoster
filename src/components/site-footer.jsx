export function SiteFooter() {
    return (
        <footer className="py-8 border-t bg-muted/20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">PostPilot</span>
                    <span>© 2024</span>
                </div>
                <div className="flex gap-6">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>Built for Professionals</span>
                </div>
            </div>
        </footer>
    );
}
