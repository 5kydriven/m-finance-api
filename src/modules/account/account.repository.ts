import { and, desc, eq, lt, or } from 'drizzle-orm';
import { InternalError } from '@/core/errors';
import type { Database } from '@/db/client';
import {
	financialAccounts,
	type FinancialAccountRow,
	type NewFinancialAccountRow,
} from '@/db/schema/financial-accounts';
import type { CursorParams } from '@/core/pagination/types';
import type { UpdateAccountInput } from './account.schema';

export function makeAccountRepository(db: Database) {
	return {
		async create(data: NewFinancialAccountRow) {
			const [created] = await db
				.insert(financialAccounts)
				.values(data)
				.returning();
			if (!created) {
				throw new InternalError('Financial account was not returned after insert');
			}
			return created;
		},

		async findByIdForUser(id: string, userId: string) {
			return await db.query.financialAccounts.findFirst({
				where: (accounts, { and, eq }) =>
					and(eq(accounts.id, id), eq(accounts.userId, userId)),
			});
		},

		async updateForUser(id: string, userId: string, data: UpdateAccountInput) {
			const [updated] = await db
				.update(financialAccounts)
				.set(data)
				.where(
					and(eq(financialAccounts.id, id), eq(financialAccounts.userId, userId)),
				)
				.returning();

			return updated ?? null;
		},

		async paginateForUser(
			userId: string,
			p: CursorParams,
		): Promise<FinancialAccountRow[]> {
			const conditions = [eq(financialAccounts.userId, userId)];
			if (p.cursor) {
				conditions.push(
					or(
						lt(financialAccounts.createdAt, p.cursor.createdAt),
						and(
							eq(financialAccounts.createdAt, p.cursor.createdAt),
							lt(financialAccounts.id, p.cursor.id),
						),
					)!,
				);
			}

			return db
				.select()
				.from(financialAccounts)
				.where(and(...conditions))
				.orderBy(desc(financialAccounts.createdAt), desc(financialAccounts.id))
				.limit(p.limit + 1);
		},
	};
}

export type AccountRepository = ReturnType<typeof makeAccountRepository>;
