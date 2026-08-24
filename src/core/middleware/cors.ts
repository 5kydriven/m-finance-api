import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import { InternalError } from '@/core/errors';
import type { AppEnv } from '@/core/types';

export function corsMiddleware(): MiddlewareHandler<AppEnv> {
	return async (c, next) => {
		// Origins come from env, which comes from the container.
		// But container middleware runs AFTER cors — so parse directly.
		const rawOrigins = c.env.CORS_ORIGINS;
		if (typeof rawOrigins !== 'string') {
			throw new InternalError('CORS_ORIGINS is not configured');
		}
		const allowed = rawOrigins.split(',').map((s) => s.trim());
		return cors({
			origin: (origin) => (allowed.includes(origin) ? origin : null),
			allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
			allowHeaders: [
				'Content-Type',
				'Authorization',
				'X-Request-Id',
				'Idempotency-Key',
			],
			exposeHeaders: [
				'X-Request-Id',
				'X-RateLimit-Limit',
				'X-RateLimit-Remaining',
				'X-RateLimit-Reset',
				'Link',
			],
			credentials: true,
			maxAge: 86400,
		})(c, next);
	};
}
