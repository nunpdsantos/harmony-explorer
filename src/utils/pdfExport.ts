import type { Chord } from '../core/chords';
import { chordName, chordPitchClasses } from '../core/chords';
import { noteName } from '../core/constants';
import { getDiatonicInfo } from '../core/harmony';
import { voiceProgression } from '../audio/voicingEngine';
import { analyzeVoiceLeading, smoothnessRating } from '../core/progressionTemplates';

/**
 * Generate a printable HTML analysis report for a chord progression
 * and open it in a new window for the user to print / save as PDF.
 */
export function exportProgressionAsPdf(
  chords: Chord[],
  keyRoot: number,
  title?: string,
): void {
  if (chords.length === 0) return;

  const keyName = noteName(keyRoot);
  const reportTitle = title || 'Progression Analysis';

  // Compute voicings and voice leading
  const voicings = chords.length >= 2 ? voiceProgression(chords) : [];
  const vlAnalysis = voicings.length >= 2 ? analyzeVoiceLeading(voicings) : null;
  const vlRating = vlAnalysis ? smoothnessRating(vlAnalysis.averageMovement) : null;

  // Build chord rows
  const chordRows = chords.map((c, i) => {
    const info = getDiatonicInfo(c, keyRoot);
    const pcs = chordPitchClasses(c).map(pc => noteName(pc)).join(', ');
    return {
      index: i + 1,
      name: chordName(c),
      roman: info?.roman ?? '-',
      fn: info?.function ?? 'chromatic',
      notes: pcs,
    };
  });

  // Build transition rows
  const transitionRows = vlAnalysis
    ? vlAnalysis.transitions.map((t, i) => ({
        from: chordName(chords[i]),
        to: chordName(chords[i + 1]),
        movement: t.movement,
        rating: smoothnessRating(t.movement),
      }))
    : [];

  const html = buildReportHtml({
    reportTitle,
    keyName,
    chordCount: chords.length,
    chordRows,
    transitionRows,
    totalMovement: vlAnalysis?.totalMovement ?? 0,
    avgMovement: vlAnalysis?.averageMovement ?? 0,
    overallRating: vlRating,
  });

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();

  // Auto-trigger print after content renders
  win.onload = () => {
    win.print();
  };
}

interface ReportData {
  reportTitle: string;
  keyName: string;
  chordCount: number;
  chordRows: { index: number; name: string; roman: string; fn: string; notes: string }[];
  transitionRows: { from: string; to: string; movement: number; rating: string }[];
  totalMovement: number;
  avgMovement: number;
  overallRating: string | null;
}

function buildReportHtml(data: ReportData): string {
  const fnBadge = (fn: string) => {
    const colors: Record<string, string> = {
      tonic: '#22c55e',
      subdominant: '#3b82f6',
      dominant: '#ef4444',
      chromatic: '#9ca3af',
    };
    const color = colors[fn] ?? colors.chromatic;
    return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;color:white;background:${color}">${fn}</span>`;
  };

  const ratingBadge = (rating: string) => {
    const colors: Record<string, string> = {
      smooth: '#22c55e',
      moderate: '#f59e0b',
      angular: '#ef4444',
    };
    const color = colors[rating] ?? '#9ca3af';
    return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;color:white;background:${color}">${rating}</span>`;
  };

  const chordTableRows = data.chordRows
    .map(r => `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${r.index}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${r.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-style:italic">${r.roman}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${fnBadge(r.fn)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${r.notes}</td>
    </tr>`)
    .join('\n');

  const transitionTableRows = data.transitionRows
    .map(r => `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${r.from}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#9ca3af">&rarr;</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:500">${r.to}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${r.movement} st</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${ratingBadge(r.rating)}</td>
    </tr>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${data.reportTitle} - Harmony Explorer</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    line-height: 1.5;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; }
  .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
  th { padding: 8px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #d1d5db; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .summary-card { padding: 12px 16px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb; }
  .summary-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; }
  .summary-card .value { font-size: 20px; font-weight: 700; margin-top: 2px; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  .chord-sequence { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .chord-chip { padding: 6px 12px; border-radius: 6px; background: #f3f4f6; font-weight: 600; font-size: 14px; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <h1>${data.reportTitle}</h1>
  <div class="meta">Key of ${data.keyName} major &middot; ${data.chordCount} chord${data.chordCount !== 1 ? 's' : ''} &middot; Generated by Harmony Explorer</div>

  <div class="chord-sequence">
    ${data.chordRows.map(r => `<div class="chord-chip">${r.name}</div>`).join('\n    ')}
  </div>

  ${data.overallRating ? `
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Voice Leading</div>
      <div class="value">${data.overallRating}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Movement</div>
      <div class="value">${data.totalMovement} st</div>
    </div>
    <div class="summary-card">
      <div class="label">Avg. per Transition</div>
      <div class="value">${data.avgMovement.toFixed(1)} st</div>
    </div>
  </div>
  ` : ''}

  <h2>Chord Analysis</h2>
  <table>
    <thead>
      <tr>
        <th style="text-align:center">#</th>
        <th>Chord</th>
        <th style="text-align:center">Roman</th>
        <th>Function</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${chordTableRows}
    </tbody>
  </table>

  ${data.transitionRows.length > 0 ? `
  <h2>Voice Leading Transitions</h2>
  <table>
    <thead>
      <tr>
        <th>From</th>
        <th></th>
        <th>To</th>
        <th style="text-align:center">Movement</th>
        <th>Quality</th>
      </tr>
    </thead>
    <tbody>
      ${transitionTableRows}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    Harmony Explorer &middot; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
}
