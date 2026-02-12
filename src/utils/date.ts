import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = "Asia/Taipei";

/**
 * 格式化為台灣時區時間
 */
export const formatDisplayTime = (
  dateStr: string | null | undefined, 
  format = 'YYYY/MM/DD HH:mm:ss'
) => {
  if (!dateStr) return "-";
  return dayjs.utc(dateStr).tz(DEFAULT_TIMEZONE).format(format);
};

/**
 * 格式化為純日期 (YYYY/MM/DD)
 */
export const formatDisplayDate = (dateStr: string | null | undefined) => {
  return formatDisplayTime(dateStr, 'YYYY/MM/DD');
};
