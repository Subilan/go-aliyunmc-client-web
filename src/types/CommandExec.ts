export type CommandExec = {
	id: string;
	type: 'backup_worlds' | 'archive_server' | 'start_server' | 'stop_server';
	createdAt: string;
	updatedAt: string;
	status: 'success' | 'error' | 'created';
	comment: string | null;
	by: number | null;
	auto: boolean;
};

export const CommandExecTypeWord: Record<CommandExec['type'], string> = {
	archive_server: '归档服务器',
	backup_worlds: '备份世界',
	start_server: '开启服务器',
	stop_server: '关闭服务器'
};

export const CommandExecStatusWord: Record<CommandExec['status'], string> = {
	created: '已创建',
	error: '失败',
	success: '成功'
};

export const CommandExecStatusColor: Record<CommandExec['status'], string> = {
	created: 'bg-gray-200 text-gray-700',
	error: 'bg-red-200 text-red-700',
	success: 'bg-green-200 text-green-700'
};

export type JoinedCommandExec = CommandExec & {
	username: string | null;
};

export type CommandExecOverview = {
	successCount: number;
	errorCount: number;
	latestCommandExec?: JoinedCommandExec;
};
