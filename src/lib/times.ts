import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'

export function getExtendedDayjs(datetime: string | Date) {
	dayjs.extend(relativeTime);
    dayjs.locale('zh-cn')
	return dayjs(datetime);
}

export function formatDatetime(datetime: string | Date, format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(datetime).format(format);
}

export function formatDateAgo(datetime: string | Date) {
    return getExtendedDayjs(datetime).fromNow();
}

export default {
    getExtendedDayjs,
    formatDateAgo,
    formatDatetime
}