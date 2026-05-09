export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  idNumber?: string;
  monthlyContribution?: number;
  createdAt?: string;
  groupId?: number;
  role?: 'Admin' | 'Member';
  isSuperAdmin?: boolean;
  monthlyTarget?: number;
  yearlyTarget?: number;
}

export interface StokvelGroup {
  id: number;
  name: string;
  description: string;
  groupBalance: number;
  monthlyTarget: number;
  yearlyTarget: number;
}

export interface AuthResponse {
  token: string;
  member: Member;
}

export interface MemberStats {
  totalVerified: number;
  totalPending: number;
  paymentsCount: number;
  yearlyContributions: number;
  totalContributions: number;
  monthlyVerified: number;
  groupMonthlyVerified?: number;
  group?: StokvelGroup;
}

export interface Payment {
  id: string;
  userId: string | number;
  amount: number;
  method: string;
  reference?: string;
  status: "pending" | "verified" | "rejected";
  paidAt: string;
  note?: string;
  hasProof: boolean;
  proofFilename?: string;
  createdAt?: string;
  userName?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
  read: boolean;
  createdAt: string;
}
