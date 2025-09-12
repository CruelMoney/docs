/**
 * Trust Level Calculator
 *
 * Simple, transparent trust level system based on:
 * - Account age
 * - Clean content volume
 * - Violation rate in sliding window
 * - Manual promotions for highest level
 */

import {
  ContentAnalysisMetrics,
  getTrustLevelConfig,
  SimpleAuthor,
  StrictApiRequest,
  StrictAuthor,
  TRUST_LEVEL_GATES,
  TrustLevel,
  TrustLevelMetadata,
  TrustLevelResult,
} from './types';

export class TrustLevelCalculator {
  private contentLookback = 100; // Look at last 100 pieces of content

  /**
   * Calculate trust level for a user with raw content (analyzes content first)
   */
  calculate(user: StrictAuthor, content: StrictApiRequest[]): TrustLevelResult {
    const accountAgeDays = this.daysBetween(user.firstSeen, new Date());
    const contentAnalysis = this.analyzeContent(content);

    return this.calculateFromMetrics(
      {
        accountAgeDays,
        manualTrustLevel: user.manualTrustLevel,
      },
      contentAnalysis,
    );
  }

  /**
   * Calculate trust level from pre-calculated metrics (main calculation logic)
   */
  calculateFromMetrics(
    user: SimpleAuthor,
    contentMetrics: ContentAnalysisMetrics,
  ): TrustLevelResult {
    const now = new Date();
    const { accountAgeDays, manualTrustLevel } = user;

    // Check gates for each level (starting from highest)
    const gateResults = this.checkAllGates(accountAgeDays, contentMetrics);

    // Find highest level where all gates are passed
    const trustLevel = this.determineTrustLevel(gateResults, manualTrustLevel);
    const config = getTrustLevelConfig(trustLevel);

    // Calculate next level requirements
    const nextLevelReqs = this.getNextLevelRequirements(
      trustLevel,
      gateResults,
    );

    const metadata: TrustLevelMetadata = {
      accountAgeDays,
      cleanContentCount: contentMetrics.cleanContent,
      totalContentAnalyzed: contentMetrics.totalAnalyzed,
      violationRate: contentMetrics.violationRate,
      violationCount: contentMetrics.violations,
      isManualPromotion: manualTrustLevel === TrustLevel.TRUSTED,
      gatesPassed: gateResults[trustLevel],
      nextLevelRequirements: nextLevelReqs,
    };

    return {
      level: trustLevel,
      config,
      metadata,
      calculatedAt: now,
    };
  }

  /**
   * Analyze content in sliding window
   */
  private analyzeContent(content: StrictApiRequest[]): ContentAnalysisMetrics {
    // Sort by timestamp (newest first) and take recent window
    const sortedContent = [...content].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    const recentContent = sortedContent.slice(0, this.contentLookback);

    const violations = recentContent.filter((c) => c.flagged).length;
    const cleanContent = recentContent.length - violations;
    const violationRate =
      recentContent.length > 0
        ? Math.round((violations / recentContent.length) * 1000) / 10 // Round to 1 decimal
        : 0;

    return {
      totalAnalyzed: recentContent.length,
      violations,
      cleanContent,
      violationRate,
    };
  }

  /**
   * Check all gate requirements for each trust level
   */
  private checkAllGates(
    accountAgeDays: number,
    contentAnalysis: ContentAnalysisMetrics,
  ) {
    const results: Record<
      TrustLevel,
      { age: boolean; content: boolean; violations: boolean }
    > = {
      [TrustLevel.UNTRUSTED]: { age: true, content: true, violations: true },
      [TrustLevel.NEW]: { age: true, content: true, violations: true },
      [TrustLevel.BASIC]: { age: false, content: false, violations: false },
      [TrustLevel.MEMBER]: { age: false, content: false, violations: false },
      [TrustLevel.REGULAR]: { age: false, content: false, violations: false },
      [TrustLevel.TRUSTED]: { age: false, content: false, violations: false },
    };

    // Check each level's requirements
    for (const level of [
      TrustLevel.UNTRUSTED,
      TrustLevel.NEW,
      TrustLevel.BASIC,
      TrustLevel.MEMBER,
      TrustLevel.REGULAR,
      TrustLevel.TRUSTED,
    ]) {
      const gates = TRUST_LEVEL_GATES[level];

      results[level] = {
        age:
          accountAgeDays >= gates.minAgeDays &&
          accountAgeDays <= (gates.maxAgeDays ?? Infinity),
        content: contentAnalysis.cleanContent >= gates.minCleanContent,
        violations: contentAnalysis.violationRate <= gates.maxViolationRate,
      };
    }

    return results;
  }

  /**
   * Determine highest trust level where all gates are passed
   */
  private determineTrustLevel(
    gateResults: Record<
      TrustLevel,
      { age: boolean; content: boolean; violations: boolean }
    >,
    manualTrustLevel?: number | null,
  ): TrustLevel {
    // Check for manual trust level
    if (manualTrustLevel !== null && manualTrustLevel !== undefined) {
      return manualTrustLevel;
    }

    // Check levels from highest to lowest (excluding Trusted which requires manual promotion)
    for (const level of [
      TrustLevel.REGULAR,
      TrustLevel.MEMBER,
      TrustLevel.BASIC,
      TrustLevel.NEW,
    ]) {
      const gates = gateResults[level];
      if (gates.age && gates.content && gates.violations) {
        return level;
      }
    }

    return TrustLevel.UNTRUSTED;
  }

  /**
   * Calculate what's needed to reach the next trust level
   */
  private getNextLevelRequirements(
    currentLevel: TrustLevel,
    gateResults: Record<
      TrustLevel,
      { age: boolean; content: boolean; violations: boolean }
    >,
  ) {
    const nextLevel = currentLevel + 1;

    // Already at max level or manual promotion required
    if (nextLevel > TrustLevel.TRUSTED || nextLevel === TrustLevel.TRUSTED) {
      return nextLevel === TrustLevel.TRUSTED
        ? { requiresManualPromotion: true }
        : undefined;
    }

    const gates = TRUST_LEVEL_GATES[nextLevel as TrustLevel];
    const gateStatus = gateResults[nextLevel as TrustLevel];
    const requirements: any = {};

    if (!gateStatus.age) {
      requirements.ageDays = gates.minAgeDays;
    }
    if (!gateStatus.content) {
      requirements.cleanContent = gates.minCleanContent;
    }
    if (!gateStatus.violations) {
      requirements.maxViolationRate = gates.maxViolationRate;
    }

    return Object.keys(requirements).length > 0 ? requirements : undefined;
  }

  /**
   * Helper: Calculate days between two dates
   */
  private daysBetween(start: Date, end: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((end.getTime() - start.getTime()) / msPerDay);
  }
}

export * from './types';
