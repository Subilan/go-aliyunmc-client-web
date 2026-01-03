import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CopyIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function DataListKv(props: { data: Record<string, string | { content: string; detail?: string; render?: ReactNode; copy?: boolean }>; grid?: boolean }) {
	return (
		<div className={cn('gap-4', props.grid ? 'grid grid-cols-2' : 'flex flex-col')}>
			{Object.entries(props.data).map(([k, v]) => (
				<div className="flex items-center gap-2" key={k}>
					<div className="w-25 text-neutral-500">{k}</div>
					{typeof v === 'string' && <div>{v}</div>}
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
