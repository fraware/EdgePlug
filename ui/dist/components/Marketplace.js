import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import algoliasearch from 'algoliasearch';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID || 'your-app-id', process.env.REACT_APP_ALGOLIA_SEARCH_KEY || 'your-search-key');
const index = searchClient.initIndex('marketplace');
const useMarketplaceSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        category: [],
        priceRange: [0, 1000],
        rating: 0,
        certified: false,
        vendor: [],
    });
    const search = useCallback(async (searchQuery, searchFilters) => {
        setLoading(true);
        try {
            const searchParams = {
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
            setResults(hits);
        }
        catch (error) {
            console.error('Search error:', error);
            setResults([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const debouncedSearch = useMemo(() => {
        let timeoutId;
        return (searchQuery, searchFilters) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                search(searchQuery, searchFilters);
            }, 300);
        };
    }, [search]);
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
const SearchBar = ({ query, onQueryChange, onSearch, loading }) => {
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const handleSearch = () => {
        if (query.trim()) {
            setSearchHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 5));
            onSearch();
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("input", { type: "text", value: query, onChange: (e) => onQueryChange(e.target.value), onKeyPress: handleKeyPress, onFocus: () => setShowHistory(true), onBlur: () => setTimeout(() => setShowHistory(false), 200), placeholder: "Search agents, components, and tools...", className: "w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2", children: loading ? (_jsx("div", { className: "w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" })) : (_jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })) })] }), _jsx(Button, { onClick: handleSearch, disabled: loading, children: "Search" })] }), _jsx(AnimatePresence, { children: showHistory && searchHistory.length > 0 && (_jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10", children: searchHistory.map((item, index) => (_jsx("button", { onClick: () => {
                            onQueryChange(item);
                            handleSearch();
                        }, className: "w-full px-4 py-2 text-left hover:bg-gray-50 text-sm", children: item }, index))) })) })] }));
};
const FilterPanel = ({ filters, onFiltersChange }) => {
    const categories = ['plc', 'transformer', 'breaker', 'sensor', 'actuator'];
    const vendors = ['Siemens', 'Allen-Bradley', 'Schneider', 'ABB', 'Rockwell'];
    const updateFilter = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Filters" }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Categories" }), _jsx("div", { className: "space-y-2", children: categories.map((category) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.category.includes(category), onChange: (e) => {
                                        const newCategories = e.target.checked
                                            ? [...filters.category, category]
                                            : filters.category.filter(c => c !== category);
                                        updateFilter('category', newCategories);
                                    }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700 capitalize", children: category })] }, category))) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Price Range" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", value: filters.priceRange[0], onChange: (e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]]), className: "w-20 px-2 py-1 text-sm border border-gray-300 rounded", placeholder: "Min" }), _jsx("span", { className: "text-gray-500", children: "-" }), _jsx("input", { type: "number", value: filters.priceRange[1], onChange: (e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)]), className: "w-20 px-2 py-1 text-sm border border-gray-300 rounded", placeholder: "Max" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Minimum Rating" }), _jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { onClick: () => updateFilter('rating', star), className: cn('text-lg', star <= filters.rating ? 'text-yellow-400' : 'text-gray-300'), children: "\u2605" }, star))) })] }), _jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.certified, onChange: (e) => updateFilter('certified', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Certified Only" })] }) }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Vendors" }), _jsx("div", { className: "space-y-2", children: vendors.map((vendor) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: filters.vendor.includes(vendor), onChange: (e) => {
                                        const newVendors = e.target.checked
                                            ? [...filters.vendor, vendor]
                                            : filters.vendor.filter(v => v !== vendor);
                                        updateFilter('vendor', newVendors);
                                    }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: vendor })] }, vendor))) })] })] }));
};
const MarketplaceItem = ({ item, onSelect }) => {
    return (_jsxs(motion.div, { className: "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: () => onSelect(item), children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: item.name }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: item.description })] }), _jsxs("div", { className: "flex items-center gap-2", children: [item.certified && (_jsx(Badge, { variant: "success", size: "sm", children: "Certified" })), _jsx(Badge, { variant: "neutral", size: "sm", children: item.category })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500 mb-3", children: [_jsx("span", { children: item.vendor }), _jsxs("span", { children: ["v", item.version] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [Array.from({ length: 5 }, (_, i) => (_jsx("span", { className: cn('text-sm', i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'), children: "\u2605" }, i))), _jsxs("span", { className: "text-xs text-gray-500 ml-1", children: ["(", item.rating, ")"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold text-gray-900", children: ["$", item.price] }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.downloads, " downloads"] })] })] }), _jsx("div", { className: "flex flex-wrap gap-1 mt-3", children: item.tags.slice(0, 3).map((tag) => (_jsx("span", { className: "px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded", children: tag }, tag))) })] }));
};
const MarketplaceList = ({ items, onItemSelect, loading }) => {
    const parentRef = React.useRef(null);
    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 200,
        overscan: 5,
    });
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: Array.from({ length: 6 }, (_, i) => (_jsx(Skeleton, { variant: "rectangular", height: 200 }, i))) }));
    }
    return (_jsx("div", { ref: parentRef, className: "h-[600px] overflow-auto", children: _jsx("div", { style: {
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
            }, children: rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = items[virtualRow.index];
                return (_jsx("div", { style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                    }, children: _jsx(MarketplaceItem, { item: item, onSelect: onItemSelect }) }, virtualRow.index));
            }) }) }));
};
export const Marketplace = ({ className, onItemSelect }) => {
    const { query, setQuery, results, loading, filters, setFilters, search, } = useMarketplaceSearch();
    const handleSearch = useCallback(() => {
        search(query, filters);
    }, [query, filters, search]);
    const handleItemSelect = useCallback((item) => {
        onItemSelect?.(item);
    }, [onItemSelect]);
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Marketplace" }), _jsx("p", { className: "text-gray-600", children: "Discover and deploy industrial automation agents" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-3", children: _jsx(SearchBar, { query: query, onQueryChange: setQuery, onSearch: handleSearch, loading: loading }) }), _jsx("div", { className: "lg:col-span-1", children: _jsx(FilterPanel, { filters: filters, onFiltersChange: setFilters }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: loading ? 'Searching...' : `${results.length} results` }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("select", { className: "px-3 py-1 text-sm border border-gray-300 rounded", children: [_jsx("option", { children: "Sort by: Relevance" }), _jsx("option", { children: "Price: Low to High" }), _jsx("option", { children: "Price: High to Low" }), _jsx("option", { children: "Rating" }), _jsx("option", { children: "Downloads" })] }) })] }), _jsx(MarketplaceList, { items: results, onItemSelect: handleItemSelect, loading: loading })] })] }));
};
//# sourceMappingURL=Marketplace.js.map