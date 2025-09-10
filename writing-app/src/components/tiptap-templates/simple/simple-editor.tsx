import * as React from "react"
import { EditorContent, EditorContext, useEditor, useEditorState } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { CharacterCount } from '@tiptap/extensions'
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useScrolling } from "@/hooks/use-scrolling"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

// Custom hook for optimized word counting
const useWordCount = (editor: any) => {
  const [wordCount, setWordCount] = React.useState(0)

  const updateWordCount = React.useCallback(() => {
    if (editor?.storage?.characterCount) {
      const count = editor.storage.characterCount.words()
      setWordCount(count)
    }
  }, [editor])

  const throttledUpdateWordCount = useThrottledCallback(updateWordCount, 100)

  React.useEffect(() => {
    if (!editor) return

    // Initial count
    updateWordCount()

    // Listen to editor updates
    const onUpdate = () => {
      throttledUpdateWordCount()
    }

    editor.on('update', onUpdate)

    return () => {
      editor.off('update', onUpdate)
    }
  }, [editor, throttledUpdateWordCount])

  return wordCount
}

const MainToolbarContent = ({
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
      </ToolbarGroup>

      <ToolbarSeparator />
      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />
    
  </>
)

export function SimpleEditor() {
  const isMobile = useIsMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: [ "paragraph"] }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      CharacterCount.configure({
        wordCounter: (text) => text.split(/\s+/).filter((word) => word !== '').length,
      }),
    ],
    content,
  })

  const isScrolling = useScrolling()
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })
  const wordCount = useWordCount(editor)

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isScrolling && isMobile
              ? { opacity: 0, transition: "opacity 0.1s ease-in-out" }
              : {}),
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
        {wordCount} / 100 words
        <div>
      <div className="button-bar">
      <Button onClick={() => {
        if (editor) {
          const content = editor.getJSON()
          console.log('Editor content:', JSON.stringify(content, null, 2))
          
          // Example: Store the content (you could save this to localStorage, API, etc.)
          localStorage.setItem('editorContent', JSON.stringify(content))
        }
      }}>Save</Button>
      
      <Button onClick={() => {
        if (editor) {
          const savedContent = localStorage.getItem('editorContent')
          if (savedContent) {
            const content = JSON.parse(savedContent)
            editor.commands.setContent(content)
            console.log('Content restored from JSON')
          } else {
            console.log('No saved content found')
          }
        }
      }}>Restore</Button>
      
      <Button onClick={async () => {
        try {
          const response = await fetch('http://localhost:8000/')
          const data = await response.json()
          console.log('FastAPI response:', data)
        } catch (error) {
          console.error('Error calling FastAPI:', error)
        }
      }}>Test FastAPI</Button>
      <Button disabled={wordCount < 100} onClick={() => {
        alert('Saved to database!')
      }}>Share</Button>
      </div>
      </div>
      </EditorContext.Provider>
    </div>
  )
}
