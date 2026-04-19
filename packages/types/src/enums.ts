export enum UserRole {
  TECHNICIAN = 'technician',
  COMPANY_ADMIN = 'company_admin',
  COMPANY_TECHNICIAN = 'company_technician',
  PLATFORM_ADMIN = 'platform_admin',
}

export enum UserLevel {
  NOVATO = 'novato',
  VERIFICADO = 'verificado',
  PRO = 'pro',
  SENIOR = 'senior',
  ELITE = 'elite',
}

export enum WOType {
  INSTALLATION = 'installation',
  REVISION = 'revision',
  SUPPORT = 'support',
  CONFIG = 'config',
  MOTOR_CUT = 'motor_cut',
}

export enum WOStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EvidenceStage {
  BEFORE = 'before',
  DURING = 'during',
  AFTER = 'after',
  DEVICE = 'device',
  OTHER = 'other',
}

export enum ReferralStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REWARDED = 'rewarded',
}

export enum KbType {
  MOTOR_CUT = 'motor_cut',
  DEVICE_CONFIG = 'device_config',
  KNOWN_ISSUE = 'known_issue',
  INSTALL_GUIDE = 'install_guide',
}

export enum KbStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum WorkspacePlan {
  STARTER = 'starter',
  PRO = 'pro',
  BUSINESS = 'business',
}

export enum RewardType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  COUPON = 'coupon',
}

export enum RedemptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
}
