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
import { useState } from "react";

import "@/assets/styles/tiptap-editor.css";

const colors = [
  "#000000", "#ffffff", "#f87171", "#fbbf24", "#34d399",
  "#60a5fa", "#a78bfa", "#f472b6", "#d1d5db",
];

type Props = {
  content: object; // Now expects Tiptap JSON doc
  onChange: (json: object) => void; // Now sends Tiptap JSON doc
  showLinkUnlink?: boolean;
};

export default function EditorClient({ content, onChange, showLinkUnlink = true }: Props) {
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [selectedImagePos, setSelectedImagePos] = useState<{ from: number; to: number } | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const editor = useEditor({
    content,
    onUpdate: ({ editor }) => {
      // The key change: send Tiptap JSON, not HTML
      onChange(editor.getJSON());
    },
    extensions: [
      TextStyle,
      Color,
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
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
        addNodeView() {
          return ({ node, getPos, editor }) => {
            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.style.width = node.attrs.width ?? "auto";
            img.style.float = node.attrs.float ?? "";
            img.className = "tiptap-img";
            img.contentEditable = "false";

            const wrapper = document.createElement("span");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            wrapper.appendChild(img);

            const btn = document.createElement("button");
            btn.innerHTML = "×";
            btn.className = "tiptap-img-delete";
            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof getPos === "function") {
                editor.chain().focus().deleteRange({ from: getPos(), to: getPos() + 1 }).run();
              }
            };
            wrapper.appendChild(btn);

            let startX = 0;
            let startWidth = 0;
            const resizeHandle = document.createElement("div");
            resizeHandle.className = "tiptap-img-resize";
            resizeHandle.onmousedown = (e) => {
              e.preventDefault();
              startX = e.clientX;
              startWidth = img.width;
              document.onmousemove = (moveEvent) => {
                const newWidth = Math.max(32, startWidth + (moveEvent.clientX - startX));
                img.width = newWidth;
                if (typeof getPos === "function") {
                  editor.commands.command(({ tr }) => {
                    tr.setNodeMarkup(getPos(), undefined, {
                      ...node.attrs,
                      width: `${newWidth}px`,
                    });
                    return true;
                  });
                }
              };
              document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
              };
            };
            wrapper.appendChild(resizeHandle);

            wrapper.onclick = (e) => {
              setSelectedImagePos({ from: getPos(), to: getPos() + 1 });
              e.stopPropagation();
            };

            return {
              dom: wrapper,
              contentDOM: null,
              stopEvent: () => true,
            };
          };
        },
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Table.configure({ resizable: true }),
      TableHeader.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-background-color"),
              renderHTML: (attributes) =>
                attributes.backgroundColor
                  ? {
                      style: `background-color: ${attributes.backgroundColor}`,
                      "data-background-color": attributes.backgroundColor,
                    }
                  : {},
            },
          };
        },
      }),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-background-color"),
              renderHTML: (attributes) =>
                attributes.backgroundColor
                  ? {
                      style: `background-color: ${attributes.backgroundColor}`,
                      "data-background-color": attributes.backgroundColor,
                    }
                  : {},
            },
          };
        },
      }),
      TableRow,
      CodeBlock,
      HorizontalRule,
      HardBreak,
    ],
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert min-h-[200px] p-2 focus:outline-none tiptap",
      },
      handleClickOn(view, pos, node, nodePos) {
        if (node.type.name === "image") {
          setSelectedImagePos({ from: nodePos, to: nodePos + node.nodeSize });
        } else {
          setSelectedImagePos(null);
        }
        return false;
      },
    },
  });

  const setCellColor = (color: string) => editor?.chain().focus().setCellAttribute("backgroundColor", color).run();
  const setTextColor = (color: string) => editor?.chain().focus().setColor(color).run();
  const setImageFloat = (float: "left" | "right" | "none") => {
    if (selectedImagePos && editor) {
      editor.chain().focus().setNodeAttribute("image", "float", float === "none" ? null : float).run();
    }
  };
  const setImageWidth = (width: string) => {
    if (selectedImagePos && editor) {
      editor.chain().focus().setNodeAttribute("image", "width", width).run();
    }
  };
  const removeImage = () => {
    if (selectedImagePos && editor) {
      editor.chain().focus().deleteRange(selectedImagePos).run();
      setSelectedImagePos(null);
    }
  };
  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      editor?.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  if (!editor) return null;

  // Link form interaction
  const openLinkInput = () => {
    setLinkValue(editor.getAttributes("link").href || "");
    setShowLinkInput(true);
    setTimeout(() => {
      const el = document.getElementById("tiptap-link-input");
      if (el) el.focus();
    }, 0);
  };
  const handleLinkInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor.chain().focus();
      if (!linkValue) {
        editor.chain().unsetLink().run();
      } else {
        editor.chain().extendMarkRange("link").setLink({ href: linkValue }).run();
      }
      setShowLinkInput(false);
    }
    if (e.key === "Escape") {
      setShowLinkInput(false);
    }
  };

  return (
    <div>
      <div className="tiptap-toolbar mb-2 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "tiptap-btn-active" : "tiptap-btn"}
        >
          Normal
        </button>
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={editor.isActive("heading", { level }) ? "tiptap-btn-active" : "tiptap-btn"}
          >
            H{level}
          </button>
        ))}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "tiptap-btn-active" : "tiptap-btn"}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "tiptap-btn-active" : "tiptap-btn"}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "tiptap-btn-active" : "tiptap-btn"}><u>U</u></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "tiptap-btn-active" : "tiptap-btn"}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "tiptap-btn-active" : "tiptap-btn"}>1. List</button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="tiptap-btn">❝ Quote</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="tiptap-btn">⌨ Code</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="tiptap-btn">― Rule</button>
        <button type="button" onClick={() => editor.chain().focus().setHardBreak().run()} className="tiptap-btn">↵ New Line</button>
        <input
          type="color"
          onChange={(e) => setTextColor(e.target.value)}
          value={editor.getAttributes("textStyle").color || "#000000"}
          className="tiptap-color-input"
          title="Text color"
        />
        <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="tiptap-btn">
          Remove Color
        </button>
        {/* LINK AND UNLINK */}
        {!showLinkInput ? (
          <>
            <button
              type="button"
              onClick={openLinkInput}
              className={editor.isActive("link") ? "tiptap-btn-active" : "tiptap-btn"}
            >
              🔗 Link
            </button>
            {showLinkUnlink && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className={editor.isActive("link") ? "tiptap-btn" : "tiptap-btn-disabled"}
                disabled={!editor.isActive("link")}
              >
                ⛔ Unlink
              </button>
            )}
          </>
        ) : (
          <input
            id="tiptap-link-input"
            className="tiptap-link-input"
            type="text"
            placeholder="Paste or type a URL and press Enter"
            value={linkValue}
            onChange={e => setLinkValue(e.target.value)}
            onKeyDown={handleLinkInputKeyDown}
            onBlur={() => setShowLinkInput(false)}
            style={{
              minWidth: 180,
              fontSize: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              padding: "2px 6px"
            }}
          />
        )}

        <label className="tiptap-btn cursor-pointer">
          🖼️ Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) insertImage(file);
            }}
          />
        </label>
        <button onClick={() => setShowTablePrompt(true)} className="tiptap-btn">➕ Table</button>
        <button onClick={() => editor.chain().focus().deleteTable().run()} className="tiptap-btn">❌ Table</button>
        <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="tiptap-btn">|◀️ Col</button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="tiptap-btn">Col ▶️|</button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()} className="tiptap-btn">⛔ Col</button>
        <button onClick={() => editor.chain().focus().addRowBefore().run()} className="tiptap-btn">▲ Row</button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()} className="tiptap-btn">▼ Row</button>
        <button onClick={() => editor.chain().focus().deleteRow().run()} className="tiptap-btn">⛔ Row</button>
        <button onClick={() => editor.chain().focus().undo().run()} className="tiptap-btn">↶ Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="tiptap-btn">↷ Redo</button>
      </div>

      {editor.isActive("table") && (
        <div className="tiptap-table-colors mb-2 flex flex-wrap gap-1 items-center">
          <span className="text-xs mr-2">Cell Color:</span>
          {colors.map((color) => (
            <button
              key={color}
              className="tiptap-table-color-btn"
              style={{ backgroundColor: color }}
              onClick={() => setCellColor(color)}
              aria-label={`Set cell color ${color}`}
              type="button"
            />
          ))}
        </div>
      )}

      {selectedImagePos && (
        <div className="tiptap-img-menu flex flex-wrap gap-2 mb-2 items-center">
          <span className="text-xs">Image:</span>
          <button className="tiptap-btn" onClick={() => setImageFloat("left")}>⬅️ Float Left</button>
          <button className="tiptap-btn" onClick={() => setImageFloat("right")}>Float Right ➡️</button>
          <button className="tiptap-btn" onClick={() => setImageFloat("none")}>No Float</button>
          <button className="tiptap-btn" onClick={() => setImageWidth("100%")}>100% Width</button>
          <button className="tiptap-btn" onClick={() => setImageWidth("50%")}>50% Width</button>
          <button className="tiptap-btn" onClick={removeImage}>❌ Delete Image</button>
        </div>
      )}

      <EditorContent editor={editor} />

      {showTablePrompt && (
        <div className="mt-4 border p-4 rounded-md bg-muted text-muted-foreground space-y-2">
          <div className="flex gap-4 items-center">
            <label>Rows:</label>
            <input type="number" value={tableRows} min={1} max={10} onChange={(e) => setTableRows(+e.target.value)} className="border p-1 w-16" />
            <label>Cols:</label>
            <input type="number" value={tableCols} min={1} max={10} onChange={(e) => setTableCols(+e.target.value)} className="border p-1 w-16" />
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={includeHeader} onChange={() => setIncludeHeader(!includeHeader)} />
              Header
            </label>
          </div>
          <div className="flex gap-4">
            <button
              className="tiptap-btn"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: includeHeader })
                  .run()
                setShowTablePrompt(false)
              }}
            >
              ✅ Insert
            </button>
            <button onClick={() => setShowTablePrompt(false)} className="tiptap-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}