const User = require('../models/Users');
const Projects = require('../models/Project');

// giảng viên chỉ thao tác trên đồ án mình phụ trách, admin thao tác trên mọi đồ án
const projectScope = (req, projectId) => {
    const filter = { _id: projectId };
    if (req.user.role === 'teacher') filter.teacherId = req.user.userId;
    return filter;
};

// danh sách đồ án cho admin (tất cả) và giảng viên (đồ án mình phụ trách)
const getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        const filter = {};
        if (req.user.role === 'teacher') {
            filter.teacherId = req.user.userId;
        }
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
            .select('name subjectCode projectCode teacherId members')
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

// danh sách đồ án của sinh viên đang đăng nhập, kèm đề tài/điểm của chính sinh viên đó
const getMyProjects = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        const filter = { 'members.studentId': studentId };
        if (semester) {
            filter.semester = semester;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { projectCode: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Projects.countDocuments(filter);
        const projects = await Projects.find(filter)
            .select('subjectCode name projectCode teacherId members')
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const formatted = projects.map(p => {
            const myMember = p.members.find(
                m => m.studentId.toString() === studentId
            );

            return {
                _id: p._id,
                subjectCode: p.subjectCode,
                name: p.name,
                projectCode: p.projectCode,
                teacher: p.teacherId,
                title: myMember?.title || null,
                score: myMember?.score ?? null,
                comment: myMember?.comment ?? null
            };
        });

        res.status(200).json({
            projects: formatted,
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

        const project = await Projects.findOne(projectScope(req, projectId))
            .populate('teacherId', '_id name email code')
            .populate('members.studentId', '_id name email code');

        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project' });
        }
        res.json({ project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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

// sinh viên nộp báo cáo của mình; admin/giảng viên nộp thay sinh viên trong URL
const uploadReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const studentId = req.user.role === 'student' ? req.user.userId : req.params.studentId;
        if (!req.file) {
            return res.status(400).json({ message: 'Thiếu file báo cáo' });
        }
        const fileUrl = req.file.path;

        const project = await Projects.findOneAndUpdate(
            { ...projectScope(req, projectId), 'members.studentId': studentId },
            { $set: { 'members.$.fileUrl': fileUrl } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project hoặc sinh viên' });
        }
        res.json({ message: 'Upload thành công', fileUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const gradeStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { score, comment } = req.body;

        const project = await Projects.findOneAndUpdate(
            { ...projectScope(req, projectId), 'members.studentId': studentId },
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTitleForStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { title } = req.body;
        const project = await Projects.findOneAndUpdate(
            { ...projectScope(req, projectId), 'members.studentId': studentId },
            { $set: { 'members.$.title': title } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy lớp đồ án' });
        }
        res.json({ message: 'Cập nhật đề tài thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllProjects, getMyProjects, getProjectDetail,
    createProject, updateProjectInfo, deleteProject,
    addStudentToProject, removeStudentFromProject,
    uploadReport, gradeStudent, updateTitleForStudent
};
