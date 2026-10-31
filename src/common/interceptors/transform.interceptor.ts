import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Nettoie récursivement les données sensibles (ex: password hashes) avant sérialisation JSON
 */
function sanitizeSensitiveFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeSensitiveFields(item));
  }

  if (typeof obj === 'object') {
    // Ne pas altérer les objets Date ou Regex
    if (obj instanceof Date || obj instanceof RegExp) {
      return obj;
    }

    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase() === 'password') {
        continue; // Élimination totale du hash de mot de passe
      }
      cleaned[key] = sanitizeSensitiveFields(obj[key]);
    }
    return cleaned;
  }

  return obj;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: sanitizeSensitiveFields(data),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
