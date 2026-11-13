"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold, Code2, Heading2, Heading3, Heading4, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Minus, Quote, Redo, Underline, Undo, Unlink,
} from "lucide-react";
import { MediaModal } from "./MediaPicker";
import { Label } from "./Form";

function Btn({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={on} disabled={disabled} title={label} aria-label={label} aria-pressed={active} className={`grid size-8 place-items-center rounded transition disabled:opacity-30 ${active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-200"}`}>
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, source, setSource }: { editor: Editor; onImage: () => void; source: boolean; setSource: (v: boolean) => void }) {
  const link = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (e.g. /contact-us/ or https://…)", prev ?? "");
    if (url === null) return;
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 p-1.5">
      <Btn label="Heading 2" active={editor.isActive("heading", { level: 2 })} on={() => c().toggleHeading({ level: 2 }).run()} disabled={source}><Heading2 className="size-4" /></Btn>
      <Btn label="Heading 3" active={editor.isActive("heading", { level: 3 })} on={() => c().toggleHeading({ level: 3 }).run()} disabled={source}><Heading3 className="size-4" /></Btn>
      <Btn label="Small heading" active={editor.isActive("heading", { level: 4 })} on={() => c().toggleHeading({ level: 4 }).run()} disabled={source}><Heading4 className="size-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Btn label="Bold" active={editor.isActive("bold")} on={() => c().toggleBold().run()} disabled={source}><Bold className="size-4" /></Btn>
      <Btn label="Italic" active={editor.isActive("italic")} on={() => c().toggleItalic().run()} disabled={source}><Italic className="size-4" /></Btn>
      <Btn label="Underline" active={editor.isActive("underline")} on={() => c().toggleUnderline().run()} disabled={source}><Underline className="size-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Btn label="Bullet list" active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()} disabled={source}><List className="size-4" /></Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()} disabled={source}><ListOrdered className="size-4" /></Btn>
      <Btn label="Quote" active={editor.isActive("blockquote")} on={() => c().toggleBlockquote().run()} disabled={source}><Quote className="size-4" /></Btn>
      <Btn label="Divider" on={() => c().setHorizontalRule().run()} disabled={source}><Minus className="size-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Btn label="Add link" active={editor.isActive("link")} on={link} disabled={source}><LinkIcon className="size-4" /></Btn>
      <Btn label="Remove link" on={() => c().unsetLink().run()} disabled={source || !editor.isActive("link")}><Unlink className="size-4" /></Btn>
      <Btn label="Insert image" on={onImage} disabled={source}><ImagePlus className="size-4" /></Btn>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Btn label="Undo" on={() => c().undo().run()} disabled={source}><Undo className="size-4" /></Btn>
      <Btn label="Redo" on={() => c().redo().run()} disabled={source}><Redo className="size-4" /></Btn>
      <span className="ml-auto" />
      <Btn label="Edit HTML source" active={source} on={() => setSource(!source)}><Code2 className="size-4" /></Btn>
    </div>
  );
}

export default function RichEditor({ name, label, defaultValue = "", hint, minHeight = 320 }: { name: string; label?: string; defaultValue?: string; hint?: string; minHeight?: number }) {
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);
  const [pick, setPick] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "prose-site max-w-none break-words px-4 py-4 outline-none sm:px-5", style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const toggleSource = (v: boolean) => {
    if (!v && editor) editor.commands.setContent(html);
    setSource(v);
  };

  return (
    <div className="min-w-0">
      {label && <Label hint={hint}>{label}</Label>}
      <input type="hidden" name={name} value={html} />
      <div className="overflow-hidden rounded-md border border-zinc-300 bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
        {editor && <Toolbar editor={editor} onImage={() => setPick(true)} source={source} setSource={toggleSource} />}
        {source ? (
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} className="block w-full resize-y p-4 font-mono text-xs outline-none" style={{ minHeight }} spellCheck={false} />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto"><EditorContent editor={editor} /></div>
        )}
      </div>
      <MediaModal open={pick} onClose={() => setPick(false)} onSelect={(urls) => urls.forEach((src) => editor?.chain().focus().setImage({ src }).run())} multiple />
    </div>
  );
}
