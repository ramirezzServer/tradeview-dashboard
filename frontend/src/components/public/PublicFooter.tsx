import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="mt-6 text-center text-[10px] text-muted-foreground/35">
      <nav aria-label="Legal links" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link to="/privacy" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Privacy
        </Link>
        <Link to="/terms" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Terms
        </Link>
        <Link to="/disclaimer" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Disclaimer
        </Link>
      </nav>
    </footer>
  );
}
