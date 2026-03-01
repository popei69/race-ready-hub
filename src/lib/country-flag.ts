import {
  getNames,
  getAlpha2Code,
  registerLocale,
} from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

registerLocale(en);

const REGIONAL_INDICATOR_A = 0x1f1e6; // Unicode for 🇦

/**
 * Converts a 2-letter ISO 3166-1 alpha-2 code to the corresponding flag emoji
 * using Unicode regional indicator symbols.
 */
function codeToFlagEmoji(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2 || upper[0] < 'A' || upper[0] > 'Z' || upper[1] < 'A' || upper[1] > 'Z') {
    return '';
  }
  return String.fromCodePoint(
    REGIONAL_INDICATOR_A + upper.charCodeAt(0) - 65,
    REGIONAL_INDICATOR_A + upper.charCodeAt(1) - 65
  );
}

/**
 * Returns the flag emoji for the given country.
 * - If country is a 2-letter ISO alpha-2 code (e.g. "FR"), converts to flag emoji.
 * - Otherwise uses the country list to resolve country name → code, then code → emoji.
 * - Returns "" for empty, undefined, or unknown country.
 */
export function getCountryFlagEmoji(country: string | undefined): string {
  const trimmed = country?.trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (
    upper.length === 2 &&
    upper[0] >= 'A' &&
    upper[0] <= 'Z' &&
    upper[1] >= 'A' &&
    upper[1] <= 'Z'
  ) {
    const emoji = codeToFlagEmoji(upper);
    if (emoji) return emoji;
  }

  const code = getAlpha2Code(trimmed, 'en');
  if (code) return codeToFlagEmoji(code);
  return '';
}

/**
 * Returns the display string for a race: "[flag] - [name]" when country resolves
 * to a flag, otherwise just the race name.
 */
export function getRaceDisplayName(race: { name: string; country?: string }): string {
  const flag = getCountryFlagEmoji(race.country);
  return flag ? `${flag} - ${race.name}` : race.name;
}

export interface CountryOption {
  code: string;
  name: string;
}

/**
 * List of countries as { code, name } sorted by name, for use in dropdowns.
 */
export const COUNTRY_OPTIONS: CountryOption[] = (() => {
  const names = getNames('en', { select: 'official' }) as Record<string, string>;
  return Object.entries(names)
    .map(([code, name]) => ({ code, name: name as string }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

/**
 * Resolves a legacy country value (name or code) to an ISO alpha-2 code if possible.
 * Used to pre-select the dropdown when editing a race with free-text country.
 */
export function resolveCountryToCode(country: string | undefined): string | undefined {
  const trimmed = country?.trim();
  if (!trimmed) return undefined;
  const upper = trimmed.toUpperCase();
  if (
    upper.length === 2 &&
    upper[0] >= 'A' &&
    upper[0] <= 'Z' &&
    upper[1] >= 'A' &&
    upper[1] <= 'Z'
  ) {
    return upper;
  }
  return getAlpha2Code(trimmed, 'en') ?? undefined;
}

/**
 * Returns the full country name for display (e.g. "France" from "FR" or "France").
 * Returns undefined if country is empty or cannot be resolved.
 */
export function getCountryName(country: string | undefined): string | undefined {
  const code = resolveCountryToCode(country);
  if (!code) return undefined;
  const option = COUNTRY_OPTIONS.find((o) => o.code === code);
  return option?.name;
}

/**
 * Returns the location string for display: "[city], [countryName] [emoji]" or
 * "[countryName] [emoji]" when no city, or "[city]" when no country.
 * Returns "" when neither city nor country is set.
 */
export function getLocationDisplay(race: {
  city?: string;
  country?: string;
}): string {
  const city = race.city?.trim();
  const countryName = getCountryName(race.country);
  const emoji = getCountryFlagEmoji(race.country);
  const countryPart = countryName ? `${countryName}${emoji ? ` ${emoji}` : ''}` : '';
  const parts = [city, countryPart].filter(Boolean);
  return parts.join(', ');
}
