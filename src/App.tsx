import React, { useState } from 'react';
import { StudentProfileData, UserRole, UserSession } from './types';
import { INITIAL_STUDENT_PROFILE, DEMO_STUDENT_PROFILE, CLEAN_STUDENT_PROFILE, CLEAN_USER_SESSION, alexMercerSession, sarahJenkinsSession } from './data/mockData';
import StudentHeader from './components/StudentHeader';
import FacultyHeader from './components/FacultyHeader';
import Footer from './components/Footer';
import CareerCopilot from './components/CareerCopilot';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import CareerPlanScreen, { calculateDeterministicReadiness } from './screens/student/CareerPlanScreen';
import ResumeAnalyzerScreen from './screens/student/ResumeAnalyzerScreen';
import JobSearchScreen from './screens/student/JobSearchScreen';
import SkillDemandScreen from './screens/student/SkillDemandScreen';
import PlacementHubScreen from './screens/student/PlacementHubScreen';
import InterviewRoomScreen from './screens/student/InterviewRoomScreen';
import SemesterAssessmentScreen from './screens/student/SemesterAssessmentScreen';
import { SemesterAssessmentResult } from './types';

import FacultyOverviewScreen from './screens/faculty/FacultyOverviewScreen';
import FacultyStudentsScreen from './screens/faculty/FacultyStudentsScreen';
import FacultySkillAnalyticsScreen from './screens/faculty/FacultySkillAnalyticsScreen';
import FacultyPlacementDrivesScreen from './screens/faculty/FacultyPlacementDrivesScreen';
import FacultyReviewsTrainingScreen from './screens/faculty/FacultyReviewsTrainingScreen';
import FacultyReportsScreen from './screens/faculty/FacultyReportsScreen';
import FacultyImportScreen from './screens/faculty/FacultyImportScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(alexMercerSession);
  const [currentScreen, setCurrentScreen] = useState<string>('career-plan');
  const [studentProfile, setStudentProfile] = useState<StudentProfileData>(CLEAN_STUDENT_PROFILE);
  const [dataMode, setDataMode] = useState<'demo' | 'custom' | 'clean'>('clean');
  const [dockerQuizCompleted, setDockerQuizCompleted] = useState<boolean>(false);

  // Sync currentUser with studentProfile when updated
  React.useEffect(() => {
    if (currentUser?.role === 'student' && studentProfile.name && studentProfile.name !== currentUser.name) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              name: studentProfile.name,
              id: studentProfile.id || studentProfile.registerNumber || prev.id,
              email: studentProfile.email || prev.email,
              department: studentProfile.department || prev.department,
            }
          : null
      );
    }
  }, [studentProfile.name, studentProfile.id, studentProfile.email, studentProfile.department]);
  const [copilotQuizSkillId, setCopilotQuizSkillId] = useState<string | null>(null);
  const [customRoadmapTasks, setCustomRoadmapTasks] = useState<
    Array<{ id: string; title: string; skillId?: string; time: string; objective: string }>
  >([]);
  const [facultyWorkshops, setFacultyWorkshops] = useState<
    Array<{ id: string; title: string; cohort: string; deadline: string; studentCount: number }>
  >([]);
  const [cohortNudgesSent, setCohortNudgesSent] = useState<
    Array<{ id: string; studentIds: string[]; reason: string; timestamp: string }>
  >([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Role-aware navigation helper so jumping between student & faculty screens never renders blank
  const handleNavigate = (screen: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (screen === 'login') {
      setCurrentScreen('login');
      return;
    }
    if (screen.startsWith('admin')) {
      if (currentUser?.role !== 'faculty') {
        setCurrentUser(sarahJenkinsSession);
      }
      setCurrentScreen(screen);
    } else {
      if (currentUser?.role !== 'student') {
        setCurrentUser(alexMercerSession);
      }
      setCurrentScreen(screen);
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (newRole === 'faculty') {
      setCurrentUser(sarahJenkinsSession);
      setCurrentScreen('admin-overview');
      showToast('Switched to Faculty Placement Director console (Dr. S. Soundararajan)', 'info');
    } else {
      setCurrentUser(alexMercerSession);
      setCurrentScreen('career-plan');
      showToast('Switched to Student Candidate view (Aravind R. • RA2211003010482)', 'info');
    }
  };

  const handleLoginDemo = (role: UserRole) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (role === 'student') {
      handleLoadDemoData();
      setCurrentScreen('career-plan');
    } else {
      setCurrentUser(sarahJenkinsSession);
      setCurrentScreen('admin-overview');
      showToast('Authenticated as Placement Director (Dr. S. Soundararajan • CDC)', 'success');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentUser(null);
    setCurrentScreen('login');
    showToast('Signed out of placement console session.', 'info');
  };

    const handleLoadDemoData = () => {
    setStudentProfile(DEMO_STUDENT_PROFILE);
    setCurrentUser(alexMercerSession);
    setDataMode('demo');
    showToast('⚡ Demo mode active (Aravind R. • 8.74 CGPA)', 'success');
  };

  const handleResetCleanState = () => {
    setStudentProfile(CLEAN_STUDENT_PROFILE);
    setCurrentUser(CLEAN_USER_SESSION);
    setDataMode('clean');
    showToast('Reset to clean state. Ready for fresh file upload.', 'info');
  };

  const handleSemesterAssessmentCompleted = (result: SemesterAssessmentResult) => {
    setStudentProfile((prev) => ({
      ...prev,
      competencies: prev.competencies.map((c) => {
        const lower = c.name.toLowerCase();
        if (
          c.id === 'comp-sql' ||
          lower.includes('sql') ||
          lower.includes('postgres') ||
          lower.includes('database')
        ) {
          return {
            ...c,
            proficiency: 4.2,
            evidenceSource: 'verified_assessment' as const,
            evidenceLabel: `Semester Assessment (${result.percentageScore}%) • Verified (4.2/5.0)`,
          };
        }
        if (
          c.id === 'comp-sys' ||
          lower.includes('system') ||
          lower.includes('os') ||
          lower.includes('network')
        ) {
          return {
            ...c,
            proficiency: 4.0,
            evidenceSource: 'verified_assessment' as const,
            evidenceLabel: `Semester Assessment (${result.percentageScore}%) • Verified (4.0/5.0)`,
          };
        }
        return c;
      }),
    }));
    showToast(`Semester Assessment completed! Score: ${result.percentageScore}% recorded to profile.`, 'success');
  };

  const handleDockerQuizFinished = () => {
    setDockerQuizCompleted(true);
    setStudentProfile((prev) => ({
      ...prev,
      competencies: prev.competencies.map((c) =>
        c.id === 'comp-docker'
          ? {
              ...c,
              proficiency: 4.0,
              evidenceSource: 'verified_assessment',
              evidenceLabel: 'Placement Hub Quiz #DCK-101 • Verified (4.0/5.0)',
            }
          : c
      ),
    }));
    showToast('Docker Containerization score: 4.0 recorded! CloudScale placement gate unlocked.', 'success');
  };

  // If logged out or on login screen
  if (!currentUser || currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-[#000000] text-[#D6D6DC] flex flex-col font-sans selection:bg-[#8052ff]/30 selection:text-white">
        <LoginScreen onLoginSuccess={handleLoginDemo} onShowToast={showToast} />
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#16161A] border border-[#363639] text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-mono animate-fade-in">
            <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#55C98B]' : toast.type === 'warning' ? 'bg-[#ffba35]' : 'bg-[#8052ff]'}`}></span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  const dockerCompScore =
    studentProfile.competencies.find((c) => c.id === 'comp-docker')?.proficiency ?? (dockerQuizCompleted ? 4.0 : null);

  return (
    <div className="min-h-screen bg-[#000000] text-[#D6D6DC] flex flex-col font-sans selection:bg-[#8052ff]/30 selection:text-white antialiased">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#16161A] border border-[#363639] text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-fade-in">
          <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#55C98B]' : toast.type === 'warning' ? 'bg-[#ffba35]' : 'bg-[#8052ff]'}`}></span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-[#8B8B93] hover:text-white">✕</button>
        </div>
      )}

      {/* Role-Specific Header */}
      {currentUser.role === 'student' ? (
        <StudentHeader
          currentPath={currentScreen}
          onNavigate={handleNavigate}
          onRoleSwitch={handleRoleSwitch}
          studentId={studentProfile.registerNumber || studentProfile.id || ''}
          studentName={studentProfile.name || ''}
          studentCgpa={studentProfile.cgpa}
          onLogout={handleLogout}
          dataMode={dataMode}
          onLoadDemoData={handleLoadDemoData}
          onResetCleanState={handleResetCleanState}
          onUploadClick={() => handleNavigate('career-plan')}
        />
      ) : (
        <FacultyHeader
          currentPath={currentScreen}
          onNavigate={handleNavigate}
          onRoleSwitch={handleRoleSwitch}
          facultyName={currentUser.name}
          department={currentUser.department}
          onLogout={handleLogout}
        />
      )}

      {/* Active Screen View */}
      <main className={`flex-1 flex flex-col ${currentUser.role === 'faculty' ? 'pt-32' : 'pt-20'}`}>
        {currentUser.role === 'student' ? (
          <>
            {(currentScreen === 'career-plan' || currentScreen === 'career_plan' || currentScreen === '') && (
              <CareerPlanScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                profile={studentProfile}
                onUpdateProfile={(updater) => {
                  setStudentProfile((prev) => {
                    const next = typeof updater === 'function' ? updater(prev) : updater;
                    if (next.name && next.name !== 'Aravind R. (Alex Mercer)') {
                      setDataMode('custom');
                    }
                    return next;
                  });
                }}
                dockerScore={dockerCompScore}
                onDockerQuizCompleted={handleDockerQuizFinished}
                externalQuizSkillId={copilotQuizSkillId}
                onClearExternalQuizSkillId={() => setCopilotQuizSkillId(null)}
                customRoadmapTasks={customRoadmapTasks}
                onLoadDemoData={handleLoadDemoData}
                onResetCleanState={handleResetCleanState}
                dataMode={dataMode}
              />
            )}
            {(currentScreen === 'resume-analyzer' ||
              currentScreen === 'resume_analyzer' ||
              currentScreen === 'career-assets' ||
              currentScreen === 'career_assets') && (
              <ResumeAnalyzerScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                initialWorkspaceTab="resume"
                targetRole={studentProfile.targetRole}
                profile={studentProfile}
              />
            )}
            {(currentScreen === 'linkedin-optimizer' || currentScreen === 'linkedin_optimizer') && (
              <ResumeAnalyzerScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                initialWorkspaceTab="linkedin"
                targetRole={studentProfile.targetRole}
              />
            )}
            {(currentScreen === 'job-search' || currentScreen === 'job_search') && (
              <JobSearchScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                profile={studentProfile}
              />
            )}
            {(currentScreen === 'skill-demand' || currentScreen === 'skill_demand') && (
              <SkillDemandScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                profile={studentProfile}
                dockerScore={dockerCompScore}
                onLaunchQuiz={(skillId) => {
                  setCopilotQuizSkillId(skillId);
                  handleNavigate('career-plan');
                }}
              />
            )}
            {(currentScreen === 'placement-hub' || currentScreen === 'placement_hub') && (
              <PlacementHubScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                onDockerQuizCompleted={handleDockerQuizFinished}
                dockerScore={dockerCompScore}
              />
            )}
            {(currentScreen === 'interview-room' || currentScreen === 'interview_room') && (
              <InterviewRoomScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                profile={studentProfile}
              />
            )}
            {(currentScreen === 'assessment' || currentScreen === 'semester-assessment' || currentScreen === 'semester_assessment') && (
              <SemesterAssessmentScreen
                profile={studentProfile}
                onNavigate={handleNavigate}
                onShowToast={showToast}
                onCompleteAssessment={handleSemesterAssessmentCompleted}
              />
            )}
          </>
        ) : (
          <>
            {(currentScreen === 'admin' || currentScreen === 'admin-overview' || currentScreen === 'admin/overview') && (
              <FacultyOverviewScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
            {(currentScreen === 'admin/students' || currentScreen === 'admin-students') && (
              <FacultyStudentsScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
            {(currentScreen === 'admin/skill-analytics' || currentScreen === 'admin-skill-analytics') && (
              <FacultySkillAnalyticsScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
            {(currentScreen === 'admin/placement-drives' || currentScreen === 'admin-placement-drives') && (
              <FacultyPlacementDrivesScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
            {(currentScreen === 'admin/reviews-training' || currentScreen === 'admin-reviews-training') && (
              <FacultyReviewsTrainingScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                extraWorkshops={facultyWorkshops}
                facultyName={currentUser.role === 'faculty' ? currentUser.name : 'Dr. S. Soundararajan (CDC Director)'}
              />
            )}
            {(currentScreen === 'admin/reports' || currentScreen === 'admin-reports') && (
              <FacultyReportsScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
            {(currentScreen === 'admin/import' || currentScreen === 'admin-import') && (
              <FacultyImportScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Role-Adaptive Conversational Copilot (Student & Faculty Views) */}
      <CareerCopilot
        userRole={currentUser.role}
        profile={studentProfile}
        readinessPct={calculateDeterministicReadiness(studentProfile.competencies)}
        facultyName={currentUser.name}
        department={currentUser.department || 'Computer Science & Engineering'}
        activeCohort="CSE 2028 A"
        onNavigate={handleNavigate}
        onLaunchQuiz={(skillId) => {
          setCopilotQuizSkillId(skillId);
          handleNavigate('career-plan');
        }}
        onAddRoadmapTask={(task) => {
          setCustomRoadmapTasks((prev) => [
            ...prev,
            { ...task, id: `custom-task-${Date.now()}` },
          ]);
        }}
        onAddFacultyWorkshop={(workshop) => {
          setFacultyWorkshops((prev) => [
            ...prev,
            { ...workshop, id: `ws-${Date.now()}` },
          ]);
        }}
        onSendCohortNudges={(targetIds, reason) => {
          setCohortNudgesSent((prev) => [
            ...prev,
            {
              id: `nudge-${Date.now()}`,
              studentIds: targetIds,
              reason,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }}
        onShowToast={showToast}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} onShowToast={showToast} />
    </div>
  );
}
