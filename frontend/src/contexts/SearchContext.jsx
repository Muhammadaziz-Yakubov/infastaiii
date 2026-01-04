import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

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
    goals: [],
    challenges: [],
    transactions: []
  });
  const [isSearching, setIsSearching] = useState(false);

  // Search function - haqiqiy API bilan ishlaydi
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ tasks: [], goals: [], challenges: [], transactions: [] });
      return;
    }

    setIsSearching(true);
    const searchTerm = query.toLowerCase().trim();
    
    try {
      // Parallel ravishda barcha API larni chaqirish
      const [tasksRes, goalsRes, challengesRes, transactionsRes] = await Promise.allSettled([
        api.get('/api/tasks'),
        api.get('/api/goals'),
        api.get('/api/challenges'),
        api.get('/api/finance/transactions')
      ]);

      // Tasks filter
      let tasks = [];
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.tasks) {
        tasks = tasksRes.value.data.tasks.filter(task =>
          task.title?.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.category?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
      }

      // Goals filter
      let goals = [];
      if (goalsRes.status === 'fulfilled' && goalsRes.value?.data?.goals) {
        goals = goalsRes.value.data.goals.filter(goal =>
          goal.title?.toLowerCase().includes(searchTerm) ||
          goal.description?.toLowerCase().includes(searchTerm) ||
          goal.category?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
      }

      // Challenges filter
      let challenges = [];
      if (challengesRes.status === 'fulfilled' && challengesRes.value?.data?.challenges) {
        challenges = challengesRes.value.data.challenges.filter(challenge =>
          challenge.title?.toLowerCase().includes(searchTerm) ||
          challenge.description?.toLowerCase().includes(searchTerm) ||
          challenge.category?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
      }

      // Transactions filter
      let transactions = [];
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.data?.transactions) {
        transactions = transactionsRes.value.data.transactions.filter(tx =>
          tx.description?.toLowerCase().includes(searchTerm) ||
          tx.category?.toLowerCase().includes(searchTerm) ||
          tx.type?.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
      }

      setSearchResults({
        tasks,
        goals,
        challenges,
        transactions
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ tasks: [], goals: [], challenges: [], transactions: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({ tasks: [], goals: [], challenges: [], transactions: [] });
  }, []);

  // Umumiy natijalar soni
  const totalResults = 
    searchResults.tasks.length + 
    searchResults.goals.length + 
    searchResults.challenges.length + 
    searchResults.transactions.length;

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
    totalResults
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;