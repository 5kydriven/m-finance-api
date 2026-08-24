import { NotFoundError } from '@/core/errors';
import { decodeCursor, toCursorMeta } from '@/core/pagination/helper';
import type { CursorPaginated } from '@/core/pagination/types';
import type { CursorQuery } from '@/core/pagination/schema';
import type { Principal } from '@/auth/principal';
import type { AccountRepository } from './account.repository';
import {
	type CreateAccountInput,
	type FinancialAccount,
	toPublicAccount,
	type UpdateAccountInput,
} from './account.schema';

export interface AccountServiceDep {
	accountRepo: AccountRepository;
}

export function makeAccountService(deps: AccountServiceDep) {
	const { accountRepo } = deps;

	return {
		async createAccount(
			principal: Principal,
			input: CreateAccountInput,
		): Promise<FinancialAccount> {
			const created = await accountRepo.create({
				...input,
				userId: principal.id,
			});
			return toPublicAccount(created);
		},

		async listAccounts(
			principal: Principal,
			q: CursorQuery,
		): Promise<CursorPaginated<FinancialAccount>> {
			const rows = await accountRepo.paginateForUser(principal.id, {
				limit: q.limit,
				cursor: q.cursor ? decodeCursor(q.cursor) : null,
			});
			const hasMore = rows.length > q.limit;
			const page = hasMore ? rows.slice(0, q.limit) : rows;

			return {
				data: page.map(toPublicAccount),
				meta: toCursorMeta(page, hasMore),
			};
		},

		async getAccount(
			principal: Principal,
			id: string,
		): Promise<FinancialAccount> {
			const account = await accountRepo.findByIdForUser(id, principal.id);
			if (!account) throw new NotFoundError('Financial account', id);
			return toPublicAccount(account);
		},

		async updateAccount(
			principal: Principal,
			id: string,
			input: UpdateAccountInput,
		): Promise<FinancialAccount> {
			const updated = await accountRepo.updateForUser(id, principal.id, input);
			if (!updated) throw new NotFoundError('Financial account', id);
			return toPublicAccount(updated);
		},
	};
}

export type AccountService = ReturnType<typeof makeAccountService>;
