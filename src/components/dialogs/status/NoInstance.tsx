import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

export default function NoInstance() {
	return (
		<Empty>
			<EmptyContent>
				<EmptyTitle>暂无实例</EmptyTitle>
				<EmptyDescription>暂时没有信息可以显示</EmptyDescription>
			</EmptyContent>
		</Empty>
	);
}
