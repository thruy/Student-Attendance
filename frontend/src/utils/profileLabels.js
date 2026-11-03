// nhãn các trường thông tin cá nhân khác nhau theo role
const TEACHER_LABELS = {
    title: 'giảng viên',
    code: 'Mã số giảng viên',
    school: 'Viện/Trường',
    branch: 'Khoa',
    trainingSystem: 'Học vị'
};

const PROFILE_LABELS = {
    student: {
        title: 'sinh viên',
        code: 'Mã số sinh viên',
        school: 'Khoa/Viện',
        branch: 'Ngành học',
        trainingSystem: 'Hệ đào tạo'
    },
    teacher: TEACHER_LABELS,
    admin: { ...TEACHER_LABELS, title: 'quản trị viên', code: 'Mã số cán bộ' }
};

export const getProfileLabels = (role) => PROFILE_LABELS[role] || TEACHER_LABELS;
