export type Distribution = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: "Open" | "Closed";

  // Human-readable eligibility (derived from rules)
  eligibilityPreview?: string;
};


export type Application = {
  id: string;
  date: string;
  status: "Submitted" | "Reviewed" | "Selected";
  title: string;
  content: string;
  additionalFields: {
    label: string;
    value: string;
  }[];
};
