import { Student, StudentAcademic, StudentSkill, StudentProject, StudentCertification } from '../types';
import { Request } from 'express';
export declare class StudentService {
    static getFullProfile(userId: string): Promise<{
        profile: import("../types").UserProfile;
        student: Student;
        academics: StudentAcademic[];
        skills: StudentSkill[];
        projects: StudentProject[];
        certifications: StudentCertification[];
        profilePercentage: number;
    }>;
    static updatePersonal(userId: string, data: any, req?: Request): Promise<{
        profile: import("../types").UserProfile;
        student: Student;
    }>;
    static addSkill(studentId: string, skillName: string, skillLevel: any): Promise<StudentSkill>;
    static removeSkill(studentId: string, skillId: string): Promise<{
        success: boolean;
    }>;
    static addProject(studentId: string, data: any): Promise<StudentProject>;
    static removeProject(studentId: string, projectId: string): Promise<{
        success: boolean;
    }>;
    static addCertification(studentId: string, data: any): Promise<StudentCertification>;
    static removeCertification(studentId: string, certId: string): Promise<{
        success: boolean;
    }>;
    static uploadResumeMetadata(userId: string, filename: string, size: number, storagePath: string): Promise<{
        documentId: string;
        resumeUrl: string;
        originalFilename: string;
    }>;
}
