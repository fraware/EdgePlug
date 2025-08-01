import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import algoliasearch from 'algoliasearch';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

// Types
export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  vendor: string;
  version: string;
  price: number;
  rating: number;
  downloads: number;
  category: 'plc' | 'transformer' | 'breaker' | 'sensor' | 'actuator';
  tags: string[];
  certified: boolean;
  lastUpdated: string;
  size: number; // KB
  compatibility: string[];
}

export interface MarketplaceFilters {
  category: string[];
  priceRange: [number, number];
  rating: number;
  certified: boolean;
  vendor: string[];
}

// Algolia Search Client
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID || 'your-app-id',
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY || 'your-search-key'
);
const index = searchClient.initIndex('marketplace');

// Search Hook
const useMarketplaceSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: [],
    priceRange: [0, 1000],
    rating: 0,
    certified: false,
    vendor: [],
  });

  const search = useCallback(async (searchQuery: string, searchFilters: MarketplaceFilters) => {
    setLoading(true);
    try {
      const searchParams: any = {
        query: searchQuery,
        hitsPerPage: 50,
      };

      if (searchFilters.category.length > 0) {
        searchParams.filters = `category:(${searchFilters.category.join(' OR ')})`;
      }

      if (searchFilters.certified) {
        searchParams.filters = searchParams.filters 
          ? `${searchParams.filters} AND certified:true`
          : 'certified:true';
      }

      const { hits } = await index.search(searchQuery, searchParams);
      setResults(hits as MarketplaceItem[]);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string, searchFilters: MarketplaceFilters) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          search(searchQuery, searchFilters);
        }, 300);
      };
    },
    [search]
  );

  return {
    query,
    setQuery,
    results,
    loading,
    filters,
    setFilters,
    search: debouncedSearch,
  };
};

// Search Bar Component
interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch, loading }) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setSearchHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 5));
      onSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="Search agents, components, and tools..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {/* Search History */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onQueryChange(item);
                  handleSearch();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Filter Panel Component
interface FilterPanelProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const categories = ['plc', 'transformer', 'breaker', 'sensor', 'actuator'];
  const vendors = ['Siemens', 'Allen-Bradley', 'Schneider', 'ABB', 'Rockwell'];

  const updateFilter = (key: keyof MarketplaceFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
      
      {/* Categories */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...filters.category, category]
                    : filters.category.filter(c => c !== category);
                  updateFilter('category', newCategories);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="Min"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => updateFilter('rating', star)}
              className={cn(
                'text-lg',
                star <= filters.rating ? 'text-yellow-400' : 'text-gray-300'
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Certified Only */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.certified}
            onChange={(e) => updateFilter('certified', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Certified Only</span>
        </label>
      </div>

      {/* Vendors */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Vendors</h4>
        <div className="space-y-2">
          {vendors.map((vendor) => (
            <label key={vendor} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.vendor.includes(vendor)}
                onChange={(e) => {
                  const newVendors = e.target.checked
                    ? [...filters.vendor, vendor]
                    : filters.vendor.filter(v => v !== vendor);
                  updateFilter('vendor', newVendors);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{vendor}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Marketplace Item Component
interface MarketplaceItemProps {
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
}

const MarketplaceItem: React.FC<MarketplaceItemProps> = ({ item, onSelect }) => {
  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.certified && (
            <Badge variant="success" size="sm">Certified</Badge>
          )}
          <Badge variant="neutral" size="sm">{item.category}</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{item.vendor}</span>
        <span>v{item.version}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={cn(
                'text-sm',
                i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
              )}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-500 ml-1">({item.rating})</span>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">${item.price}</div>
          <div className="text-xs text-gray-500">{item.downloads} downloads</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Virtualized Marketplace List
interface MarketplaceListProps {
  items: MarketplaceItem[];
  onItemSelect: (item: MarketplaceItem) => void;
  loading: boolean;
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({ items, onItemSelect, loading }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each item
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="rectangular" height={200} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MarketplaceItem item={item} onSelect={onItemSelect} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Marketplace Component
export interface MarketplaceProps {
  className?: string;
  onItemSelect?: (item: MarketplaceItem) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ className, onItemSelect }) => {
  const {
    query,
    setQuery,
    results,
    loading,
    filters,
    setFilters,
    search,
  } = useMarketplaceSearch();

  const handleSearch = useCallback(() => {
    search(query, filters);
  }, [query, filters, search]);

  const handleItemSelect = useCallback((item: MarketplaceItem) => {
    onItemSelect?.(item);
  }, [onItemSelect]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Discover and deploy industrial automation agents</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-1">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Searching...' : `${results.length} results`}
          </h2>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1 text-sm border border-gray-300 rounded">
              <option>Sort by: Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Downloads</option>
            </select>
          </div>
        </div>

        <MarketplaceList
          items={results}
          onItemSelect={handleItemSelect}
          loading={loading}
        />
      </div>
    </div>
  );
}; 