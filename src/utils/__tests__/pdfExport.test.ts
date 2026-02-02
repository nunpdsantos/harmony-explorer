import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportProgressionAsPdf } from '../pdfExport';
import type { Chord } from '../../core/chords';

describe('PDF Export', () => {
  const cMajor: Chord = { root: 0, quality: 'major' };
  const fMajor: Chord = { root: 5, quality: 'major' };
  const gDom7: Chord = { root: 7, quality: 'dom7' };

  let mockWindow: {
    document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };
    onload: (() => void) | null;
    print: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWindow = {
      document: { write: vi.fn(), close: vi.fn() },
      onload: null,
      print: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);
  });

  it('does nothing for empty progression', () => {
    exportProgressionAsPdf([], 0);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens a new window', () => {
    exportProgressionAsPdf([cMajor], 0);
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });

  it('writes HTML to the new window', () => {
    exportProgressionAsPdf([cMajor], 0);
    expect(mockWindow.document.write).toHaveBeenCalledTimes(1);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('closes the document after writing', () => {
    exportProgressionAsPdf([cMajor], 0);
    expect(mockWindow.document.close).toHaveBeenCalledTimes(1);
  });

  it('sets onload handler for print', () => {
    exportProgressionAsPdf([cMajor], 0);
    expect(mockWindow.onload).toBeInstanceOf(Function);
  });

  it('calls print when onload fires', () => {
    exportProgressionAsPdf([cMajor], 0);
    mockWindow.onload?.();
    expect(mockWindow.print).toHaveBeenCalledTimes(1);
  });

  it('includes key name in the report', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('C major');
  });

  it('includes different key names', () => {
    exportProgressionAsPdf([cMajor], 7);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('G major');
  });

  it('includes chord names in the report', () => {
    exportProgressionAsPdf([cMajor, fMajor, gDom7], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('>C<');
    expect(html).toContain('>F<');
    expect(html).toContain('>G7<');
  });

  it('includes roman numerals for diatonic chords', () => {
    exportProgressionAsPdf([cMajor, gDom7], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    // I for C major in key of C
    expect(html).toContain('>I<');
  });

  it('includes tonal function labels', () => {
    const gMajor: Chord = { root: 7, quality: 'major' };
    exportProgressionAsPdf([cMajor, gMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('tonic');
    expect(html).toContain('dominant');
  });

  it('includes voice leading analysis for 2+ chords', () => {
    exportProgressionAsPdf([cMajor, fMajor, gDom7], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Voice Leading');
    expect(html).toContain('Total Movement');
  });

  it('does not include voice leading summary for single chord', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    // Summary cards with actual data only appear when there's voice leading analysis
    expect(html).not.toContain('Total Movement');
    expect(html).not.toContain('Avg. per Transition');
  });

  it('uses custom title when provided', () => {
    exportProgressionAsPdf([cMajor], 0, 'My Song');
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('My Song');
  });

  it('uses default title when none provided', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Progression Analysis');
  });

  it('handles non-diatonic chords gracefully', () => {
    const dbMajor: Chord = { root: 1, quality: 'major' };
    exportProgressionAsPdf([cMajor, dbMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('chromatic');
  });

  it('handles window.open returning null', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    expect(() => exportProgressionAsPdf([cMajor], 0)).not.toThrow();
  });

  it('includes Harmony Explorer branding', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Harmony Explorer');
  });

  it('includes chord count in metadata', () => {
    exportProgressionAsPdf([cMajor, fMajor, gDom7], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('3 chords');
  });

  it('uses singular for single chord', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('1 chord');
    // Should not say "1 chords"
    expect(html).not.toContain('1 chords');
  });

  it('includes print media query styles', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('@media print');
  });

  it('includes note names for each chord', () => {
    exportProgressionAsPdf([cMajor], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    // C major = C, E, G
    expect(html).toContain('C, E, G');
  });

  it('includes transition details for multi-chord progressions', () => {
    exportProgressionAsPdf([cMajor, fMajor, gDom7], 0);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Voice Leading Transitions');
    expect(html).toContain('&rarr;');
  });
});
