import {
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDot,
  Code2,
  Command,
  Database,
  ExternalLink,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Globe2,
  Hammer,
  LayoutDashboard,
  Maximize2,
  MoreHorizontal,
  PanelBottomClose,
  PanelBottomOpen,
  Play,
  Plus,
  Rocket,
  Search,
  Settings2,
  Share2,
  Sparkles,
  SquareTerminal,
  Terminal,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

type FileKind = "folder" | "tsx" | "json" | "md" | "css" | "config";

type ProjectFile = {
  name: string;
  path: string;
  kind: FileKind;
  depth: number;
  folder?: boolean;
};

type CodePart = {
  text: string;
  color: string;
};

type CodeRow = {
  line: number;
  parts: CodePart[];
};

const code = (text: string, color = "text-[#c7ccd4]"): CodePart => ({
  text,
  color,
});

const keyword = (text: string): CodePart => code(text, "text-[#ff9871]");
const component = (text: string): CodePart => code(text, "text-[#f5c76b]");
const string = (text: string): CodePart => code(text, "text-[#9ecbff]");
const comment = (text: string): CodePart => code(text, "text-[#6e7786]");
const fn = (text: string): CodePart => code(text, "text-[#d3a7ff]");

const appCode: CodeRow[] = [
  { line: 1, parts: [keyword("import"), code(" "), component(" { useState } "), keyword("from"), code(" "), string("'react'"), code(";")] },
  { line: 2, parts: [keyword("import"), code(" "), component("{ Rocket, ArrowUpRight } "), keyword("from"), code(" "), string("'lucide-react'"), code(";")] },
  { line: 3, parts: [] },
  { line: 4, parts: [keyword("type"), code(" "), component("LaunchCardProps"), code(" = {")] },
  { line: 5, parts: [code("  title"), code(": "), component("string"), code(";")] },
  { line: 6, parts: [code("  subtitle"), code(": "), component("string"), code(";")] },
  { line: 7, parts: [code("};")] },
  { line: 8, parts: [] },
  { line: 9, parts: [keyword("export"), code(" "), keyword("default"), code(" "), keyword("function"), code(" "), fn("Launchpad"), code("() {")] },
  { line: 10, parts: [code("  "), keyword("const"), code(" [ready, setReady] = "), fn("useState"), code("(true);")] },
  { line: 11, parts: [] },
  { line: 12, parts: [code("  "), keyword("return"), code(" (")] },
  { line: 13, parts: [code("    <"), component("main"), code(" className="), string('"launchpad"'), code(">")] },
  { line: 14, parts: [code("      <"), component("header"), code(" className="), string('"hero"'), code(">")] },
  { line: 15, parts: [code("        <"), component("div"), code(" className="), string('"eyebrow"'), code(">")] },
  { line: 16, parts: [code("          <"), component("Rocket"), code(" size={16} />")] },
  { line: 17, parts: [code("          "), string("Ship something small, learn something big"), code(".")] },
  { line: 18, parts: [code("        </"), component("div"), code(">")] },
  { line: 19, parts: [code("        <"), component("h1"), code(">A calmer way to ship.</"), component("h1"), code(">")] },
  { line: 20, parts: [code("        <"), component("p"), code(">A tiny release board for teams that"), code(" ")] },
  { line: 21, parts: [code("          "), string("care about the details"), code(".</"), component("p"), code(">")] },
  { line: 22, parts: [code("      </"), component("header"), code(">")] },
  { line: 23, parts: [] },
  { line: 24, parts: [code("      <"), component("section"), code(" className="), string('"launch-grid"'), code(">")] },
  { line: 25, parts: [code("        <"), component("LaunchCard"), code(" title="), string('"Web refresh"'), code(" subtitle="), string('"Ready for review"'), code(" />")] },
  { line: 26, parts: [code("        <"), component("LaunchCard"), code(" title="), string('"Mobile beta"'), code(" subtitle="), string('"2 tasks left"'), code(" />")] },
  { line: 27, parts: [code("      </"), component("section"), code(">")] },
  { line: 28, parts: [] },
  { line: 29, parts: [code("      <"), component("button"), code(" onClick={() => setReady(!ready)}>")] },
  { line: 30, parts: [code("        {ready ? "), string("'Mark shipped'"), code(" : "), string("'Reopen launch'"), code("}")] },
  { line: 31, parts: [code("      </"), component("button"), code(">")] },
  { line: 32, parts: [code("    </"), component("main"), code(">")] },
  { line: 33, parts: [code("  );")] },
  { line: 34, parts: [code("}")] },
];

const packageCode: CodeRow[] = [
  { line: 1, parts: [code("{")] },
  { line: 2, parts: [code('  "name"'), code(": "), string('"replit-clone"'), code(",")] },
  { line: 3, parts: [code('  "private"'), code(": "), keyword("true"), code(",")] },
  { line: 4, parts: [code('  "version"'), code(": "), string('"0.4.2"'), code(",")] },
  { line: 5, parts: [] },
  { line: 6, parts: [code('  "scripts"'), code(": {")] },
  { line: 7, parts: [code('    "dev"'), code(": "), string('"vite --host 0.0.0.0"'), code(",")] },
  { line: 8, parts: [code('    "build"'), code(": "), string('"tsc -b && vite build"'), code(",")] },
  { line: 9, parts: [code('    "preview"'), code(": "), string('"vite preview"')] },
  { line: 10, parts: [code("  },")] },
  { line: 11, parts: [] },
  { line: 12, parts: [code('  "dependencies"'), code(": {")] },
  { line: 13, parts: [code('    "@vitejs/plugin-react"'), code(": "), string('"latest"'), code(",")] },
  { line: 14, parts: [code('    "lucide-react"'), code(": "), string('"^0.468.0"'), code(",")] },
  { line: 15, parts: [code('    "react"'), code(": "), string('"^18.3.1"'), code(",")] },
  { line: 16, parts: [code('    "react-dom"'), code(": "), string('"^18.3.1"')] },
  { line: 17, parts: [code("  }")] },
  { line: 18, parts: [code("}")] },
];

const readmeCode: CodeRow[] = [
  { line: 1, parts: [code("# "), component("Replit Clone")] },
  { line: 2, parts: [] },
  { line: 3, parts: [code("A focused launch board for small product teams.")] },
  { line: 4, parts: [] },
  { line: 5, parts: [keyword("##"), code(" Local development")] },
  { line: 6, parts: [] },
  { line: 7, parts: [code("Run the app locally with:")] },
  { line: 8, parts: [] },
  { line: 9, parts: [code("```bash")] },
  { line: 10, parts: [string("npm run dev")] },
  { line: 11, parts: [code("```")] },
  { line: 12, parts: [] },
  { line: 13, parts: [comment("Built with React, Vite, and a small amount of optimism.")] },
];

const fileTree: ProjectFile[] = [
  { name: "src", path: "src", kind: "folder", depth: 0, folder: true },
  { name: "components", path: "src/components", kind: "folder", depth: 1, folder: true },
  { name: "LaunchCard.tsx", path: "src/components/LaunchCard.tsx", kind: "tsx", depth: 2 },
  { name: "App.tsx", path: "src/App.tsx", kind: "tsx", depth: 1 },
  { name: "main.tsx", path: "src/main.tsx", kind: "tsx", depth: 1 },
  { name: "styles.css", path: "src/styles.css", kind: "css", depth: 1 },
  { name: "public", path: "public", kind: "folder", depth: 0, folder: true },
  { name: "index.html", path: "index.html", kind: "config", depth: 0 },
  { name: "package.json", path: "package.json", kind: "json", depth: 0 },
  { name: "tsconfig.json", path: "tsconfig.json", kind: "json", depth: 0 },
  { name: "README.md", path: "README.md", kind: "md", depth: 0 },
];

const codeByFile: Record<string, CodeRow[]> = {
  "src/App.tsx": appCode,
  "src/components/LaunchCard.tsx": appCode.slice(0, 20),
  "package.json": packageCode,
  "README.md": readmeCode,
  "src/main.tsx": appCode.slice(0, 12),
  "src/styles.css": readmeCode.slice(0, 10),
  "index.html": readmeCode.slice(0, 9),
  "tsconfig.json": packageCode.slice(0, 12),
};

function FileIcon({ kind, open = false }: { kind: FileKind; open?: boolean }) {
  if (kind === "folder") {
    return open ? <FolderOpen size={15} /> : <Folder size={15} />;
  }
  if (kind === "json" || kind === "config") return <FileJson size={15} />;
  if (kind === "md") return <FileText size={15} />;
  if (kind === "css") return <Braces size={15} />;
  return <FileCode2 size={15} />;
}

function CodeEditor({ file }: { file: string }) {
  const rows = codeByFile[file] ?? appCode;

  return (
    <div className="flex min-w-[560px] flex-1 overflow-auto bg-[#15171b] font-mono text-[12px] leading-[1.8]">
      <div className="sticky left-0 z-10 min-h-full w-12 shrink-0 border-r border-[#252932] bg-[#15171b] pt-3 text-right text-[11px] text-[#606875]">
        {rows.map((row) => (
          <div key={row.line} className="h-[22px] pr-3 select-none">
            {row.line}
          </div>
        ))}
      </div>
      <div className="px-4 pb-10 pt-3">
        {rows.map((row) => (
          <div key={row.line} className="h-[22px] whitespace-pre">
            {row.parts.map((part, index) => (
              <span key={`${row.line}-${index}`} className={part.color}>
                {part.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RunningPreview({
  previewTab,
  setPreviewTab,
}: {
  previewTab: "app" | "logs";
  setPreviewTab: (tab: "app" | "logs") => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#101216]">
      <div className="flex h-10 items-center border-b border-[#2b2f38] bg-[#1b1e24] px-3">
        <div className="flex items-center gap-1">
          <button
            title="Show running app"
            aria-label="Show running app"
            onClick={() => setPreviewTab("app")}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-[11px] font-medium transition-colors ${
              previewTab === "app"
                ? "border-[#f26b38] text-[#f3f4f6]"
                : "border-transparent text-[#858d9b] hover:text-[#c8ced8]"
            }`}
          >
            <Globe2 size={13} />
            Preview
          </button>
          <button
            title="Show preview logs"
            aria-label="Show preview logs"
            onClick={() => setPreviewTab("logs")}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-[11px] font-medium transition-colors ${
              previewTab === "logs"
                ? "border-[#f26b38] text-[#f3f4f6]"
                : "border-transparent text-[#858d9b] hover:text-[#c8ced8]"
            }`}
          >
            <Terminal size={13} />
            Logs
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[#7e8794]">
          <button title="Open preview in a new window" aria-label="Open preview in a new window" className="rounded p-1.5 hover:bg-[#2b3039] hover:text-[#e3e7ed]">
            <ExternalLink size={14} />
          </button>
          <button title="Fullscreen preview" aria-label="Fullscreen preview" className="rounded p-1.5 hover:bg-[#2b3039] hover:text-[#e3e7ed]">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      {previewTab === "app" ? (
        <div className="min-h-0 flex-1 overflow-auto bg-[#20262c] p-6">
          <div className="mx-auto min-h-[330px] max-w-[560px] overflow-hidden rounded-xl border border-[#39424b] bg-[#f6f4ef] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-[#e5e1d8] bg-[#fbfaf7] px-5 py-3">
              <div className="flex items-center gap-2 text-[#1e252b]">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f26b38] text-white">
                  <Rocket size={13} />
                </div>
                <span className="text-[12px] font-semibold tracking-tight">launchpad</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#80878b]">
                <span>Board</span>
                <span>Updates</span>
                <div className="h-5 w-5 rounded-full bg-[#d8c8b7] text-center text-[9px] leading-5 text-[#544d47]">AL</div>
              </div>
            </div>
            <div className="px-7 pb-7 pt-8">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e46739]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e46739]" />
                Monday, September 16
              </div>
              <h2 className="max-w-[360px] text-[28px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#232a30]">
                A calmer way
                <br />
                to ship.
              </h2>
              <p className="mt-3 max-w-[330px] text-[12px] leading-5 text-[#697176]">
                Keep the next release small, visible, and moving forward.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#e7e1d7] bg-[#fffdfa] p-3">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#263139]">Web refresh</span>
                    <Check size={13} className="text-[#e46739]" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#eee9df]">
                    <div className="h-1.5 w-[78%] rounded-full bg-[#e46739]" />
                  </div>
                  <span className="mt-2 block text-[9px] text-[#8a918f]">4 of 5 tasks</span>
                </div>
                <div className="rounded-lg border border-[#e7e1d7] bg-[#fffdfa] p-3">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#263139]">Mobile beta</span>
                    <CircleDot size={13} className="text-[#d09a51]" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#eee9df]">
                    <div className="h-1.5 w-[48%] rounded-full bg-[#d09a51]" />
                  </div>
                  <span className="mt-2 block text-[9px] text-[#8a918f]">2 of 4 tasks</span>
                </div>
              </div>
              <button className="mt-6 rounded-md bg-[#253039] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5">
                Mark shipped <span className="ml-2 text-[#f1a37d]">open</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto bg-[#111317] p-5 font-mono text-[11px] leading-6 text-[#a3abb8]">
          <div className="mb-4 flex items-center gap-2 text-[#85d6a0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#69c58c]" />
            preview server connected
          </div>
          <div><span className="text-[#6d7480]">09:41:08</span> <span className="text-[#8fa7c4]">GET</span> / 200 in 12ms</div>
          <div><span className="text-[#6d7480]">09:41:09</span> <span className="text-[#8fa7c4]">GET</span> /assets/index.css 200 in 4ms</div>
          <div><span className="text-[#6d7480]">09:41:12</span> <span className="text-[#85d6a0]">hmr</span> updated /src/App.tsx</div>
          <div><span className="text-[#6d7480]">09:41:12</span> <span className="text-[#8fa7c4]">GET</span> / 200 in 8ms</div>
          <div className="mt-4 border-t border-[#252a31] pt-4 text-[#6e7785]">Watching for file changes...</div>
        </div>
      )}
    </div>
  );
}

export function ReplitWorkspace() {
  const [activeFile, setActiveFile] = useState("src/App.tsx");
  const [activeTool, setActiveTool] = useState("workspace");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [previewTab, setPreviewTab] = useState<"app" | "logs">("app");
  const [isRunning, setIsRunning] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [srcOpen, setSrcOpen] = useState(true);
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [search, setSearch] = useState("");

  const visibleFiles = fileTree.filter((file) => {
    if (search && !file.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (!srcOpen && file.path.startsWith("src/")) return false;
    if (!componentsOpen && file.path.startsWith("src/components/")) return false;
    return true;
  });

  const handleShare = () => {
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#111316] font-sans text-[#e3e6eb] selection:bg-[#f26b38]/30">
      <div className="flex min-h-screen min-w-[760px] flex-col">
        <header className="flex h-12 shrink-0 items-center border-b border-[#292d34] bg-[#1b1e23] px-3 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
          <div className="flex w-[205px] items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f26b38] text-white shadow-[0_4px_12px_rgba(242,107,56,0.2)]">
              <span className="text-[15px] font-black tracking-[-0.14em]">ᖇ</span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-[#e9ebee]">replit-clone</span>
              <ChevronDown size={13} className="shrink-0 text-[#737b87]" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="hidden items-center gap-1 rounded-md border border-[#30353e] bg-[#16181c] p-0.5 sm:flex">
              <button className="rounded px-3 py-1.5 text-[10px] font-semibold text-[#f3f4f5] shadow-sm" title="Workspace view" aria-label="Workspace view">
                Workspace
              </button>
              <button className="rounded px-3 py-1.5 text-[10px] text-[#7e8793] hover:text-[#d8dce2]" title="Version history" aria-label="Version history">
                History
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mr-2 hidden items-center gap-1.5 text-[10px] text-[#747d8a] lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#54c985]" />
              Saved
            </span>
            <button title="Invite collaborators" aria-label="Invite collaborators" className="hidden items-center gap-2 rounded-md border border-[#343a44] px-2.5 py-1.5 text-[10px] font-medium text-[#bac0ca] hover:border-[#4b5360] hover:bg-[#252931] sm:flex">
              <Users size={13} />
              Invite
            </button>
            <button onClick={handleShare} title="Share workspace" aria-label="Share workspace" className="flex items-center gap-2 rounded-md bg-[#f26b38] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(242,107,56,0.15)] transition-colors hover:bg-[#ff7a46]">
              {shareCopied ? <Check size={13} /> : <Share2 size={13} />}
              {shareCopied ? "Copied" : "Share"}
            </button>
            <button title="Account menu" aria-label="Account menu" className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#423a45] text-[10px] font-semibold text-[#e8d9da] hover:bg-[#514351]">
              AL
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav className="hidden w-[54px] shrink-0 flex-col items-center border-r border-[#292d34] bg-[#181a1f] py-3 md:flex">
            <button onClick={() => setActiveTool("workspace")} title="Workspace" aria-label="Workspace" className={`mb-2 flex h-9 w-9 items-center justify-center rounded-md transition-colors ${activeTool === "workspace" ? "bg-[#2d3037] text-[#f26b38] shadow-inner" : "text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]"}`}>
              <Code2 size={18} />
            </button>
            <button onClick={() => setActiveTool("dashboard")} title="Dashboard" aria-label="Dashboard" className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${activeTool === "dashboard" ? "bg-[#2d3037] text-[#f26b38]" : "text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]"}`}>
              <LayoutDashboard size={17} />
            </button>
            <button onClick={() => setActiveTool("database")} title="Database" aria-label="Database" className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${activeTool === "database" ? "bg-[#2d3037] text-[#f26b38]" : "text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]"}`}>
              <Database size={17} />
            </button>
            <button onClick={() => setActiveTool("git")} title="Version control" aria-label="Version control" className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${activeTool === "git" ? "bg-[#2d3037] text-[#f26b38]" : "text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]"}`}>
              <GitBranch size={17} />
            </button>
            <div className="my-3 h-px w-7 bg-[#2b3038]" />
            <button onClick={() => setActiveTool("spark")} title="AI assistant" aria-label="AI assistant" className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${activeTool === "spark" ? "bg-[#2d3037] text-[#f26b38]" : "text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]"}`}>
              <Sparkles size={17} />
            </button>
            <button title="Help and shortcuts" aria-label="Help and shortcuts" className="mt-auto flex h-9 w-9 items-center justify-center rounded-md text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]">
              <CircleHelp size={17} />
            </button>
            <button title="Settings" aria-label="Settings" className="mt-1 flex h-9 w-9 items-center justify-center rounded-md text-[#77808d] hover:bg-[#252930] hover:text-[#e3e7ed]">
              <Settings2 size={17} />
            </button>
          </nav>

          <aside className="hidden w-[238px] shrink-0 flex-col border-r border-[#292d34] bg-[#1b1e23] lg:flex">
            <div className="flex h-12 items-center justify-between border-b border-[#292d34] px-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#abb2bd]">Files</span>
              <div className="flex items-center gap-1">
                <button title="New file" aria-label="New file" className="rounded p-1.5 text-[#7f8793] hover:bg-[#292e36] hover:text-[#e6e8ec]"><Plus size={14} /></button>
                <button title="More file actions" aria-label="More file actions" className="rounded p-1.5 text-[#7f8793] hover:bg-[#292e36] hover:text-[#e6e8ec]"><MoreHorizontal size={14} /></button>
              </div>
            </div>
            <div className="border-b border-[#292d34] p-2.5">
              <div className="flex h-7 items-center gap-2 rounded-md border border-[#323741] bg-[#15171b] px-2 text-[#77808d] focus-within:border-[#f26b38]/60">
                <Search size={13} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter files" className="w-full bg-transparent text-[11px] text-[#dfe3e8] outline-none placeholder:text-[#68717f]" aria-label="Filter files" />
                <kbd className="hidden rounded border border-[#343942] px-1 text-[9px] text-[#6e7783] xl:block">⌘P</kbd>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <div className="mb-1 flex items-center justify-between px-3 text-[10px] font-medium uppercase tracking-[0.09em] text-[#69727e]">
                <span>Project</span>
                <span className="text-[9px] text-[#56606c]">main</span>
              </div>
              {visibleFiles.map((file) => {
                const isFolder = file.kind === "folder";
                const isSelected = activeFile === file.path;
                const isSrc = file.path === "src";
                const isComponents = file.path === "src/components";
                const isOpen = isSrc ? srcOpen : isComponents ? componentsOpen : false;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      if (isSrc) setSrcOpen(!srcOpen);
                      else if (isComponents) setComponentsOpen(!componentsOpen);
                      else setActiveFile(file.path);
                    }}
                    title={file.path}
                    aria-label={`Open ${file.path}`}
                    className={`flex w-full items-center gap-2 py-[5px] pr-3 text-left text-[11px] transition-colors ${isSelected ? "bg-[#2c3037] text-[#f2f3f5]" : "text-[#9ca4b0] hover:bg-[#252930] hover:text-[#e2e5e9]"}`}
                    style={{ paddingLeft: `${12 + file.depth * 14}px` }}
                  >
                    {isFolder && (isOpen ? <ChevronDown size={12} className="shrink-0 text-[#777f8c]" /> : <ChevronRight size={12} className="shrink-0 text-[#777f8c]" />)}
                    {!isFolder && <span className="w-3 shrink-0" />}
                    <span className={`${isFolder ? "text-[#c7cdd5]" : file.kind === "tsx" ? "text-[#74c8ed]" : file.kind === "json" ? "text-[#d5b25e]" : "text-[#a5acb7]"}`}>
                      <FileIcon kind={file.kind} open={isOpen} />
                    </span>
                    <span className="truncate">{file.name}</span>
                    {file.name === "App.tsx" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f26b38]" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-[#292d34] px-3 py-2.5">
              <div className="flex items-center gap-2 text-[10px] text-[#757e8b]">
                <GitBranch size={12} />
                <span>main</span>
                <span className="ml-auto text-[#59626e]">clean</span>
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col bg-[#15171b]">
            <div className="flex h-10 shrink-0 items-center border-b border-[#292d34] bg-[#1b1e23]">
              <div className="flex h-full min-w-0 items-center border-r border-[#292d34] bg-[#15171b] px-3">
                <FileCode2 size={14} className="mr-2 text-[#74c8ed]" />
                <span className="max-w-[180px] truncate text-[11px] text-[#d9dde2]">{activeFile}</span>
                <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[#f26b38]" />
                <button title="Close file" aria-label="Close file" className="ml-3 rounded p-0.5 text-[#646d79] hover:bg-[#2d323b] hover:text-[#e6e8ec]"><X size={12} /></button>
              </div>
              <div className="ml-auto flex items-center gap-2 px-2">
                <button title="Format document" aria-label="Format document" className="hidden items-center gap-1.5 rounded px-2 py-1.5 text-[10px] text-[#89919d] hover:bg-[#292e36] hover:text-[#e8eaed] sm:flex"><Hammer size={12} /> Format</button>
                <button title="Open command palette" aria-label="Open command palette" className="flex items-center gap-1.5 rounded border border-[#333943] px-1.5 py-1 text-[10px] text-[#77818e] hover:bg-[#292e36]"><Command size={11} /><span className="hidden sm:inline">K</span></button>
              </div>
            </div>

            <div className={`flex min-h-0 flex-1 flex-col xl:flex-row ${terminalOpen ? "max-h-[calc(100vh-270px)]" : ""}`}>
              <section className="flex min-h-[330px] min-w-0 flex-1 flex-col border-b border-[#292d34] xl:border-b-0 xl:border-r">
                <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#292d34] bg-[#181a1f] px-3">
                  <div className="flex items-center gap-2 text-[10px] text-[#707987]">
                    <span className="text-[#adb5c0]">replit-clone</span>
                    <ChevronRight size={11} />
                    <span>{activeFile}</span>
                  </div>
                  <span className="text-[10px] text-[#5f6874]">TypeScript React</span>
                </div>
                <CodeEditor file={activeFile} />
              </section>
              <section className="flex min-h-[300px] min-w-0 flex-1 flex-col xl:max-w-[48%]">
                <RunningPreview previewTab={previewTab} setPreviewTab={setPreviewTab} />
              </section>
            </div>

            <section className={`${terminalOpen ? "h-[176px]" : "h-8"} shrink-0 border-t border-[#292d34] bg-[#17191d] transition-[height] duration-200`}>
              <div className="flex h-8 items-center border-b border-[#292d34] bg-[#1b1e23] px-3">
                <button onClick={() => setTerminalOpen(!terminalOpen)} title={terminalOpen ? "Hide terminal" : "Show terminal"} aria-label={terminalOpen ? "Hide terminal" : "Show terminal"} className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#aeb5bf] hover:text-[#e5e8eb]">
                  {terminalOpen ? <PanelBottomClose size={13} /> : <PanelBottomOpen size={13} />}
                  Terminal
                </button>
                <span className="ml-3 rounded bg-[#2a3037] px-1.5 py-0.5 text-[9px] text-[#89929f]">1</span>
                <div className="ml-auto flex items-center gap-3 text-[#6f7885]">
                  <span className="hidden items-center gap-1 text-[9px] sm:flex"><CircleDot size={10} className="text-[#54c985]" /> Process exited 0</span>
                  <button title="Clear terminal" aria-label="Clear terminal" className="rounded p-1 hover:bg-[#2b3038] hover:text-[#dbe0e5]"><X size={12} /></button>
                </div>
              </div>
              {terminalOpen && (
                <div className="h-[144px] overflow-auto px-4 py-2 font-mono text-[10px] leading-5 text-[#98a2af]">
                  <div><span className="text-[#646e7c]">replit-clone</span> <span className="text-[#ecaa73]">main</span> <span className="text-[#6a7480]">$</span> npm run dev</div>
                  <div className="text-[#778291]">&gt; replit-clone@0.4.2 dev</div>
                  <div className="text-[#778291]">&gt; vite --host 0.0.0.0</div>
                  <div className="mt-1 text-[#86d19f]">VITE v5.4.8 ready in 412 ms</div>
                  <div className="text-[#9aa4b0]">Local:   <span className="text-[#9ecbff]">http://localhost:5173/</span></div>
                  <div className="text-[#9aa4b0]">Network: <span className="text-[#9ecbff]">http://172.31.0.4:5173/</span></div>
                  <div className="mt-1 text-[#6f7884]">09:41:12 [vite] hmr update /src/App.tsx</div>
                </div>
              )}
            </section>
          </main>
        </div>

        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-[#292d34] bg-[#191b20] px-3 text-[10px] text-[#7a8390]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#9ca5b0]"><GitBranch size={11} /> main</span>
            <span className="hidden items-center gap-1.5 sm:flex"><Upload size={11} /> 0 changes</span>
            <span className="hidden items-center gap-1.5 md:flex"><Zap size={11} className="text-[#e6a45e]" /> 45 ms</span>
          </div>
          <div className="flex items-center gap-3">
            <button title="Toggle terminal" aria-label="Toggle terminal" onClick={() => setTerminalOpen(!terminalOpen)} className="hover:text-[#dce0e5]"><SquareTerminal size={12} /></button>
            <span className="hidden sm:inline">UTF-8</span>
            <span>TypeScript React</span>
          </div>
        </footer>
      </div>

      <div className="pointer-events-none fixed bottom-11 left-1/2 z-20 -translate-x-1/2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          title={isRunning ? "Stop running app" : "Run app"}
          aria-label={isRunning ? "Stop running app" : "Run app"}
          className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2 text-[11px] font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 ${
            isRunning ? "border-[#4ca976]/40 bg-[#1e3129] text-[#87d9a5]" : "border-[#f26b38]/50 bg-[#f26b38] text-white"
          }`}
        >
          {isRunning ? <Check size={14} /> : <Play size={14} fill="currentColor" />}
          {isRunning ? "Running" : "Run"}
        </button>
      </div>
    </div>
  );
}

export default ReplitWorkspace;