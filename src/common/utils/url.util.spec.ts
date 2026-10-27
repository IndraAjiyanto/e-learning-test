import { isValidHttpUrl, isMapsLocationUrl } from './url.util';

describe('url.util', () => {
  describe('isValidHttpUrl', () => {
    it('accepts valid http and https URLs', () => {
      expect(isValidHttpUrl('https://example.com')).toBe(true);
      expect(isValidHttpUrl('http://sub.domain.co.id/path?q=1')).toBe(true);
      expect(isValidHttpUrl('https://chat.whatsapp.com/invite/123')).toBe(true);
    });

    it('rejects invalid or malformed URLs', () => {
      expect(isValidHttpUrl('')).toBe(false);
      expect(isValidHttpUrl('   ')).toBe(false);
      expect(isValidHttpUrl('not-a-url')).toBe(false);
      expect(isValidHttpUrl('https:www.google.com')).toBe(false);
      expect(isValidHttpUrl('ftp://example.com')).toBe(false);
      expect(isValidHttpUrl('https://localhost')).toBe(false);
      expect(isValidHttpUrl('https://.com')).toBe(false);
      expect(isValidHttpUrl('https://com.')).toBe(false);
    });
  });

  describe('isMapsLocationUrl', () => {
    it('accepts Google Maps URLs', () => {
      expect(isMapsLocationUrl('https://maps.app.goo.gl/abcdef123')).toBe(true);
      expect(isMapsLocationUrl('https://goo.gl/maps/abcdef123')).toBe(true);
      expect(isMapsLocationUrl('https://maps.google.com/?q=loc')).toBe(true);
      expect(isMapsLocationUrl('https://maps.google.co.id/maps?q=loc')).toBe(
        true,
      );
      expect(isMapsLocationUrl('https://www.google.com/maps/place/test')).toBe(
        true,
      );
    });

    it('accepts OpenStreetMap, Waze, and Apple Maps URLs', () => {
      expect(
        isMapsLocationUrl('https://www.openstreetmap.org/#map=19/1/2'),
      ).toBe(true);
      expect(isMapsLocationUrl('https://osm.org/go/0Z~4_0--?m=')).toBe(true);
      expect(
        isMapsLocationUrl('https://waze.com/ul?ll=40.75889500%2C-73.98513100'),
      ).toBe(true);
      expect(
        isMapsLocationUrl('https://www.waze.com/live-map/directions'),
      ).toBe(true);
      expect(isMapsLocationUrl('https://maps.apple.com/?q=Cupertino')).toBe(
        true,
      );
    });

    it('rejects non-map URLs (e.g., YouTube, Instagram, WhatsApp, generic sites)', () => {
      expect(isMapsLocationUrl('https://www.youtube.com/watch?v=12345')).toBe(
        false,
      );
      expect(isMapsLocationUrl('https://youtu.be/8aBvuRwcbds')).toBe(false);
      expect(isMapsLocationUrl('https://chat.whatsapp.com/invite123')).toBe(
        false,
      );
      expect(isMapsLocationUrl('https://google.com/search?q=test')).toBe(false);
      expect(isMapsLocationUrl('https://example.com')).toBe(false);
      expect(isMapsLocationUrl('https://facebook.com')).toBe(false);
    });
  });
});
