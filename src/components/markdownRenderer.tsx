import { ExternalLink } from "lucide-react";
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./copyButton";
import Mermaid from "./mermaid";
import TableWrapper from "./TableWrapper";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    code: ({ className, children, ...props }) => {
      const isBlock = !!className;
      const language = className?.replace("language-", "") || "code";
      if (isBlock && language === "mermaid") {
        const chart =
          typeof children === "string"
            ? children
            : Array.isArray(children)
              ? children.join("")
              : "";

        return (
          <div className="my-6 flex justify-center">
            <Mermaid chart={chart} theme="dark" />
          </div>
        );
      }
      if (isBlock) {
        return (
          <div className="rounded-2xl overflow-hidden mb-4 bg-default/40 text-foreground">
            {/* Header with language */}
            <div className="flex items-center justify-between px-4 py-2 bg-transparent text-sm rounded-t-2xl">
              <span>{language}</span>
              <CopyButton
                onClick={() => {
                  if (typeof children === "string") {
                    navigator.clipboard.writeText(children);
                  } else if (Array.isArray(children)) {
                    navigator.clipboard.writeText(
                      children
                        .map((c) => (typeof c === "string" ? c : ""))
                        .join("")
                    );
                  }
                }}
              />
            </div>

            {/* Code content */}
            <div className="overflow-x-auto p-4">
              <code
                className={`${className} foregroundspace-pre`}
                {...(props as any)}
              >
                {children}
              </code>
            </div>
          </div>
        );
      } else {
        return (
          <code className="bg-default/40 px-1 rounded" {...props}>
            {children}
          </code>
        );
      }
    },

    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold mb-2" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-semibold mb-1" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-semibold mb-1 mt-4" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="font-semibold mt-4" {...props} />
    ),
    h5: ({ node, ...props }) => <h6 className="font-semibold" {...props} />,
    h6: ({ node, ...props }) => <h6 className="font-normal" {...props} />,

    p: (props) => {
      return <p className="my-4 leading-7" {...props} />;
    },

    a: ({ href, children, ...props }) => {
      if (!href) return <>{children}</>;

      // Determine if the link is external
      const isExternal = /^https?:\/\//.test(href);

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1 text-primary/100 underline decoration-dotted underline-offset-2 hover:text-primary/70 transition-colors duration-200"
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
          {isExternal && <ExternalLink className="w-4 h-4" />}
        </a>
      );
    },

    hr: (props) => {
      return <hr className="my-7 border-default/70" {...props} />;
    },

    img: (props) => {
      return (
        <img
          className="w-[90%] max-w-full mx-auto rounded my-2"
          {...props}
          alt={props.alt || ""}
        />
      );
    },

    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside ml-2 [&>li>ul]:ml-7" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside ml-2 [&>li>ol]:ml-7" {...props} />
    ),

    li: ({ node, ...props }) => <li className="mb-1" {...props} />,

    blockquote: ({ node, ...props }) => (
      <blockquote className="relative pl-4 mb-2 ">
        <span className="absolute left-0 top-0 h-full w-1 bg-default/70 rounded-full"></span>
        <div className="pl-2">{props.children}</div>
      </blockquote>
    ),

    // Inside components object:
    table: ({ node, ...props }) => (
      <TableWrapper {...props} />
    ),
    thead: ({ node, ...props }) => (
      <thead className="border-b-1 border-default/70 text-left" {...props} />
    ),
    tbody: ({ node, ...props }) => <tbody {...props} />,
    tr: ({ node, ...props }) => (
      <tr
        className="border-b last:border-b-0 [&:not(:has(th))]:border-default/30"
        {...props}
      />
    ),

    th: ({ node, ...props }) => (
      <th
        className="py-2 pr-8 last:pr-0 [&:not(:first-child)]:pl-2 text-sm font-semibold"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className="py-2.5 pr-8 last:pr-0 [&:not(:first-child)]:pl-2 text-sm"
        {...props}
      />
    ),
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
