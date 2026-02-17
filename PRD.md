# Planning Guide

An interactive canvas-based presentation application designed specifically for IT training sessions, enabling instructors to draw, write, and present technical concepts across multiple subjects with persistent storage and backup capabilities.

**Experience Qualities**: 
1. **Intuitive** - Large, clearly labeled controls with tooltips make every tool immediately discoverable and usable without training
2. **Responsive** - Instant visual feedback for every interaction with smooth drawing, auto-save notifications, and clear tool state indicators
3. **Professional** - Clean, high-contrast interface optimized for screen sharing in Teams/Zoom with distinctive subject organization

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a full-featured drawing and presentation application with multiple canvases, comprehensive tool palette, undo/redo system, persistent storage, import/export, keyboard shortcuts, and multi-tab subject management.

## Essential Features

**Multi-Subject Canvas System**
- Functionality: Separate canvas workspaces for FISI, Azure, AWS, Linux, with ability to add more subjects
- Purpose: Organize training materials by topic for structured learning sessions
- Trigger: User clicks subject tab in sidebar/bottom bar
- Progression: Click tab → Canvas switches → Previous work auto-saved → New canvas loads with saved content
- Success criteria: Each subject maintains independent canvas state, switching is instant, no data loss

**Drawing Tools**
- Functionality: Freehand drawing with mouse, various pen widths, color selection, eraser
- Purpose: Enable natural expression of technical concepts through sketches and diagrams
- Trigger: Select pen tool, choose color/width, draw on canvas
- Progression: Select tool → Choose settings → Click/drag on canvas → Real-time drawing appears → Release to complete
- Success criteria: Smooth drawing at 60fps, no lag, accurate cursor tracking, pen settings persist

**Shape Tools**
- Functionality: Rectangle, circle, line, arrow drawing with preview
- Purpose: Create structured diagrams, network topology maps, cloud architecture diagrams
- Trigger: Click shape tool button
- Progression: Select shape → Click start point → Drag to size → Preview shows → Release to finalize → Shape added to canvas
- Success criteria: Perfect geometric shapes, live preview, consistent styling with pen settings

**Text Tool**
- Functionality: Click-to-place text fields with font size, family, and color options
- Purpose: Add labels, annotations, code snippets, and explanations to visual concepts
- Trigger: Click text tool, then click canvas location
- Progression: Select text tool → Click canvas → Text input appears → Type content → Click outside to finalize → Text becomes drawable object
- Success criteria: Text is crisp and readable, supports multiple fonts/sizes, integrates with undo system

**Selection and Manipulation**
- Functionality: Select objects to move, delete, or copy with selection tool
- Purpose: Reorganize canvas content and correct mistakes without redrawing
- Trigger: Click selection tool, then click/drag to select objects
- Progression: Select tool → Click object or drag selection box → Object highlights → Drag to move / Press Delete to remove / Ctrl+C to copy
- Success criteria: Accurate hit detection, visual selection feedback, smooth dragging, multi-select with box

**Undo/Redo System**
- Functionality: Complete history tracking with Ctrl+Z/Ctrl+Y or toolbar buttons
- Purpose: Encourage experimentation without fear of mistakes
- Trigger: Ctrl+Z, Ctrl+Y, or toolbar buttons
- Progression: User draws/edits → Action added to history → Ctrl+Z pressed → Last action removed → Canvas reverts → Ctrl+Y restores
- Success criteria: Every canvas action is tracked, history persists per subject, no limit on undo depth

**Auto-Save System**
- Functionality: Automatic saving every 30 seconds to localStorage with visual indicator
- Purpose: Prevent data loss during long training sessions
- Trigger: 30 second timer or manual Ctrl+S
- Progression: Timer expires → Canvas serialized to JSON → Saved to localStorage → Toast notification "Auto-saved" → Timer resets
- Success criteria: Reliable saving, user notified of saves, no performance impact, save survives browser refresh

**Export/Import**
- Functionality: Download canvas data as JSON file, import from JSON file
- Purpose: Backup presentations to GitHub or share with other instructors
- Trigger: Click Export or Import button in menu
- Progression: Export: Click button → JSON generated → File downloads → "Exported successfully" toast | Import: Click button → File picker opens → Select JSON → Canvas loads → "Imported successfully" toast
- Success criteria: Complete canvas state exported (all subjects), valid JSON format, import restores exactly, file naming includes timestamp

**Presentation List**
- Functionality: View and manage all saved presentations with thumbnail previews
- Purpose: Quick access to previous training sessions
- Trigger: Click "Presentations" button in toolbar
- Progression: Click button → Dialog opens → List shows all saved canvases by subject → Click to load → Canvas switches → Dialog closes
- Success criteria: All subjects listed, clear labels, delete option, sorted by last modified

**Keyboard Shortcuts**
- Functionality: Ctrl+Z/Y (undo/redo), Ctrl+S (save), Ctrl+C/V (copy/paste), Delete (remove), Ctrl+A (select all)
- Purpose: Accelerate workflow for power users during live teaching
- Trigger: Press keyboard combination
- Progression: Shortcut pressed → Action executes immediately → Visual feedback confirms
- Success criteria: All shortcuts work reliably, don't conflict with browser, documented in help tooltip

**Theme Toggle**
- Functionality: Switch between light and dark mode
- Purpose: Adapt to different screen sharing scenarios and reduce eye strain
- Trigger: Click theme toggle button
- Progression: Click button → Theme switches → All colors invert → Canvas content remains unchanged → Preference saved
- Success criteria: High contrast in both modes, smooth transition, preference persists, no canvas content affected

## Edge Case Handling

- **Empty Canvas State**: Show welcome message with quick start guide when canvas is blank
- **Large File Import**: Display loading spinner and validate JSON structure before importing
- **Storage Quota Exceeded**: Notify user and prompt to export/delete old presentations
- **Invalid JSON Import**: Show error message with details, don't crash application
- **Rapid Drawing**: Throttle canvas updates to maintain 60fps, queue overflow actions
- **Browser Refresh Mid-Draw**: Auto-save ensures recovery, show "Restored from auto-save" message
- **Unsupported Browser**: Detect Canvas API support, show fallback message if unavailable

## Design Direction

The design should evoke precision, clarity, and efficiency - like a professional whiteboard software meets technical documentation tools. High contrast for excellent visibility during screen sharing, with bold tool indicators and generous spacing for easy mouse targeting during live presentations.

## Color Selection

The color scheme creates a technical, focused environment optimized for readability during video calls, with vibrant accent colors that remain visible when compressed by streaming codecs.

- **Primary Color**: Deep Tech Blue `oklch(0.45 0.15 250)` - Communicates professionalism and technical expertise, used for primary actions and active tool states
- **Secondary Colors**: 
  - Canvas Background (Light): `oklch(0.98 0 0)` - Near-white for maximum contrast with drawings
  - Canvas Background (Dark): `oklch(0.18 0 0)` - Dark slate that doesn't cause eye strain
  - Toolbar Background: `oklch(0.25 0.02 250)` - Subtle blue-tinted dark surface
- **Accent Color**: Electric Cyan `oklch(0.7 0.2 200)` - High-visibility color for active tools, selected items, and important notifications
- **Foreground/Background Pairings**: 
  - Primary Button (Deep Tech Blue): White text `oklch(1 0 0)` - Ratio 9.2:1 ✓
  - Canvas Light (Near White): Dark text `oklch(0.2 0 0)` - Ratio 15.8:1 ✓
  - Canvas Dark (Dark Slate): White text `oklch(1 0 0)` - Ratio 11.3:1 ✓
  - Accent (Electric Cyan): Dark text `oklch(0.2 0 0)` - Ratio 6.7:1 ✓

## Font Selection

Typography should be highly legible at all sizes, work well for both UI labels and canvas text, with a technical aesthetic that matches IT training context.

- **Typographic Hierarchy**: 
  - H1 (App Title): IBM Plex Sans Bold/24px/tight tracking
  - H2 (Tab Labels): IBM Plex Sans Medium/16px/normal tracking
  - Body (Tooltips, Menus): IBM Plex Sans Regular/14px/relaxed line-height
  - Canvas Text Small: IBM Plex Mono Regular/14px
  - Canvas Text Medium: IBM Plex Mono Regular/20px
  - Canvas Text Large: IBM Plex Mono Bold/32px
  - Canvas Text XL: IBM Plex Mono Bold/48px

## Animations

Animations reinforce tool selection and canvas interactions with purposeful, subtle motion that feels responsive without distracting from teaching content - button states change with gentle color transitions (150ms), tool selections pulse briefly to confirm activation, and auto-save notifications slide in smoothly then fade after 2 seconds.

## Component Selection

- **Components**: 
  - `Tabs` - Subject switcher for FISI, Azure, AWS, Linux with clear active state
  - `Button` - All toolbar tools with hover states and active indicators
  - `Popover` - Color picker, font selector, advanced tool settings
  - `Tooltip` - Hover hints for all tools and keyboard shortcuts
  - `Dialog` - Import/export interface, presentation list manager
  - `Separator` - Visual dividers in toolbar sections
  - `ScrollArea` - For presentation list when many subjects exist
  - `Switch` - Theme toggle (light/dark mode)
  - Custom Canvas component with full drawing engine

- **Customizations**: 
  - Large toolbar buttons (48x48px min) with icon + label for clarity
  - Color picker with preset IT-relevant colors (red/yellow/green for status, blue/purple for clouds)
  - Custom canvas cursor showing current tool and pen size preview
  - Floating tool palette with drag-to-reposition capability

- **States**: 
  - Buttons: Rest (subtle bg), Hover (border glow), Active (accent color fill), Disabled (50% opacity)
  - Canvas tools: Show current selection with persistent accent border
  - Text inputs: Focus state with animated accent border
  - Auto-save indicator: Idle (hidden), Saving (spinner), Saved (checkmark for 2s)

- **Icon Selection**: 
  - Pen: `PencilLine` from Phosphor
  - Shapes: `Square`, `Circle`, `ArrowRight` from Phosphor  
  - Text: `TextT` from Phosphor
  - Selection: `Selection` from Phosphor
  - Eraser: `Eraser` from Phosphor
  - Undo/Redo: `ArrowCounterClockwise`, `ArrowClockwise` from Phosphor
  - Save: `FloppyDisk` from Phosphor
  - Export/Import: `DownloadSimple`, `UploadSimple` from Phosphor
  - Theme: `Sun`, `Moon` from Phosphor
  - Add Subject: `Plus` from Phosphor

- **Spacing**: 
  - Toolbar padding: `p-4` (16px)
  - Tool button gaps: `gap-2` (8px)
  - Section separation: `gap-6` (24px)
  - Canvas margin from toolbar: `0px` (full bleed)
  - Tooltip offset: `8px` from trigger

- **Mobile**: 
  - Desktop-first design optimized for mouse/stylus input
  - On tablets: Toolbar moves to bottom, larger touch targets (56x56px)
  - On mobile: Show tool menu in bottom drawer, simplified tool set
  - Canvas always full-screen with responsive toolbar collapse
