import DataBssCard from '@/routes/index-sections/components/DataBssCard';
import DataCmdCard from '@/routes/index-sections/components/DataCmdCard';
import DataTaskCard from '@/routes/index-sections/components/DataTaskCard';

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
