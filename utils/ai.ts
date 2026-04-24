export const callAI = async (prompt: string): Promise<string> => {
  try {
    const apiKey = ""; // API key injected by environment
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  } catch (error) {
    console.error('[Web O-S] AI API Error:', error);
    return 'Error: Unable to connect to AI service. Please try again later.';
  }
};
