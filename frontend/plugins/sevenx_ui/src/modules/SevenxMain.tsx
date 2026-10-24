import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppLayout, AppLayoutFooterLink, Spinner } from 'erxes-ui';
import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { PluginSettingsRoutes, PluginSharedSettingsNavigation } from 'ui-modules';
import { SevenxNavigation } from './SevenxNavigation';
import { SevenxSettingsNavigation } from './SevenxSettingsNavigation';

const Settings = lazy(() =>
  import('./SevenxSettings').then((module) => ({
    default: module.SevenxSettings,
  })),
);

const IndexPage = lazy(() =>
  import('~/pages/classes/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

export const SevenxMain = () => {
  return (
    <Routes>
      <Route path="settings/*" element={
        <AppLayout
          id="sevenx:settings"
          title="Sevenx Settings"
          sidebar={<>
            <SevenxSettingsNavigation />
            <PluginSharedSettingsNavigation pluginName="sevenx" pathPrefix="sevenx/settings" />
          </>}
          footer={<AppLayoutFooterLink path="sevenx/classes" name="Back to Sevenx" icon={IconArrowLeft} />}
        >
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes pluginName="sevenx" basePath="/sevenx/settings">
              <Routes>
                <Route index element={<Navigate to="classes" replace />} />
                <Route path="classes" element={<Settings />} />
              </Routes>
            </PluginSettingsRoutes>
          </Suspense>
        </AppLayout>
      } />
      <Route path="*" element={
        <AppLayout
          id="sevenx"
          title="Sevenx"
          sidebar={<SevenxNavigation />}
          footer={<AppLayoutFooterLink path="sevenx/settings" name="App settings" icon={IconSettings} />}
        >
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route index element={<Navigate to="classes" replace />} />
              <Route path="classes" element={<IndexPage />} />
            </Routes>
          </Suspense>
        </AppLayout>
      } />
    </Routes>
  );
};
