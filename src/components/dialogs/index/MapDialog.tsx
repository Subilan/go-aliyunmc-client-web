import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';

export default function MapDialog(props: DialogControl & { ip?: string | null }) {
	return (
		<Wrapper
			hideClose
			className="max-w-full! h-full"
			open={props.open}
			setOpen={props.setOpen}
			title="世界地图"
		>
			{props.ip === undefined && <p>暂无 IP 地址</p>}
			{props.ip && (
				<>
					<p className="hidden lg:inline">
						鼠标左键拖动调整方位，右键拖动调整视角。黑色部分为未探索区域。
					</p>
					<iframe className="h-[85dvh]" src={`http://${props.ip}:8100`}></iframe>
				</>
			)}
		</Wrapper>
	);
}
