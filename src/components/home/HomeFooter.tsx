import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', to: '/pricing' },
      { label: 'Examples', to: '/discover' },
      { label: 'Changelog', to: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', to: '/help' },
      { label: 'Contact', to: '/contact' },
      { label: 'Status', to: '/status' },
      { label: 'Discord community', to: 'https://discord.gg/ZgnSJqUyV' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Cookies', to: '/cookies' },
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="py-16 bg-[#FAFAF8] border-t border-[#e8e7e4]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/home" className="text-[#1a1a2e] font-semibold text-lg tracking-tight">
              VOVV
            </Link>
            <p className="text-[#9ca3af] text-[13px] mt-3 leading-relaxed">
              AI product images &amp; videos for e-commerce brands.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[#1a1a2e] text-[13px] font-semibold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => {
                  const isExternal = link.to.startsWith('http');
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6b7280] text-[13px] hover:text-[#1a1a2e] transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-[#6b7280] text-[13px] hover:text-[#1a1a2e] transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#e8e7e4] text-[#9ca3af] text-[12px]">
          © {new Date().getFullYear()} VOVV. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
