import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckIcon, CopyIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function DataListKv(props: { data: Record<string, boolean | number | string | { content?: string; detail?: string; render?: ReactNode; copy?: boolean }>; grid?: boolean; border?: boolean; className?: string }) {
	return (
		<div className={cn('gap-4', props.grid ? 'grid grid-cols-2' : 'flex flex-col', props.border ? 'border border-neutral-200 p-3 rounded-lg' : '', props.className)}>
			{Object.entries(props.data).map(([k, v]) => (
				<div className="flex items-center gap-2" key={k}>
					<div className="w-25 text-neutral-500">{k}</div>
					{typeof v === 'boolean' && (v ? <CheckIcon size={14} /> : <XIcon size={14} />)}
					{(typeof v === 'string' || typeof v === 'number') && <div>{v}</div>}
					{typeof v === 'object' &&
						(() => {
							const child = (
								<div className="flex gap-2 items-center">
									{v.content}
									{v.copy && (
										<Button size={'icon-xs'} variant={'outline'}>
											<CopyIcon />
										</Button>
									)}
									{v.render}
								</div>
							);

							return v.detail ? (
								<Tooltip>
									<TooltipTrigger asChild>{child}</TooltipTrigger>
									<TooltipContent>
										<p>{v.detail}</p>
									</TooltipContent>
								</Tooltip>
							) : (
								child
							);
						})()}
				</div>
			))}
		</div>
	);
}
