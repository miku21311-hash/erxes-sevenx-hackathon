export const Widgets = ({
  module,
  contentId,
  contentType,
}: {
  module: string;
  contentId: string;
  contentType: string;
}) => {
  return <div>classes Widget for {contentType} ({contentId})</div>;
};
