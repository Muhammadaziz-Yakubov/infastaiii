import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/uz-latn';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';

// Day.js plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default locale
dayjs.locale('uz-latn');

export default dayjs;

