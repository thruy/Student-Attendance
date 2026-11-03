import { useCallback, useEffect, useMemo, useState } from "react";

export const toDateKey = (date) => new Date(date).toISOString().split("T")[0];

// chuyển danh sách phiên điểm danh thành { dates đã sắp xếp, map[date].recordMap[studentId] = status }
const buildAttendanceMap = (attendances) => {
    const map = {};
    const dates = [];
    attendances.forEach(a => {
        const dateKey = toDateKey(a.date);
        dates.push(dateKey);

        const recordMap = {};
        a.records.forEach(r => {
            recordMap[r.studentId] = r.status;
        });
        map[dateKey] = { recordMap };
    });
    dates.sort((a, b) => new Date(a) - new Date(b));
    return { dates, map };
};

// tải thông tin lớp + các phiên điểm danh, fetchData phải ổn định (bọc bằng useCallback)
export function useClassAttendance(fetchData) {
    const [data, setData] = useState({ classInfo: null, attendances: [], qrSession: null });
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        const res = await fetchData();
        setData({ classInfo: res.class, attendances: res.attendances, qrSession: res.qrSession || null });
    }, [fetchData]);

    useEffect(() => {
        loadData()
            .catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err))
            .finally(() => setLoading(false));
    }, [loadData]);

    const { dates, map } = useMemo(() => buildAttendanceMap(data.attendances), [data.attendances]);

    return {
        classInfo: data.classInfo,
        students: data.classInfo?.students || [],
        attendances: data.attendances,
        qrSession: data.qrSession,
        attendanceDates: dates,
        attendanceMap: map,
        loading,
        loadData
    };
}
