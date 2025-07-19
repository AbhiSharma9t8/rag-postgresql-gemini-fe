// src/App.jsx
import React, { useState } from 'react';
import './App.css'; // We'll create this file for styling

function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_ENDPOINT = 'http://localhost:8000/query'; // Your FastAPI RAG endpoint

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setLoading(true);
    setError(null);
    setResponse(null); // Clear previous response

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Indicate that we prefer JSON response
        },
        body: JSON.stringify({ question: question }),
      });

      if (!res.ok) {
        // Handle HTTP errors
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>RAG Query Interface</h1>
        <p>Ask your database a question in natural language!</p>
      </header>

      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What is the total sum of the salaries of employees in the 'Engineering' department?"
          rows="4"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Get Answer'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <h3>Error:</h3>
          <p>{error}</p>
          <p>Please check your FastAPI server and network connection.</p>
        </div>
      )}

      {response && (
        <div className="response-container">
          <h2>Query Results</h2>
          <div className="result-section">
            <h3>Your Question:</h3>
            <p className="user-question">{response.query}</p>
          </div>

          <div className="result-section">
            <h3>Generated SQL Query:</h3>
            <pre className="sql-query-generated"><code>{response.sql_query_generated}</code></pre>
          </div>

          <div className="result-section">
            <h3>LLM Answer:</h3>
            <p className="llm-answer" dangerouslySetInnerHTML={{ __html: response.llm_answer }}></p>
            {/* Using dangerouslySetInnerHTML if the LLM sometimes returns formatted text (e.g., markdown converted to HTML) */}
          </div>

          {response.raw_db_results && (
            <div className="result-section">
              <h3>Raw Database Results:</h3>
              <pre className="raw-db-results">
                <code>{JSON.stringify(response.raw_db_results, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;