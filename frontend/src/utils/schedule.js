export const DAY_ORDER = {
    'Thứ Hai': 1,
    'Thứ Ba': 2,
    'Thứ Tư': 3,
    'Thứ Năm': 4,
    'Thứ Sáu': 5,
    'Thứ Bảy': 6,
    'Chủ Nhật': 7
};

export const sortSchedulesByDay = (schedules) => {
    return [...schedules].sort(
        (a, b) => DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek]
    );
};

export const formatSchedule = (schedules, emptyText = 'Chưa cập nhật') => {
    if (!Array.isArray(schedules) || schedules.length === 0) return emptyText;
    return sortSchedulesByDay(schedules)
        .map(s => `${s.dayOfWeek}, ${s.startTime} – ${s.endTime}, phòng ${s.room}`)
        .join(' | ');
};
