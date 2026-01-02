import { Module, DynamicModule, Global } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RBAC_OPTIONS } from './constants/rbac.constants';
import { DEFAULT_RBAC_CONFIG } from './config/rbac.config';
import {
  RbacModuleOptions,
  RbacModuleAsyncOptions,
} from './interfaces/rbac.interface';

@Global()
@Module({})
export class RbacModule {
  /**
   * Register RBAC module with static configuration
   * @example
   * RbacModule.forRoot({
   *   roles: [
   *     { name: 'USER', permissions: ['profile:read'] },
   *     { name: 'ADMIN', inherits: ['USER'], permissions: ['users:write'] },
   *   ],
   * })
   */
  static forRoot(options?: Partial<RbacModuleOptions>): DynamicModule {
    const mergedOptions = { ...DEFAULT_RBAC_CONFIG, ...options };

    return {
      module: RbacModule,
      providers: [
        {
          provide: RBAC_OPTIONS,
          useValue: mergedOptions,
        },
        RbacService,
      ],
      exports: [RbacService, RBAC_OPTIONS],
    };
  }

  /**
   * Register RBAC module with async configuration
   * @example
   * RbacModule.forRootAsync({
   *   imports: [ConfigModule],
   *   useFactory: (configService: ConfigService) => ({
   *     roles: configService.get('rbac.roles'),
   *   }),
   *   inject: [ConfigService],
   * })
   */
  static forRootAsync(options: RbacModuleAsyncOptions): DynamicModule {
    return {
      module: RbacModule,
      imports: options.imports || [],
      providers: [
        {
          provide: RBAC_OPTIONS,
          useFactory: async (...args: unknown[]) => {
            const userOptions = await options.useFactory(...args);
            return { ...DEFAULT_RBAC_CONFIG, ...userOptions };
          },
          inject: options.inject || [],
        },
        RbacService,
      ],
      exports: [RbacService, RBAC_OPTIONS],
    };
  }
}
