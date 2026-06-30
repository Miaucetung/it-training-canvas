import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Gemeinsame Markdown-Renderer-Komponenten für Concept-Inhalte.
// Zentral, damit TopicDetailPanel und Callout dieselbe Typografie nutzen.
function makeMarkdownComponents(dark: boolean): Components {
  return {
    h1: ({ children }) => (
      <h1
        className={`text-base font-bold mt-3 mb-1 ${dark ? "text-white" : "text-slate-900"}`}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`text-sm font-semibold mt-3 mb-1 ${dark ? "text-slate-100" : "text-slate-800"}`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`text-xs font-semibold uppercase tracking-wide mt-2 mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p
        className={`text-xs leading-relaxed my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
      >
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong
        className={`font-semibold ${dark ? "text-white" : "text-slate-900"}`}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
      <ul
        className={`list-disc list-inside text-xs space-y-0.5 my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`list-decimal list-inside text-xs space-y-0.5 my-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    code: ({ children, className }) => {
      const isBlock = className?.includes("language-");
      return isBlock ? (
        <code
          className={`block text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto ${dark ? "bg-slate-900 text-slate-200 border border-slate-700" : "bg-slate-100 text-slate-800 border border-slate-200"}`}
        >
          {children}
        </code>
      ) : (
        <code
          className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? "bg-slate-700 text-indigo-300" : "bg-slate-100 text-indigo-700"}`}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre
        className={`text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto ${dark ? "bg-slate-900 border border-slate-700" : "bg-slate-100 border border-slate-200"}`}
      >
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-2 pl-3 my-2 italic text-xs ${dark ? "border-indigo-500 text-slate-400" : "border-indigo-400 text-slate-500"}`}
      >
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={dark ? "bg-slate-700" : "bg-slate-100"}>
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th
        className={`px-2 py-1 text-left font-semibold border ${dark ? "border-slate-600 text-slate-200" : "border-slate-200 text-slate-700"}`}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={`px-2 py-1 border ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
      >
        {children}
      </td>
    ),
    hr: () => (
      <hr className={`my-3 ${dark ? "border-slate-700" : "border-slate-200"}`} />
    ),
  };
}

/** Rendert einen Markdown-Abschnitt mit der gemeinsamen Concept-Typografie. */
export function ConceptMarkdown({
  text,
  dark,
}: {
  text: string;
  dark: boolean;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={makeMarkdownComponents(dark)}
    >
      {text}
    </ReactMarkdown>
  );
}
