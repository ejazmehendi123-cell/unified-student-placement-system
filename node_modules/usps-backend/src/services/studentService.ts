import { db } from '../repositories/dataStore';
import { Student, StudentAcademic, StudentSkill, StudentProject, StudentCertification } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './auditService';
import { Request } from 'express';

export class StudentService {
  public static async getFullProfile(userId: string) {
    const profile = db.profiles.get(userId);
    if (!profile) throw { status: 404, message: 'Profile not found.' };

    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student academic record not found.' };

    const academics = db.academics.get(student.id) || [];
    const skills = db.skills.get(student.id) || [];
    const projects = db.projects.get(student.id) || [];
    const certifications = db.certifications.get(student.id) || [];

    // Calculate profile completion score
    let completionPoints = 0;
    if (profile.fullName && profile.email && profile.phone) completionPoints += 20;
    if (student.cgpa > 0 && academics.length > 0) completionPoints += 25;
    if (skills.length >= 3) completionPoints += 20;
    if (projects.length >= 1) completionPoints += 15;
    if (student.resumeDocumentId) completionPoints += 20;

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

  public static async updatePersonal(userId: string, data: any, req?: Request) {
    const profile = db.profiles.get(userId);
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!profile || !student) throw { status: 404, message: 'Student record not found.' };

    if (data.fullName) profile.fullName = data.fullName;
    if (data.phone) {
      profile.phone = data.phone;
    }
    if (data.address !== undefined) student.address = data.address;
    if (data.gender !== undefined) student.gender = data.gender;
    if (data.passingYear) student.passingYear = data.passingYear;
    if (data.cgpa !== undefined) student.cgpa = data.cgpa;
    if (data.backlogCount !== undefined) student.backlogCount = data.backlogCount;
    if (data.branch) student.branch = data.branch;

    student.profileStatus = 'COMPLETE';
    student.updatedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();

    await AuditService.logAction({
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

  public static async addSkill(studentId: string, skillName: string, skillLevel: any) {
    const existing = db.skills.get(studentId) || [];
    if (existing.some(s => s.skillName.toLowerCase() === skillName.toLowerCase())) {
      throw { status: 400, message: 'This skill has already been added.' };
    }

    const newSkill: StudentSkill = {
      id: uuidv4(),
      studentId,
      skillName,
      skillLevel,
      createdAt: new Date().toISOString(),
    };

    existing.push(newSkill);
    db.skills.set(studentId, existing);
    return newSkill;
  }

  public static async removeSkill(studentId: string, skillId: string) {
    const existing = db.skills.get(studentId) || [];
    const filtered = existing.filter(s => s.id !== skillId);
    db.skills.set(studentId, filtered);
    return { success: true };
  }

  public static async addProject(studentId: string, data: any) {
    const existing = db.projects.get(studentId) || [];
    const newProject: StudentProject = {
      id: uuidv4(),
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
    db.projects.set(studentId, existing);
    return newProject;
  }

  public static async removeProject(studentId: string, projectId: string) {
    const existing = db.projects.get(studentId) || [];
    db.projects.set(studentId, existing.filter(p => p.id !== projectId));
    return { success: true };
  }

  public static async addCertification(studentId: string, data: any) {
    const existing = db.certifications.get(studentId) || [];
    const cert: StudentCertification = {
      id: uuidv4(),
      studentId,
      name: data.name,
      issuer: data.issuer,
      issueDate: data.issueDate,
      credentialUrl: data.credentialUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existing.push(cert);
    db.certifications.set(studentId, existing);
    return cert;
  }

  public static async removeCertification(studentId: string, certId: string) {
    const existing = db.certifications.get(studentId) || [];
    db.certifications.set(studentId, existing.filter(c => c.id !== certId));
    return { success: true };
  }

  public static async uploadResumeMetadata(userId: string, filename: string, size: number, storagePath: string) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student record not found.' };

    const docId = uuidv4();
    db.documents.set(docId, {
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
