const scenarios = [
  'restaurant-server', 'restaurant-kitchen-kds', 'restaurant-manager',
  'retail-cashier', 'retail-stock-employee', 'nonprofit-fundraising-staff',
  'donation-kiosk', 'offline-order', 'restart-recovery', 'split-payment',
  'refund', 'printer-offline', 'kds-disconnect', 'permission-revoke', 'device-revoke',
];
console.log(`[E2E Matrix] ${scenarios.length} scenarios registered.`);
scenarios.forEach((scenario, index) => console.log(`${index + 1}. ${scenario}`));
