'use client';

import { useState, useRef } from 'react';

interface UniverseData {
  name: string;
  classes: number;
  objects: number;
  dimensions: number;
  measures: number;
  tables: number;
  joins: number;
  details: {
    classList: string[];
    objectList: string[];
    tableList: string[];
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [universeData, setUniverseData] = useState<UniverseData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError('');
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-universe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du parsing du fichier');
      }

      const data = await response.json();
      setUniverseData(data);
      setMessages([{
        role: 'assistant',
        content: `Univers "${data.name}" chargé avec succès! Je peux maintenant répondre à vos questions sur cet univers.`
      }]);
    } catch (err) {
      setError('Erreur lors de la lecture du fichier. Assurez-vous qu\'il s\'agit d\'un fichier univers Business Objects valide (.unv, .unx ou XML).');
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !universeData) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage,
          universeData: universeData,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la requête');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite lors du traitement de votre question.'
      }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Business Objects Universe Analyzer</h1>
        <p>Téléchargez votre univers et posez vos questions</p>
      </div>

      <div className="main-content">
        <div className="upload-section">
          <h2>Importer un univers</h2>
          <div
            className={`upload-area ${dragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              Cliquez ou glissez-déposez votre fichier univers<br />
              (.unv, .unx, .xml)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".unv,.unx,.xml"
              onChange={handleFileChange}
            />
          </div>
          {fileName && (
            <div className="file-info">
              <strong>Fichier chargé:</strong> {fileName}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="universe-info">
          <h2>Informations de l'univers</h2>
          {universeData ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="number">{universeData.classes}</div>
                  <div className="label">Classes</div>
                </div>
                <div className="stat-card">
                  <div className="number">{universeData.objects}</div>
                  <div className="label">Objets</div>
                </div>
                <div className="stat-card">
                  <div className="number">{universeData.dimensions}</div>
                  <div className="label">Dimensions</div>
                </div>
                <div className="stat-card">
                  <div className="number">{universeData.measures}</div>
                  <div className="label">Mesures</div>
                </div>
              </div>
              <div className="details-section">
                <h3 style={{marginBottom: '10px'}}>Classes:</h3>
                {universeData.details.classList.map((cls, idx) => (
                  <div key={idx} className="detail-item">{cls}</div>
                ))}
              </div>
            </>
          ) : (
            <p style={{color: '#666', textAlign: 'center', padding: '40px'}}>
              Importez un univers pour voir ses informations
            </p>
          )}
        </div>
      </div>

      <div className="chat-section">
        <h2>💬 Posez vos questions</h2>
        <div className="chat-messages">
          {messages.length === 0 && !universeData && (
            <p style={{color: '#999', textAlign: 'center', padding: '40px'}}>
              Importez un univers pour commencer à poser des questions
            </p>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              Analyse en cours...
            </div>
          )}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Posez une question sur l'univers..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!universeData || isLoading}
          />
          <button
            className="chat-button"
            onClick={handleSendMessage}
            disabled={!universeData || isLoading || !inputMessage.trim()}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
