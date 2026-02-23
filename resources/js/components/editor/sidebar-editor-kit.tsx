import { TrailingBlockPlugin } from 'platejs';

import { AutoformatKit } from './plugins/autoformat-kit';
import { BasicBlocksKit } from './plugins/basic-blocks-kit';
import { BasicMarksKit } from './plugins/basic-marks-kit';
import { CodeBlockKit } from './plugins/code-block-kit';
import { CursorOverlayKit } from './plugins/cursor-overlay-kit';
import { ExitBreakKit } from './plugins/exit-break-kit';
import { FontKit } from './plugins/font-kit';
import { LinkKit } from './plugins/link-kit';
import { ListKit } from './plugins/list-kit';
import { MediaKit } from './plugins/media-kit';
import { SidebarFixedToolbarKit } from './plugins/sidebar-fixed-toolbar-kit';
import { TableKit } from './plugins/table-kit';

export const SidebarEditorKit = [
    // Elements
    ...BasicBlocksKit,
    ...CodeBlockKit,
    ...TableKit,
    ...MediaKit,
    ...LinkKit,

    // Marks
    ...BasicMarksKit,
    ...FontKit,

    // Block Style
    ...ListKit,

    // Editing
    ...AutoformatKit,
    ...CursorOverlayKit,
    ...ExitBreakKit,
    TrailingBlockPlugin,

    // UI
    ...SidebarFixedToolbarKit,
];
