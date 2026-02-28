import { describe, it, expect } from 'vitest';
import {
  getCountryFlagEmoji,
  getRaceDisplayName,
  COUNTRY_OPTIONS,
  resolveCountryToCode,
} from './country-flag';

describe('country-flag', () => {
  describe('getCountryFlagEmoji', () => {
    it('returns empty string for undefined', () => {
      expect(getCountryFlagEmoji(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(getCountryFlagEmoji('')).toBe('');
    });

    it('returns flag emoji for ISO alpha-2 code FR', () => {
      const result = getCountryFlagEmoji('FR');
      expect(result).toBe('🇫🇷');
    });

    it('returns flag emoji for ISO alpha-2 code US', () => {
      const result = getCountryFlagEmoji('US');
      expect(result).toBe('🇺🇸');
    });

    it('returns same emoji for country name "France" as for "FR"', () => {
      const byCode = getCountryFlagEmoji('FR');
      const byName = getCountryFlagEmoji('France');
      expect(byName).toBe(byCode);
      expect(byName).toBe('🇫🇷');
    });

    it('returns empty string for unknown country name', () => {
      expect(getCountryFlagEmoji('UnknownCountryXYZ')).toBe('');
    });

    it('returns empty string for single character (not valid alpha-2)', () => {
      expect(getCountryFlagEmoji('A')).toBe('');
    });

    it('returns flag emoji for codes where first letter is Z (e.g. ZW)', () => {
      const result = getCountryFlagEmoji('ZW');
      expect(result).toBe('🇿🇼');
    });
  });

  describe('getRaceDisplayName', () => {
    it('returns "[emoji] - [name]" when country yields emoji', () => {
      expect(
        getRaceDisplayName({ name: 'Paris Marathon', country: 'FR' })
      ).toBe('🇫🇷 - Paris Marathon');
    });

    it('returns only name when no country', () => {
      expect(getRaceDisplayName({ name: 'Local 10K' })).toBe('Local 10K');
    });

    it('returns only name when country is empty', () => {
      expect(getRaceDisplayName({ name: 'Local 10K', country: '' })).toBe('Local 10K');
    });

    it('returns only name when country is unknown', () => {
      expect(
        getRaceDisplayName({ name: 'Some Race', country: 'UnknownXYZ' })
      ).toBe('Some Race');
    });
  });

  describe('COUNTRY_OPTIONS', () => {
    it('is non-empty and sorted by name', () => {
      expect(COUNTRY_OPTIONS.length).toBeGreaterThan(0);
      for (let i = 1; i < COUNTRY_OPTIONS.length; i++) {
        expect(
          COUNTRY_OPTIONS[i].name.localeCompare(COUNTRY_OPTIONS[i - 1].name)
        ).toBeGreaterThanOrEqual(0);
      }
    });

    it('has code and name for each option', () => {
      COUNTRY_OPTIONS.forEach((opt) => {
        expect(opt.code).toMatch(/^[A-Z]{2}$/);
        expect(typeof opt.name).toBe('string');
        expect(opt.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('resolveCountryToCode', () => {
    it('returns code for alpha-2 input', () => {
      expect(resolveCountryToCode('FR')).toBe('FR');
      expect(resolveCountryToCode('fr')).toBe('FR');
    });

    it('returns code for country name', () => {
      expect(resolveCountryToCode('France')).toBe('FR');
    });

    it('returns undefined for empty or unknown', () => {
      expect(resolveCountryToCode(undefined)).toBeUndefined();
      expect(resolveCountryToCode('')).toBeUndefined();
      expect(resolveCountryToCode('UnknownXYZ')).toBeUndefined();
    });
  });
});
