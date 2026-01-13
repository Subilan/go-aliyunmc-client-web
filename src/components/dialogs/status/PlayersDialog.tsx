import NoInstance from '@/components/dialogs/status/NoInstance';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import mchead from '@/lib/mchead';
import type { Instance } from '@/types/Instance';

export default function PlayersDialog({ players, instance, ...control }: DialogControl & { players: string[]; instance: Instance | undefined }) {
	return (
		<Wrapper {...control} title="玩家列表">
			{instance && instance.deletedAt === null ? (
				players.length ? (
					<div className="grid grid-cols-15">
						{players.map(name => {
							return (
								<Tooltip key={name}>
									<TooltipTrigger>
										<img draggable="false" src={mchead(name)} className="border-2 border-white" />
									</TooltipTrigger>
									<TooltipContent>{name}</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				) : (
					<Empty>
						<EmptyContent>
							<EmptyTitle>暂无玩家</EmptyTitle>
							<EmptyDescription>服务器空空如也</EmptyDescription>
						</EmptyContent>
					</Empty>
				)
			) : (
				<NoInstance />
			)}
		</Wrapper>
	);
}
