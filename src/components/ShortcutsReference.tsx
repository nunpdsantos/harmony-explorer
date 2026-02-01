import React from 'react';
import { Modal } from './ui';
import { useStore } from '../state/store';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Playback',
    shortcuts: [
      { keys: 'Space', description: 'Play / Stop' },
      { keys: 'L', description: 'Toggle loop' },
      { keys: 'V', description: 'Toggle voice leading overlay' },
      { keys: 'B', description: 'Toggle bridge chord suggestions' },
      { keys: '[', description: 'Decrease BPM by 5' },
      { keys: ']', description: 'Increase BPM by 5' },
    ],
  },
  {
    title: 'Chords (Explore mode)',
    shortcuts: [
      { keys: '1-7', description: 'Add diatonic chord (I through vii\u00B0)' },
      { keys: 'Backspace', description: 'Remove last chord' },
      { keys: '\u2318/Ctrl+Z', description: 'Undo progression change' },
      { keys: '\u2318/Ctrl+Shift+Z', description: 'Redo progression change' },
      { keys: 'Escape', description: 'Deselect chord' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'E', description: 'Switch to Explore mode' },
      { keys: 'N', description: 'Switch to Learn mode' },
      { keys: '\u2190 / \u2192', description: 'Previous / Next lesson (Learn mode)' },
      { keys: '?', description: 'Toggle this shortcuts reference' },
      { keys: '\\', description: 'Toggle sidebar collapse' },
    ],
  },
];

export const ShortcutsReference: React.FC = () => {
  const { showShortcutsModal, setShowShortcutsModal } = useStore();

  return (
    <Modal
      open={showShortcutsModal}
      title="Keyboard Shortcuts"
      onClose={() => setShowShortcutsModal(false)}
    >
      <div className="space-y-4 min-w-[280px]">
        {SHORTCUT_GROUPS.map(group => (
          <div key={group.title}>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.shortcuts.map(shortcut => (
                <div key={shortcut.keys} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-white/70">{shortcut.description}</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-white/60 font-mono whitespace-nowrap">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
