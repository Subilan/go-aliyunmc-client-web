import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/zh-cn'

export type DateLike = string | Date;

export function getExtendedDayjs() {
	dayjs.extend(relativeTime);
    dayjs.extend(duration);
    dayjs.locale('zh-cn')
	return dayjs;
}

const extendedDayjs = getExtendedDayjs();

export function formatDatetime(datetime: DateLike, format = 'YYYY-MM-DD HH:mm:ss') {
    return extendedDayjs(datetime).format(format);
}

export function formatDateAgo(datetime: DateLike) {
    return extendedDayjs(datetime).fromNow();
}

export function formatDuration(d1: DateLike, d2: DateLike) {
    return extendedDayjs.duration(extendedDayjs(d1).diff(d2));
}

export default {
    getExtendedDayjs,
    formatDateAgo,
    formatDatetime,
    formatDuration
}