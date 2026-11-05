import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ComparisonAiMarkdown({ content }: { content: string }) {
  return (
    <div className="min-w-0 space-y-3 whitespace-normal [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h4]:text-sm [&_h5]:text-sm [&_h6]:text-sm [&_hr]:border-border [&_li]:my-1 [&_li>ol]:mt-1 [&_li>ul]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:whitespace-pre [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-6 [&_:is(h1,h2,h3,h4,h5,h6)]:mt-5 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_input]:accent-primary">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          table: ({ children }) => (
            <div className="max-w-full overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
