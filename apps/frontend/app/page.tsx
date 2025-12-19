"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Send,
  X,
  Bookmark,
  Clock,
  Plus,
  Settings2,
  Upload,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TabType = "summary" | "epics" | "risks" | "assumptions" | "questions" | "insights"

type Story = {
  title: string
  description: string
  criteria: string[]
  estimationHours: number
}

type Epic = {
  title: string
  description: string
  stories: Story[]
}

type AgentPersona =
  | "General Orchestrator"
  | "PM"
  | "Content Producer"
  | "UX"
  | "Dev"
  | "Tech Lead"
  | "PO"
  | "Business Consultant"
  | "QA Lead"
  | "Account Lead"
  | "Client Owner"

type ChatMessage = {
  id: string
  agent: AgentPersona
  content: string
  timestamp: Date
  isUser?: boolean
}

type InsightType = "Summary" | "Epics & Stories" | "Risks & Assumptions" | "Open Questions" | "Other"

type Insight = {
  id: string
  type: InsightType
  agent: AgentPersona
  label: string
  content: string
  timestamp: Date
}

type FreeformNote = {
  id: string
  title: string
  content: string
  timestamp: Date
}

type ContextItem = {
  id: string
  story: Story
}

const agentEmojis: Record<AgentPersona, string> = {
  "General Orchestrator": "🧠",
  PM: "📋",
  "Content Producer": "✍️",
  UX: "🎨",
  Dev: "💻",
  "Tech Lead": "🧩",
  PO: "🧾",
  "Business Consultant": "📊",
  "QA Lead": "✅",
  "Account Lead": "🤝",
  "Client Owner": "🧑‍💼",
}

// Project Output Types (matching backend schema)
type ProjectOutput = {
  projectSummary: {
    title: string
    description: string
    objectives: string[]
  }
  epics: Array<{
    id: string
    title: string
    description: string
    stories: Array<{
      id: string
      title: string
      shortDescription: string
      fullDescription: string
      acceptanceCriteria: string[]
      tags: string[]
    }>
  }>
  risks: Array<{
    id: string
    description: string
    impact: "low" | "medium" | "high"
    probability: "low" | "medium" | "high"
    mitigation: string
  }>
  assumptions: Array<{
    id: string
    description: string
    reason: string
  }>
  openQuestions: {
    unclassified: unknown[]
    categories: Array<{
      category: string
      questions: Array<{
        id: string
        question: string
        type: string
        origin: string
      }>
    }>
  }
}

export default function AgileFactory() {
  const [activeTab, setActiveTab] = useState<TabType>("summary")
  const [sourceTab, setSourceTab] = useState<"miro" | "file">("miro")
  const [miroUrl, setMiroUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { toast } = useToast()
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [projectOutput, setProjectOutput] = useState<ProjectOutput | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [enableChatAndInsights, setEnableChatAndInsights] = useState(true)
  const [showFeatureFlags, setShowFeatureFlags] = useState(false)

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AgentPersona>("General Orchestrator")
  const [chatHistories, setChatHistories] = useState<Record<AgentPersona, ChatMessage[]>>({
    "General Orchestrator": [
      {
        id: "1",
        agent: "General Orchestrator",
        content: "Hello! I'm the General Orchestrator. I can help coordinate your discovery process across all areas.",
        timestamp: new Date(),
      },
    ],
    PM: [],
    "Content Producer": [],
    UX: [],
    Dev: [],
    "Tech Lead": [],
    PO: [],
    "Business Consultant": [],
    "QA Lead": [],
    "Account Lead": [],
    "Client Owner": [],
  })
  const [messageInput, setMessageInput] = useState("")
  const [contextItems, setContextItems] = useState<ContextItem[]>([])

  const [savingMessageId, setSavingMessageId] = useState<string | null>(null)
  const [saveInsightForm, setSaveInsightForm] = useState<{
    type: InsightType
    label: string
  }>({ type: "Summary", label: "" })

  const [insights, setInsights] = useState<Insight[]>([])
  const [freeformNotes, setFreeformNotes] = useState<FreeformNote[]>([])
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")

  const agentPersonas: AgentPersona[] = [
    "General Orchestrator",
    "PM",
    "Content Producer",
    "UX",
    "Dev",
    "Tech Lead",
    "PO",
    "Business Consultant",
    "QA Lead",
    "Account Lead",
    "Client Owner",
  ]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const addToContext = (story: Story) => {
    // Check if story is already in context
    const exists = contextItems.some((item) => item.story.title === story.title)
    if (exists) {
      toast({
        title: "Already in Context",
        description: `"${story.title}" is already in chat context`,
        variant: "destructive",
      })
      return
    }

    const newItem: ContextItem = {
      id: Date.now().toString(),
      story,
    }
    setContextItems((prev) => [...prev, newItem])

    toast({
      title: "Added to Context",
      description: `"${story.title}" added to chat context`,
    })
  }

  const removeFromContext = (id: string) => {
    setContextItems((prev) => prev.filter((item) => item.id !== id))
  }

  const sendMessage = () => {
    if (!messageInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      agent: activeAgent,
      content: messageInput,
      timestamp: new Date(),
      isUser: true,
    }

    setChatHistories((prev) => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], userMessage],
    }))

    setMessageInput("")

    // Simulate agent response
    setTimeout(() => {
      const contextInfo = contextItems.length > 0 ? `\n\nContext available: ${contextItems.length} item(s)` : ""
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        agent: activeAgent,
        content: `As ${activeAgent}, I understand your question. Let me provide some insights based on the current discovery...${contextInfo}`,
        timestamp: new Date(),
      }

      setChatHistories((prev) => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], response],
      }))
    }, 1000)
  }

  const saveToInsights = (message: ChatMessage) => {
    const newInsight: Insight = {
      id: Date.now().toString(),
      type: saveInsightForm.type,
      agent: message.agent,
      label: saveInsightForm.label || `${saveInsightForm.type} from ${message.agent}`,
      content: message.content,
      timestamp: new Date(),
    }

    setInsights((prev) => [newInsight, ...prev])
    setSavingMessageId(null)
    setSaveInsightForm({ type: "Summary", label: "" })

    toast({
      title: "Saved!",
      description: "Insight saved successfully",
    })
  }

  const toggleInsightExpansion = (id: string) => {
    const newExpanded = new Set(expandedInsights)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedInsights(newExpanded)
  }

  const addFreeformNote = () => {
    if (!newNoteTitle.trim()) return

    const note: FreeformNote = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      timestamp: new Date(),
    }

    setFreeformNotes((prev) => [note, ...prev])
    setNewNoteTitle("")
    setNewNoteContent("")
    setIsAddingNote(false)

    toast({
      title: "Note Added!",
      description: "Your note has been saved",
    })
  }

  const handleProcess = async () => {
    setIsProcessing(true)
    setError(null)
    setProjectOutput(null)

    try {
      const formData = new FormData()
      
      if (sourceTab === "file") {
        if (!uploadedFile) {
          throw new Error("Please select a file to upload")
        }
        formData.append("file", uploadedFile)
      } else {
        if (!miroUrl.trim()) {
          throw new Error("Please enter a Miro URL")
        }
        formData.append("miroUrl", miroUrl.trim())
      }

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Processing failed")
      }

      setProjectOutput(data.data)
      toast({
        title: "Success!",
        description: "Project breakdown generated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const availableTabs = [
    { id: "summary", label: "Summary" },
    { id: "epics", label: "Epics & Stories" },
    { id: "risks", label: "Risks" },
    { id: "assumptions", label: "Assumptions" },
    { id: "questions", label: "Open Questions" },
    ...(enableChatAndInsights ? [{ id: "insights", label: "Insights" }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">Agile Factory</h1>
          <p className="text-sm text-muted-foreground">Generate MVP plans from your Miro boards</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Miro Source</CardTitle>
            <CardDescription>Enter your Miro board or upload a discovery document</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={sourceTab} onValueChange={(v) => setSourceTab(v as "miro" | "file")}>
              <TabsList className="mb-4">
                <TabsTrigger value="miro">Miro</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>
              <TabsContent value="miro" className="mt-0">
                <div className="flex gap-3">
                  <Input
                    placeholder="Miro board ID or URL..."
                    value={miroUrl}
                    onChange={(e) => setMiroUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="lg" onClick={handleProcess} disabled={isProcessing || !miroUrl.trim()}>
                    {isProcessing ? "Processing..." : "Run Orchestrator"}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}
              </TabsContent>
              <TabsContent value="file" className="mt-0">
                <div className="flex gap-3">
                  <div className="flex flex-1 items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="file-upload" className="flex-1 cursor-pointer text-sm text-muted-foreground">
                      {uploadedFile
                        ? uploadedFile.name
                        : "Upload an image, PDF, JSON, or text file"}
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.json,.txt,.jpg,.jpeg,.png"
                    />
                  </div>
                  <Button size="lg" onClick={handleProcess} disabled={isProcessing || !uploadedFile}>
                    {isProcessing ? "Processing..." : "Run Orchestrator"}
                  </Button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-border">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {!projectOutput && !isProcessing && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Upload a file or enter a Miro URL and click "Run Orchestrator" to generate project breakdown</p>
              </CardContent>
            </Card>
          )}
          {isProcessing && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Processing your input... This may take a moment.</p>
              </CardContent>
            </Card>
          )}
          {projectOutput && (
            <>
              {activeTab === "summary" && <SummaryTab projectOutput={projectOutput} onCopy={copyToClipboard} />}
              {activeTab === "epics" && (
                <EpicsTab projectOutput={projectOutput} onOpenEpic={setSelectedEpic} onOpenStory={setSelectedStory} onAddToContext={addToContext} />
              )}
              {activeTab === "risks" && <RisksTab projectOutput={projectOutput} onCopy={copyToClipboard} />}
              {activeTab === "assumptions" && <AssumptionsTab projectOutput={projectOutput} onCopy={copyToClipboard} />}
              {activeTab === "questions" && <QuestionsTab projectOutput={projectOutput} onCopy={copyToClipboard} />}
            </>
          )}
          {activeTab === "insights" && enableChatAndInsights && (
            <InsightsTab
              insights={insights}
              freeformNotes={freeformNotes}
              expandedInsights={expandedInsights}
              onToggleExpand={toggleInsightExpansion}
              onCopy={copyToClipboard}
              isAddingNote={isAddingNote}
              onStartAddNote={() => setIsAddingNote(true)}
              onCancelAddNote={() => {
                setIsAddingNote(false)
                setNewNoteTitle("")
                setNewNoteContent("")
              }}
              newNoteTitle={newNoteTitle}
              setNewNoteTitle={setNewNoteTitle}
              newNoteContent={newNoteContent}
              setNewNoteContent={setNewNoteContent}
              onAddNote={addFreeformNote}
            />
          )}
        </div>
      </main>

      <button
        onClick={() => setShowFeatureFlags(!showFeatureFlags)}
        className="fixed bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg border border-border transition-transform hover:scale-110"
      >
        <Settings2 className="h-5 w-5 text-foreground" />
      </button>

      {showFeatureFlags && (
        <Card className="fixed bottom-20 left-6 w-64 shadow-xl z-50">
          <CardHeader>
            <CardTitle className="text-sm">Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <label htmlFor="chat-insights-toggle" className="text-sm font-medium cursor-pointer">
                Enable Chat & Insights
              </label>
              <Switch
                id="chat-insights-toggle"
                checked={enableChatAndInsights}
                onCheckedChange={setEnableChatAndInsights}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {enableChatAndInsights && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {enableChatAndInsights && isChatOpen && (
        <div className="fixed bottom-0 right-0 top-0 z-50 flex border-l border-border bg-card shadow-xl">
          {/* Agent Sidebar */}
          <div className="flex w-16 flex-col items-center gap-3 border-r border-border bg-muted/30 py-4">
            {agentPersonas.map((agent) => (
              <button
                key={agent}
                onClick={() => setActiveAgent(agent)}
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition-all ${
                  activeAgent === agent
                    ? "bg-primary text-primary-foreground shadow-md scale-110"
                    : "bg-background hover:bg-accent"
                }`}
                title={agent}
              >
                {agentEmojis[agent]}
              </button>
            ))}
          </div>

          {/* Chat Content */}
          <div className="flex w-96 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{agentEmojis[activeAgent]}</span>
                <h2 className="font-semibold">{activeAgent}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {chatHistories[activeAgent].map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`rounded-lg p-3 ${
                      message.isUser ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8"
                    }`}
                  >
                    {!message.isUser && (
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold">{message.agent}</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>

                  {/* Save to Insights Button - only for agent messages */}
                  {!message.isUser && (
                    <div className="flex justify-end">
                      {savingMessageId === message.id ? (
                        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Type</label>
                            <Select
                              value={saveInsightForm.type}
                              onValueChange={(value) =>
                                setSaveInsightForm((prev) => ({ ...prev, type: value as InsightType }))
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Summary">Summary</SelectItem>
                                <SelectItem value="Epics & Stories">Epics & Stories</SelectItem>
                                <SelectItem value="Risks & Assumptions">Risks & Assumptions</SelectItem>
                                <SelectItem value="Open Questions">Open Questions</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Label (optional)</label>
                            <Input
                              placeholder="e.g., Client-friendly version"
                              value={saveInsightForm.label}
                              onChange={(e) => setSaveInsightForm((prev) => ({ ...prev, label: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveToInsights(message)} className="h-7 text-xs">
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSavingMessageId(null)}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSavingMessageId(message.id)}
                          className="h-7 text-xs"
                        >
                          <Bookmark className="mr-1 h-3 w-3" />
                          Save to Insights
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 space-y-3">
              {/* Context Pills */}
              {contextItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contextItems.map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="flex items-center gap-1.5 bg-primary/10 text-primary pr-1 pl-2.5 py-1"
                    >
                      <span className="text-xs max-w-[200px] truncate">{item.story.title}</span>
                      <button
                        onClick={() => removeFromContext(item.id)}
                        className="rounded-sm hover:bg-primary/20 p-0.5 transition-colors"
                        aria-label="Remove from context"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button size="sm" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedEpic} onOpenChange={() => setSelectedEpic(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                EPIC
              </Badge>
              {selectedEpic?.title}
            </DialogTitle>
            <DialogDescription>{selectedEpic?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Epic Title</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedEpic?.title || "", "Epic Title")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedEpic?.title}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Epic Description</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedEpic?.description || "", "Epic Description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedEpic?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                STORY
              </Badge>
              {selectedStory?.title}
            </DialogTitle>
            <DialogDescription>{selectedStory?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Story Title</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedStory?.title || "", "Story Title")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedStory?.title}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Story Description</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedStory?.description || "", "Story Description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm italic text-muted-foreground">{selectedStory?.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Estimation</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`${selectedStory?.estimationHours || 0} hours`, "Estimation Hours")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedStory?.estimationHours || 0} hours</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  Acceptance Criteria
                  <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
                    AC: {selectedStory?.criteria.length || 0} items
                  </Badge>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      selectedStory?.criteria.map((c) => `- ${c}`).join("\n") || "",
                      "Acceptance Criteria",
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {selectedStory?.criteria.map((criterion, index) => (
                  <li key={index}>• {criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

// Summary Tab Component
function SummaryTab({ projectOutput, onCopy }: { projectOutput: ProjectOutput; onCopy: (text: string, label: string) => void }) {
  const summaryText = `${projectOutput.projectSummary.title}\n\n${projectOutput.projectSummary.description}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{projectOutput.projectSummary.title}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onCopy(summaryText, "Summary")}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Summary
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="leading-relaxed text-foreground">{projectOutput.projectSummary.description}</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Objectives</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {projectOutput.projectSummary.objectives.map((objective, index) => (
              <li key={index}>• {objective}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Project Overview</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <span className="text-xs text-muted-foreground">Epics:</span>
              <span className="text-xs font-medium">{projectOutput.epics.length}</span>
            </Badge>
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <span className="text-xs text-muted-foreground">Total Stories:</span>
              <span className="text-xs font-medium">
                {projectOutput.epics.reduce((acc, epic) => acc + epic.stories.length, 0)}
              </span>
            </Badge>
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <span className="text-xs text-muted-foreground">Risks:</span>
              <span className="text-xs font-medium">{projectOutput.risks.length}</span>
            </Badge>
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <span className="text-xs text-muted-foreground">Assumptions:</span>
              <span className="text-xs font-medium">{projectOutput.assumptions.length}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Epics Tab Component
function EpicsTab({
  projectOutput,
  onOpenEpic,
  onOpenStory,
  onAddToContext,
}: {
  projectOutput: ProjectOutput
  onOpenEpic: (epic: Epic) => void
  onOpenStory: (story: Story) => void
  onAddToContext: (story: Story) => void
}) {
  // Convert project output epics to display format
  const epics: Epic[] = projectOutput.epics.map((epic) => ({
    title: epic.title,
    description: epic.description,
    stories: epic.stories.map((story) => ({
      title: story.title,
      description: story.fullDescription,
      criteria: story.acceptanceCriteria,
      estimationHours: 0, // Not in schema
    })),
  }))

  const [collapsedEpics, setCollapsedEpics] = useState<Set<number>>(new Set())

  const toggleEpic = (index: number) => {
    const newCollapsed = new Set(collapsedEpics)
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index)
    } else {
      newCollapsed.add(index)
    }
    setCollapsedEpics(newCollapsed)
  }

  return (
    <div className="space-y-4">
      {epics.map((epic, index) => (
        <Card key={index} className="bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <button onClick={() => toggleEpic(index)} className="flex flex-1 items-start gap-3 text-left">
                {collapsedEpics.has(index) ? (
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                      EPIC
                    </Badge>
                    <CardTitle className="text-base">{epic.title}</CardTitle>
                  </div>
                  {collapsedEpics.has(index) ? (
                    <CardDescription className="text-sm">
                      {epic.stories.length} {epic.stories.length === 1 ? "story" : "stories"}
                    </CardDescription>
                  ) : (
                    <CardDescription>{epic.description}</CardDescription>
                  )}
                </div>
              </button>
              <Button variant="ghost" size="sm" onClick={() => onOpenEpic(epic)}>
                View Details
              </Button>
            </div>
          </CardHeader>

          {!collapsedEpics.has(index) && (
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {epic.stories.map((story, storyIndex) => (
                  <div key={storyIndex} className="relative group">
                    <button
                      onClick={() => onOpenStory(story)}
                      className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToContext(story)
                        }}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 hover:bg-primary/10"
                        title="Add to chat context"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>

                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                          STORY
                        </Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          AC: {story.criteria.length}
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                          <Clock className="mr-1 h-3 w-3" />
                          {story.estimationHours}h
                        </Badge>
                      </div>
                      <h5 className="mb-1 font-medium text-foreground">{story.title}</h5>
                      <p className="line-clamp-2 text-sm italic text-muted-foreground">{story.description}</p>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

// Risks Tab Component
function RisksTab({ projectOutput, onCopy }: { projectOutput: ProjectOutput; onCopy: (text: string, label: string) => void }) {
  const risks = projectOutput.risks.map((risk) => ({
    title: risk.id,
    description: `${risk.description} Mitigation: ${risk.mitigation}`,
    impact: risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1) as "High" | "Medium" | "Low",
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Risks
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onCopy(risks.map((r) => `${r.title} (${r.impact}): ${r.description}`).join("\n\n"), "All Risks")
            }
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Risks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Risk</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{risk.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{risk.description}</TableCell>
                <TableCell>
                  <Badge variant={risk.impact === "High" ? "destructive" : "secondary"}>{risk.impact}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function AssumptionsTab({ projectOutput, onCopy }: { projectOutput: ProjectOutput; onCopy: (text: string, label: string) => void }) {
  const assumptions = projectOutput.assumptions.map((assumption) => ({
    title: assumption.id,
    description: `${assumption.description} Reason: ${assumption.reason}`,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Assumptions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onCopy(assumptions.map((a) => `${a.title}: ${a.description}`).join("\n\n"), "All Assumptions")
            }
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Assumptions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Assumption</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assumptions.map((assumption, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{assumption.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{assumption.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Questions Tab Component
function QuestionsTab({ projectOutput, onCopy }: { projectOutput: ProjectOutput; onCopy: (text: string, label: string) => void }) {
  // Flatten questions from all categories
  const questions = projectOutput.openQuestions.categories.flatMap((category) =>
    category.questions.map((q) => ({
      question: q.question,
      category: category.category,
    }))
  )

  const categoryColors = {
    Client: "bg-blue-500/10 text-blue-600",
    Internal: "bg-green-500/10 text-green-600",
    Technical: "bg-purple-500/10 text-purple-600",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Open Questions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n"), "All Questions")}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Questions
          </Button>
        </div>
        <CardDescription>Questions that need to be answered before or during the discovery phase</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="text-sm">{item.question}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={categoryColors[item.category as keyof typeof categoryColors]}>
                    {item.category}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function InsightsTab({
  insights,
  freeformNotes,
  expandedInsights,
  onToggleExpand,
  onCopy,
  isAddingNote,
  onStartAddNote,
  onCancelAddNote,
  newNoteTitle,
  setNewNoteTitle,
  newNoteContent,
  setNewNoteContent,
  onAddNote,
}: {
  insights: Insight[]
  freeformNotes: FreeformNote[]
  expandedInsights: Set<string>
  onToggleExpand: (id: string) => void
  onCopy: (text: string, label: string) => void
  isAddingNote: boolean
  onStartAddNote: () => void
  onCancelAddNote: () => void
  newNoteTitle: string
  setNewNoteTitle: (title: string) => void
  newNoteContent: string
  setNewNoteContent: (content: string) => void
  onAddNote: () => void
}) {
  const typeColors = {
    Summary: "bg-blue-500/10 text-blue-600",
    "Epics & Stories": "bg-purple-500/10 text-purple-600",
    "Risks & Assumptions": "bg-red-500/10 text-red-600",
    "Open Questions": "bg-yellow-500/10 text-yellow-600",
    Other: "bg-gray-500/10 text-gray-600",
  }

  const agentColors = {
    "General Orchestrator": "bg-slate-500/10 text-slate-600",
    PM: "bg-blue-500/10 text-blue-600",
    "Content Producer": "bg-green-500/10 text-green-600",
    UX: "bg-purple-500/10 text-purple-600",
    Dev: "bg-orange-500/10 text-orange-600",
    "Tech Lead": "bg-red-500/10 text-red-600",
    PO: "bg-pink-500/10 text-pink-600",
    "Business Consultant": "bg-cyan-500/10 text-cyan-600",
    "QA Lead": "bg-lime-500/10 text-lime-600",
    "Account Lead": "bg-amber-500/10 text-amber-600",
    "Client Owner": "bg-indigo-500/10 text-indigo-600",
  }

  return (
    <div className="space-y-8">
      {/* Saved Alternatives Section */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Alternatives</CardTitle>
          <CardDescription>Alternative versions and refined outputs saved from agent conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No saved insights yet. Use the chat to save alternatives.
            </p>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Title and Tags */}
                      <div>
                        <h4 className="mb-2 font-medium">{insight.label}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className={typeColors[insight.type]}>
                            {insight.type}
                          </Badge>
                          <Badge variant="secondary" className={agentColors[insight.agent as keyof typeof agentColors]}>
                            {insight.agent}
                          </Badge>
                        </div>
                      </div>

                      {/* Preview Text */}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {expandedInsights.has(insight.id)
                            ? insight.content
                            : insight.content.slice(0, 120) + (insight.content.length > 120 ? "..." : "")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {insight.content.length > 120 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleExpand(insight.id)}
                            className="h-7 text-xs"
                          >
                            {expandedInsights.has(insight.id) ? "Show less" : "View full"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCopy(insight.content, "Insight")}
                          className="h-7 text-xs"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Freeform Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Freeform Notes</CardTitle>
              <CardDescription>Personal notes and ideas from your discovery process</CardDescription>
            </div>
            {!isAddingNote && (
              <Button size="sm" onClick={onStartAddNote}>
                Add Note
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAddingNote && (
            <Card className="mb-4 border-primary">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Add your note content..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={onAddNote}>
                    Save Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancelAddNote}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {freeformNotes.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No notes yet. Click "Add Note" to create one.</p>
          ) : (
            <div className="space-y-3">
              {freeformNotes.map((note) => (
                <Card key={note.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{note.title}</h4>
                      {note.content && <p className="text-sm text-muted-foreground">{note.content}</p>}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCopy(`${note.title}\n\n${note.content}`, "Note")}
                          className="h-7 text-xs"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </Button>
                        <span className="text-xs text-muted-foreground">{note.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
