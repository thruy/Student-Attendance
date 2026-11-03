import InfoRow from './InfoRow';
import { getProfileLabels } from '../utils/profileLabels';

export const formatName = (name) => name?.toLowerCase().split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN");
};

// danh sách thông tin cá nhân, role: 'student' | 'teacher' | 'admin'
function ProfileInfo({ role, profile }) {
    const labels = getProfileLabels(role);
    const isStudent = role === 'student';

    return (
        <>
            <InfoRow label="Họ và tên:" value={formatName(profile?.name)} />
            <InfoRow label="Email:" value={profile?.email} />
            <InfoRow label={`${labels.code}:`} value={profile?.code} />
            <InfoRow label="Ngày sinh:" value={formatDate(profile?.dob)} />
            <InfoRow label="Giới tính:" value={profile?.gender} />
            <InfoRow label="Dân tộc:" value={profile?.ethnic} />
            <InfoRow label="Đại học:" value={profile?.university} />
            <InfoRow label={`${labels.school}:`} value={profile?.school} />
            <InfoRow label={`${labels.branch}:`} value={profile?.branch} />
            {isStudent && <InfoRow label="Lớp:" value={profile?.className} />}
            {isStudent && <InfoRow label="Khóa:" value={profile?.schoolYear} />}
            <InfoRow label={`${labels.trainingSystem}:`} value={profile?.trainingSystem} />
            <InfoRow label="Quê quán:" value={profile?.hometown} />
            <InfoRow label="Số căn cước công dân:" value={profile?.identificationNumber} />
            <InfoRow label="Số điện thoại:" value={profile?.phone} />
        </>
    );
}

export default ProfileInfo;
