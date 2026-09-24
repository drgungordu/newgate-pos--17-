import React, { useState, useEffect } from 'react';
import { MOCK_PRINTER_LABELS } from '../../constants';
import { KitchenTicket, KDSSettings, PrinterLabel, Employee } from '../../types';
import { KitchenRoutingService, StationConfig } from '../../services/kitchenRoutingService';
import { LocalDbService } from '../../services/localDbService';
import { PermissionService } from '../../services/permissionService';
import { AuditService } from '../../services/auditService';
import { AddStationModal } from './kds/AddStationModal';
import { RefireModal } from './kds/RefireModal';
import { StationSelectionView } from './kds/StationSelectionView';
import { ActiveStationHeader } from './kds/ActiveStationHeader';
import { KdsTicketColumns } from './kds/KdsTicketColumns';

interface KitchenDisplayProps {
  settings?: KDSSettings;
  kdsSettings?: KDSSettings;
  liveTickets?: KitchenTicket[];
  tickets?: KitchenTicket[];
  onUpdateStatus?: (id: string, status: KitchenTicket['status']) => void;
  onStatusChange?: (id: string, status: KitchenTicket['status']) => void;
  printerLabels?: PrinterLabel[];
  onExit?: () => void;
  initialStationId?: string | null;
  currentUser?: Employee;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  settings,
  kdsSettings,
  liveTickets,
  tickets: propTickets,
  onUpdateStatus,
  onStatusChange,
  printerLabels,
  onExit,
  initialStationId = null,
  currentUser,
}) => {
  const tickets = liveTickets || propTickets || [];
  const effectiveSettings = settings || kdsSettings;
  const activeLabels = (printerLabels && printerLabels.length > 0) ? printerLabels : MOCK_PRINTER_LABELS;

  const [selectedStation, setSelectedStation] = useState<string | null>(() => {
    if (initialStationId && currentUser && !PermissionService.canViewStation(currentUser, initialStationId)) {
      return null;
    }
    return initialStationId;
  });
  const [stations, setStations] = useState<StationConfig[]>([
    ...KitchenRoutingService.STATIONS,
    { id: 'unassigned', name: 'Unassigned', deliveryMode: 'KDS_ONLY' },
  ]);
  const [activeTab, setActiveTab] = useState<'All' | 'Dine-in' | 'Takeout'>('All');
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [customStationName, setCustomStationName] = useState('');
  const [customDeliveryMode, setCustomDeliveryMode] = useState<'KDS_ONLY' | 'PRINTER_ONLY' | 'BOTH'>('KDS_ONLY');
  const [refireTicketId, setRefireTicketId] = useState<string | null>(null);
  const [refireReason, setRefireReason] = useState('Customer changed seat/prep error');
  const [recentlyBumped, setRecentlyBumped] = useState<KitchenTicket | null>(null);

  useEffect(() => {
    KitchenRoutingService.getStations().then(next => setStations([...next, { id: 'unassigned', name: 'Unassigned', deliveryMode: 'KDS_ONLY' }])).catch(console.warn);
  }, []);

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      LocalDbService.saveKdsTickets(tickets);
    }
  }, [tickets]);

  const isStationAuthorized = (stationId: string) => {
    if (!currentUser) return true;
    return PermissionService.canViewStation(currentUser, stationId);
  };

  const handleSelectStation = async (stationId: string) => {
    if (currentUser && !isStationAuthorized(stationId)) {
      await AuditService.log({
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'UNAUTHORIZED_KDS_STATION_ACCESS_BLOCKED',
        targetType: 'KDS_STATION',
        targetId: stationId,
        details: {
          stationId,
          requiredPermission: `kds.station.${stationId.toLowerCase()}.view`,
          operatorRole: currentUser.role,
        },
        status: 'REJECTED',
        merchantId: currentUser.businessId,
      });
      alert(`Access Restricted: Operator '${currentUser.name}' lacks 'kds.station.${stationId.toLowerCase()}.view' permission to monitor this production line.`);
      return;
    }
    setSelectedStation(stationId);
  };

  const handleStatusChange = (id: string, status: KitchenTicket['status']) => {
    if (status === 'Delivered') {
      const t = tickets.find(x => x.id === id);
      if (t) setRecentlyBumped(t);
    }
    if (onUpdateStatus) onUpdateStatus(id, status);
    else if (onStatusChange) onStatusChange(id, status);
  };

  const handleRecall = () => {
    if (recentlyBumped) {
      handleStatusChange(recentlyBumped.id, 'Ready');
      setRecentlyBumped(null);
    }
  };

  const handleCreateCustomStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStationName.trim()) return;
    const slug = customStationName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const updated = await KitchenRoutingService.addCustomStation({
      id: slug,
      name: customStationName.trim(),
      deliveryMode: customDeliveryMode,
      color: 'indigo',
    });
    setStations(updated);
    setShowAddStationModal(false);
    setCustomStationName('');
    setSelectedStation(slug);
  };

  const matchesStation = (t: KitchenTicket, stationId: string | null) => {
    if (!stationId || stationId === 'All Stations' || stationId.toLowerCase() === 'expo') return true;
    if ((t as any).station && (t as any).station.toLowerCase() === stationId.toLowerCase()) return true;
    const targetSlug = stationId.toLowerCase();
    if (targetSlug === 'unassigned') {
      return t.items.some(item => !Array.isArray((item as any).stationIds) || (item as any).stationIds.length === 0);
    }
    const stationObj = stations.find(s => s.id.toLowerCase() === targetSlug);
    const targetName = stationObj ? stationObj.name.toLowerCase() : targetSlug;

    return t.items.some(item => {
      const itemStationIds = ((item as any).stationIds || []).map((s: string) => s.toLowerCase());
      return itemStationIds.includes(targetSlug) || itemStationIds.includes(targetName) ||
        false;
    });
  };

  const getTicketCountForStation = (stationId: string) => {
    if (stationId === 'expo') return tickets.filter(t => t.status !== 'Delivered').length;
    return tickets.filter(t => t.status !== 'Delivered' && matchesStation(t, stationId)).length;
  };

  if (!selectedStation) {
    return (
      <>
        <StationSelectionView
          onExit={onExit}
          onOpenAddStationModal={() => setShowAddStationModal(true)}
          stations={stations}
          getTicketCountForStation={getTicketCountForStation}
          onSelectStation={handleSelectStation}
          isStationAuthorized={isStationAuthorized}
        />
        <AddStationModal
          isOpen={showAddStationModal}
          onClose={() => setShowAddStationModal(false)}
          customStationName={customStationName}
          setCustomStationName={setCustomStationName}
          customDeliveryMode={customDeliveryMode}
          setCustomDeliveryMode={setCustomDeliveryMode}
          onSubmit={handleCreateCustomStation}
        />
      </>
    );
  }

  const isExpo = selectedStation.toLowerCase() === 'expo';
  const filteredTickets = tickets.filter(t => (activeTab === 'All' || t.type === activeTab) && matchesStation(t, selectedStation));
  const currentStationObj = stations.find(s => s.id === selectedStation);

  return (
    <div className="h-full min-h-[calc(100vh-5rem)] flex flex-col bg-slate-900 text-white select-none">
      <ActiveStationHeader
        onExit={onExit}
        onChangeStation={() => setSelectedStation(null)}
        stationName={currentStationObj?.name || selectedStation}
        isExpo={isExpo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentlyBumped={recentlyBumped}
        onRecall={handleRecall}
        activeOrdersCount={filteredTickets.filter(t => t.status !== 'Delivered').length}
      />

      <KdsTicketColumns
        pendingTickets={filteredTickets.filter(t => t.status === 'Pending')}
        prepTickets={filteredTickets.filter(t => t.status === 'Prep')}
        readyTickets={filteredTickets.filter(t => t.status === 'Ready')}
        handleStatusChange={handleStatusChange}
        effectiveSettings={effectiveSettings}
        activeLabels={activeLabels}
        selectedStation={selectedStation}
        isExpo={isExpo}
        onRefire={setRefireTicketId}
      />

      <RefireModal
        ticketId={refireTicketId}
        onClose={() => setRefireTicketId(null)}
        refireReason={refireReason}
        setRefireReason={setRefireReason}
        onConfirm={(id) => { handleStatusChange(id, 'Prep'); setRefireTicketId(null); }}
      />
    </div>
  );
};

export default KitchenDisplay;
