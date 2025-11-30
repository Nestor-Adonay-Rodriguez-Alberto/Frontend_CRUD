export interface ApiEnvelope<T> {
  status?: boolean;
  Status?: boolean;
  message?: string;
  Message?: string;
  data?: T | null;
  Data?: T | null;
}

export interface PaginatedApiEnvelope<T> extends ApiEnvelope<T> {
  count?: number;
  Count?: number;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  count: number;
}

export const mapApiResponse = <T>(payload: ApiEnvelope<T>): ApiResponse<T> => ({
  status: coerceBoolean(payload.status, payload.Status),
  message: payload.message ?? payload.Message ?? '',
  data: (payload.data ?? payload.Data ?? null) as T | null
});

export const mapPaginatedResponse = <T>(payload: PaginatedApiEnvelope<T>): PaginatedResponse<T> => ({
  ...mapApiResponse(payload),
  count: payload.count ?? payload.Count ?? 0
});

function coerceBoolean(primary?: boolean, secondary?: boolean): boolean {
  if (typeof primary === 'boolean') {
    return primary;
  }

  if (typeof secondary === 'boolean') {
    return secondary;
  }

  return false;
}
