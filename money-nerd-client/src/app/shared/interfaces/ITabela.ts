export interface Column {
  label: string;
  field: string;
  width?: string;
  textAlignContent?: 'start' | 'center' | 'end';
  textAlignLabel?: 'start' | 'center' | 'end';
  campoCustomizado?: boolean;
  setSortable?: boolean;
}
