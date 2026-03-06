import { type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

interface OverviewMetricProps {
	title: string;
	children: ReactNode;
	popoverContent?: ReactNode;
}

export default function OverviewMetric({ title, children, popoverContent }: OverviewMetricProps) {
	return (
		<div className="flex flex-col gap-2">
			<span>{title}</span>
			<div className="text-2xl">
				{children}
				{popoverContent && (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="icon-xs">
								<InfoIcon />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-max">{popoverContent}</PopoverContent>
					</Popover>
				)}
			</div>
		</div>
	);
}
