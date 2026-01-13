import DataBssCard from '@/components/dialogs/index/DataBssCard';
import DataCmdCard from '@/components/dialogs/index/DataCmdCard';
import DataTaskCard from '@/components/dialogs/index/DataTaskCard';

export default function IndexDataSection() {
	return (
		<>
			<div className="flex flex-col gap-5">
				<section>
					<DataBssCard />
				</section>
				<section>
					<DataTaskCard />
				</section>
				<section>
					<DataCmdCard />
				</section>
			</div>
		</>
	);
}
