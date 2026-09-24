import { Employee } from '../types';

export interface AuthResult {
  success: boolean;
  employee?: Employee;
  isLockedOut?: boolean;
  lockoutRemainingSeconds?: number;
  errorMessage?: string;
}

export class EmployeeAuthService {
  static async authenticateByPin(
    enteredPin: string,
    deviceId: string,
    employees: Employee[]
  ): Promise<AuthResult> {
    const emp = employees.find(
      (e) => (e.passcode && e.passcode === enteredPin) || e.id === enteredPin
    );
    if (emp && emp.status === 'Active') {
      return { success: true, employee: emp };
    }
    return { success: false, errorMessage: 'Invalid PIN entered.' };
  }
}
