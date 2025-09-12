/**
 * Trust Level System
 *
 * Based on Discourse's trust level philosophy with 5 progressive levels (0-4).
 * Users advance through clear, measurable criteria focused on positive engagement.
 */

import { ApiRequest, Author } from '@prisma/client';

export enum TrustLevel {
  UNTRUSTED = -1,
  NEW = 0,
  BASIC = 1,
  MEMBER = 2,
  REGULAR = 3,
  TRUSTED = 4,
}

export interface TrustLevelConfig {
  level: TrustLevel;
  displayName: string;
  description: string;
  permissions: string[];
  colorTw: string;
}

export const TRUST_LEVEL_CONFIGS: TrustLevelConfig[] = [
  {
    level: TrustLevel.UNTRUSTED,
    displayName: 'Untrusted',
    description: 'Accounts with high violations rates.',
    permissions: ['Increased moderation scrutiny', 'Limited posting frequency'],
    colorTw: 'bg-red-500',
  },
  {
    level: TrustLevel.NEW,
    displayName: 'New',
    description:
      'New account with limited privileges while learning community norms.',
    permissions: ['Standard moderation review', 'Limited posting frequency'],
    // color: '#6B7280', // Gray-500
    colorTw: 'bg-orange-500',
  },
  {
    level: TrustLevel.BASIC,
    displayName: 'Basic',
    description:
      'Proven account with demonstrated understanding of community guidelines.',
    permissions: ['Standard moderation policies', 'Normal posting frequency'],
    // color: '#F59E0B', // Amber-500
    colorTw: 'bg-amber-500',
  },
  {
    level: TrustLevel.MEMBER,
    displayName: 'Member',
    description:
      'Established community member with consistent positive contributions.',
    permissions: [
      'Reduced moderation scrutiny',
      'Access to member-only features',
      'Higher posting limits',
    ],
    // color: '#10B981', // Emerald-500
    colorTw: 'bg-blue-500',
  },
  {
    level: TrustLevel.REGULAR,
    displayName: 'Regular',
    description:
      'Trusted community member with demonstrated long-term positive engagement.',
    permissions: [
      'Light-touch moderation',
      'Can help with community moderation',
      'Reports prioritized by system',
    ],
    colorTw: 'bg-emerald-500',
  },
  {
    level: TrustLevel.TRUSTED,
    displayName: 'Trusted',
    description:
      'Exceptional community member manually promoted by staff. Near-moderator privileges.',
    permissions: ['Minimal moderation oversight'],
    colorTw: 'bg-lime-500',
  },
];

export interface TrustLevelResult {
  level: TrustLevel;
  config: TrustLevelConfig;
  metadata: TrustLevelMetadata;
  calculatedAt: Date;
}

export interface TrustLevelMetadata {
  accountAgeDays: number;
  cleanContentCount: number;
  totalContentAnalyzed: number;
  violationRate: number;
  violationCount: number;
  isManualPromotion: boolean;
  gatesPassed: {
    age: boolean;
    content: boolean;
    violations: boolean;
  };
  nextLevelRequirements?: {
    ageDays?: number;
    cleanContent?: number;
    maxViolationRate?: number;
    requiresManualPromotion?: boolean;
  };
}

export const TRUST_LEVEL_GATES: Record<
  TrustLevel,
  {
    minAgeDays: number;
    maxAgeDays?: number;
    minCleanContent: number;
    maxViolationRate: number;
    requiresManualPromotion?: boolean;
  }
> = {
  [TrustLevel.UNTRUSTED]: {
    minAgeDays: 0,
    minCleanContent: 0,
    maxViolationRate: 100,
  },
  [TrustLevel.NEW]: {
    minAgeDays: 0,
    minCleanContent: 0,
    maxViolationRate: 5,
  },
  [TrustLevel.BASIC]: {
    minAgeDays: 7,
    minCleanContent: 5,
    maxViolationRate: 5,
  },
  [TrustLevel.MEMBER]: {
    minAgeDays: 30,
    minCleanContent: 25,
    maxViolationRate: 5,
  },
  [TrustLevel.REGULAR]: {
    minAgeDays: 90,
    minCleanContent: 50,
    maxViolationRate: 5,
  },
  [TrustLevel.TRUSTED]: {
    minAgeDays: 90,
    minCleanContent: 50,
    maxViolationRate: 5,
    requiresManualPromotion: true,
  },
};

export type TrustLevelGates = typeof TRUST_LEVEL_GATES;

// Helper types for the calculator
export type StrictApiRequest = Omit<ApiRequest, 'createdAt'>;
export type StrictAuthor = Pick<Author, 'firstSeen' | 'metadata'> & {
  manualTrustLevel?: number | null;
};

// Content analysis metrics interface for easier testing
export interface ContentAnalysisMetrics {
  totalAnalyzed: number;
  violations: number;
  cleanContent: number;
  violationRate: number;
}

// Simplified author interface for testing
export interface SimpleAuthor {
  accountAgeDays: number;
  manualTrustLevel?: number | null;
}

export const getTrustLevelConfig = (level: TrustLevel): TrustLevelConfig => {
  // Find the config that matches the level
  const config = TRUST_LEVEL_CONFIGS.find((c) => c.level === level);
  if (!config) {
    // Default to NEW user if level not found
    return TRUST_LEVEL_CONFIGS[0];
  }
  return config;
};
