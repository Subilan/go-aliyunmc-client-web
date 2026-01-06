export type CommandExec = {
	id: string;
	type: 'backup_worlds' | 'archive_server';
	createdAt: string;
	updatedAt: string;
	status: 'success' | 'error' | 'created';
} & ({ by: null; auto: true } | { by: number; auto: false });
