import { PlatformUser } from '../types';
import { DeviceIdentityService } from './deviceIdentityService';
import { MOCK_PLATFORM_USERS } from '../constants';

export class PlatformAuthService {
  static loginDemoSuperAdmin(): PlatformUser {
    if (!DeviceIdentityService.isDevOrDemoMode()) {
      throw new Error('Platform demo authentication is disabled outside development mode.');
    }
    return { ...MOCK_PLATFORM_USERS[0] };
  }
}