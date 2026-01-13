import DataListKv from '@/components/data-list-kv';
import NoInstance from '@/components/dialogs/status/NoInstance';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import times from '@/lib/times';
import type { Instance } from '@/types/Instance';

export default function InstanceInfoDialog({ instance, ...control }: DialogControl & { instance: Instance | undefined }) {
	return (
		<Wrapper {...control} title="实例配置">
			{instance && instance.deletedAt === null ? (
				<DataListKv
					data={{
						实例规格: instance.instanceType,
						'地域/可用区': instance.zoneId,
						'IPv4 地址': instance.ip ? { content: instance.ip, copy: true } : '--',
						创建于: times.formatDateAgo(instance.createdAt)
					}}
				/>
			) : (
				<NoInstance />
			)}
		</Wrapper>
	);
}
