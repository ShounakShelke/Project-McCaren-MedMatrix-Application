import { Dispatch, SetStateAction } from 'react';
import { RouteName } from '../App';

interface NavbarProps {
  route: RouteName;
  setRoute: Dispatch<SetStateAction<RouteName>>;
}

export default function Navbar({ route, setRoute }: NavbarProps) {
  const navItemClass = (currentRoute: RouteName) =>
    `relative px-4 py-2 text-sm font-bold transition-all duration-200 rounded-lg ${route === currentRoute
      ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800'
      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">

          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group hover:opacity-90 transition-opacity z-10" onClick={() => setRoute('home')}>
            <img
              src="/logo.png"
              alt="Project McCaren Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-2 z-10">
            <button className={navItemClass('home')} onClick={() => setRoute('home')}>
              <span className="relative z-10 flex items-center gap-2">
                Home
              </span>
            </button>
            <button className={navItemClass('how')} onClick={() => setRoute('how')}>
              <span className="relative z-10 flex items-center gap-2">
                How it Works
              </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}