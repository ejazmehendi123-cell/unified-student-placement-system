"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SISService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auditService_1 = require("./auditService");
class SISService {
    static async syncRecords(records, adminUserId, req) {
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        const errors = [];
        const defaultPasswordHash = bcryptjs_1.default.hashSync('DemoPass@2026', 10);
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
                const existingStudent = Array.from(dataStore_1.db.students.values()).find(s => s.rollNumber.toLowerCase() === record.rollNumber.toLowerCase());
                if (existingStudent) {
                    // Update academic metrics from SIS
                    existingStudent.cgpa = record.cgpa;
                    existingStudent.backlogCount = record.backlogCount;
                    existingStudent.branch = record.branch;
                    existingStudent.updatedAt = new Date().toISOString();
                    // Update profile name
                    const profile = dataStore_1.db.profiles.get(existingStudent.userId);
                    if (profile) {
                        profile.fullName = record.name;
                        profile.updatedAt = new Date().toISOString();
                    }
                    updatedCount++;
                }
                else {
                    // Create new user profile and student
                    const userId = (0, uuid_1.v4)();
                    const studentId = (0, uuid_1.v4)();
                    const newProfile = {
                        id: userId,
                        email: record.email.toLowerCase(),
                        role: 'student',
                        fullName: record.name,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    const newStudent = {
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
                    dataStore_1.db.profiles.set(userId, newProfile);
                    dataStore_1.db.userPasswords.set(record.email.toLowerCase(), defaultPasswordHash);
                    dataStore_1.db.students.set(studentId, newStudent);
                    importedCount++;
                }
            }
            catch (err) {
                errors.push({ rollNumber: record.rollNumber, error: err.message || 'Processing failure' });
                skippedCount++;
            }
        }
        // Log administrative audit
        await auditService_1.AuditService.logAction({
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
    static getSampleSISData() {
        return [
            { rollNumber: '2022CSE099', name: 'Varun Swaminathan', email: 'varun.s@usps.edu.in', branch: 'CSE', cgpa: 9.15, backlogCount: 0 },
            { rollNumber: '2022IT045', name: 'Ritika Sharma', email: 'ritika.s@usps.edu.in', branch: 'IT', cgpa: 8.80, backlogCount: 0 },
            { rollNumber: '2022ECE033', name: 'Manish Kumar', email: 'manish.k@usps.edu.in', branch: 'ECE', cgpa: 7.90, backlogCount: 1 },
            { rollNumber: '2022MECH021', name: 'Gaurav Patil', email: 'gaurav.p@usps.edu.in', branch: 'Mechanical', cgpa: 7.65, backlogCount: 0 },
            { rollNumber: '2022CIVIL015', name: 'Ananya Roy', email: 'ananya.r@usps.edu.in', branch: 'Civil', cgpa: 8.35, backlogCount: 0 },
        ];
    }
}
exports.SISService = SISService;
