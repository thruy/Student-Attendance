const User = require('../models/Users');
const Classes = require('../models/Classes');
const Attendances = require('../models/Attendances');
const Projects = require('../models/Project');
const bcrypt = require('bcryptjs');
const DEFAULT_PASSWORD = '123456';
// students
const getAllStudents = async (req, res) => {
    try {
        let { page = 1, limit = 8, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { role: 'student' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const students = await User.find(query)
            .select('name code email')
            .sort({ code: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            students,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const getStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findOne({ _id: id, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        res.status(201).json({ student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const createStudent = async (req, res) => {
    try {
        const { name, code, email, dob, gender, } = req.body;
        // check bắt buộc
        if (!name || !code || !email) {
            return res.status(400).json({ message: 'Thiếu thông tin tên/code/email' });
        }

        const existed = await User.findOne({ $or: [{ code }, { email }] });
        if (existed) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }

        // tạo mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // tính khóa học
        let schoolYear = null;
        const year = parseInt(code.substring(2, 4), 10);
        if (!isNaN(year)) {
            schoolYear = year + 45;
        }

        const student = await User.create({
            name, code, email, password: hashedPassword, role: 'student', dob, gender, schoolYear
        });

        res.status(201).json({
            message: 'Thêm sinh viên thành công',
            student: {
                id: student._id,
                name: student.name,
                code: student.code,
                email: student.email
            }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, email, dob, gender, ethnic, school, branch, className, trainingSystem, hometown, identificationNumber, phone } = req.body;
        const student = await User.findOne({ _id: id, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        if (name !== undefined) student.name = name;
        if (code !== undefined) student.code = code;
        if (email !== undefined) student.email = email;
        if (dob !== undefined) student.dob = dob;
        if (gender !== undefined) student.gender = gender;
        if (ethnic !== undefined) student.ethnic = ethnic;
        if (school !== undefined) student.school = school;
        if (branch !== undefined) student.branch = branch;
        if (className !== undefined) student.className = className;
        if (trainingSystem !== undefined) student.trainingSystem = trainingSystem;
        if (hometown !== undefined) student.hometown = hometown;
        if (identificationNumber !== undefined) student.identificationNumber = identificationNumber;
        if (phone !== undefined) student.phone = phone;
        const year = parseInt(code.substring(2, 4), 10);
        student.schoolYear = year + 45;
        await student.save();
        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            student: {
                _id: student._id,
                name: student.name,
                code: student.code,
                email: student.email,
                dob: student.dob,
                gender: student.gender,
                ethnic: student.ethnic,
                school: student.school,
                branch: student.branch,
                className: student.className,
                trainingSystem: student.trainingSystem,
                hometown: student.hometown,
                identificationNumber: student.identificationNumber,
                phone: student.phone
            }
        });

    } catch (error) {
        console.error(error);
        // trùng MSSV/email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
        await user.save();
        res.status(200).json({ message: 'Đã reset mật khẩu về mặc định.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteStudent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const student = await User.findOne({ _id: id, role: 'student' }, null, { session });
        if (!student) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }

        const classResult = await Classes.updateMany({ students: id }, { $pull: { students: id } }, { session });
        const attendanceResult = await Attendances.updateMany(
            { 'records.studentId': id },
            { $pull: { records: { studentId: id } } },
            { session }
        );

        const projectResult = await Projects.updateMany(
            { 'members.studentId': id },
            { $pull: { members: { studentId: id } } },
            { session }
        );

        await student.deleteOne({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Đã xóa sinh viên và gỡ khỏi lớp học, đồ án, điểm danh' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

//teacher
const getAllTeachers = async (req, res) => {
    try {
        let { page = 1, limit = 8, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { role: 'teacher' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const teachers = await User.find(query)
            .select('name code email')
            .sort({ code: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            teachers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const getTeacherDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await User.findOne({ _id: id, role: 'teacher' });
        if (!teacher) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }
        res.status(201).json({ teacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const createTeacher = async (req, res) => {
    try {
        const { name, code, email, dob, gender, } = req.body;
        // check bắt buộc
        if (!name || !code || !email) {
            return res.status(400).json({ message: 'Thiếu thông tin tên/code/email' });
        }

        const existed = await User.findOne({ $or: [{ code }, { email }] });
        if (existed) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }

        // tạo mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // tính khóa học
        let schoolYear = null;
        const year = parseInt(code.substring(2, 4), 10);
        if (!isNaN(year)) {
            schoolYear = year + 45;
        }

        const teacher = await User.create({
            name, code, email, password: hashedPassword, role: 'teacher', dob, gender, schoolYear
        });

        res.status(201).json({
            message: 'Thêm sinh viên thành công',
            teacher: {
                id: teacher._id,
                name: teacher.name,
                code: teacher.code,
                email: teacher.email
            }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, email, dob, gender, ethnic, school, branch, trainingSystem, hometown, identificationNumber, phone } = req.body;
        const teacher = await User.findOne({ _id: id, role: 'teacher' });
        if (!teacher) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }
        if (name !== undefined) teacher.name = name;
        if (code !== undefined) teacher.code = code;
        if (email !== undefined) teacher.email = email;
        if (dob !== undefined) teacher.dob = dob;
        if (gender !== undefined) teacher.gender = gender;
        if (ethnic !== undefined) teacher.ethnic = ethnic;
        if (school !== undefined) teacher.school = school;
        if (branch !== undefined) teacher.branch = branch;
        if (trainingSystem !== undefined) teacher.trainingSystem = trainingSystem;
        if (hometown !== undefined) teacher.hometown = hometown;
        if (identificationNumber !== undefined) teacher.identificationNumber = identificationNumber;
        if (phone !== undefined) teacher.phone = phone;
        const year = parseInt(code.substring(2, 4), 10);
        teacher.schoolYear = year + 45;
        await teacher.save();
        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                code: teacher.code,
                email: teacher.email,
                dob: teacher.dob,
                gender: teacher.gender,
                ethnic: teacher.ethnic,
                school: teacher.school,
                branch: teacher.branch,
                className: teacher.className,
                trainingSystem: teacher.trainingSystem,
                hometown: teacher.hometown,
                identificationNumber: teacher.identificationNumber,
                phone: teacher.phone
            }
        });

    } catch (error) {
        console.error(error);
        // trùng MSSV/email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const deleteTeacher = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const teacher = await User.findOne({ _id: id, role: 'teacher' }, null, { session });
        if (!teacher) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }

        const projectResult = await Projects.deleteMany({ teacherId: id }, { session });

        const classes = await Classes.find({ teacherId: id }, '_id', { session });
        const classIds = classes.map(c => c._id);
        if (classIds.length > 0) {
            await Attendances.deleteMany({ classId: { $in: classIds } }, { session });
        }

        const classResult = await Classes.deleteMany({ teacherId: id }, { session });
        await teacher.deleteOne({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Đã xóa giảng viên và dữ liệu liên quan',
            deleted: {
                projects: projectResult.deletedCount,
                classes: classResult.deletedCount
            }
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

//class
const getAllClasses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        const filter = {};
        if (semester) {
            filter.semester = semester;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { classCode: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Classes.countDocuments(filter);

        const classes = await Classes.find(filter)
            .select('name subjectCode classCode type schedule teacherId')
            .populate({
                path: 'teacherId',
                select: 'name email'
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            classes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const getClassDetail = async (req, res) => {
    try {
        const { classId } = req.params;
        const cls = await Classes.findById(classId)
            .populate('teacherId', 'name email code')
            .populate('students', 'name email code')
        if (!cls) { return res.status(404).json({ message: 'Không tìm thấy lớp học' }); }

        const attendances = await Attendances.find({ classId });
        res.status(200).json({
            class: {
                classId: cls._id,
                subjectCode: cls.subjectCode,
                name: cls.name,
                classCode: cls.classCode,
                type: cls.type,
                semester: cls.semester,
                teacher: {
                    name: cls.teacherId?.name,
                    email: cls.teacherId?.email,
                    code: cls.teacherId?.code
                },
                schedule: cls.schedule.map(s => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    room: s.room
                })),
                date: cls.date.map(d => d.toISOString().split('T')[0]),
                students: cls.students.map(student => ({
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    code: student.code
                }))
            },
            attendances,
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lớp học', error: err.message });
    }
}

const createClass = async (req, res) => {
    try {
        const { subjectCode, name, classCode, type, semester, teacherId, date, schedule, students = [] } = req.body;
        if (!subjectCode || !name || !classCode || !type || !semester || !teacherId || !date || !schedule) {
            return res.status(400).json({ message: 'Thiếu thông tin lớp học' });
        }

        const existed = await Classes.findOne({ classCode });
        if (existed) {
            return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
        }

        const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
        if (!teacher) {
            return res.status(400).json({ message: 'Giảng viên không hợp lệ' });
        }
        const parsedDates = date.map(d => new Date(d));

        // 5. Tạo lớp
        const newClass = await Classes.create({ subjectCode, name, classCode, type, semester, teacherId, students, date: parsedDates, schedule });
        res.status(201).json({
            message: 'Tạo lớp học thành công',
            class: {
                id: newClass._id,
                classCode: newClass.classCode,
                name: newClass.name,
                semester: newClass.semester
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const saveAttendance = async (req, res) => {
    try {
        const { classId, date, type, records } = req.body;
        const teacherId = req.user.userId;
        if (!classId || !date || !records) { return res.status(400).json({ message: 'Thiếu dữ liệu điểm danh' }); }
        const cls = await Classes.findById(classId);
        if (!cls) { return res.status(404).json({ message: 'Không tìm thấy lớp học' }); }

        const validDate = cls.date.some(
            d => new Date(d).toISOString().split('T')[0] === date
        );
        if (!validDate) { return res.status(400).json({ message: 'Ngày không thuộc lịch học' }); }

        let attendance = await Attendances.findOne({ classId, date });
        if (!attendance) {
            attendance = await Attendances.create({
                classId,
                teacherId,
                date,
                type,
                records
            });
        } else {
            attendance.records = records;
            attendance.teacherId = teacherId;
            await attendance.save();
        }

        res.json({
            message: 'Lưu điểm danh thành công',
            attendance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const { classId, date } = req.params;
        const teacherId = req.user.userId;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const validDate = cls.date.some(d => new Date(d).toISOString().split('T')[0] === date);
        if (!validDate) {
            return res.status(400).json({ message: 'Ngày không thuộc lịch học' });
        }

        const attendance = await Attendances.findOne({ classId, date });
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy phiên điểm danh' });
        }

        if (attendance.teacherId.toString() !== teacherId) {
            return res.status(403).json({ message: 'Không có quyền xóa phiên điểm danh này' });
        }
        await attendance.deleteOne();
        res.status(200).json({
            message: 'Đã xóa phiên điểm danh thành công'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const addStudentsToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Danh sách sinh viên không hợp lệ/không có sinh viên nào' });
        }

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('_id');
        if (students.length === 0) {
            return res.status(400).json({ message: 'Không có sinh viên hợp lệ' });
        }

        const newStudentIds = students
            .map(s => s._id.toString())
            .filter(id => !cls.students.map(x => x.toString()).includes(id));

        cls.students.push(...newStudentIds);
        await cls.save();

        res.status(200).json({
            message: 'Thêm sinh viên vào lớp thành công',
            addedCount: newStudentIds.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const removeStudentFromClass = async (req, res) => {
    try {
        const { classId, studentId } = req.params;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const before = cls.students.length;
        cls.students = cls.students.filter(id => id.toString() !== studentId);
        if (cls.students.length === before) {
            return res.status(400).json({ message: 'Sinh viên không thuộc lớp này' });
        }

        await cls.save();
        res.status(200).json({ message: 'Đã xóa sinh viên khỏi lớp' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const updates = req.body;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        if (updates.teacherId) {
            const teacher = await User.findOne({ _id: updates.teacherId, role: 'teacher' });
            if (!teacher) {
                return res.status(400).json({ message: 'Giảng viên không hợp lệ' });
            }
        }
        Object.keys(updates).forEach(key => {
            cls[key] = updates[key];
        });

        await cls.save();
        res.status(200).json({
            message: 'Cập nhật lớp học thành công',
            class: cls
        });
    } catch (err) {
        console.error(err);

        if (err.code === 11000) {
            return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const cls = await Classes.findById(id);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        await Attendances.deleteMany({ classId: id });
        await cls.deleteOne();

        res.status(200).json({
            message: 'Đã xóa lớp học và toàn bộ phiên điểm danh liên quan'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

//project
const createProject = async (req, res) => {
    try {
        const { subjectCode, name, projectCode, semester, teacherId } = req.body;
        if (!subjectCode || !name || !projectCode || !semester || !teacherId) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const existed = await Projects.findOne({ projectCode });
        if (existed) {
            return res.status(400).json({ message: 'Mã đồ án đã tồn tại' });
        }

        const project = await Projects.create({
            subjectCode,
            name,
            projectCode,
            semester,
            teacherId,
            members: []
        });
        res.status(201).json({
            message: 'Tạo lớp đồ án thành công',
            project
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addStudentToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).json({ message: 'Thiếu sinh viên' });
        }

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy lớp đồ án' });
        }

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }

        const existed = project.members.some(m => m.studentId.toString() === studentId);
        if (existed) {
            return res.status(400).json({ message: 'Sinh viên đã tồn tại trong lớp đồ án' });
        }

        project.members.push({
            studentId,
            title: null,
            fileUrl: null,
            score: null,
            comment: null
        });

        await project.save();
        res.json({
            message: 'Thêm sinh viên vào project thành công',
            members: project.members
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeStudentFromProject = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project' });
        }

        const before = project.members.length;
        project.members = project.members.filter(m => m.studentId.toString() !== studentId);
        if (project.members.length === before) {
            return res.status(404).json({ message: 'Sinh viên không tồn tại trong lớp đồ án' });
        }

        await project.save();
        res.json({
            message: 'Xóa sinh viên khỏi project thành công'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        const filter = {};
        if (semester) {
            filter.semester = semester;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { projectCode: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } },
            ];
        }
        const total = await Projects.countDocuments(filter);
        const projects = await Projects.find(filter)
            .select('name subjectCode classCode teacherId members')
            .populate({
                path: 'teacherId',
                select: 'name email'
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const formattedProjects = projects.map(p => ({
            _id: p._id,
            name: p.name,
            subjectCode: p.subjectCode,
            projectCode: p.projectCode,
            teacherId: p.teacherId,
            studentCount: p.members?.length || 0
        }));

        res.status(200).json({
            projects: formattedProjects,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProjectDetail = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Projects.findById(projectId)
            .populate('teacherId', 'name email code')
            .populate('members.studentId', 'name email code');

        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project' });
        }
        res.json({ project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProjectInfo = async (req, res) => {
    try {
        const { projectId } = req.params;
        const updateData = req.body;

        const project = await Projects.findByIdAndUpdate(projectId, updateData, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project' });
        }

        res.json({ message: 'Cập nhật project thành công', project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const studentId = req.user.userId;
        const fileUrl = req.file.path;

        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            { $set: { 'members.$.fileUrl': fileUrl } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project hoặc sinh viên' });
        }
        res.json({ message: 'Upload thành công', fileUrl });
    } catch {
        res.status(500).json({ message: err.message });
    }
};

const gradeStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { score, comment } = req.body;

        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            {
                $set: {
                    'members.$.score': score,
                    'members.$.comment': comment
                }
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên trong project' });
        }

        res.json({ message: 'Chấm điểm thành công' });
    } catch {
        res.status(500).json({ message: err.message });
    }
};

const updateTitleForStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { title } = req.body;
        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            {
                $set: { 'members.$.title': title }
            },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy lớp đồ án' });
        }
    } catch {
        res.status(500).json({ message: err.message });
    }
}

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy lớp project' });
        }
        await project.deleteOne();
        res.status(200).json({ message: 'Xóa lớp project thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    resetPassword,
    getAllStudents, getStudentDetails, createStudent, updateStudent, deleteStudent,
    getAllTeachers, getTeacherDetails, createTeacher, updateTeacher, deleteTeacher,

    getAllClasses, getClassDetail, createClass, updateClass, deleteClass,
    addStudentsToClass, removeStudentFromClass, saveAttendance, deleteAttendance,

    getAllProjects, getProjectDetail, createProject, updateProjectInfo, deleteProject,
    addStudentToProject, removeStudentFromProject, uploadReport, gradeStudent, updateTitleForStudent
}