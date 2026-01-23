export type User = {
	id: number;
	createdAt: string;
	username: string;
	role: UserRoleEmpty | UserRoleUser | UserRoleAdmin;
};

export type UserRoleEmpty = 0;
export type UserRoleUser = 1;
export type UserRoleAdmin = 2;

export const UserRoleEmpty = 0;
export const UserRoleUser = 1;
export const UserRoleAdmin = 2;
