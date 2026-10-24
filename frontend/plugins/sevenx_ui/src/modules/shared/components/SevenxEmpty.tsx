import { Empty } from 'erxes-ui';
import { ReactNode } from 'react';

export const SevenxEmpty = ({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <Empty className={className}>
    <Empty.Header>
      <Empty.Media variant="icon">
        <Icon />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      {description && <Empty.Description>{description}</Empty.Description>}
    </Empty.Header>
    {children && <Empty.Content>{children}</Empty.Content>}
  </Empty>
);
