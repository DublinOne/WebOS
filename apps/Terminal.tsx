import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileItem, WindowInstance } from '../types';
import { callAI } from '../utils/ai';

interface TerminalAppProps {
  files: FileItem[];
  windows: WindowInstance[];
  onClose?: () => void;
  setFiles?: React.Dispatch<React.SetStateAction<FileItem[]>>;
  addNotification?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  openApp?: (appKey: string, props?: any) => void;
}

const TerminalApp = ({ 
  files, 
  windows, 
  onClose,
  setFiles,
  addNotification,
  openApp
}: TerminalAppProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{type: 'input' | 'output'; content: string}[]>([
    { type: 'output', content: 'Web O-S Terminal v3.0.0 initialized...' },
    { type: 'output', content: 'Type "help" for available commands.' }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('~');
  const [startTime] = useState(Date.now());
  const [npmPackages, setNpmPackages] = useState<string[]>(['react', 'next', 'typescript']);
  const [gitBranch, setGitBranch] = useState('main');
  const [serverRunning, setServerRunning] = useState(false);
  const [serverPort, setServerPort] = useState(3000);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;

      setHistory(prev => [...prev, { type: 'input', content: cmd }]);
      setCommandHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput('');
      
      const args = cmd.split(' ');
      const command = args[0].toLowerCase();
      
      let response = '';
      
      switch (command) {
        case 'help':
          response = `Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 File System:
  ls              - List files
  cat <file>      - View file contents
  tree            - Show file tree structure
  pwd             - Print working directory
  touch <file>    - Create new file
  mkdir <dir>     - Create new folder
  rm <file>       - Delete file/folder
  mv <src> <dst>  - Move/rename file
  cp <src> <dst>  - Copy file
  grep <ptn> <f>  - Search text in file
  
⚙️  System:
  ps              - Show running processes
  top             - System resource monitor
  uname           - System information
  uptime          - Show system uptime
  neofetch        - Display system info
  kill <pid>      - Close window by PID
  settings        - Open Integration Manager
  apps            - List all available apps
  theme <t>       - Change system theme
  history         - Show command history
  
🤖 AI Commands:
  ask <question>  - Ask AI assistant
  code <desc>     - Generate code snippet
  weather <city>  - Get weather via AI
  
🌐 Network:
  ping <host>     - Test connectivity
  fetch <url>     - Fetch URL content
  curl <url>      - Transfer data from URL
  wget <url>      - Download file from URL
  axs server      - Start server
  axs stop        - Stop server
  
🎮 Fun:
  cowsay <msg>    - Cow says message
  fortune         - Random fortune
  sudo            - Use root powers
  
💡 Other:
  man <cmd>       - Command manual
  sh <file>       - Run shell script
  clear           - Clear terminal
  exit            - Close terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
          break;
          
        case 'history':
          response = commandHistory.map((c, i) => `${(i + 1).toString().padStart(3)}  ${c}`).join('\n');
          break;

        case 'sudo':
          response = "Nice try! This incident will be reported to... absolutely no one. You already have guest root.";
          break;

        case 'theme':
          const newTheme = args[1]?.toLowerCase();
          if (['light', 'dark', 'auto'].includes(newTheme)) {
            // Note: This relies on parent state being updated via props or context
            // For now we'll just acknowledge and assume system handles it
            response = `System theme set to: ${newTheme}`;
            if (addNotification) addNotification('System', `Theme changed to ${newTheme}`, 'info');
          } else {
            response = 'Usage: theme <light|dark|auto>';
          }
          break;

        case 'ping':
          if (!args[1]) {
            response = 'Usage: ping <host>';
          } else {
            const host = args[1];
            setHistory(prev => [...prev, { type: 'output', content: `PING ${host} (127.0.0.1): 56 data bytes` }]);
            let count = 0;
            const interval = setInterval(() => {
              setHistory(prev => [...prev, { type: 'output', content: `64 bytes from 127.0.0.1: icmp_seq=${count} ttl=64 time=${(Math.random() * 20 + 5).toFixed(3)} ms` }]);
              count++;
              if (count >= 4) {
                clearInterval(interval);
                setHistory(prev => [...prev, { type: 'output', content: `\n--- ${host} ping statistics ---\n4 packets transmitted, 4 packets received, 0.0% packet loss` }]);
              }
            }, 500);
            return;
          }
          break;

        case 'fetch':
        case 'curl':
          if (!args[1]) {
            response = `Usage: ${command} <url>`;
          } else {
            setHistory(prev => [...prev, { type: 'output', content: `% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0` }]);
            
            // Use AI to simulate the "fetch" content for realism
            const content = await callAI(`Simulate the raw text/html or JSON output of a curl request to ${args[1]}. Keep it under 15 lines.`);
            
            setHistory(prev => [...prev, { type: 'output', content: `100   ${content.length}  100   ${content.length}    0     0   ${Math.floor(Math.random()*1000)}      0 --:--:-- --:--:-- --:--:--  ${Math.floor(Math.random()*1000)}\n\n${content}` }]);
            return;
          }
          break;

        case 'wget':
          if (!args[1]) {
            response = 'Usage: wget <url>';
          } else if (setFiles) {
            const url = args[1];
            const filename = url.split('/').pop() || 'index.html';
            
            setHistory(prev => [...prev, { type: 'output', content: `--${new Date().toLocaleTimeString()}--  ${url}\nResolving ${url.split('/')[2] || 'server'}... done.\nConnecting to ${url.split('/')[2] || 'server'}... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: ${Math.floor(Math.random() * 50000)} (49K) [text/html]\nSaving to: '${filename}'` }]);
            
            let progress = 0;
            const interval = setInterval(() => {
              progress += 25;
              setHistory(prev => [...prev, { type: 'output', content: `${filename}  [${'='.repeat(progress/5)}${'>'}${'.'.repeat((100-progress)/5)}] ${progress}%  ${Math.floor(Math.random()*500)}K/s` }]);
              
              if (progress >= 100) {
                clearInterval(interval);
                const newFile: FileItem = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: filename,
                  type: 'file',
                  mimeType: 'text/plain',
                  size: '49 KB',
                  url: '',
                  date: new Date().toLocaleDateString(),
                  parentId: undefined
                };
                setFiles(prev => [...prev, newFile]);
                setHistory(prev => [...prev, { type: 'output', content: `\n${new Date().toLocaleTimeString()} (${Math.floor(Math.random()*500)} KB/s) - '${filename}' saved.` }]);
                if (addNotification) addNotification('Download', `Finished downloading ${filename}`, 'success');
              }
            }, 400);
            return;
          }
          break;

        case 'sh':
          if (!args[1]) {
            response = 'Usage: sh <script.sh>';
          } else {
            const file = files.find(f => f.name === args[1]);
            if (!file) {
              response = `sh: ${args[1]}: No such file`;
            } else {
              setHistory(prev => [...prev, { type: 'output', content: `Executing ${file.name}...` }]);
              // Simulate "installing" a mock package if the script name matches
              if (file.name.toLowerCase().includes('install')) {
                setTimeout(() => {
                  setHistory(prev => [...prev, { type: 'output', content: 'Reading package lists... Done\nBuilding dependency tree...\nInstalling new components...\n[####################] 100%\nInstallation complete. Try running the new app from the desktop.' }]);
                  if (addNotification) addNotification('System', 'New components installed successfully', 'success');
                }, 1500);
              } else {
                response = 'Script executed successfully (sandbox mode).';
              }
            }
          }
          break;

        case 'weather':
          const city = args.slice(1).join(' ');
          if (!city) {
            response = "Usage: weather <city>";
          } else {
            setHistory(prev => [...prev, { type: 'output', content: `🌤️ Checking weather for ${city}...` }]);
            const weatherReport = await callAI(`Give a creative 3-line weather report for ${city}. Use emojis.`);
            setHistory(prev => {
              const filtered = prev.filter(p => !p.content.includes('Checking weather'));
              return [...filtered, { type: 'output', content: `Weather in ${city}:\n${weatherReport}` }];
            });
            return;
          }
          break;

        case 'man':
          if (!args[1]) {
            response = 'What manual page do you want? Try "man help".';
          } else {
            response = `MANUAL: ${args[1].toUpperCase()}\n${'━'.repeat(20)}\nDetailed documentation for ${args[1]} would appear here.\nCurrently, please refer to the "help" command for usage details.`;
          }
          break;

        case 'grep':
          if (!args[1] || !args[2]) {
            response = 'Usage: grep <pattern> <filename>';
          } else {
            const file = files.find(f => f.name === args[2]);
            if (!file) {
              response = `grep: ${args[2]}: No such file`;
            } else {
              response = `[Matching lines in ${file.name} for "${args[1]}"]\n(Simulated search result: No matches found in sandbox)`;
            }
          }
          break;

        case 'cp':
          if (!args[1] || !args[2]) {
            response = 'Usage: cp <source> <destination>';
          } else if (setFiles) {
            const sourceFile = files.find(f => f.name === args[1]);
            if (!sourceFile) {
              response = `cp: ${args[1]}: No such file`;
            } else {
              const newFile: FileItem = {
                ...sourceFile,
                id: Math.random().toString(36).substr(2, 9),
                name: args[2],
                date: new Date().toLocaleDateString()
              };
              setFiles(prev => [...prev, newFile]);
              response = `Copied ${args[1]} to ${args[2]}`;
            }
          }
          break;

        case 'clear':
          setHistory([]);
          return;
          
        case 'ls':
          if (files.length === 0) {
            response = 'total 0';
          } else {
            const fileList = files.filter(f => f.type === 'file');
            const folderList = files.filter(f => f.type === 'folder');
            response = `total ${files.length}\n`;
            if (folderList.length > 0) {
              response += folderList.map(f => `📁 ${f.name}/`).join('\n') + '\n';
            }
            if (fileList.length > 0) {
              response += fileList.map(f => `📄 ${f.name.padEnd(30)} ${f.size.padStart(10)}  ${f.date}`).join('\n');
            }
          }
          break;
          
        case 'cat':
          if (!args[1]) {
            response = 'Usage: cat <filename>';
          } else {
            const file = files.find(f => f.name === args[1]);
            if (!file) {
              response = `cat: ${args[1]}: No such file`;
            } else if (file.type === 'folder') {
              response = `cat: ${args[1]}: Is a directory`;
            } else {
              response = `Contents of ${file.name}:\n${'─'.repeat(50)}\n(File content simulation)\n${'─'.repeat(50)}`;
            }
          }
          break;
          
        case 'tree':
          response = '.\n';
          files.forEach((f, i) => {
            const isLast = i === files.length - 1;
            const prefix = isLast ? '└── ' : '├── ';
            const icon = f.type === 'folder' ? '📁' : '📄';
            response += `${prefix}${icon} ${f.name}\n`;
          });
          break;
          
        case 'pwd':
          response = `/home/guest${currentDir === '~' ? '' : currentDir}`;
          break;
          
        case 'ps':
          response = 'PID    NAME              STATUS    MEM      CPU\n' + '─'.repeat(50) + '\n';
          response += windows.map(w => 
            `${w.id.toString().substr(-4).padEnd(6)}${w.title.padEnd(17)}${(w.isMinimized ? 'Sleep' : 'Active').padEnd(10)}${Math.floor(Math.random() * 100)}MB    ${Math.floor(Math.random() * 30)}%`
          ).join('\n');
          break;
          
        case 'apps':
          response = `Installed Applications:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Web Browser
📁 File Manager
💻 Code Studio
📝 Markdown Editor
📝 Notepad
🎨 PixelPaint
🧮 Calculator
🤖 AI Chat
🔐 DevVault
🎬 Media Player
📊 Task Manager
⌨️ Terminal
⚙️ Settings
🔑 Integration Manager (internal://integrations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
          break;

        case 'settings':
        case 'config':
          if (openApp) {
            openApp('INTEGRATIONS');
            response = 'Opening Integration Manager...';
          } else {
            response = 'Error: openApp function not available';
          }
          break;
          
        case 'top':
          response = `System Resources:
CPU Usage:  ${Math.floor(Math.random() * 50 + 20)}%
Memory:     ${Math.floor(Math.random() * 30 + 40)}%
Processes:  ${windows.length} running
Files:      ${files.length} total`;
          break;
          
        case 'neofetch':
          response = `
    ╭───────────────╮     guest@web-os
    │    ████████   │     ───────────
    │    ████████   │     OS: Web O-S 1.2.0
    │    ▀▀▀▀▀▀▀▀   │     Kernel: web-os-kernel
    │               │     Shell: wsh
    │    ▄▄▄▄▄▄▄▄   │     Resolution: ${window.innerWidth}x${window.innerHeight}
    ╰───────────────╯     Terminal: Web O-S Terminal`;
          break;
          
        case 'whoami':
          response = 'guest_user';
          break;
          
        case 'date':
          response = new Date().toString();
          break;
          
        case 'echo':
          response = args.slice(1).join(' ');
          break;
          
        case 'calc':
          const expression = args.slice(1).join('');
          if (!expression) {
            response = 'Usage: calc <expression>';
          } else {
            try {
              const result = new Function('return ' + expression.replace(/[^0-9+\-*/().]/g, ''))();
              response = `${expression} = ${result}`;
            } catch (e) {
              response = 'Error: Invalid expression';
            }
          }
          break;
          
        case 'cowsay':
          const message = args.slice(1).join(' ') || 'Hello!';
          const msgLen = message.length;
          response = `
 ${'_'.repeat(msgLen + 2)}
< ${message} >
 ${'-'.repeat(msgLen + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
          break;
          
        case 'fortune':
          const fortunes = [
            'You will write great code today.',
            'A bug is just a feature in disguise.',
            'Coffee: the developer fuel.',
            'It works on my machine. ¯\\_(ツ)_/¯'
          ];
          response = fortunes[Math.floor(Math.random() * fortunes.length)];
          break;
          
        // File operations
        case 'touch':
          if (!args[1]) {
            response = 'Usage: touch <filename>';
          } else if (setFiles) {
            const exists = files.find(f => f.name === args[1]);
            if (exists) {
              response = `touch: ${args[1]}: File exists`;
            } else {
              const newFile: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: args[1],
                type: 'file',
                mimeType: 'text/plain',
                size: '0 B',
                url: '',
                date: new Date().toLocaleDateString(),
                parentId: undefined
              };
              setFiles(prev => [...prev, newFile]);
              response = `Created: ${args[1]}`;
              if (addNotification) addNotification('System', `Created file ${args[1]} via Terminal`, 'info');
            }
          }
          break;
          
        case 'mkdir':
          if (!args[1]) {
            response = 'Usage: mkdir <dirname>';
          } else if (setFiles) {
            const exists = files.find(f => f.name === args[1]);
            if (exists) {
              response = `mkdir: ${args[1]}: File exists`;
            } else {
              const newFolder: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: args[1],
                type: 'folder',
                size: '-',
                date: new Date().toLocaleDateString(),
                parentId: undefined
              };
              setFiles(prev => [...prev, newFolder]);
              response = `Created directory: ${args[1]}`;
              if (addNotification) addNotification('System', `Created folder ${args[1]} via Terminal`, 'info');
            }
          }
          break;
          
        case 'rm':
          if (!args[1]) {
            response = 'Usage: rm <filename>';
          } else if (setFiles) {
            const fileToDelete = files.find(f => f.name === args[1]);
            if (!fileToDelete) {
              response = `rm: ${args[1]}: No such file or directory`;
            } else {
              setFiles(prev => prev.filter(f => f.name !== args[1]));
              response = `Removed: ${args[1]}`;
              if (addNotification) addNotification('System', `Deleted ${args[1]} via Terminal`, 'warning');
            }
          }
          break;
          
        case 'mv':
          if (!args[1] || !args[2]) {
            response = 'Usage: mv <source> <destination>';
          } else if (setFiles) {
            const fileToMove = files.find(f => f.name === args[1]);
            if (!fileToMove) {
              response = `mv: ${args[1]}: No such file or directory`;
            } else {
              setFiles(prev => prev.map(f => 
                f.name === args[1] ? { ...f, name: args[2] } : f
              ));
              response = `Renamed: ${args[1]} -> ${args[2]}`;
            }
          }
          break;
          
        case 'ask':
          const query = args.slice(1).join(' ');
          if (!query) {
            response = "Usage: ask <question>";
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Thinking...' }]);
            const aiReply = await callAI(`Terminal query: ${query}. Give a concise, helpful answer.`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Thinking...');
              return [...filtered, { type: 'output', content: `🤖 ${aiReply}` }];
            });
            return;
          }
          break;

        case 'axs':
          const axsCmd = args[1];
          if (axsCmd === 'server') {
            if (serverRunning) {
              response = `AXS server is already running on port ${serverPort}`;
            } else {
              setServerRunning(true);
              const port = parseInt(args[2]) || 3000;
              setServerPort(port);
              response = `AXS Server started at http://localhost:${port}`;
              if (addNotification) addNotification('Network', `Server started on port ${port}`, 'success');
            }
          } else if (axsCmd === 'stop') {
            setServerRunning(false);
            response = 'AXS Server stopped';
            if (addNotification) addNotification('Network', 'Server stopped', 'info');
          }
          break;
          
        case 'exit':
          if (onClose) onClose();
          response = 'Goodbye!';
          break;
          
        default:
          response = `bash: ${command}: command not found`;
      }

      if (response) {
        setHistory(prev => [...prev, { type: 'output', content: response }]);
      }
    }
  }, [input, files, windows, onClose, commandHistory, historyIndex, currentDir, startTime, setFiles, addNotification, openApp]);

  return (
    <div 
      className="h-full bg-slate-950 p-4 font-mono text-sm overflow-auto text-slate-200" 
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-1">
        {history.map((line, i) => (
          <div key={i} className={`${line.type === 'input' ? 'text-blue-400 mt-2' : 'text-slate-300 whitespace-pre-wrap'}`}>
            {line.type === 'input' && <span className="mr-2 text-green-500">➜ ~</span>}
            {line.content}
          </div>
        ))}
      </div>
      
      <div className="flex items-center mt-2 text-blue-400">
        <span className="mr-2 text-green-500">➜ ~</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent border-none focus:outline-none text-slate-100"
          aria-label="Terminal command input"
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalApp;
