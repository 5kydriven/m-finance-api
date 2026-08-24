import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const financialAccountType = pgEnum('financial_account_type', [
	'bank',
	'credit_card',
	'e_wallet',
	'cash',
	'investment',
	'other',
]);

export const financialAccountStatus = pgEnum('financial_account_status', [
	'active',
	'archived',
]);

export const financialAccounts = pgTable(
	'financial_accounts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		type: financialAccountType('type').notNull(),
		currency: text('currency').notNull(),
		institutionName: text('institution_name'),
		mask: text('mask'),
		status: financialAccountStatus('status').notNull().default('active'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		index('financial_accounts_user_status_idx').on(t.userId, t.status),
		index('financial_accounts_cursor_idx').on(t.userId, t.createdAt, t.id),
	],
);

export type FinancialAccountRow = typeof financialAccounts.$inferSelect;
export type NewFinancialAccountRow = typeof financialAccounts.$inferInsert;
