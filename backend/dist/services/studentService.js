"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
const auditService_1 = require("./auditService");
class StudentService {
    static async getFullProfile(userId) {
        const profile = dataStore_1.db.profiles.get(userId);
        if (!profile)
            throw { status: 404, message: 'Profile not found.' };
        const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
        if (!student)
            throw { status: 404, message: 'Student academic record not found.' };
        const academics = dataStore_1.db.academics.get(student.id) || [];
        const skills = dataStore_1.db.skills.get(student.id) || [];
        const projects = dataStore_1.db.projects.get(student.id) || [];
        const certifications = dataStore_1.db.certifications.get(student.id) || [];
        // Calculate profile completion score
        let completionPoints = 0;
        if (profile.fullName && profile.email && profile.phone)
            completionPoints += 20;
        if (student.cgpa > 0 && academics.length > 0)
            completionPoints += 25;
        if (skills.length >= 3)
            completionPoints += 20;
        if (projects.length >= 1)
            completionPoints += 15;
        if (student.resumeDocumentId)
            completionPoints += 20;
        const profilePercentage = Math.min(100, completionPoints);
        return {
            profile,
            student,
            academics,
            skills,
            projects,
            certifications,
            profilePercentage,
        };
    }
    static async updatePersonal(userId, data, req) {
        const profile = dataStore_1.db.profiles.get(userId);
        const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
        if (!profile || !student)
            throw { status: 404, message: 'Student record not found.' };
        if (data.fullName)
            profile.fullName = data.fullName;
        if (data.phone) {
            profile.phone = data.phone;
        }
        if (data.address !== undefined)
            student.address = data.address;
        if (data.gender !== undefined)
            student.gender = data.gender;
        if (data.passingYear)
            student.passingYear = data.passingYear;
        if (data.cgpa !== undefined)
            student.cgpa = data.cgpa;
        if (data.backlogCount !== undefined)
            student.backlogCount = data.backlogCount;
        if (data.branch)
            student.branch = data.branch;
        student.profileStatus = 'COMPLETE';
        student.updatedAt = new Date().toISOString();
        profile.updatedAt = new Date().toISOString();
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: 'student',
            action: 'PROFILE_UPDATED',
            entityType: 'students',
            entityId: student.id,
            reason: 'Student updated personal profile details',
            req,
        });
        return { profile, student };
    }
    static async addSkill(studentId, skillName, skillLevel) {
        const existing = dataStore_1.db.skills.get(studentId) || [];
        if (existing.some(s => s.skillName.toLowerCase() === skillName.toLowerCase())) {
            throw { status: 400, message: 'This skill has already been added.' };
        }
        const newSkill = {
            id: (0, uuid_1.v4)(),
            studentId,
            skillName,
            skillLevel,
            createdAt: new Date().toISOString(),
        };
        existing.push(newSkill);
        dataStore_1.db.skills.set(studentId, existing);
        return newSkill;
    }
    static async removeSkill(studentId, skillId) {
        const existing = dataStore_1.db.skills.get(studentId) || [];
        const filtered = existing.filter(s => s.id !== skillId);
        dataStore_1.db.skills.set(studentId, filtered);
        return { success: true };
    }
    static async addProject(studentId, data) {
        const existing = dataStore_1.db.projects.get(studentId) || [];
        const newProject = {
            id: (0, uuid_1.v4)(),
            studentId,
            title: data.title,
            description: data.description,
            technologies: data.technologies || [],
            projectUrl: data.projectUrl,
            githubUrl: data.githubUrl,
            startDate: data.startDate,
            endDate: data.endDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        existing.push(newProject);
        dataStore_1.db.projects.set(studentId, existing);
        return newProject;
    }
    static async removeProject(studentId, projectId) {
        const existing = dataStore_1.db.projects.get(studentId) || [];
        dataStore_1.db.projects.set(studentId, existing.filter(p => p.id !== projectId));
        return { success: true };
    }
    static async addCertification(studentId, data) {
        const existing = dataStore_1.db.certifications.get(studentId) || [];
        const cert = {
            id: (0, uuid_1.v4)(),
            studentId,
            name: data.name,
            issuer: data.issuer,
            issueDate: data.issueDate,
            credentialUrl: data.credentialUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        existing.push(cert);
        dataStore_1.db.certifications.set(studentId, existing);
        return cert;
    }
    static async removeCertification(studentId, certId) {
        const existing = dataStore_1.db.certifications.get(studentId) || [];
        dataStore_1.db.certifications.set(studentId, existing.filter(c => c.id !== certId));
        return { success: true };
    }
    static async uploadResumeMetadata(userId, filename, size, storagePath) {
        const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
        if (!student)
            throw { status: 404, message: 'Student record not found.' };
        const docId = (0, uuid_1.v4)();
        dataStore_1.db.documents.set(docId, {
            id: docId,
            ownerUserId: userId,
            documentType: 'RESUME',
            storagePath,
            originalFilename: filename,
            mimeType: 'application/pdf',
            fileSize: size,
            isPrivate: true,
            createdAt: new Date().toISOString(),
        });
        student.resumeDocumentId = docId;
        student.resumeUrl = `/api/documents/${docId}`;
        student.profileStatus = 'COMPLETE';
        student.updatedAt = new Date().toISOString();
        return {
            documentId: docId,
            resumeUrl: student.resumeUrl,
            originalFilename: filename,
        };
    }
}
exports.StudentService = StudentService;
