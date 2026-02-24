export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'ray-infotech-mlm');

  return (
    <footer className="bg-navy-950 border-t border-gold-500/20 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-navy-300 text-sm">
            © {year} Ray Infotech. All rights reserved.
          </div>
          <div className="text-navy-400 text-sm flex items-center gap-1">
            Built with{' '}
            <span className="text-gold-400">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
