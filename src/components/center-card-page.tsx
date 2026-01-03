import { Card, CardContent } from '@/components/ui/card';
import type { ReactNode } from 'react';

export default function CenterCardPage(props: { title?: string; children?: ReactNode }) {
	return (
		<div className="w-dvw h-dvh flex items-center justify-center">
			<Card className="max-w-85">
				<CardContent>
					<div className="flex flex-col gap-2">
						{props.title && <h1 className="text-xl">{props.title}</h1>}
						{props.children}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
