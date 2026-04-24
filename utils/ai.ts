export const callAI = async (prompt: string): Promise<string> => {
  try {
    const apiKey = ""; // API key injected by environment
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are the core intelligence of Web O-S, a professional web-based operating system.
    You have "Absolute Power" to control the OS.

    SYSTEM CAPABILITIES:
    - Open apps: browser, explorer, ide, markdown, notepad, paint, calculator, vault, player, services, terminal, settings, integrations.
    - Window management: CLOSE_ALL, MINIMIZE_ALL.
    - Change theme: light, dark, auto.
    - Create files: touch filenames.
    - Notifications: NOTIFY:message.
    - System Status: GET_STATUS.
    - Media Control: PLAY_MEDIA, PAUSE_MEDIA, NEXT_MEDIA.

    COMMAND SYNTAX:
    You MUST include system commands at the end of your response in this format: [CMD: ACTION:VALUE]
    Examples:
    - [CMD: OPEN_APP:notepad]
    - [CMD: CLOSE_ALL:now]
    - [CMD: PLAY_MEDIA:now]
    - [CMD: NOTIFY:Your backup is complete]    Be helpful and conversational, but always execute requested actions.
    User query: ${prompt}`
          }]
        }]
      })
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  } catch (error) {
    console.error('[Web O-S] AI API Error:', error);
    return 'Error: Unable to connect to AI service. Please try again later.';
  }
};
