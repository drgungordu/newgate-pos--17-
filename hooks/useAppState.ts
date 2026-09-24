import { useState, useEffect } from 'react';
import {
  UserRole, Employee, DetailedOrder, Transaction, Customer, InventoryItem, Category,
  Reservation, Schedule, DiningTable, KDSSettings, AppIntegrationConfig,
  DiscountCode, GlobalTaxConfig, TipConfig, KitchenTicket, Notification, Business,
  DiningOrderItem, CartItem, CashLogEntry, Invoice, RecurringPlan, ModifierGroup,
  PrinterLabel, Feedback, FeedbackSettings, WaitlistEntry, GiftCard, RemovedItem, Role, RolePermission
} from '../types';
import {
  MOCK_EMPLOYEES, MOCK_DETAILED_ORDERS, MOCK_TRANSACTIONS, MOCK_CUSTOMERS,
  MOCK_INVENTORY_ITEMS, MOCK_CATEGORIES, MOCK_RESERVATIONS,
  MOCK_SCHEDULES, MOCK_FLOOR_TABLES, MOCK_KDS_SETTINGS,
  MOCK_DISCOUNTS, MOCK_CASH_LOGS, MOCK_RECEIPT_SETTINGS, MOCK_TIP_CONFIG,
  MOCK_KITCHEN_TICKETS, MOCK_BUSINESSES, MOCK_INVOICES, MOCK_RECURRING_PLANS,
  MOCK_MODIFIER_GROUPS, MOCK_PRINTER_LABELS, MOCK_ROLES, MOCK_ROLE_PERMISSIONS
} from '../constants';
import { LocalDbService } from '../services/localDbService';

const getUrlPath = () => (typeof window !== 'undefined' ? window.location.pathname : '/');

const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useAppState = () => {
  const [currentPath, setCurrentPath] = useState(getUrlPath());

  // Global State
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);

  // Data State
  const [orders, setOrders] = useState<DetailedOrder[]>(MOCK_DETAILED_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [employeesState, setEmployeesState] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(MOCK_MODIFIER_GROUPS);
  const [discounts, setDiscounts] = useState<DiscountCode[]>(MOCK_DISCOUNTS);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);

  // Roles & Permissions
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLE_PERMISSIONS);
  const [matrixState, setMatrixState] = useState<any>({});

  // Financial State
  const [cashLogs, setCashLogs] = useState<CashLogEntry[]>(MOCK_CASH_LOGS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [recurringPlans, setRecurringPlans] = useState<RecurringPlan[]>(MOCK_RECURRING_PLANS);

  // GiftCards & Feedback
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>({
    allowFeedback: true,
    showOnReceipt: true,
    promptFrequency: 'Always',
    customQuestions: []
  });

  // Printer & Hardware
  const [printerLabels, setPrinterLabels] = useState<PrinterLabel[]>(MOCK_PRINTER_LABELS);

  // Kitchen & Notification State
  const [activeTickets, setActiveTickets] = useState<KitchenTicket[]>(MOCK_KITCHEN_TICKETS);
  const [serverNotifications, setServerNotifications] = useState<Notification[]>([]);

  // Advanced Module State
  const [floorPlanTables, setFloorPlanTables] = useState<DiningTable[]>(MOCK_FLOOR_TABLES);
  const [activeTableOrders, setActiveTableOrders] = useState<Record<string, { items: DiningOrderItem[], guests: {id: number, name?: string}[] }>>({});
  const [registerCart, setRegisterCart] = useState<CartItem[]>([]);
  const [currentRegisterOrderId, setCurrentRegisterOrderId] = useState<string | null>(null);

  const [kdsSettings, setKdsSettings] = useState<KDSSettings>(MOCK_KDS_SETTINGS);
  const [integrationConfig, setIntegrationConfig] = useState<AppIntegrationConfig>({
    reservation_pos: true,
    scheduling_pos: false,
    scheduling_reservation: false,
    kdsEnabled: MOCK_KDS_SETTINGS.isEnabled,
  });
  const [receiptSettings, setReceiptSettings] = useState(MOCK_RECEIPT_SETTINGS);

  // Tax & Tip
  const [taxConfig, setTaxConfig] = useState<GlobalTaxConfig>({ rate: 8.25, name: 'Sales Tax', enabled: true, includeInPrice: false });
  const [tipConfig, setTipConfig] = useState<TipConfig>(MOCK_TIP_CONFIG);
  const [removalReasons, setRemovalReasons] = useState<RemovedItem[]>([]);

  // Navigation State
  const [activeTab, setActiveTab] = useState('Home');
  const [requestedPosApp, setRequestedPosApp] = useState<string | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Effects
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setIntegrationConfig(prev => ({...prev, kdsEnabled: kdsSettings.isEnabled}));
  }, [kdsSettings.isEnabled]);

  useEffect(() => {
    if (registerCart.length > 0 && !currentRegisterOrderId) {
      setCurrentRegisterOrderId(generateOrderId());
    } else if (registerCart.length === 0) {
      setCurrentRegisterOrderId(null);
    }
  }, [registerCart, currentRegisterOrderId]);

  // Handlers
  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    const posOnlyRoles = ['Server Lead', 'Server', 'Host', 'Employee', UserRole.CASHIER, UserRole.STAFF];
    if (posOnlyRoles.includes(user.role)) {
      setActiveTab('New Sale');
    } else if (user.role === UserRole.SUPER_ADMIN) {
      setActiveTab('SuperAdmin');
    } else {
      setActiveTab('Home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('Login');
    setIsProfileMenuOpen(false);
  };

  const handleSwitchRole = (roleName: string) => {
    const user = employeesState.find(u => u.role === roleName) || MOCK_EMPLOYEES.find(u => u.role === roleName);
    if (user) {
      handleLogin(user);
      setShowRoleSwitcher(false);
      setIsProfileMenuOpen(false);
    } else {
      if (roleName === UserRole.SUPER_ADMIN) {
        const sa = MOCK_EMPLOYEES.find(u => u.role === UserRole.SUPER_ADMIN);
        if (sa) {
          handleLogin(sa);
          setShowRoleSwitcher(false);
          setIsProfileMenuOpen(false);
          return;
        }
      }
      alert(`No user found with role: ${roleName}`);
    }
  };

  const handleProcessSale = (cart: any[], total: number, paymentMethod: string = 'Card', existingOrderId?: string) => {
    const newOrder: DetailedOrder = {
      id: existingOrderId || currentRegisterOrderId || generateOrderId(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: total,
      status: 'Paid',
      paymentMethod: paymentMethod as any,
      employeeName: currentUser?.name || 'Staff',
      device: 'Main Register',
      type: 'Dine-in',
      items: cart
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [{
      id: `TRX-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      amount: total,
      type: 'Sale',
      method: paymentMethod as any,
      employeeId: currentUser?.id || 'E001'
    }, ...prev]);
    setRegisterCart([]);
  };

  const handleUpdateTableOrder = (tableId: string, data: { items: DiningOrderItem[], guests: { id: number, name?: string }[] } | undefined) => {
    setActiveTableOrders(prev => {
      if (data === undefined) {
        const next = { ...prev };
        delete next[tableId];
        return next;
      }
      return { ...prev, [tableId]: data };
    });
    const nextState = { ...activeTableOrders };
    if (data === undefined) delete nextState[tableId];
    else nextState[tableId] = data;
    LocalDbService.saveTableState(floorPlanTables, nextState);
  };

  const handleUpdateTableStatus = (updatedTable: DiningTable) => {
    setFloorPlanTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
  };

  const handleSaveItem = (item: InventoryItem) => {
    setInventory(prev => {
      const index = prev.findIndex(i => i.id === item.id);
      if (index >= 0) {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      }
      return [...prev, item];
    });
  };

  const handleDeleteItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const handleAddCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const handleAddInvoice = (invoice: any) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const handleAddRecurringPlan = (plan: any) => {
    setRecurringPlans(prev => [plan, ...prev]);
  };

  const handleAddCashLog = (log: CashLogEntry) => {
    setCashLogs(prev => [log, ...prev]);
  };

  const handleUpdateReservation = (updatedRes: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
  };

  const handleAddSchedule = (schedule: Schedule) => {
    setSchedules(prev => [...prev, schedule]);
  };

  const handleSyncSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
  };

  const handleAddEmployee = (emp: Employee) => {
    const linkedEmployee = {
      ...emp,
      businessId: currentUser?.businessId
    };
    setEmployeesState(prev => [...prev, linkedEmployee]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployeesState(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployeesState(prev => prev.filter(emp => emp.id !== id));
  };

  const handleAddBusiness = (biz: Business, owner: Partial<Employee>) => {
    const newBusiness = { ...biz, id: `B-${Date.now()}` };
    setBusinesses(prev => [...prev, newBusiness]);

    const newOwner: Employee = {
      id: `E-${Date.now()}`,
      name: owner.name || 'Admin',
      email: owner.email || '',
      passcode: owner.passcode || '1234',
      role: UserRole.BUSINESS_ADMIN,
      businessId: newBusiness.id,
      status: 'Active',
      hourlyRate: 0,
      hoursWorked: 0,
      deviceAccess: true
    };
    setEmployeesState(prev => [...prev, newOwner]);
  };

  const handleSwitchMerchant = (businessId: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, businessId });
    }
  };

  const handleStopImpersonating = () => {
    setIsImpersonating(false);
  };

  const handleSaveFloorPlan = (tables: DiningTable[]) => {
    setFloorPlanTables(tables);
  };

  const handleFireToKitchen = (ticket: KitchenTicket) => {
    setActiveTickets(prev => [...prev, ticket]);
  };

  const handleTicketStatusChange = (ticketId: string, status: KitchenTicket['status']) => {
    setActiveTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));

    if (status === 'Ready' || status === 'Delivered') {
      const ticket = activeTickets.find(t => t.id === ticketId);
      if (ticket && ticket.serverEmployeeId) {
        const notification: Notification = {
          id: `NOTIF-${Date.now()}`,
          type: 'OrderReady',
          message: `Order #${ticket.orderId.split('-')[1] || ticket.orderId} for ${ticket.table || 'Takeout'} is ${status}!`,
          targetEmployeeId: ticket.serverEmployeeId,
          timestamp: new Date().toISOString(),
          read: false
        };
        setServerNotifications(prev => [notification, ...prev]);
      }
    }
  };

  const handleDismissNotification = (id: string) => {
    setServerNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getMergedOrders = () => {
    const openTableOrders: DetailedOrder[] = floorPlanTables
      .filter(t => t.status === 'Occupied' && activeTableOrders[t.id])
      .map(t => {
        const orderData = activeTableOrders[t.id];
        const total = orderData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0) * (1 + taxConfig.rate / 100);
        return {
          id: t.orderId || `TEMP-${t.id}`,
          date: new Date().toLocaleDateString(),
          time: t.timeSeated ? new Date(t.timeSeated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          total: total,
          status: 'Open',
          paymentMethod: 'Card',
          employeeName: t.assignedToName || 'Server',
          device: 'Table Service',
          type: 'Dine-in',
          items: orderData.items
        } as DetailedOrder;
      });

    const openRegisterOrder: DetailedOrder[] = [];
    if (registerCart.length > 0 && currentRegisterOrderId) {
      const regTotal = registerCart.reduce((sum, i) => sum + (i.price * i.quantity), 0) * (1 + taxConfig.rate / 100);
      openRegisterOrder.push({
        id: currentRegisterOrderId,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total: regTotal,
        status: 'Open',
        paymentMethod: 'Card',
        employeeName: currentUser?.name || 'Cashier',
        device: 'Main Register',
        type: 'Dine-in',
        items: registerCart
      } as DetailedOrder);
    }

    return [...openRegisterOrder, ...openTableOrders, ...orders];
  };

  return {
    currentPath, currentUser, businesses, orders, transactions, customers,
    roles, setRoles, rolePermissions, setRolePermissions, matrixState, setMatrixState,
    employeesState, inventory, setInventory, categories, setCategories, modifierGroups, setModifierGroups,
    discounts, setDiscounts, reservations, schedules, cashLogs, invoices, recurringPlans,
    feedbacks, setFeedbacks, waitlist, setWaitlist, giftCards, setGiftCards,
    printerLabels, setPrinterLabels, feedbackSettings, setFeedbackSettings,
    activeTickets, serverNotifications, floorPlanTables, setFloorPlanTables,
    activeTableOrders, registerCart, setRegisterCart, currentRegisterOrderId,
    isImpersonating, kdsSettings, setKdsSettings, integrationConfig, setIntegrationConfig,
    receiptSettings, taxConfig, setTaxConfig, tipConfig, setTipConfig,
    removalReasons, setRemovalReasons, activeTab, setActiveTab,
    requestedPosApp, setRequestedPosApp, expandedMenu, setExpandedMenu,
    isSidebarOpen, setIsSidebarOpen, isProfileMenuOpen, setIsProfileMenuOpen,
    showRoleSwitcher, setShowRoleSwitcher, handleLogin, handleLogout, handleSwitchRole,
    handleProcessSale, handleUpdateTableOrder, handleUpdateTableStatus, handleSaveItem,
    handleDeleteItem, handleAddCustomer, handleUpdateCustomer, handleDeleteCustomer,
    handleAddInvoice, handleAddRecurringPlan, handleAddCashLog, handleUpdateReservation,
    handleAddSchedule, handleSyncSchedules, handleAddEmployee, handleUpdateEmployee,
    handleDeleteEmployee, handleAddBusiness, handleSwitchMerchant, handleStopImpersonating,
    handleSaveFloorPlan, handleFireToKitchen, handleTicketStatusChange,
    handleDismissNotification, getMergedOrders
  };
};
