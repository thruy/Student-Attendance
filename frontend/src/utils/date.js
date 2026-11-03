// ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (khớp với backend)
export const todayInVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
