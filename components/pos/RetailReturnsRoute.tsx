import React from 'react';
import { Employee } from '../../types';
import { RetailReturnsModal } from './RetailReturnsModal';

export const RetailReturnsRoute: React.FC<{ currentUser: Employee; onExit: () => void }> = ({ currentUser, onExit }) => (
  <RetailReturnsModal isOpen currentUser={currentUser} onClose={onExit} />
);
