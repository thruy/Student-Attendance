import { Table } from "react-bootstrap";
import { CheckCircle, XCircleFill } from 'react-bootstrap-icons';
import '../pages/timetable.css';

// bảng tổng hợp điểm danh: mỗi hàng một sinh viên, mỗi cột một ngày
function AttendanceTable({ students, attendanceDates, attendanceMap }) {
    return (
        <Table bordered hover responsive className="timetable-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Họ tên</th>
                    <th>MSSV</th>
                    {attendanceDates.map(date => (
                        <th key={date}>{date}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {students.map((student, index) => (
                    <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td className="text-center">{student.code}</td>
                        {attendanceDates.map(date => (
                            <td key={date} className="text-center">
                                {attendanceMap[date]?.recordMap?.[student.id] === "yes" && <CheckCircle size={20} color="royalblue" />}
                                {attendanceMap[date]?.recordMap?.[student.id] === "no" && <XCircleFill size={20} color="red" />}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default AttendanceTable;
