import "katex/dist/katex.min.css";
import { memo } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const MarkDown = ({ content }) => {
  // const formattedContent = content.replace(/\n\n/g, "\n\n&nbsp;\n\n");

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        className="whitespace-normal"
        components={{
          h1({ children, ...props }) {
            return (
              <h1
                style={{ fontSize: "2em", fontWeight: "bold", margin: "1em 0" }}
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                style={{
                  fontSize: "1.5em",
                  fontWeight: "bold",
                  margin: "1em 0",
                }}
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3
                style={{
                  fontSize: "1.25em",
                  fontWeight: "bold",
                  margin: "1em 0",
                }}
                {...props}
              >
                {children}
              </h3>
            );
          },
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            if (!inline && match) {
              const codeString = String(children).replace(/\n$/, "");
              const removenbsp = String(codeString).replace(/&nbsp;/, "");
              return (
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "#282a36",
                    borderRadius: "5px",
                    overflowX: "auto",
                    margin: "10px 0",
                  }}
                >
                  <CopyBlock
                    text={removenbsp}
                    language={match[1]}
                    showLineNumbers={false}
                    wrapLongLines
                    theme={dracula}
                    {...props}
                  />
                </div>
              );
            }
            return (
              <code
                style={{
                  padding: inline ? "2px 4px" : "10px",
                  backgroundColor: inline ? "none" : "#282a36",
                  borderRadius: inline ? "none" : "5px",
                  display: inline ? "inline" : "block",
                  margin: inline ? "0" : "10px 0",
                  color: inline ? "inherit" : "#f8f8f2",
                  whiteSpace: inline ? "nowrap" : "pre-wrap",
                }}
                className={className}
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children, ...props }) {
            return (
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "36px",
                  lineHeight: "20px",
                }}
                {...props}
              >
                {children}
              </table>
            );
          },
          tr({ children, ...props }) {
            return (
              <tr style={{ backgroundColor: "#f8f8f8" }} {...props}>
                {children}
              </tr>
            );
          },
          td({ children, ...props }) {
            return (
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
                {...props}
              >
                {children}
              </td>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  fontWeight: 600,
                  textAlign: "left",
                  fontSize: "16px",
                }}
                {...props}
              >
                {children}
              </th>
            );
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          ul({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <ul className="list-disc whitespace-normal pl-5">{children}</ul>
            );
          },
          ol({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <ol
                className="list-decimal pl-5"
                style={{
                  listStylePosition: "outside",
                  paddingLeft: "20px",
                }}
                {...props}
              >
                {children}
              </ol>
            );
          },
          li({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <li
                style={{
                  fontWeight: "bold",
                  margin: "5px 0",
                }}
                {...props}
              >
                <span style={{ fontWeight: "normal" }}>{children}</span>
              </li>
            );
          },
          p({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <p style={{ marginTop: "0" }} {...props}>
                {children}
              </p>
            );
          },
          span({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <span className={className} {...props}>
                {children}
              </span>
            );
          },
          div({ className, children, ...props }) {
            if (className === "math-inline") {
              return (
                <span
                  className={className}
                  style={{
                    fontSize: "1.1em",
                    margin: "0 4px",
                    display: "inline-block",
                    lineHeight: "1.4",
                  }}
                  {...props}
                >
                  {children}
                </span>
              );
            }
            if (className === "math-display") {
              return (
                <div
                  className={className}
                  style={{
                    fontSize: "1.2em",
                    textAlign: "center",
                    margin: "20px auto",
                    lineHeight: "1.6",
                  }}
                  {...props}
                >
                  {children}
                </div>
              );
            }
            return (
              <div className={className} {...props}>
                {children}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(MarkDown);
