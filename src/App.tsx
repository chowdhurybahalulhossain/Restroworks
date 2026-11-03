import React from 'react';
import { usePosStore } from './store/posStore';
import { Navbar } from './components/layout/Navbar';
import { PosTerminalPortal } from './components/portals/PosTerminalPortal';
import { KdsPortal } from './components/portals/KdsPortal';
import { DashboardPortal } from './components/portals/DashboardPortal';
import { OperationsHubPortal } from './components/portals/OperationsHubPortal';
import { CustomerQrPortal } from './components/portals/CustomerQrPortal';
import { WaiterHandheldPortal } from './components/portals/WaiterHandheldPortal';
import { CustomerFacingDisplayPortal } from './components/portals/CustomerFacingDisplayPortal';
import { RiderPortal } from './components/portals/RiderPortal';
import { DesignSystemPortal } from './components/portals/DesignSystemPortal';
import { CrmPortal } from './components/portals/CrmPortal';
import { ReservationPortal } from './components/portals/ReservationPortal';
import { DeliveryPortal } from './components/portals/DeliveryPortal';
import { LockScreenModal } from './components/modals/LockScreenModal';
import { ManagerOverrideModal } from './components/modals/ManagerOverrideModal';

export const App: React.FC = () => {
  const { activePortal } = usePosStore();

  const renderActivePortal = () => {
    switch (activePortal) {
      case 'POS_TERMINAL':
        return <PosTerminalPortal />;
      case 'KITCHEN_DISPLAY':
        return <KdsPortal />;
      case 'ADMIN_DASHBOARD':
        return <DashboardPortal />;
      case 'OPERATIONS_HUB':
        return <OperationsHubPortal />;
      case 'CUSTOMER_QR':
        return <CustomerQrPortal />;
      case 'WAITER_HANDHELD':
        return <WaiterHandheldPortal />;
      case 'CUSTOMER_DISPLAY':
        return <CustomerFacingDisplayPortal />;
      case 'RIDER_VIEW':
        return <RiderPortal />;
      case 'DESIGN_SYSTEM':
        return <DesignSystemPortal />;
      case 'CRM_HUB':
        return <CrmPortal />;
      case 'RESERVATION_HUB':
        return <ReservationPortal />;
      case 'DELIVERY_HUB':
        return <DeliveryPortal />;
      default:
        return <PosTerminalPortal />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-nova-bg text-slate-100 overflow-hidden font-sans">
      {/* Top Universal Operating Navigation Bar */}
      <Navbar />

      {/* Main Dynamic Portal Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {renderActivePortal()}
      </main>

      {/* Security Modals & Approval Overrides */}
      <LockScreenModal />
      <ManagerOverrideModal />
    </div>
  );
};

export default App;
