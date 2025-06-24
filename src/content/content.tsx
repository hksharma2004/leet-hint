import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, SendHorizontal } from 'lucide-react';
import { createOpenRouter } from '@/lib/openrouter';
import { OPENROUTER_MODEL, OPENROUTER_API_KEY } from '@/constants/valid_modals';

import './style.css';
import { Input } from '@/components/ui/input';
import { SYSTEM_PROMPT } from '@/constants/prompt';
import { extractCode } from './util';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Markdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

async function handleGenerateOpenRouterResponse(
  messages: { role: string; content: string }[],
  apiKey: string
) {
  try {
    const openrouter = createOpenRouter({ apiKey });
    const response = await openrouter.chat({
      model: OPENROUTER_MODEL,
      messages,
    });
    return response;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}

interface ChatBoxProps {
  context: {
    programmingLanguage: string;
    problemStatement: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  type: 'text' | 'markdown';
}

function ChatBox({ context }: ChatBoxProps) {
  const [value, setValue] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIResponse = async () => {
    setIsLoading(true);
    try {
      // Get API key from storage
      const { apiKey } = await chrome.storage.local.get('apiKey');
      console.log('Retrieved API key from storage:', apiKey);
      
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
      }

      const userMessage = value;
      const userCurrentCodeContainer = document.querySelector('.view-line');

      const extractedCode = extractCode(
        userCurrentCodeContainer?.innerHTML ?? ''
      );

      const systemPromptModified = SYSTEM_PROMPT.replace(
        '{{problem_statement}}',
        context.problemStatement
      )
        .replace('{{programming_language}}', context.programmingLanguage)
        .replace('{{user_code}}', extractedCode);

      const messages = [
        { role: 'system', content: systemPromptModified },
        ...chatHistory.map((chat) => ({
          role: chat.role,
          content: chat.message,
        })),
        { role: 'user', content: userMessage },
      ];

      console.log('Sending request to OpenRouter with key:', apiKey);
      const apiResponse = await handleGenerateOpenRouterResponse(messages, apiKey);
      console.log('OpenRouter response:', apiResponse);

      if (apiResponse?.choices?.[0]?.message?.content) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            message: apiResponse.choices[0].message.content,
            type: 'markdown',
          },
        ]);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('API Error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: 'Error generating response. Please try again.',
          type: 'text',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);
    setValue('');
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleGenerateAIResponse();
  };
  return (
      <div className="w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-auto p-4 space-y-3" ref={chatBoxRef}>
          {chatHistory.map((message, index) => (
            <div
              key={index.toString()}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-br-sm' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                }`}
              >
                {message.type === 'markdown' ? (
                  <Markdown className="prose dark:prose-invert prose-sm">
                    {message.message}
                  </Markdown>
                ) : (
                  <p className="text-sm">{message.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) onSendMessage();
              }}
              placeholder="Ask about this problem..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={onSendMessage} 
              disabled={isLoading || !value.trim()}
              size="icon"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            AI suggestions may contain errors - always verify solutions
          </p>
        </div>
      </div>
  );
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);

  const metaDescriptionEl = document.querySelector('meta[name=description]');

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  return (
    <div className="__chat-container dark">
      {chatboxExpanded && (
        <ChatBox context={{ problemStatement, programmingLanguage: 'C++' }} />
      )}
      <div className="flex justify-end">
        <Button onClick={() => setChatboxExpanded(!chatboxExpanded)}>
          <Bot />
          Ask AI
        </Button>
      </div>
    </div>
  );
};

export default ContentPage;
