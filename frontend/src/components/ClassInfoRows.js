import InfoRow from './InfoRow';
import { formatSchedule } from '../utils/schedule';

// thông tin chung của một lớp học, classInfo gồm cả teacher và students
function ClassInfoRows({ classInfo }) {
    return (
        <>
            <InfoRow label="Mã lớp học" value={classInfo?.classCode} />
            <InfoRow label="Loại lớp" value={classInfo?.type} />
            <InfoRow label="Học kỳ" value={classInfo?.semester} />
            <InfoRow label="Lịch học" value={formatSchedule(classInfo?.schedule)} />
            <InfoRow label="Giảng viên" value={classInfo?.teacher?.name} />
            <InfoRow label="Email giảng viên" value={classInfo?.teacher?.email} />
            <InfoRow label="Mã giảng viên" value={classInfo?.teacher?.code} />
            <InfoRow label="Số lượng sinh viên" value={classInfo?.students?.length} />
        </>
    );
}

export default ClassInfoRows;
