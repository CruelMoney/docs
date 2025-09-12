import {
  ContentAnalysisMetrics,
  SimpleAuthor,
  TrustLevel,
  TrustLevelCalculator,
} from '../index';

describe('TrustLevelCalculator', () => {
  let calculator: TrustLevelCalculator;

  beforeEach(() => {
    calculator = new TrustLevelCalculator();
  });

  const createSimpleAuthor = (options: {
    accountAgeDays: number;
    manualTrustLevel?: number | null;
  }): SimpleAuthor => ({
    accountAgeDays: options.accountAgeDays,
    manualTrustLevel: options.manualTrustLevel,
  });

  const createContentMetrics = (options: {
    cleanContent: number;
    violations: number;
    violationRate?: number;
  }): ContentAnalysisMetrics => {
    const totalAnalyzed = options.cleanContent + options.violations;
    const violationRate =
      options.violationRate ??
      (totalAnalyzed > 0
        ? Math.round((options.violations / totalAnalyzed) * 1000) / 10
        : 0);

    return {
      totalAnalyzed,
      violations: options.violations,
      cleanContent: options.cleanContent,
      violationRate,
    };
  };

  describe('Violation rate > 5% always results in UNTRUSTED level', () => {
    it('should restrict user with 10% violation rate regardless of account age', () => {
      const oldUser = createSimpleAuthor({ accountAgeDays: 365 });
      const highViolationMetrics = createContentMetrics({
        cleanContent: 90,
        violations: 10,
        violationRate: 10.0,
      });

      const result = calculator.calculateFromMetrics(
        oldUser,
        highViolationMetrics,
      );

      expect(result.level).toBe(TrustLevel.UNTRUSTED);
      expect(result.metadata.violationRate).toBe(10.0);
    });

    it('should restrict user with 6% violation rate even if they have enough clean content', () => {
      const memberAgeUser = createSimpleAuthor({ accountAgeDays: 90 });
      const slightlyHighViolationMetrics = createContentMetrics({
        cleanContent: 94,
        violations: 6,
        violationRate: 6.0,
      });

      const result = calculator.calculateFromMetrics(
        memberAgeUser,
        slightlyHighViolationMetrics,
      );

      expect(result.level).toBe(TrustLevel.UNTRUSTED);
      expect(result.metadata.violationRate).toBe(6.0);
      expect(result.metadata.cleanContentCount).toBe(94);
    });

    it('should restrict new user with high violation rate', () => {
      const newUser = createSimpleAuthor({ accountAgeDays: 1 });
      const veryHighViolationMetrics = createContentMetrics({
        cleanContent: 2,
        violations: 8,
        violationRate: 80.0,
      });

      const result = calculator.calculateFromMetrics(
        newUser,
        veryHighViolationMetrics,
      );

      expect(result.level).toBe(TrustLevel.UNTRUSTED);
      expect(result.metadata.violationRate).toBe(80.0);
    });

    it('should restrict user with exactly 5.1% violation rate', () => {
      const user = createSimpleAuthor({ accountAgeDays: 100 });
      const justOverLimitMetrics = createContentMetrics({
        cleanContent: 95,
        violations: 5,
        violationRate: 5.1,
      });

      const result = calculator.calculateFromMetrics(
        user,
        justOverLimitMetrics,
      );

      expect(result.level).toBe(TrustLevel.UNTRUSTED);
      expect(result.metadata.violationRate).toBe(5.1);
    });
  });

  describe('Authors never go to new user level unless actually new', () => {
    it('should not assign NEW level to 1-week-old author with clean record', () => {
      const weekOldUser = createSimpleAuthor({ accountAgeDays: 7 });
      const cleanMetrics = createContentMetrics({
        cleanContent: 15,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(weekOldUser, cleanMetrics);

      expect(result.level).toBe(TrustLevel.BASIC);
      expect(result.metadata.accountAgeDays).toBe(7);
      expect(result.metadata.cleanContentCount).toBe(15);
    });

    it('should not assign NEW level to month-old author', () => {
      const monthOldUser = createSimpleAuthor({ accountAgeDays: 30 });
      const sufficientContentMetrics = createContentMetrics({
        cleanContent: 25,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        monthOldUser,
        sufficientContentMetrics,
      );

      expect(result.level).toBe(TrustLevel.MEMBER);
      expect(result.metadata.accountAgeDays).toBe(30);
    });

    it('should assign NEW level to month-old author with no content', () => {
      const monthOldUser = createSimpleAuthor({ accountAgeDays: 30 });
      const sufficientContentMetrics = createContentMetrics({
        cleanContent: 0,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        monthOldUser,
        sufficientContentMetrics,
      );

      expect(result.level).toBe(TrustLevel.NEW);
      expect(result.metadata.accountAgeDays).toBe(30);
    });

    it('should assign NEW level only to genuinely new authors', () => {
      const brandNewUser = createSimpleAuthor({ accountAgeDays: 1 });
      const limitedContentMetrics = createContentMetrics({
        cleanContent: 5,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        brandNewUser,
        limitedContentMetrics,
      );

      expect(result.level).toBe(TrustLevel.NEW);
      expect(result.metadata.accountAgeDays).toBe(1);
    });

    it('should assign NEW level only to new authors regardless of content', () => {
      const brandNewUser = createSimpleAuthor({ accountAgeDays: 1 });
      const limitedContentMetrics = createContentMetrics({
        cleanContent: 50,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        brandNewUser,
        limitedContentMetrics,
      );

      expect(result.level).toBe(TrustLevel.NEW);
      expect(result.metadata.accountAgeDays).toBe(1);
    });
  });

  describe('Progression through trust levels', () => {
    it('should progress from NEW to BASIC with sufficient age and content', () => {
      const basicEligibleUser = createSimpleAuthor({ accountAgeDays: 10 });
      const basicEligibleMetrics = createContentMetrics({
        cleanContent: 15,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        basicEligibleUser,
        basicEligibleMetrics,
      );

      expect(result.level).toBe(TrustLevel.BASIC);
      expect(result.metadata.accountAgeDays).toBeGreaterThanOrEqual(7);
      expect(result.metadata.cleanContentCount).toBeGreaterThanOrEqual(10);
      expect(result.metadata.violationRate).toBeLessThanOrEqual(5);
    });

    it('should progress from BASIC to MEMBER with 30+ days and 25+ clean content', () => {
      const memberEligibleUser = createSimpleAuthor({ accountAgeDays: 35 });
      const memberEligibleMetrics = createContentMetrics({
        cleanContent: 30,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        memberEligibleUser,
        memberEligibleMetrics,
      );

      expect(result.level).toBe(TrustLevel.MEMBER);
      expect(result.metadata.accountAgeDays).toBeGreaterThanOrEqual(30);
      expect(result.metadata.cleanContentCount).toBeGreaterThanOrEqual(25);
    });

    it('should progress from MEMBER to REGULAR with 90+ days and 50+ clean content', () => {
      const regularEligibleUser = createSimpleAuthor({ accountAgeDays: 100 });
      const regularEligibleMetrics = createContentMetrics({
        cleanContent: 60,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        regularEligibleUser,
        regularEligibleMetrics,
      );

      expect(result.level).toBe(TrustLevel.REGULAR);
      expect(result.metadata.accountAgeDays).toBeGreaterThanOrEqual(90);
      expect(result.metadata.cleanContentCount).toBeGreaterThanOrEqual(50);
    });

    it('should require manual promotion for TRUSTED level', () => {
      const regularEligibleUser = createSimpleAuthor({
        accountAgeDays: 200,
        manualTrustLevel: null,
      });
      const excellentMetrics = createContentMetrics({
        cleanContent: 100,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        regularEligibleUser,
        excellentMetrics,
      );

      expect(result.level).toBe(TrustLevel.REGULAR);
      expect(
        result.metadata.nextLevelRequirements?.requiresManualPromotion,
      ).toBe(true);
    });

    it('should assign TRUSTED level with manual promotion', () => {
      const trustedUser = createSimpleAuthor({
        accountAgeDays: 200,
        manualTrustLevel: TrustLevel.TRUSTED,
      });
      const excellentMetrics = createContentMetrics({
        cleanContent: 100,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        trustedUser,
        excellentMetrics,
      );

      expect(result.level).toBe(TrustLevel.TRUSTED);
      expect(result.metadata.isManualPromotion).toBe(true);
    });

    it('should STILL assign TRUSTED level if manual promotion but insufficient base requirements', () => {
      const manuallyPromotedButInsufficientUser = createSimpleAuthor({
        accountAgeDays: 200,
        manualTrustLevel: TrustLevel.TRUSTED,
      });
      const highViolationMetrics = createContentMetrics({
        cleanContent: 40,
        violations: 10,
        violationRate: 20.0,
      });

      const result = calculator.calculateFromMetrics(
        manuallyPromotedButInsufficientUser,
        highViolationMetrics,
      );

      expect(result.level).toBe(TrustLevel.TRUSTED);
      expect(result.metadata.violationRate).toBe(20.0);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle user with no content', () => {
      const userWithNoContent = createSimpleAuthor({ accountAgeDays: 10 });
      const noContentMetrics = createContentMetrics({
        cleanContent: 0,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(
        userWithNoContent,
        noContentMetrics,
      );

      expect(result.level).toBe(TrustLevel.NEW);
      expect(result.metadata.cleanContentCount).toBe(0);
      expect(result.metadata.violationRate).toBe(0);
    });

    it('should handle exactly 5% violation rate (boundary)', () => {
      const user = createSimpleAuthor({ accountAgeDays: 50 });
      const exactBoundaryMetrics = createContentMetrics({
        cleanContent: 95,
        violations: 5,
        violationRate: 5.0,
      });

      const result = calculator.calculateFromMetrics(
        user,
        exactBoundaryMetrics,
      );

      expect(result.level).toBe(TrustLevel.MEMBER);
      expect(result.metadata.violationRate).toBe(5.0);
    });

    it('should handle exactly minimum requirements for each level', () => {
      // Test BASIC minimum requirements
      const basicMinUser = createSimpleAuthor({ accountAgeDays: 7 });
      const basicMinMetrics = createContentMetrics({
        cleanContent: 10,
        violations: 0,
      });

      const basicResult = calculator.calculateFromMetrics(
        basicMinUser,
        basicMinMetrics,
      );
      expect(basicResult.level).toBe(TrustLevel.BASIC);

      // Test MEMBER minimum requirements
      const memberMinUser = createSimpleAuthor({ accountAgeDays: 30 });
      const memberMinMetrics = createContentMetrics({
        cleanContent: 25,
        violations: 0,
      });

      const memberResult = calculator.calculateFromMetrics(
        memberMinUser,
        memberMinMetrics,
      );
      expect(memberResult.level).toBe(TrustLevel.MEMBER);
    });

    it('should calculate next level requirements correctly', () => {
      const newUser = createSimpleAuthor({ accountAgeDays: 3 });
      const limitedMetrics = createContentMetrics({
        cleanContent: 2,
        violations: 0,
      });

      const result = calculator.calculateFromMetrics(newUser, limitedMetrics);

      expect(result.level).toBe(TrustLevel.NEW);
      expect(result.metadata.nextLevelRequirements).toEqual({
        ageDays: 7,
        cleanContent: 5,
      });
    });

    it('should handle mixed violation scenarios correctly', () => {
      const user = createSimpleAuthor({ accountAgeDays: 90 });
      const mixedMetrics = createContentMetrics({
        cleanContent: 48,
        violations: 2,
        violationRate: 4.0, // Just under 5%
      });

      const result = calculator.calculateFromMetrics(user, mixedMetrics);

      expect(result.level).toBe(TrustLevel.MEMBER); // Should not be UNTRUSTED
      expect(result.metadata.violationRate).toBe(4.0);
      expect(result.metadata.cleanContentCount).toBe(48);
    });
  });
});
