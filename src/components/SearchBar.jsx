import React from 'react';
import { Search, Sparkles } from 'lucide-react';

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isLoading, 
  isMobile = false 
}) => {
  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative ${isMobile ? 'w-full' : 'flex w-full group'}`}
    >
      <div className={`flex rounded-xl bg-gradient-to-r from-gray-50 to-orange-50 ring-2 ring-orange-200 focus-within:ring-4 focus-within:ring-orange-400/20 transition-all shadow-md ${isMobile ? 'w-full rounded-2xl' : ''}`}>
        <div className="flex items-center pl-4 text-gray-400">
          <Search size={isMobile ? 20 : 18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isMobile ? "Search premium products..." : "Search products..."}
          className={`flex-1 bg-transparent text-gray-800 placeholder-gray-500 px-3 py-3 outline-none font-medium ${isMobile ? 'text-base px-4 py-4' : 'text-sm'}`}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-3 rounded-xl shadow hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 ${isMobile ? 'px-6 py-4 rounded-2xl' : 'xl:px-6'}`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <Sparkles size={16} />
          )}
          <span className={isMobile ? "hidden sm:inline" : "hidden xl:inline text-sm"}>Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
