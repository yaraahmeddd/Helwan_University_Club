const AppLoader = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="جار التحميل"
    className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background"
  >
    <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
    <p className="text-sm text-muted-foreground">جار التحميل…</p>
  </div>
);

export default AppLoader;
