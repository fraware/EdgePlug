import React from 'react';
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
    size: number;
    compatibility: string[];
}
export interface MarketplaceFilters {
    category: string[];
    priceRange: [number, number];
    rating: number;
    certified: boolean;
    vendor: string[];
}
export interface MarketplaceProps {
    className?: string;
    onItemSelect?: (item: MarketplaceItem) => void;
}
export declare const Marketplace: React.FC<MarketplaceProps>;
//# sourceMappingURL=Marketplace.d.ts.map