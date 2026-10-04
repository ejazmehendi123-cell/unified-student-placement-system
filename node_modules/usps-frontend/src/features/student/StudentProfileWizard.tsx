import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WizardStepper } from '../../components/ui/Stepper';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
} from 'lucide-react';

const PROFILE_STEPS = [
  'Personal Details',
  'Academics',
  'Technical Skills',
  'Key Projects',
  'Certifications',
  'Resume Upload',
  'Final Review',
];

export const StudentProfileWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [personal, setPersonal] = useState({
    fullName: '',
    phone: '',
    gender: 'Male',
    address: '',
    passingYear: 2026,
    branch: 'CSE',
    department: 'Computer Science and Engineering',
    cgpa: 8.75,
    backlogCount: 0,
  });

  const [academics, setAcademics] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [resumeMetadata, setResumeMetadata] = useState<any>(null);

  // New item draft states
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' as any });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    projectUrl: '',
  });
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getProfile();
      if (res.success && res.data) {
        const { profile, student, academics, skills, projects, certifications } = res.data;
        setPersonal({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          gender: student.gender || 'Male',
          address: student.address || '',
          passingYear: student.passingYear || 2026,
          branch: student.branch || 'CSE',
          department: student.department || 'Computer Science and Engineering',
          cgpa: student.cgpa || 0,
          backlogCount: student.backlogCount || 0,
        });
        setAcademics(academics || []);
        setSkills(skills || []);
        setProjects(projects || []);
        setCertifications(certifications || []);
        if (student.resumeDocumentId) {
          setResumeMetadata({
            documentId: student.resumeDocumentId,
            resumeUrl: student.resumeUrl,
            filename: 'Aarav_Sharma_Resume_2026.pdf',
          });
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      await studentApi.updateProfile(personal);
      setFeedback({ type: 'success', message: 'Personal details updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Failed to update.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      const res = await studentApi.addSkill({ skillName: newSkill.name, skillLevel: newSkill.level });
      if (res.success) {
        setSkills([...skills, res.data]);
        setNewSkill({ name: '', level: 'Intermediate' });
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error adding skill');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      await studentApi.removeSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
    } catch {
      // Ignore
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim() || !newProject.description.trim()) return;
    try {
      const techArray = newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await studentApi.addProject({
        title: newProject.title,
        description: newProject.description,
        technologies: techArray,
        githubUrl: newProject.githubUrl,
        projectUrl: newProject.projectUrl,
      });
      if (res.success) {
        setProjects([...projects, res.data]);
        setNewProject({ title: '', description: '', technologies: '', githubUrl: '', projectUrl: '' });
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error adding project');
    }
  };

  const handleRemoveProject = async (id: string) => {
    try {
      await studentApi.removeProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch {
      // Ignore
    }
  };

  const handleAddCert = async () => {
    if (!newCert.name.trim() || !newCert.issuer.trim() || !newCert.issueDate) return;
    try {
      const res = await studentApi.addCertification(newCert);
      if (res.success) {
        setCertifications([...certifications, res.data]);
        setNewCert({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error adding certification');
    }
  };

  const handleRemoveCert = async (id: string) => {
    try {
      await studentApi.removeCertification(id);
      setCertifications(certifications.filter((c) => c.id !== id));
    } catch {
      // Ignore
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF documents (max 5MB) are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB limit.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await studentApi.uploadResume(formData);
      if (res.success) {
        setResumeMetadata(res.data);
        setFeedback({ type: 'success', message: 'Resume uploaded and verified successfully.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error?.message || 'Resume upload failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    setFeedback(null);
    setCurrentStep((prev) => Math.min(PROFILE_STEPS.length - 1, prev + 1));
  };

  const prevStep = () => {
    setFeedback(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5]">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Student Profile & Placement Portfolio</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Maintain your verified institutional credentials, resume, and technical competency portfolio
          </p>
        </div>
        <Badge variant="primary" size="md">
          Progress: {currentStep + 1} / {PROFILE_STEPS.length}
        </Badge>
      </div>

      {feedback && (
        <Alert type={feedback.type} className="text-xs">
          {feedback.message}
        </Alert>
      )}

      {/* 7-Step Progress Stepper */}
      <Card className="p-4">
        <WizardStepper
          steps={PROFILE_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {/* STEP 1: Personal Details */}
        {currentStep === 0 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brass" /> Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:ring-1 focus:ring-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:ring-1 focus:ring-navy text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Gender</label>
                <select
                  value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:ring-1 focus:ring-navy text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Graduation Passing Year</label>
                <input
                  type="number"
                  value={personal.passingYear}
                  onChange={(e) => setPersonal({ ...personal, passingYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:ring-1 focus:ring-navy text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-charcoal mb-1">Campus / Residential Address</label>
                <textarea
                  rows={2}
                  value={personal.address}
                  onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:ring-1 focus:ring-navy text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Academics */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brass" /> Academic Performance & SIS Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <div>
                <p className="text-charcoal-muted uppercase text-[10px] font-bold">Cumulative CGPA</p>
                <p className="text-xl font-bold text-navy mt-0.5 font-heading">{personal.cgpa.toFixed(2)} / 10.00</p>
              </div>
              <div>
                <p className="text-charcoal-muted uppercase text-[10px] font-bold">Active Backlogs</p>
                <p className="text-xl font-bold text-navy mt-0.5 font-heading">{personal.backlogCount}</p>
              </div>
              <div>
                <p className="text-charcoal-muted uppercase text-[10px] font-bold">Branch & Discipline</p>
                <p className="text-sm font-bold text-navy mt-0.5">{personal.branch} — {personal.department}</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E5DFD5] rounded-sm mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                    <th className="p-3">Semester</th>
                    <th className="p-3">SGPA</th>
                    <th className="p-3">Backlogs</th>
                    <th className="p-3">Academic Year</th>
                    <th className="p-3">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D3]">
                  {academics.map((sem) => (
                    <tr key={sem.id} className="hover:bg-paper/50">
                      <td className="p-3 font-semibold text-navy">Semester {sem.semester}</td>
                      <td className="p-3 font-bold">{sem.sgpa.toFixed(2)}</td>
                      <td className="p-3">{sem.backlogCount}</td>
                      <td className="p-3 text-charcoal-muted">{sem.academicYear}</td>
                      <td className="p-3">
                        <Badge variant="neutral" size="sm">
                          {sem.source}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: Technical Skills */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brass" /> Technical & Domain Competencies
            </h3>

            {/* Existing Skills Tags */}
            <div className="flex flex-wrap gap-2 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] min-h-[60px] items-center">
              {skills.length === 0 ? (
                <p className="text-charcoal-muted text-[11px]">No skills added yet. Use the form below to add competencies.</p>
              ) : (
                skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8D3C8] rounded-sm font-semibold text-navy shadow-xs"
                  >
                    <span>{s.skillName}</span>
                    <span className="text-[10px] text-charcoal-muted font-normal">({s.skillLevel})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.id)}
                      className="ml-1 text-charcoal-muted hover:text-clay"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Skill Form */}
            <div className="p-3 bg-white border border-[#D8D3C8] rounded-sm flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block font-semibold text-charcoal mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, React, PostgreSQL"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="block font-semibold text-charcoal mb-1">Proficiency Level</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <Button type="button" size="sm" variant="primary" onClick={handleAddSkill} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Skill
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Key Projects */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brass" /> Software & Engineering Projects
            </h3>

            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="p-3.5 bg-paper-dark border border-[#E5DFD5] rounded-sm flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-navy">{p.title}</h4>
                    <p className="text-charcoal mt-1 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.technologies?.map((t: string) => (
                        <Badge key={t} variant="neutral" size="sm">{t}</Badge>
                      ))}
                    </div>
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-navy font-semibold mt-2 hover:underline">
                        <ExternalLink className="w-3 h-3" /> GitHub Repository
                      </a>
                    )}
                  </div>
                  <button onClick={() => handleRemoveProject(p.id)} className="p-1 text-charcoal-muted hover:text-clay">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Project Form */}
            <div className="p-4 bg-white border border-[#D8D3C8] rounded-sm space-y-3 mt-4">
              <h4 className="font-bold text-xs text-navy uppercase tracking-wider">Add New Project</h4>
              <div>
                <label className="block font-semibold text-charcoal mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cache Protocol with RAFT"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize architecture, algorithms, and key impact metrics..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Technologies (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Go, TypeScript, Raft, gRPC"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">GitHub / Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
              </div>
              <Button type="button" size="sm" variant="primary" onClick={handleAddProject} icon={<Plus className="w-3.5 h-3.5" />}>
                Save Project
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Certifications */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-brass" /> Professional Certifications & Badges
            </h3>

            <div className="space-y-3">
              {certifications.map((c) => (
                <div key={c.id} className="p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy">{c.name}</h4>
                    <p className="text-[11px] text-charcoal-muted">{c.issuer} • Issued on {c.issueDate}</p>
                  </div>
                  <button onClick={() => handleRemoveCert(c.id)} className="p-1 text-charcoal-muted hover:text-clay">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border border-[#D8D3C8] rounded-sm space-y-3 mt-4">
              <h4 className="font-bold text-xs text-navy uppercase tracking-wider">Add Certification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Certification Name</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Solutions Architect"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Verification URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newCert.credentialUrl}
                    onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                  />
                </div>
              </div>
              <Button type="button" size="sm" variant="primary" onClick={handleAddCert} icon={<Plus className="w-3.5 h-3.5" />}>
                Save Certification
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: Resume Upload */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brass" /> Resume Document Management
            </h3>

            {resumeMetadata ? (
              <div className="p-4 bg-sage-50 border border-[#5D9479]/30 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sage text-white rounded-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm">{resumeMetadata.originalFilename || 'Verified_Resume_2026.pdf'}</h4>
                    <p className="text-[11px] text-charcoal-muted">Verified University Placement Resume • Format: PDF (max 5 MB)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resumeMetadata.resumeUrl || '/api/documents/doc-resume-001'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-sm hover:bg-navy-light inline-flex items-center gap-1"
                  >
                    Preview PDF →
                  </a>
                </div>
              </div>
            ) : (
              <Alert type="warning">
                A verified PDF resume is mandatory to apply for campus placement drives.
              </Alert>
            )}

            <div className="p-6 border-2 border-dashed border-[#D8D3C8] rounded-sm bg-paper-dark/50 text-center">
              <Upload className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
              <p className="font-bold text-navy text-sm">Upload Updated PDF Resume</p>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Maximum file size: 5 MB (PDF format only)</p>
              <label className="mt-3 inline-block">
                <span className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-sm hover:bg-navy-light cursor-pointer shadow-xs">
                  Choose PDF File
                </span>
                <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: Final Review */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage" /> Final Review & Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
                <h4 className="font-bold text-navy text-xs uppercase mb-2">Student Information</h4>
                <p><strong>Name:</strong> {personal.fullName}</p>
                <p><strong>Phone:</strong> {personal.phone}</p>
                <p><strong>Branch:</strong> {personal.branch}</p>
                <p><strong>CGPA:</strong> {personal.cgpa.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
                <h4 className="font-bold text-navy text-xs uppercase mb-2">Portfolio Statistics</h4>
                <p><strong>Skills:</strong> {skills.length} competencies listed</p>
                <p><strong>Projects:</strong> {projects.length} repositories attached</p>
                <p><strong>Certifications:</strong> {certifications.length} verified credentials</p>
                <p><strong>Resume:</strong> {resumeMetadata ? '✓ Attached' : '✕ Missing'}</p>
              </div>
            </div>

            <Alert type="success" title="Profile Ready for Campus Placement">
              Your profile is verified and authorized for placement drive screening under the University Placement Policy.
            </Alert>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#EAE2D3]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            ← Previous Step
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isSaving}
              onClick={handleSavePersonal}
            >
              Save Draft
            </Button>

            {currentStep < PROFILE_STEPS.length - 1 ? (
              <Button type="button" variant="primary" size="sm" onClick={nextStep}>
                Next Step →
              </Button>
            ) : (
              <Button type="button" variant="accent" size="sm" onClick={handleSavePersonal}>
                Save & Complete Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
