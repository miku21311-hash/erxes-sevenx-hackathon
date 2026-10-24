import {
  IconSandbox,
  IconSettings,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';

export const IndexPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/sevenx/classes">
                    <IconSandbox />
                    classes
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/sevenx/settings/classes">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-auto p-6">
          <div className="rounded-lg border bg-card p-8 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">classes</h2>
            <p className="text-muted-foreground">
              This is the classes module. Add your content here using RecordTable, Form, and other erxes-ui components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
