import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { Principal } from '@/auth/principal';
import type { AppEnv } from '@/core/types';
import { createApp } from '@/core/http/openapi';
import { requireAuth } from '@/core/middleware/auth';
import { UnauthorizedError } from '@/core/errors';
import { errs } from '@/core/http/responses';
import {
	CursorQuerySchema,
	cursorPaginated,
} from '@/core/pagination/schema';
import { buildLinkHeader } from '@/core/pagination/link-header';
import {
	AccountIdParamSchema,
	CreateAccountSchema,
	FinancialAccountSchema,
	UpdateAccountSchema,
} from './account.schema';

export const accountRoutes = createApp();

const principal = (c: Context<AppEnv>): Principal => {
	const value = c.get('principal');
	if (!value) throw new UnauthorizedError();
	return value;
};

const listRoute = createRoute({
	method: 'get',
	path: '/accounts',
	tags: ['Accounts'],
	summary: 'List financial accounts',
	security: [{ bearerAuth: [] }],
	middleware: [requireAuth] as const,
	request: { query: CursorQuerySchema },
	responses: {
		200: {
			content: {
				'application/json': {
					schema: cursorPaginated(
						FinancialAccountSchema,
						'FinancialAccountCursorPage',
					),
				},
			},
			description: 'A cursor page of financial accounts.',
			headers: z.object({
				Link: z
					.string()
					.optional()
					.openapi({ description: 'RFC 8288 navigation.' }),
			}),
		},
		...errs(401, 422, 429),
	},
});

accountRoutes.openapi(listRoute, async (c) => {
	const { services } = c.get('container');
	const result = await services.account.listAccounts(
		principal(c),
		c.req.valid('query'),
	);
	const link = buildLinkHeader(new URL(c.req.url), result.meta);
	if (link) c.header('Link', link);
	return c.json(result, 200);
});

const createAccountRoute = createRoute({
	method: 'post',
	path: '/accounts',
	tags: ['Accounts'],
	summary: 'Create a financial account',
	security: [{ bearerAuth: [] }],
	middleware: [requireAuth] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: CreateAccountSchema,
				},
			},
			required: true,
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: FinancialAccountSchema,
				},
			},
			description: 'Created financial account.',
		},
		...errs(401, 422, 429),
	},
});

accountRoutes.openapi(createAccountRoute, async (c) => {
	const { services } = c.get('container');
	return c.json(
		await services.account.createAccount(
			principal(c),
			c.req.valid('json'),
		),
		201,
	);
});

const getAccountRoute = createRoute({
	method: 'get',
	path: '/accounts/{id}',
	tags: ['Accounts'],
	summary: 'Get a financial account',
	security: [{ bearerAuth: [] }],
	middleware: [requireAuth] as const,
	request: { params: AccountIdParamSchema },
	responses: {
		200: {
			content: {
				'application/json': {
					schema: FinancialAccountSchema,
				},
			},
			description: 'Financial account.',
		},
		...errs(401, 404, 422, 429),
	},
});

accountRoutes.openapi(getAccountRoute, async (c) => {
	const { services } = c.get('container');
	return c.json(
		await services.account.getAccount(
			principal(c),
			c.req.valid('param').id,
		),
		200,
	);
});

const updateAccountRoute = createRoute({
	method: 'patch',
	path: '/accounts/{id}',
	tags: ['Accounts'],
	summary: 'Update a financial account',
	security: [{ bearerAuth: [] }],
	middleware: [requireAuth] as const,
	request: {
		params: AccountIdParamSchema,
		body: {
			content: {
				'application/json': {
					schema: UpdateAccountSchema,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: FinancialAccountSchema,
				},
			},
			description: 'Updated financial account.',
		},
		...errs(401, 404, 422, 429),
	},
});

accountRoutes.openapi(updateAccountRoute, async (c) => {
	const { services } = c.get('container');
	return c.json(
		await services.account.updateAccount(
			principal(c),
			c.req.valid('param').id,
			c.req.valid('json'),
		),
		200,
	);
});
