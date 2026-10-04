import { db } from '../repositories/dataStore';
import { Student, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { AuditService } from './auditService';
import { Request } from 'express';

export interface SISRecord {
  rollNumber: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogCount: number;
}

export class SISService {
  public static async syncRecords(records: SISRecord[], adminUserId: string, req?: Request) {
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ rollNumber: string; error: string }> = [];

    const defaultPasswordHash = bcrypt.hashSync('DemoPass@2026', 10);

    for (const record of records) {
      try {
        if (!record.rollNumber || !record.email || !record.name) {
          errors.push({ rollNumber: record.rollNumber || 'UNKNOWN', error: 'Missing required identity fields.' });
          skippedCount++;
          continue;
        }

        if (record.cgpa < 0 || record.cgpa > 10) {
          errors.push({ rollNumber: record.rollNumber, error: 'CGPA out of range (must be 0.0 - 10.0).' });
          skippedCount++;
          continue;
        }

        // Check if student already exists by roll number
        const existingStudent = Array.from(db.students.values()).find(
          s => s.rollNumber.toLowerCase() === record.rollNumber.toLowerCase()
        );

        if (existingStudent) {
          // Update academic metrics from SIS
          existingStudent.cgpa = record.cgpa;
          existingStudent.backlogCount = record.backlogCount;
          existingStudent.branch = record.branch;
          existingStudent.updatedAt = new Date().toISOString();

          // Update profile name
          const profile = db.profiles.get(existingStudent.userId);
          if (profile) {
            profile.fullName = record.name;
            profile.updatedAt = new Date().toISOString();
          }

          updatedCount++;
        } else {
          // Create new user profile and student
          const userId = uuidv4();
          const studentId = uuidv4();

          const newProfile: UserProfile = {
            id: userId,
            email: record.email.toLowerCase(),
            role: 'student',
            fullName: record.name,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const newStudent: Student = {
            id: studentId,
            userId,
            rollNumber: record.rollNumber,
            branch: record.branch,
            department: `${record.branch} Engineering`,
            cgpa: record.cgpa,
            backlogCount: record.backlogCount,
            profileStatus: 'COMPLETE',
            isPlaced: false,
            placementStatus: 'UNPLACED',
            passingYear: 2026,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          db.profiles.set(userId, newProfile);
          db.userPasswords.set(record.email.toLowerCase(), defaultPasswordHash);
          db.students.set(studentId, newStudent);

          importedCount++;
        }
      } catch (err: any) {
        errors.push({ rollNumber: record.rollNumber, error: err.message || 'Processing failure' });
        skippedCount++;
      }
    }

    // Log administrative audit
    await AuditService.logAction({
      actorUserId: adminUserId,
      actorRole: 'tpo_admin',
      action: 'SIS_SYNC_COMPLETED',
      entityType: 'sis_integration',
      newData: { total: records.length, importedCount, updatedCount, skippedCount },
      reason: `SIS batch synchronization: ${importedCount} created, ${updatedCount} updated, ${skippedCount} skipped.`,
      req,
    });

    return {
      totalProcessed: records.length,
      importedCount,
      updatedCount,
      skippedCount,
      errors,
    };
  }

  public static getSampleSISData(): SISRecord[] {
    return [
      { rollNumber: '2022CSE099', name: 'Varun Swaminathan', email: 'varun.s@usps.edu.in', branch: 'CSE', cgpa: 9.15, backlogCount: 0 },
      { rollNumber: '2022IT045', name: 'Ritika Sharma', email: 'ritika.s@usps.edu.in', branch: 'IT', cgpa: 8.80, backlogCount: 0 },
      { rollNumber: '2022ECE033', name: 'Manish Kumar', email: 'manish.k@usps.edu.in', branch: 'ECE', cgpa: 7.90, backlogCount: 1 },
      { rollNumber: '2022MECH021', name: 'Gaurav Patil', email: 'gaurav.p@usps.edu.in', branch: 'Mechanical', cgpa: 7.65, backlogCount: 0 },
      { rollNumber: '2022CIVIL015', name: 'Ananya Roy', email: 'ananya.r@usps.edu.in', branch: 'Civil', cgpa: 8.35, backlogCount: 0 },
    ];
  }
}
