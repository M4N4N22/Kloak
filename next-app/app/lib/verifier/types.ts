export type ApplicationStatus =
  | "Submitted"
  | "Reviewed"
  | "Selected";

export type ApplicationRecord = {
  id: string;
  distributionId: string;
  submittedAt: string;
  status: ApplicationStatus;

  // What reviewer sees
  title: string;
  content: string;

  // Extra structured fields
  metadata: {
    label: string;
    value: string;
  }[];

  // Privacy guarantees
  proof: {
    type: "mock" | "zk";
    verified: boolean;
  };
};
