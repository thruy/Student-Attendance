const collator = new Intl.Collator('vi');

// "Nguyễn Văn An" -> { given: 'An', family: 'Nguyễn Văn' }
const splitName = (name = '') => {
    const parts = name.trim().split(/\s+/);
    const given = parts.pop() || '';
    return { given, family: parts.join(' ') };
};

// thứ tự abc kiểu Việt Nam: tên -> họ đệm -> MSSV
export const compareVietnameseName = (a, b) => {
    const x = splitName(a.name);
    const y = splitName(b.name);
    return collator.compare(x.given, y.given)
        || collator.compare(x.family, y.family)
        || String(a.code).localeCompare(String(b.code));
};

// chia đều sinh viên: số phòng = ceil(n / maxPerRoom), các phòng chênh nhau tối đa 1 sinh viên
// trả về mảng các nhóm id sinh viên
export const splitIntoRooms = (students, maxPerRoom) => {
    const sorted = [...students].sort(compareVietnameseName);
    const n = sorted.length;
    if (n === 0) return [];

    const roomCount = Math.ceil(n / maxPerRoom);
    const base = Math.floor(n / roomCount);
    const extra = n % roomCount;

    const groups = [];
    let start = 0;
    for (let i = 0; i < roomCount; i++) {
        const size = base + (i < extra ? 1 : 0);
        groups.push(sorted.slice(start, start + size).map(s => s.id));
        start += size;
    }
    return groups;
};

export const defaultExamCode = (classCode, index) => `${classCode}-${String(index + 1).padStart(2, '0')}`;

const pad = (n) => String(n).padStart(2, '0');

// ISO -> giá trị cho <input type="datetime-local"> theo giờ máy người dùng
export const toDateTimeLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// giá trị datetime-local -> ISO gửi lên backend, để trống thì backend báo lỗi
export const fromDateTimeLocal = (value) => (value ? new Date(value).toISOString() : '');

export const formatDateTime = (iso) => new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
});

export const formatTime = (iso) => new Date(iso).toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit'
});

// lỗi trả về từ backend: { message } hoặc { errors: [{ field: 'rooms[0].room', message }] }
export const formatExamErrors = (data) => {
    if (data?.errors) {
        return data.errors.map(e => {
            const match = /^rooms\[(\d+)\]/.exec(e.field || '');
            return match ? `Lớp thi ${Number(match[1]) + 1}: ${e.message}` : e.message;
        });
    }
    return [data?.message || 'Lỗi khi lưu danh sách lớp thi'];
};
