export interface SectionContent {
  title: string;
  sections: Array<{
    type: 'custom';
    content: {
      render: () => JSX.Element;
    };
  }>;
}