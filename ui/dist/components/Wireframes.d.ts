import React from 'react';
interface CanvasWireframeProps {
    isActive?: boolean;
    onNavigate?: (screen: string) => void;
}
export declare const CanvasWireframe: React.FC<CanvasWireframeProps>;
interface MarketplaceWireframeProps {
    isActive?: boolean;
    onNavigate?: (screen: string) => void;
}
export declare const MarketplaceWireframe: React.FC<MarketplaceWireframeProps>;
interface FleetWireframeProps {
    isActive?: boolean;
    onNavigate?: (screen: string) => void;
}
export declare const FleetWireframe: React.FC<FleetWireframeProps>;
interface AlertsWireframeProps {
    isActive?: boolean;
    onNavigate?: (screen: string) => void;
}
export declare const AlertsWireframe: React.FC<AlertsWireframeProps>;
interface DocumentationWireframeProps {
    isActive?: boolean;
    onNavigate?: (screen: string) => void;
}
export declare const DocumentationWireframe: React.FC<DocumentationWireframeProps>;
export declare const AgentConfigurationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}>;
export declare const DeviceConnectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}>;
export declare const DeploymentConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}>;
interface WireframeRouterProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}
export declare const WireframeRouter: React.FC<WireframeRouterProps>;
export declare const InteractionMap: React.FC;
export default WireframeRouter;
//# sourceMappingURL=Wireframes.d.ts.map