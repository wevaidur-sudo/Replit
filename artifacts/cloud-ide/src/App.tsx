import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  Braces,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Code2,
  FileCode2,
  FileJson2,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Menu,
  Moon,
  PanelLeft,
  Play,
  Plus,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Sun,
  Terminal as TerminalIcon,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type FilePath = '/src/App.tsx' | '/src/styles.css' | '/src/main.tsx' | '/public/index.html' | '/README.md' | '/package.json';
type MobilePanel = 'files' | 'editor' | 'terminal' | 'assistant';

const initialContents: Record<FilePath, string> = {
  '/src/App.tsx': `import { useState } from 'react';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <main className="app-shell">
      <Dashboard ready={ready} onReady={() => setReady(true)} />
    </main>
  );
}`,
  '/src/styles.css': `:root {
  color-scheme: light;
  --ink: #16202a;
  --sea: #0e7969;
  --sun: #ee8f3a;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: #edf1f3;
  color: var(--ink);
  font-family: "Manrope", sans-serif;
}`,
  '/src/main.tsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
  '/public/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orbit workspace</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  '/README.md': `# Orbit workspace

The smallest useful loop for shipping a thoughtful interface.

## Local development

\`\`\`bash
pnpm dev
\`\`\`

Open the local URL and keep building.`,
  '/package.json': `{
  "name": "orbit-workspace",
  "private": true,
  "version": "0.4.2",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "vite": "^5.4.0"
  }
}`,
};

const fileRows: { path: FilePath; label: string; kind: 'folder' | 'file'; depth: number; icon: 'tsx' | 'css' | 'json' | 'html' | 'md' }[] = [
  { path: '/src/App.tsx', label: 'App.tsx', kind: 'file', depth: 2, icon: 'tsx' },
  { path: '/src/styles.css', label: 'styles.css', kind: 'file', depth: 2, icon: 'css' },
  { path: '/src/main.tsx', label: 'main.tsx', kind: 'file', depth: 2, icon: 'tsx' },
  { path: '/public/index.html', label: 'index.html', kind: 'file', depth: 2, icon: 'html' },
  { path: '/README.md', label: 'README.md', kind: 'file', depth: 1, icon: 'md' },
  { path: '/package.json', label: 'package.json', kind: 'file', depth: 1, icon: 'json' },
];

const initialTabs: FilePath[] = ['/src/App.tsx', '/src/styles.css', '/README.md'];

const iconForFile = (type: string) => {
  if (type === 'tsx') return <FileCode2 className="size-3.5 text-sky-500" />;
  if (type === 'css') return <Braces className="size-3.5 text-fuchsia-500" />;
  if (type === 'json') return <FileJson2 className="size-3.5 text-amber-500" />;
  if (type === 'html') return <Code2 className="size-3.5 text-orange-500" />;
  return <FileText className="size-3.5 text-muted-foreground" />;
};

function App() {
  const [activePath, setActivePath] = useState<FilePath>('/src/App.tsx');
  const [openTabs, setOpenTabs] = useState<FilePath[]>(initialTabs);
  const [contents, setContents] = useState(initialContents);
  const [dirty, setDirty] = useState<Partial<Record<FilePath, boolean>>>({});
  const [saveState, setSaveState] = useState('All changes saved');
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'orbit@workspace ~/project $ pnpm dev',
    '  VITE v5.4.11  ready in 418 ms',
    '  ➜  Local:   http://localhost:5173/',
    '  ➜  press h + enter to show help',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', text: 'Your workspace is ready. Ask me about the active file or the next small move.' },
  ]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('editor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [srcOpen, setSrcOpen] = useState(true);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('orbit-theme');
    if (storedTheme === 'dark') setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('orbit-theme', theme);
  }, [theme]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveFile();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        commandInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  });

  const activeFile = fileRows.find((file) => file.path === activePath);
  const lineCount = useMemo(() => contents[activePath].split('\n').length, [contents, activePath]);
  const openFile = (path: FilePath) => {
    setActivePath(path);
    setMobilePanel('editor');
    setMobileMenuOpen(false);
    if (!openTabs.includes(path)) setOpenTabs((tabs) => [...tabs, path]);
  };

  const closeTab = (path: FilePath) => {
    if (openTabs.length === 1) return;
    const nextTabs = openTabs.filter((tab) => tab !== path);
    setOpenTabs(nextTabs);
    if (activePath === path) setActivePath(nextTabs[Math.max(0, nextTabs.indexOf(path) - 1)] ?? nextTabs[0]);
  };

  const updateActiveFile = (value: string) => {
    setContents((current) => ({ ...current, [activePath]: value }));
    setDirty((current) => ({ ...current, [activePath]: true }));
    setSaveState('Unsaved changes');
  };

  function saveFile() {
    if (!dirty[activePath]) {
      setSaveState('Already saved');
      window.setTimeout(() => setSaveState('All changes saved'), 1400);
      return;
    }
    setDirty((current) => ({ ...current, [activePath]: false }));
    setSaveState('Saved just now');
    window.setTimeout(() => setSaveState('All changes saved'), 1800);
  }

  const runProject = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOpen(true);
    setTerminalLines((lines) => [...lines, '', 'orbit@workspace ~/project $ pnpm build', '  transforming modules…']);
    window.setTimeout(() => {
      setTerminalLines((lines) => [...lines, '  ✓ 42 modules transformed', '  ✓ built in 1.08s', 'orbit@workspace ~/project $']);
      setIsRunning(false);
    }, 850);
  };

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    const command = terminalCommand.trim();
    if (!command) return;
    setTerminalLines((lines) => [...lines, `orbit@workspace ~/project $ ${command}`, command === 'clear' ? '' : `  ran locally · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`]);
    setTerminalCommand('');
  };

  const askAssistant = (event: FormEvent) => {
    event.preventDefault();
    const prompt = assistantPrompt.trim();
    if (!prompt) return;
    setAssistantMessages((messages) => [...messages, { role: 'user', text: prompt }, { role: 'assistant', text: prompt.toLowerCase().includes('test') ? 'Start with the smallest behavior: render the component, click the primary action, and assert the visible result. I would put it beside the component in a focused spec.' : `In ${activeFile?.label ?? 'this file'}, I would keep the next change narrow: name the intent, make the state explicit, then run the loop. That keeps the surface easy to review.` }]);
    setAssistantPrompt('');
  };

  const renderSidebar = (mobile = false) => (
    <aside className={`${mobile ? 'w-full' : 'hidden md:flex w-[236px]'} shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground`}>
      <div className="flex h-11 items-center justify-between border-b border-sidebar-border px-3">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/.12)]">
            <Zap className="size-3.5 fill-current" />
          </div>
          <span className="text-xs font-extrabold tracking-[.08em] text-slate-100">ORBIT</span>
          <span className="rounded bg-slate-100/10 px-1.5 py-0.5 font-code text-[9px] text-slate-400">0.4</span>
        </div>
        <button onClick={() => setMobileMenuOpen(false)} className="rounded p-1 text-slate-400 transition hover:bg-slate-100/10 hover:text-slate-100" data-testid="button-close-mobile-menu" aria-label="Close navigation">
          {mobile ? <X className="size-4" /> : <PanelLeft className="size-4" />}
        </button>
      </div>
      <div className="border-b border-sidebar-border px-3 py-3">
        <button onClick={() => setSaveState('northstar-web is the active project')} className="flex w-full items-center gap-2 rounded-md border border-slate-100/10 bg-slate-100/[.06] px-2.5 py-2 text-left transition hover:bg-slate-100/10" data-testid="button-switch-project">
          <div className="grid size-6 place-items-center rounded bg-[#d8b4fe] text-[10px] font-extrabold text-[#3b2362]">N</div>
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-100">northstar-web</span>
          <ChevronDown className="size-3.5 text-slate-500" />
        </button>
      </div>
      <div className="flex items-center justify-between px-3 pb-1 pt-4">
        <span className="font-code text-[9px] font-medium uppercase tracking-[.16em] text-slate-500">Explorer</span>
        <button onClick={() => setSaveState('New files can be added from the local project')} className="rounded p-1 text-slate-500 transition hover:bg-slate-100/10 hover:text-slate-200" data-testid="button-new-file" aria-label="New file"><Plus className="size-3.5" /></button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-auto px-2 pb-4">
        <button onClick={() => setSrcOpen((open) => !open)} className="flex w-full items-center gap-1.5 rounded px-1.5 py-1.5 text-left font-code text-[11px] font-medium text-slate-300 transition hover:bg-slate-100/10" data-testid="button-toggle-src-folder">
          {srcOpen ? <ChevronDown className="size-3 text-slate-500" /> : <ChevronRight className="size-3 text-slate-500" />}
          {srcOpen ? <FolderOpen className="size-3.5 text-teal-300" /> : <Folder className="size-3.5 text-teal-300" />}
          <span>src</span>
          <span className="ml-auto text-[9px] text-slate-600">3</span>
        </button>
        {srcOpen && fileRows.slice(0, 3).map((file) => (
          <button key={file.path} onClick={() => openFile(file.path)} className={`group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-code text-[11px] transition ${activePath === file.path ? 'bg-teal-300/15 text-teal-200' : 'text-slate-400 hover:bg-slate-100/10 hover:text-slate-200'}`} style={{ paddingLeft: `${file.depth * 8}px` }} data-testid={`button-file-${file.label.replace('.', '-')}`}>
            {iconForFile(file.icon)}
            <span className="truncate">{file.label}</span>
            {dirty[file.path] && <Circle className="ml-auto size-1.5 fill-amber-300 text-amber-300" />}
          </button>
        ))}
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center gap-1.5 px-1.5 py-1.5 font-code text-[11px] text-slate-500"><Folder className="size-3.5 text-slate-500" /> public</div>
          {fileRows.slice(3).map((file) => (
            <button key={file.path} onClick={() => openFile(file.path)} className={`group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-code text-[11px] transition ${activePath === file.path ? 'bg-teal-300/15 text-teal-200' : 'text-slate-400 hover:bg-slate-100/10 hover:text-slate-200'}`} style={{ paddingLeft: `${file.depth * 8}px` }} data-testid={`button-file-${file.label.replace('.', '-')}`}>
              {iconForFile(file.icon)}
              <span className="truncate">{file.label}</span>
              {dirty[file.path] && <Circle className="ml-auto size-1.5 fill-amber-300 text-amber-300" />}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-sidebar-border p-2">
        <button onClick={() => setSaveState('Workspace settings are local to this preview')} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[11px] text-slate-400 transition hover:bg-slate-100/10 hover:text-slate-100" data-testid="button-settings"><Settings2 className="size-3.5" /> Workspace settings <span className="ml-auto font-code text-[9px] text-slate-600">⌘,</span></button>
      </div>
    </aside>
  );

  const renderTerminal = () => (
    <section className={`${terminalOpen ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col border-t border-border bg-[hsl(var(--card)/.55)]`}>
      <div className="flex h-9 shrink-0 items-center gap-4 border-b border-border px-3">
        <button onClick={() => setTerminalOpen(false)} className="flex h-full items-center gap-1.5 border-b-2 border-primary font-code text-[10px] font-medium uppercase tracking-[.12em] text-foreground" data-testid="button-terminal-tab"><TerminalIcon className="size-3.5 text-primary" /> Terminal</button>
        <button onClick={() => setTerminalLines((lines) => [...lines, '  output stream connected'])} className="flex h-full items-center gap-1.5 font-code text-[10px] uppercase tracking-[.12em] text-muted-foreground transition hover:text-foreground" data-testid="button-output-tab"><Activity className="size-3.5" /> Output <span className="rounded bg-muted px-1 text-[9px]">1</span></button>
        <button onClick={() => setTerminalLines([])} className="ml-auto rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-clear-terminal" aria-label="Clear terminal"><Trash2 className="size-3.5" /></button>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto p-3 font-code text-[10px] leading-5">
        {terminalLines.length === 0 ? <div className="flex h-full min-h-[80px] items-center justify-center text-muted-foreground">Terminal cleared. Run a command to begin.</div> : terminalLines.map((line, index) => <div key={`${line}-${index}`} className={line.includes('✓') ? 'text-primary' : line.startsWith('orbit@') ? 'text-foreground' : 'text-muted-foreground'}>{line || '\u00a0'}</div>)}
        {isRunning && <div className="status-pulse text-accent">  building…</div>}
      </div>
      <form onSubmit={runCommand} className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2">
        <span className="font-code text-[10px] text-primary">›</span>
        <input ref={commandInputRef} value={terminalCommand} onChange={(event) => setTerminalCommand(event.target.value)} className="min-w-0 flex-1 bg-transparent font-code text-[11px] text-foreground outline-none placeholder:text-muted-foreground" placeholder="Run a command…" data-testid="input-terminal-command" aria-label="Terminal command" />
        <button className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-submit-terminal" aria-label="Run terminal command"><ArrowUpFromLine className="size-3.5" /></button>
      </form>
    </section>
  );

  const renderEditor = () => (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="scrollbar-thin flex h-10 shrink-0 overflow-x-auto border-b border-border bg-[hsl(var(--muted)/.46)]">
        {openTabs.map((tab) => {
          const file = fileRows.find((row) => row.path === tab);
          return (
            <div key={tab} className={`group flex min-w-[126px] items-center gap-2 border-r border-border px-3 font-code text-[10px] transition ${activePath === tab ? 'border-t-2 border-t-primary bg-card text-foreground' : 'border-t-2 border-t-transparent text-muted-foreground hover:bg-muted'}`}>
              <button onClick={() => openFile(tab)} className="flex min-w-0 flex-1 items-center gap-2 text-left" data-testid={`button-tab-${file?.label ?? tab}`}>
                {iconForFile(file?.icon ?? 'md')}<span className="truncate">{file?.label}</span>{dirty[tab] && <Circle className="size-1.5 shrink-0 fill-amber-400 text-amber-400" />}
              </button>
              <button onClick={() => closeTab(tab)} className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-muted-foreground/15 hover:text-foreground group-hover:opacity-100" data-testid={`button-close-tab-${file?.label ?? tab}`} aria-label={`Close ${file?.label ?? tab}`}><X className="size-3" /></button>
            </div>
          );
        })}
        <button onClick={() => openFile('/src/main.tsx')} className="px-3 text-muted-foreground transition hover:text-foreground" data-testid="button-new-tab" aria-label="New tab"><Plus className="size-3.5" /></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-2 font-code text-[10px] text-muted-foreground"><span className="text-primary">northstar-web</span><span>/</span><span>src</span><span>/</span><span className="text-foreground">{activeFile?.label}</span></div>
          <div className="flex items-center gap-2">
            <span className={`hidden text-[10px] sm:inline ${dirty[activePath] ? 'text-accent' : 'text-muted-foreground'}`}>{dirty[activePath] ? '● modified' : 'clean'}</span>
            <button onClick={saveFile} className="flex items-center gap-1.5 rounded border border-border px-2 py-1 font-code text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground" data-testid="button-save-file"><Save className="size-3" /> Save <span className="hidden text-[9px] opacity-60 sm:inline">⌘S</span></button>
          </div>
        </div>
        <div className="editor-surface scrollbar-thin flex min-h-[240px] flex-1 overflow-auto">
          <div className="line-numbers w-11 shrink-0 select-none border-r border-border/70 px-3 pt-4 text-right font-code text-[10px] text-muted-foreground/65">
            {Array.from({ length: lineCount }, (_, index) => <div key={index}>{index + 1}</div>)}
          </div>
          <textarea value={contents[activePath]} onChange={(event) => updateActiveFile(event.target.value)} className="editor-textarea min-w-0 flex-1 bg-transparent px-4 pb-8 pt-4 font-code text-[11px] text-foreground" spellCheck={false} data-testid="textarea-active-file" aria-label={`Editing ${activeFile?.label}`} />
          <div className="hidden w-9 shrink-0 border-l border-border/50 py-4 lg:block"><div className="mx-2 h-16 rounded-sm bg-primary/10"></div><div className="mx-2 mt-1 h-8 rounded-sm bg-accent/10"></div></div>
        </div>
        {renderTerminal()}
      </div>
      <div className="flex h-6 shrink-0 items-center justify-between bg-sidebar px-3 font-code text-[9px] text-slate-400">
        <div className="flex items-center gap-3"><span className="flex items-center gap-1 text-teal-200"><GitBranch className="size-3" /> main</span><span className="hidden sm:flex items-center gap-1"><ArrowDownToLine className="size-3" /> 0</span><span className="hidden sm:flex items-center gap-1"><ArrowUpFromLine className="size-3" /> 0</span></div>
        <div className="flex items-center gap-3"><span>{saveState}</span><span>UTF-8</span><span>Ln 1, Col 1</span></div>
      </div>
    </section>
  );

  const renderAssistant = (mobile = false) => (
    <aside className={`${mobile ? 'w-full' : 'hidden xl:flex w-[315px]'} min-h-0 shrink-0 flex-col border-l border-border bg-card/55`}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-4">
        <div className="grid size-6 place-items-center rounded-md bg-accent/20 text-accent"><Bot className="size-3.5" /></div>
        <div><div className="text-[11px] font-bold">Orbit assistant</div><div className="font-code text-[9px] text-muted-foreground">local context · ready</div></div>
        <button onClick={() => setAssistantMessages((messages) => [...messages, { role: 'assistant', text: 'Context is limited to this local workspace. No files leave this tab.' }])} className="ml-auto rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-assistant-options" aria-label="Assistant options"><CircleDot className="size-3.5" /></button>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-auto p-3">
        <div className="rounded-md border border-accent/20 bg-accent/10 p-3 text-[11px] leading-relaxed text-foreground"><div className="mb-1 flex items-center gap-1.5 font-code text-[9px] uppercase tracking-wider text-accent"><Sparkles className="size-3" /> Context note</div>Ask for a review, a test idea, or a second pair of eyes on the current file.</div>
        {assistantMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-md p-2.5 text-[11px] leading-relaxed ${message.role === 'user' ? 'ml-5 border border-border bg-muted text-foreground' : 'mr-2 border border-border/70 bg-card text-muted-foreground'}`} data-testid={`text-assistant-message-${index}`}>{message.text}</div>)}
      </div>
      <form onSubmit={askAssistant} className="m-3 rounded-md border border-border bg-background p-2 shadow-sm">
        <textarea value={assistantPrompt} onChange={(event) => setAssistantPrompt(event.target.value)} className="min-h-[52px] w-full resize-none bg-transparent px-1 text-[11px] leading-relaxed outline-none placeholder:text-muted-foreground" placeholder="Ask about this workspace…" data-testid="textarea-assistant-prompt" aria-label="Assistant prompt" />
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2"><span className="font-code text-[9px] text-muted-foreground">⌘ ↵ to send</span><button className="grid size-6 place-items-center rounded bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-40" disabled={!assistantPrompt.trim()} data-testid="button-send-assistant" aria-label="Send assistant prompt"><Send className="size-3" /></button></div>
      </form>
    </aside>
  );

  return (
    <div className="noise ide-app flex min-h-[100dvh] flex-col">
      <header className="topbar-glass z-10 flex h-14 shrink-0 items-center justify-between border-b border-border px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setMobileMenuOpen((open) => !open)} className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden" data-testid="button-mobile-menu" aria-label="Open navigation"><Menu className="size-4" /></button>
          <div className="flex items-center gap-2.5"><div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/.1)]"><Zap className="size-4 fill-current" /></div><span className="hidden text-sm font-extrabold tracking-[-.02em] sm:inline">orbit<span className="text-primary">/</span>workspace</span></div>
          <div className="hidden h-5 w-px bg-border sm:block"></div>
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground md:flex"><span className="size-1.5 rounded-full bg-primary"></span><span className="font-semibold text-foreground">northstar-web</span><span>/</span><span>main</span></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-2 rounded border border-border bg-muted/60 px-2.5 py-1.5 text-[10px] text-muted-foreground lg:flex"><Search className="size-3" /><span>Quick open</span><span className="font-code text-[9px]">⌘K</span></div>
          <button onClick={runProject} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60" disabled={isRunning} data-testid="button-run-project"><Play className="size-3 fill-current" /> {isRunning ? 'Building' : 'Run'}<span className="hidden font-code text-[9px] opacity-70 sm:inline">⌘↵</span></button>
          <button onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-toggle-theme" aria-label="Toggle theme">{theme === 'light' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}</button>
          <div className="ml-1 grid size-7 place-items-center rounded-full bg-[#d8b4fe] text-[10px] font-extrabold text-[#3b2362]" data-testid="avatar-user">AS</div>
        </div>
      </header>

      {mobileMenuOpen && <div className="absolute inset-x-0 top-14 z-20 flex h-[calc(100dvh-3.5rem)] md:hidden">{renderSidebar(true)}</div>}

      <main className="hidden min-h-0 flex-1 md:flex">
        {renderSidebar()}
        <div className="flex min-w-0 flex-1">{renderEditor()}{renderAssistant()}</div>
      </main>

      <main className="mobile-workspace flex min-h-0 flex-1 overflow-hidden md:hidden">
        {mobilePanel === 'files' && renderSidebar(true)}
        {mobilePanel === 'editor' && renderEditor()}
        {mobilePanel === 'terminal' && <div className="flex min-w-0 flex-1 flex-col">{renderTerminal()}</div>}
        {mobilePanel === 'assistant' && renderAssistant(true)}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid h-14 grid-cols-4 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        {([['files', FolderOpen, 'Files'], ['editor', Code2, 'Editor'], ['terminal', TerminalIcon, 'Terminal'], ['assistant', Bot, 'Orbit']] as const).map(([panel, Icon, label]) => <button key={panel} onClick={() => setMobilePanel(panel)} className={`flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition ${mobilePanel === panel ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`button-mobile-${panel}`}><Icon className="size-4" /><span>{label}</span></button>)}
      </nav>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={window.location.pathname}>
      <Switch>
        <Route path="/" component={App} />
        <Route component={App} />
      </Switch>
    </ErrorBoundary>
  );
}

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}