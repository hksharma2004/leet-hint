import React from 'react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Check, Key, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    (async function loadAPIKey() {
      if (!chrome) return;
      const keyFromStorage = (await chrome.storage.local.get('apiKey')) as { apiKey?: string };
      if (keyFromStorage.apiKey) setApiKey(keyFromStorage.apiKey);
      setIsLoaded(true);
    })();
  }, []);

  const handleAddAPIKey = async () => {
    if (!apiKey) {
      toast({
        title: 'Invalid API Key',
        description: 'API key cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      toast({
        title: 'Invalid API Key',
        description: 'OpenRouter keys must start with sk-or-v1-',
        variant: 'destructive'
      });
      return;
    }

    if (apiKey.includes(' ')) {
      toast({
        title: 'Invalid API Key',
        description: 'API key cannot contain spaces',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await chrome.storage.local.set({ apiKey });
      console.log('API key saved to storage:', apiKey);
      toast({
        title: 'API Key Saved',
        description: 'Your API key has been securely stored',
        action: <Check className="text-green-500" />
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save API key',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[400px] max-h-[500px] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <img 
            src={chrome.runtime.getURL('assets/logo.svg')} 
            className="w-12 h-12"
            alt="LeetHint Logo"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            LeetHint
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            One hint ahead of the curve
          </p>
        </div>

        {/* API Key Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Key className="w-4 h-4" />
              OpenRouter API Key
            </label>
            <div className="relative">
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                type="password"
                className="font-mono text-sm pr-10"
              />
              {apiKey && apiKey.startsWith('sk-or-v1-') && !apiKey.includes(' ') && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <Button 
            onClick={handleAddAPIKey}
            disabled={!apiKey || isSaving}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Key'
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your API key is stored locally and never sent to our servers
        </div>
      </div>
    </div>
  );
};

export default Popup;
