import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import mchead from '@/lib/mchead';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import type { OnlinePlayerHistoryItem } from '@/types/OnlinePlayerHistoryItem';
import * as echarts from 'echarts';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InfoIcon } from 'lucide-react';
import times from '@/lib/times';

type TimeRange = '1h' | '6h' | '1d' | '1w';

export default function PlayerOnlineHistoryCard() {
	const [loading, setLoading] = useState(false);
	const [timeRange, setTimeRange] = useState<TimeRange>('1h');
	const [historyData, setHistoryData] = useState<OnlinePlayerHistoryItem[]>([]);
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	const fetchHistory = useCallback(async (range: TimeRange) => {
		setLoading(true);
		const { data, error } = await req<OnlinePlayerHistoryItem[]>(
			`/server/online-player-history?time_range=${range}`,
			'get'
		);
		setLoading(false);
		if (error === null && data) {
			setHistoryData(data);
		} else {
			setHistoryData([]);
		}
	}, []);

	useEffect(() => {
		fetchHistory(timeRange);
	}, [timeRange, fetchHistory]);

	useEffect(() => {
		return () => {
			if (chartInstance.current) {
				chartInstance.current.dispose();
				chartInstance.current = null;
			}
		};
	}, []);

	useLayoutEffect(() => {
		if (!chartRef.current || historyData.length === 0) return;

		if (chartInstance.current) {
			chartInstance.current.dispose();
			chartInstance.current = null;
		}

		chartInstance.current = echarts.init(chartRef.current);

		const timeRangeMs: Record<TimeRange, number> = {
			'1h': 60 * 60 * 1000,
			'6h': 6 * 60 * 60 * 1000,
			'1d': 24 * 60 * 60 * 1000,
			'1w': 7 * 24 * 60 * 60 * 1000
		};

		const now = Date.now();
		const startTime = now - timeRangeMs[timeRange];
		const granularity = 5 * 1000;

		const dataMap = new Map<string, number>();
		historyData.forEach(item => {
			const timestamp = new Date(item.createdAt).getTime();
			const roundedTime = Math.floor(timestamp / granularity) * granularity;
			dataMap.set(roundedTime.toString(), item.playerCount);
		});

		const seriesData: [number, number][] = [];

		for (let t = startTime; t <= now; t += granularity) {
			const roundedTime = Math.floor(t / granularity) * granularity;

			if (dataMap.has(roundedTime.toString())) {
				seriesData.push([roundedTime, dataMap.get(roundedTime.toString())!]);
			} else {
				seriesData.push([roundedTime, 0]);
			}
		}

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'axis',
				formatter: params => {
					const [param] = params as any[];
					const [timestamp, count] = param.value;

					const item = historyData.find(d => {
						const itemTime = new Date(d.createdAt).getTime();
						const roundedItemTime = Math.floor(itemTime / granularity) * granularity;
						return roundedItemTime === timestamp;
					});

					const players = item?.players ?? [];
					const avatarsHtml =
						players.length > 0
							? `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 8px;">
								${players
									.map(
										(player: string) =>
											`<img src="${mchead(player, 25)}" alt="${player}" style="width: 20px; height: 20px;" />`
									)
									.join('')}
							</div>`
							: '';

					return `${times.formatDatetime(new Date(timestamp))}<br/>在线人数：${count}${avatarsHtml}`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'time'
			},
			yAxis: {
				type: 'value',
				name: '在线人数',
				min: 0,
				interval: 1
			},
			series: [
				{
					name: '在线人数',
					type: 'line',
					data: seriesData,
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 2
					},
					areaStyle: {
						opacity: 0.2
					}
				}
			]
		};

		chartInstance.current.setOption(option);
		chartInstance.current.resize();
	}, [historyData, timeRange]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					在线人数历史{' '}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant={'ghost'} size={'icon-xs'}>
								<InfoIcon />
							</Button>
						</PopoverTrigger>
						<PopoverContent>
							这些记录起始于 2026-03-02 17:16:10，在此之前无数据
						</PopoverContent>
					</Popover>
				</CardTitle>
				<CardDescription>近 7 日在线人数变化趋势</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					<div className="flex gap-2">
						{(['1h', '6h', '1d', '1w'] as TimeRange[]).map(range => (
							<Button
								key={range}
								onClick={() => setTimeRange(range)}
								variant={timeRange === range ? 'default' : 'outline'}
								size="sm"
							>
								{range === '1h' && '1 小时'}
								{range === '6h' && '6 小时'}
								{range === '1d' && '1 天'}
								{range === '1w' && '1 周'}
							</Button>
						))}
					</div>
					{loading && (
						<div className="flex justify-center items-center py-8">
							<div className="flex flex-col items-center gap-2">
								<Spinner />
								<span className="text-sm text-muted-foreground">图表加载中</span>
							</div>
						</div>
					)}
					{!loading &&
						(historyData.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">暂无数据</div>
						) : (
							<div ref={chartRef} className="w-full h-[300px]" />
						))}
				</div>
			</CardContent>
		</Card>
	);
}
