import React from 'react';
import { Crown } from 'lucide-react';

const HeaderLogo = ({ handleNavigate }) => {
  return (
    <div
      onClick={() => handleNavigate("/")}
      className="flex items-center cursor-pointer group flex-shrink-0 mr-2 lg:mr-4"
    >
      <div className="relative">
        <img
          src="/lion.png"
          alt="Lion Bidi"
          className="h-10 w-auto sm:h-12 lg:h-14 transition-all duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="ml-2 lg:ml-3">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-divine-orange">
          Lion Bidi
        </h1>
        <div className="flex items-center gap-1 mt-0.5">
          <Crown size={10} className="text-yellow-500" />
          <p className="text-xs text-divine-orange font-semibold uppercase tracking-wide">
            Special Bidi
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderLogo;
