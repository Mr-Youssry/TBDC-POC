declare module "tiptap-markdown" {
  import { Extension } from "@tiptap/core";

  interface MarkdownOptions {
    html?: boolean;
    tightLists?: boolean;
    tightListClass?: string;
    bulletListMarker?: string;
    linkify?: boolean;
    breaks?: boolean;
    transformPastedText?: boolean;
    transformCopiedText?: boolean;
  }

  interface MarkdownStorage {
    getMarkdown: () => string;
  }

  const Markdown: Extension<MarkdownOptions, MarkdownStorage>;
  export { Markdown };
}
