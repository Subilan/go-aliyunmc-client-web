import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export default function OptTooltip(props: { show: boolean; content: string; children?: ReactNode }) {
	if (props.show) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div tabIndex={0}>{props.children}</div>
				</TooltipTrigger>
				<TooltipContent>{props.content}</TooltipContent>
			</Tooltip>
		);
	} else {
		return props.children;
	}
}
