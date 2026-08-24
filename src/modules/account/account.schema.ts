import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import {
	financialAccounts,
	type FinancialAccountRow,
} from '@/db/schema/financial-accounts';

const CurrencySchema = z
	.string()
	.length(3)
	.transform((value) => value.toUpperCase())
	.openapi({ example: 'PHP' });

const FinancialAccountWire = createSelectSchema(financialAccounts).extend({
	createdAt: z.coerce.date().transform((d) => d.toISOString()),
	updatedAt: z.coerce.date().transform((d) => d.toISOString()),
});

const accountExample = {
	id: '3c6cf9a7-9c54-4d17-9118-7c6a2f9788f5',
	userId: 'b3c1f0a2-6d4e-4a19-9f27-5c8e0d1a7b34',
	name: 'BPI Savings',
	type: 'bank',
	currency: 'PHP',
	institutionName: 'BPI',
	mask: '1234',
	status: 'active',
	createdAt: '2026-08-24T04:00:00.000Z',
	updatedAt: '2026-08-24T04:00:00.000Z',
} satisfies z.infer<typeof FinancialAccountWire>;

export const FinancialAccountSchema = FinancialAccountWire.openapi(
	'FinancialAccount',
	{ example: accountExample },
);

export const CreateAccountSchema = createInsertSchema(financialAccounts, {
	name: (s) => s.min(1).max(120),
	currency: () => CurrencySchema,
	institutionName: (s) => s.min(1).max(120).optional().nullable(),
	mask: (s) => s.min(1).max(32).optional().nullable(),
})
	.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
	.openapi('CreateFinancialAccount');

export const UpdateAccountSchema = CreateAccountSchema.partial()
	.refine((o) => Object.keys(o).length > 0, {
		error: 'At least one field must be provided',
	})
	.openapi('UpdateFinancialAccount');

export const AccountIdParamSchema = z.object({
	id: z.uuid().openapi({
		param: { name: 'id', in: 'path' },
		example: '3c6cf9a7-9c54-4d17-9118-7c6a2f9788f5',
	}),
});

export type FinancialAccount = z.infer<typeof FinancialAccountSchema>;
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

export const toPublicAccount = (
	row: FinancialAccountRow,
): FinancialAccount => FinancialAccountSchema.parse(row);
