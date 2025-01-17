export type ModalConfigProps = {
  title: string;
  width?: number;
  footer?: React.ReactNode;
  content: React.ReactNode;
  dataTestModalRoot?: string;
  dataTestCloseBtn?: string;
};
