import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { AppLayout, Spinner } from 'erxes-ui';
import { registerSevenxLocales } from '~/i18n';
import { SevenxNavigation } from './SevenxNavigation';

registerSevenxLocales();

const DashboardPage = lazy(() =>
  import('~/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

const ClassesPage = lazy(() =>
  import('~/pages/ClassesPage').then((module) => ({
    default: module.ClassesPage,
  })),
);

const ClassDetailPage = lazy(() =>
  import('~/pages/ClassDetailPage').then((module) => ({
    default: module.ClassDetailPage,
  })),
);

const SchedulePage = lazy(() =>
  import('~/pages/SchedulePage').then((module) => ({
    default: module.SchedulePage,
  })),
);

const TeachersPage = lazy(() =>
  import('~/pages/TeachersPage').then((module) => ({
    default: module.TeachersPage,
  })),
);

const StudentsPage = lazy(() =>
  import('~/pages/StudentsPage').then((module) => ({
    default: module.StudentsPage,
  })),
);

const LocationsPage = lazy(() =>
  import('~/pages/LocationsPage').then((module) => ({
    default: module.LocationsPage,
  })),
);

const AnnouncementsPage = lazy(() =>
  import('~/pages/AnnouncementsPage').then((module) => ({
    default: module.AnnouncementsPage,
  })),
);

export const SevenxMain = () => {
  return (
    <AppLayout id="sevenx" title="7x" sidebar={<SevenxNavigation />}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
