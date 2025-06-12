"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import HardBreak from "@tiptap/extension-hard-break";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import "@/assets/styles/tiptap-editor.css";

type Props = {
  content: object; // Tiptap JSON doc
  className?: string;
};

export default function TiptapJsonViewer({ content, className = "" }: Props) {
  const editor = useEditor({
    content,
    editable: false,
    extensions: [
      TextStyle,
      Color,
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "underline text-blue-600 hover:text-blue-800 visited:text-purple-600",
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: "auto" },
            float: { default: null },
          };
        },
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Table.configure({ resizable: true }),
      TableHeader,
      TableCell,
      TableRow,
      CodeBlock,
      HorizontalRule,
      HardBreak,
    ],
  });

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}