import OptTooltip from '@/components/optional-tooltip';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { useMemo } from 'react';

export type ConditionAndMessage = { cond: boolean; message: string };

export default function OptDropdownMenuItem({ conditions, ...props }: { conditions: ConditionAndMessage[] } & { variant?: 'default' | 'destructive' } & React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
	const message = useMemo(() => {
		return conditions.find(x => x.cond)?.message;
	}, [conditions]);

	return (
		<OptTooltip show={message !== undefined} content={message || ''}>
			<DropdownMenuItem disabled={message !== undefined} {...props}></DropdownMenuItem>
		</OptTooltip>
	);
}
