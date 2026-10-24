import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface SevenxPageHeaderProps {
  icon: React.ElementType;
  /** Tabler icon name stored with the favorite, e.g. `IconBook2`. */
  iconName: string;
  title: string;
  path: string;
  parent?: { title: string; path: string };
  children?: ReactNode;
}

export const SevenxPageHeader = ({
  icon: Icon,
  iconName,
  title,
  path,
  parent,
  children,
}: SevenxPageHeaderProps) => (
  <PageHeader>
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          {parent && (
            <>
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={parent.path}>
                    <Icon />
                    {parent.title}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
            </>
          )}
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={path}>
                {!parent && <Icon />}
                {title}
              </Link>
            </Button>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton
        breadcrumb={['sevenx', ...(parent ? [parent.title] : []), title]}
        icon={iconName}
      />
    </PageHeader.Start>
    {children && <PageHeader.End>{children}</PageHeader.End>}
  </PageHeader>
);
