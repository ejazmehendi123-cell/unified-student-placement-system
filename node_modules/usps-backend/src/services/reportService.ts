import { db } from '../repositories/dataStore';

export class ReportService {
  public static getPlacementSummary() {
    const students = Array.from(db.students.values());
    const totalStudents = students.length;
    const registeredStudents = students.filter(s => s.profileStatus === 'COMPLETE').length;
    const placedStudents = students.filter(s => s.isPlaced).length;
    const unplacedStudents = totalStudents - placedStudents;
    const placementRate = totalStudents > 0 ? Number(((placedStudents / totalStudents) * 100).toFixed(2)) : 0;

    const placements = Array.from(db.placements.values()).filter(p => p.status === 'PLACED');
    const packages = placements.map(p => p.package);
    const avgPackage = packages.length > 0 ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)) : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    const drives = Array.from(db.drives.values());
    const totalDrives = drives.length;
    const openDrives = drives.filter(d => d.status === 'OPEN').length;
    const totalApplications = db.applications.size;
    const totalInterviews = db.interviewRounds.size;
    const totalOffers = db.offers.size;
    const acceptedOffers = Array.from(db.offers.values()).filter(o => o.status === 'ACCEPTED').length;

    return {
      totalStudents,
      registeredStudents,
      placedStudents,
      unplacedStudents,
      placementRate,
      avgPackage,
      highestPackage,
      totalDrives,
      openDrives,
      totalApplications,
      totalInterviews,
      totalOffers,
      acceptedOffers,
    };
  }

  public static getDepartmentStats() {
    const branches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'];
    const students = Array.from(db.students.values());
    const placements = Array.from(db.placements.values()).filter(p => p.status === 'PLACED');

    return branches.map(branch => {
      const branchStudents = students.filter(s => s.branch === branch);
      const total = branchStudents.length;
      const placed = branchStudents.filter(s => s.isPlaced).length;
      const unplaced = total - placed;
      const rate = total > 0 ? Number(((placed / total) * 100).toFixed(2)) : 0;

      const branchStudentIds = new Set(branchStudents.map(s => s.id));
      const branchPlacements = placements.filter(p => branchStudentIds.has(p.studentId));
      const pkgs = branchPlacements.map(p => p.package);
      const avgPkg = pkgs.length > 0 ? Number((pkgs.reduce((a, b) => a + b, 0) / pkgs.length).toFixed(2)) : 0;
      const maxPkg = pkgs.length > 0 ? Math.max(...pkgs) : 0;

      return {
        branch,
        totalStudents: total,
        placedStudents: placed,
        unplacedStudents: unplaced,
        placementRate: rate,
        avgPackage: avgPkg,
        maxPackage: maxPkg,
      };
    });
  }

  public static getCompanyStats() {
    const companies = Array.from(db.companies.values());
    const drives = Array.from(db.drives.values());
    const offers = Array.from(db.offers.values());

    return companies.map(company => {
      const companyDrives = drives.filter(d => d.companyId === company.id);
      const driveIds = new Set(companyDrives.map(d => d.id));
      const companyApps = Array.from(db.applications.values()).filter(a => driveIds.has(a.driveId));
      const appIds = new Set(companyApps.map(a => a.id));

      const companyOffers = offers.filter(o => appIds.has(o.applicationId));
      const acceptedOffers = companyOffers.filter(o => o.status === 'ACCEPTED').length;
      const pkgs = companyOffers.map(o => o.packageOffered);
      const avgPkg = pkgs.length > 0 ? Number((pkgs.reduce((a, b) => a + b, 0) / pkgs.length).toFixed(2)) : 0;

      return {
        companyId: company.id,
        companyName: company.name,
        industry: company.industry,
        totalDrives: companyDrives.length,
        totalApplicants: companyApps.length,
        offersIssued: companyOffers.length,
        offersAccepted: acceptedOffers,
        avgPackageOffered: avgPkg,
      };
    });
  }

  public static getPackageDistribution() {
    const placements = Array.from(db.placements.values()).filter(p => p.status === 'PLACED');
    const tiers = {
      'Under 6 LPA': 0,
      '6 - 10 LPA': 0,
      '10 - 15 LPA': 0,
      '15 - 20 LPA': 0,
      '20+ LPA (Dream)': 0,
    };

    placements.forEach(p => {
      const pkg = p.package;
      if (pkg < 6) tiers['Under 6 LPA']++;
      else if (pkg >= 6 && pkg < 10) tiers['6 - 10 LPA']++;
      else if (pkg >= 10 && pkg < 15) tiers['10 - 15 LPA']++;
      else if (pkg >= 15 && pkg < 20) tiers['15 - 20 LPA']++;
      else tiers['20+ LPA (Dream)']++;
    });

    return Object.entries(tiers).map(([tier, count]) => ({ tier, count }));
  }

  public static generatePlacementCSV(): string {
    const placements = Array.from(db.placements.values()).filter(p => p.status === 'PLACED');
    const header = 'Roll Number,Student Name,Branch,Company,Job Role,Package (LPA),Placement Date,Status\n';
    
    const rows = placements.map(p => {
      const student = db.students.get(p.studentId);
      const profile = student ? db.profiles.get(student.userId) : undefined;
      const company = db.companies.get(p.companyId);
      return [
        student?.rollNumber || '',
        `"${profile?.fullName || ''}"`,
        student?.branch || '',
        `"${company?.name || ''}"`,
        `"${p.jobRole}"`,
        p.package,
        p.placementDate,
        p.status,
      ].join(',');
    }).join('\n');

    return header + rows;
  }
}
