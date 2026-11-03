import { Modal, Table } from 'react-bootstrap';
import '../pages/timetable.css';
import ClassInfoRows from './ClassInfoRows';

function ClassInfoModal({ show, handleClose, selectedClass }) {
    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Thông tin chi tiết lớp học</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedClass && (
                    <>
                        <h4>{selectedClass.subjectCode} - {selectedClass.name}</h4>
                        <ClassInfoRows classInfo={selectedClass} />
                        <h5 className="mt-4">Danh sách sinh viên</h5>
                        <Table bordered hover responsive className="timetable-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã số sinh viên</th>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedClass.students.map((student, index) => (
                                    <tr key={index}>
                                        <td className="text-center fw-bold">{index + 1}</td>
                                        <td className='text-center'>{student.code}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>
        </Modal>
    )
}

export default ClassInfoModal;