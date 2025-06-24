'use client';

import { useEffect, useState } from 'react';

export default function TestCalculatorPage() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Filtrer les messages setImmediate parasites
      if (typeof event.data === 'string' && event.data.includes('setImmediate')) {
        return; // Ignorer ces messages
      }
      
      console.log('Message reçu:', event);
      setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${JSON.stringify(event.data)} (origine: ${event.origin})`]);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const calculatorUrl = process.env.NEXT_PUBLIC_CALCULATOR_URL || 'https://calculateur-volume.dodomove.fr';
  const fullUrl = `${calculatorUrl}?embedded=true`;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Calculateur de Volume</h1>
      
      <div className="mb-4">
        <strong>URL utilisée:</strong> {fullUrl}
      </div>

      <div className="mb-4">
        <strong>Messages reçus:</strong>
        <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
          {messages.length === 0 ? 'Aucun message reçu' : messages.map((msg, i) => (
            <div key={i} className="text-sm">{msg}</div>
          ))}
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded">
        <iframe
          src={fullUrl}
          width="100%"
          height="600"
          className="border-0"
          title="Test Calculateur"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
} 