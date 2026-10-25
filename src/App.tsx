import React, { useState } from 'react';
import { StudentProfileData, UserRole, UserSession } from './types';
import { INITIAL_STUDENT_PROFILE, alexMercerSession, sarahJenkinsSession } from './data/mockData';
import StudentHeader from './components/StudentHeader';
import FacultyHeader from './components/FacultyHeader';
import Footer from './components/Footer';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import CareerPlanScreen from './screens/student/CareerPlanScreen';
import ResumeAnalyzerScreen from './screens/student/ResumeAnalyzerScreen';
import JobSearchScreen from './screens/student/JobSearchScreen';
import SkillDemandScreen from './screens/student/SkillDemandScreen';
import PlacementHubScreen from './screens/student/PlacementHubScreen';

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
  const [studentProfile, setStudentProfile] = useState<StudentProfileData>(INITIAL_STUDENT_PROFILE);
  const [dockerQuizCompleted, setDockerQuizCompleted] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Role-aware navigation helper so jumping between student & faculty screens never renders blank
  const handleNavigate = (screen: string) => {
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
    if (newRole === 'faculty') {
      setCurrentUser(sarahJenkinsSession);
      setCurrentScreen('admin-overview');
      showToast('Switched to Faculty Placement Director console (Prof. Sarah Jenkins)', 'info');
    } else {
      setCurrentUser(alexMercerSession);
      setCurrentScreen('career-plan');
      showToast('Switched to Student Candidate view (Alex R. Mercer)', 'info');
    }
  };

  const handleLoginDemo = (role: UserRole) => {
    if (role === 'student') {
      setCurrentUser(alexMercerSession);
      setCurrentScreen('career-plan');
      showToast('Authenticated as Student Candidate (Alex R. Mercer #STU-2026-88)', 'success');
    } else {
      setCurrentUser(sarahJenkinsSession);
      setCurrentScreen('admin-overview');
      showToast('Authenticated as Placement Director (Prof. Sarah Jenkins #FAC-2026-04)', 'success');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    showToast('Signed out of placement console session.', 'info');
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
          studentId={currentUser.id}
          studentName={currentUser.name}
          onLogout={handleLogout}
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
                onUpdateProfile={setStudentProfile}
                dockerScore={dockerCompScore}
                onDockerQuizCompleted={handleDockerQuizFinished}
              />
            )}
            {(currentScreen === 'resume-analyzer' || currentScreen === 'resume_analyzer') && (
              <ResumeAnalyzerScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                initialWorkspaceTab="resume"
              />
            )}
            {(currentScreen === 'linkedin-optimizer' || currentScreen === 'linkedin_optimizer') && (
              <ResumeAnalyzerScreen
                onNavigate={handleNavigate}
                onShowToast={showToast}
                initialWorkspaceTab="linkedin"
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

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} onShowToast={showToast} />
    </div>
  );
}
