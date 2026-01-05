import type { DialogControl } from '@/components/dialogs/type';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ReactNode } from 'react';

export default function Wrapper(props: DialogControl & { title?: string; description?: string; children: ReactNode; hideClose?: boolean; actions?: ReactNode; className?: string }) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className={props.className}>
				<DialogHeader>
					{props.title && <DialogTitle>{props.title}</DialogTitle>}
					{props.description ? <DialogDescription>{props.description}</DialogDescription> : <DialogDescription className="hidden" aria-describedby={undefined}></DialogDescription>}
				</DialogHeader>
				<div className="flex flex-col gap-3">{props.children}</div>
				<DialogFooter>
					<DialogClose asChild>{!props.hideClose && <Button variant={'outline'}>关闭</Button>}</DialogClose>
					{props.actions}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
