'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Target,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { ProcessingOutput, Epic, Story } from '@/types';
import { cn } from '@/lib/utils';

interface ResultsDisplayProps {
  results: ProcessingOutput;
}

function StoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-3 ml-4 bg-white">
      <button
        className="w-full flex items-start gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{story.id}</span>
            {story.storyPoints && (
              <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                {story.storyPoints} pts
              </span>
            )}
          </div>
          <p className="font-medium text-gray-900 mt-1">{story.title}</p>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pl-6 space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 italic">{story.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Acceptance Criteria</p>
            <ul className="space-y-1">
              {story.acceptanceCriteria.map((ac, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{ac}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EpicCard({ epic }: { epic: Epic }) {
  const [expanded, setExpanded] = useState(true);

  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700',
  };

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 mt-0.5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 mt-0.5 text-gray-400" />
        )}
        <Target className="w-5 h-5 text-primary-500 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{epic.id}</span>
            <span className={cn('px-2 py-0.5 text-xs rounded', priorityColors[epic.priority])}>
              {epic.priority}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{epic.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{epic.description}</p>
        </div>
        <span className="text-sm text-gray-400">{epic.stories.length} stories</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {epic.stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'risks' | 'assumptions' | 'questions'>('risks');

  return (
    <div className="space-y-6">
      {/* Discovery Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Discovery Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Context</p>
            <p className="text-gray-700">{results.discoverySummary.context}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Key Insights</p>
            <ul className="space-y-1">
              {results.discoverySummary.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">User Problems</p>
            <ul className="space-y-1">
              {results.discoverySummary.userProblems.map((problem, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Epics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Epics & Stories ({results.epics.length} epics,{' '}
          {results.epics.reduce((acc, e) => acc + e.stories.length, 0)} stories)
        </h2>
        <div className="space-y-4">
          {results.epics.map((epic) => (
            <EpicCard key={epic.id} epic={epic} />
          ))}
        </div>
      </div>

      {/* Risks, Assumptions, Questions */}
      <Card>
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'risks', label: 'Risks', icon: AlertTriangle, count: results.risks.length },
              {
                key: 'assumptions',
                label: 'Assumptions',
                icon: Lightbulb,
                count: results.assumptions.length,
              },
              {
                key: 'questions',
                label: 'Questions',
                icon: HelpCircle,
                count: results.openQuestions.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        <CardContent className="pt-4">
          {activeTab === 'risks' && (
            <ul className="space-y-2">
              {results.risks.map((risk) => (
                <li key={risk.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{risk.description}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded',
                      risk.impact === 'HIGH' && 'bg-red-200 text-red-800',
                      risk.impact === 'MEDIUM' && 'bg-yellow-200 text-yellow-800',
                      risk.impact === 'LOW' && 'bg-green-200 text-green-800'
                    )}
                  >
                    {risk.impact}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'assumptions' && (
            <ul className="space-y-2">
              {results.assumptions.map((assumption) => (
                <li
                  key={assumption.id}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-gray-700 flex-1">{assumption.description}</p>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded',
                      assumption.validated ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {assumption.validated ? 'Validated' : 'Unvalidated'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'questions' && (
            <ul className="space-y-2">
              {results.openQuestions.map((q) => (
                <li key={q.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-700 flex-1">{q.question}</p>
                  {q.owner && (
                    <span className="px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded">
                      {q.owner}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

