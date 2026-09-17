export const activityKeys = {
  all: ['activities'] as const,
  byDivision: (divisionId: number) =>
    [...activityKeys.all, divisionId] as const,
};
