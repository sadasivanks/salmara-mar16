export interface SelectionData {
  type: string;
  clinic: string;
  date: string;
  time: string;
  doctor: any;
  details: {
    name: string;
    email: string;
    phone: string;
    concern?: string;
  };
}

export interface StepProps {
  selection: SelectionData;
  setSelection: React.Dispatch<React.SetStateAction<SelectionData>>;
  nextStep: () => void;
  prevStep?: () => void;
}
