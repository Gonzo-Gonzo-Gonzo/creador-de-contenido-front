import { useState, useEffect } from 'react'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [articleId, setArticleId] = useState(null)
  const [article, setArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Function to generate article
  const generateArticle = async () => {
    if (!prompt.trim()) {
      setError('Please enter some text first')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://54.175.129.125/make_article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })
      
      const data = await response.json()
      setArticleId(data.article_id)
    } catch (err) {
      setError('Error generating article. Please try again.')
      setIsLoading(false)
    }
  }

  // Function to poll for article status
  useEffect(() => {
    let pollInterval

    const checkArticleStatus = async () => {
      try {
        const response = await fetch(`http://54.175.129.125/get_article/${articleId}`)
        
        if (response.status === 200) {
          const data = await response.json()
          console.log(data)
          setArticle(data)
          console.log(article)
          setIsLoading(false)
          clearInterval(pollInterval)
        } else if (response.status === 202) {
          // Article still generating, continue polling
        } else {
          throw new Error('Failed to fetch article')
        }
      } catch (err) {
        setError('Error fetching article. Please try again.')
        setIsLoading(false)
        clearInterval(pollInterval)
      }
    }

    if (articleId) {
      // Poll every 2 seconds
      pollInterval = setInterval(checkArticleStatus, 5000)
    }

    // Cleanup function
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [articleId])
  useEffect(() => {
    console.log(article)
  }, [article])
  return (
    <div className="app-container">
      <h1>Generador de Artículos</h1>
      
      {/* Input Section */}
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt aquí"
          disabled={isLoading}
        />
        <button 
          onClick={generateArticle}
          disabled={isLoading || !prompt.trim()}
        >
          Generar Artículo
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Article Display */}
      {article && !isLoading && (
        <div className="article-section">
          <h1>{article.article.title}</h1>
          <p className="intro">{article.article.intro}</p>
          <p> {article.article.content}</p>
          <p> {article.article.conclusion}</p>
          </div>
      )}
    </div>
  )
}

export default App
