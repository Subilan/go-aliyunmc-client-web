export const UserPreferenceKeys = ['participate_in_play_time_ranking'] as const;
export type UserPreferenceKey = (typeof UserPreferenceKeys)[number];
export type UserPreferences = Partial<Record<UserPreferenceKey, string>>;
