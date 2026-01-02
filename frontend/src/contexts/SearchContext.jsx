import React, { createContext, useState, useContext, useCallback } from 'react';

// Search context yaratish
const SearchContext = createContext(null);

// Custom hook
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

// Search provider
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    tasks: [],
    users: [],
    messages: []
  });
  const [isSearching, setIsSearching] = useState(false);

  // Search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ tasks: [], users: [], messages: [] });
      return;
    }

    setIsSearching(true);
    
    // Mock/search simulation (keyin backend bilan almashtiramiz)
    setTimeout(() => {
      // Mock tasks
      const mockTasks = [
        { _id: '1', title: `${query} bo'yicha vazifa`, description: 'Bu test vazifasi', status: 'pending', createdAt: new Date() },
        { _id: '2', title: `Yana bir ${query} vazifasi`, description: 'Ikkinchi test', status: 'in_progress', createdAt: new Date() },
      ];

      setSearchResults({
        tasks: mockTasks.filter(task => 
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description.toLowerCase().includes(query.toLowerCase())
        ),
        users: [],
        messages: []
      });
      setIsSearching(false);
    }, 500);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({ tasks: [], users: [], messages: [] });
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;