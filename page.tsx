'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Monitor, 
  Folder, 
  Video, 
  Settings, 
  Wifi, 
  Volume2, 
  Battery,
  Terminal,
  Bot,
  Globe,
  Lock,
  Calculator,
  StickyNote,
  Palette,
  FolderPlus,
  Code,
  Key,
  FileText
} from 'lucide-react';

// Types
import { WindowInstance, AppDefinition, FileItem } from './types';

// Hooks
import { useWindowManagement } from './hooks/useWindowManagement';
import { useFileSystem } from './hooks/useFileSystem';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';

// Components
import DesktopIcon from './components/DesktopIcon';
import WindowFrame from './components/WindowFrame';
import TaskbarItem from './components/TaskbarItem';
import ContextMenu from './components/ContextMenu';
import TaskView from './components/TaskView';
import NotificationCenter from './components/NotificationCenter';
import BootScreen from './components/BootScreen';
import LockScreen from './components/LockScreen';

// Apps
import CalculatorApp from './apps/Calculator';
import NotepadApp from './apps/Notepad';
import PixelPaintApp from './apps/PixelPaint';
import DevVault from './apps/DevVault';
import WebBrowser from './apps/WebBrowser';
import AIAssistant from './apps/AIAssistant';
import FileExplorer from './apps/FileExplorer';
import MediaPlayer from './apps/MediaPlayer';
import TaskManager from './apps/TaskManager';
import TerminalApp from './apps/Terminal';
import SettingsApp from './apps/Settings';
import CodeStudioApp from './apps/CodeStudio';
import MarkdownEditor from './apps/MarkdownEditor';
import IntegrationManager from './apps/IntegrationManager';

export default function WebOS() {
  const { theme, setTheme } = useTheme();
  const { files, setFiles, vaultItems, setVaultItems } = useFileSystem();

  const [isBooting, setIsBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [installedApps, setInstalledApps] = useState<string[]>([
    'browser', 'explorer', 'notepad', 'terminal', 'ai_assistant', 'settings', 'player', 'services', 'integrations'
  ]);

  // App Definitions
  const APPS: Record<string, AppDefinition> = useMemo(() => ({
    BROWSER: { id: 'browser', title: 'Web Browser', icon: Globe, component: WebBrowser, defaultWidth: 900, defaultHeight: 600 },
    EXPLORER: { id: 'explorer', title: 'File Manager', icon: Folder, component: FileExplorer, defaultWidth: 850, defaultHeight: 550 },
    IDE: { id: 'ide', title: 'Code Studio', icon: Code, component: CodeStudioApp, defaultWidth: 900, defaultHeight: 600 },
    MARKDOWN: { id: 'markdown', title: 'Markdown Editor', icon: FileText, component: MarkdownEditor, defaultWidth: 800, defaultHeight: 600 },
    NOTEPAD: { id: 'notepad', title: 'Notepad', icon: StickyNote, component: NotepadApp, defaultWidth: 700, defaultHeight: 500 },
    PAINT: { id: 'paint', title: 'PixelPaint', icon: Palette, component: PixelPaintApp, defaultWidth: 500, defaultHeight: 600 },
    CALCULATOR: { id: 'calculator', title: 'Calculator', icon: Calculator, component: CalculatorApp, defaultWidth: 300, defaultHeight: 450 },
    AI_ASSISTANT: { id: 'ai_assistant', title: 'AI Chat', icon: Bot, component: AIAssistant, defaultWidth: 500, defaultHeight: 600 },
    VAULT: { id: 'vault', title: 'DevVault', icon: Lock, component: DevVault, defaultWidth: 600, defaultHeight: 500 },
    PLAYER: { id: 'player', title: 'Media Player', icon: Video, component: MediaPlayer, defaultWidth: 700, defaultHeight: 500 },
    SERVICES: { id: 'services', title: 'Task Manager', icon: Monitor, component: TaskManager, defaultWidth: 750, defaultHeight: 550 },
    TERMINAL: { id: 'terminal', title: 'Terminal', icon: Terminal, component: TerminalApp, defaultWidth: 700, defaultHeight: 450 },
    SETTINGS: { id: 'settings', title: 'Settings', icon: Settings, component: SettingsApp, defaultWidth: 600, defaultHeight: 500 },
    INTEGRATIONS: { id: 'integrations', title: 'Integrations', icon: Key, component: IntegrationManager, defaultWidth: 800, defaultHeight: 600 }
  }), []);

  // Hydrate window state from localStorage
  const hydratedWindowState = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const saved = localStorage.getItem('webos_window_state');
    if (!saved) return undefined;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        windows: parsed.windows.map(win => {
          const appDef = Object.values(APPS).find(a => a.id === win.appId);
          return {
            ...win,
            icon: appDef?.icon,
            component: appDef?.component
          };
        }).filter(win => win.component)
      };
    } catch (e) {
      console.error('Failed to hydrate window state', e);
      return undefined;
    }
  }, [APPS]);

  const { 
    state: windowState, 
    openApp: dispatchOpenApp, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    focusWindow, 
    updatePosition, 
    updateSize,
    cycleWindows
  } = useWindowManagement(hydratedWindowState);

  const { notifications, addNotification, removeNotification, clearAll: clearNotifications } = useNotifications();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number; y: number} | null>(null);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  const openApp = useCallback((appKey: string, props = {}) => {
    const appDef = APPS[appKey];
    if (!appDef) return;

    // Package Manager Check
    if (!installedApps.includes(appDef.id) && !['TERMINAL', 'SETTINGS'].includes(appKey)) {
      addNotification('System', `${appDef.title} is not installed. Use 'install ${appDef.id}' in Terminal.`, 'error');
      return;
    }

    dispatchOpenApp(appDef, props);
    setStartMenuOpen(false);
  }, [APPS, dispatchOpenApp, installedApps, addNotification]);

  const openMedia = useCallback((file: FileItem) => {
    if (file.mimeType?.startsWith('text')) {
      openApp('NOTEPAD', { initialContent: '' });
      return;
    }

    const playerWindow = windowState.windows.find(w => w.appId === APPS.PLAYER.id);
    if (playerWindow) {
      dispatchOpenApp(APPS.PLAYER, { file });
    } else {
      openApp('PLAYER', { file });
    }
  }, [windowState.windows, APPS, openApp, dispatchOpenApp]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        cycleWindows();
      }
      if (e.metaKey && e.key === 'Tab') {
        e.preventDefault();
        setIsTaskViewOpen(prev => !prev);
      }
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (windowState.activeId) closeWindow(windowState.activeId);
      }
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowState.activeId, closeWindow, cycleWindows]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const contextMenuItems = useMemo(() => [
    { label: 'New Folder', icon: FolderPlus, onClick: () => {} },
    { label: 'Terminal Here', icon: Terminal, onClick: () => openApp('TERMINAL') },
    { label: 'System Settings', icon: Settings, onClick: () => openApp('SETTINGS') },
  ], [openApp]);

  const renderWindowContent = useCallback((win: WindowInstance) => {
    const Component = win.component;
    const appProps = { ...win.props, addNotification };
    
    if (win.appId === 'explorer') return <Component files={files} setFiles={setFiles} openMedia={openMedia} addNotification={addNotification} />;
    if (win.appId === 'services') return <Component files={files} windows={windowState.windows} />;
    if (win.appId === 'terminal') return <Component files={files} windows={windowState.windows} onClose={() => closeWindow(win.id)} setFiles={setFiles} addNotification={addNotification} openApp={openApp} installedApps={installedApps} setInstalledApps={setInstalledApps} />;
    if (win.appId === 'vault') return <Component items={vaultItems} setItems={setVaultItems} addNotification={addNotification} />;
    if (win.appId === 'ai_assistant') return (
      <Component 
        openApp={openApp} 
        setTheme={setTheme} 
        setFiles={setFiles} 
        addNotification={addNotification}
        closeWindow={closeWindow}
        minimizeWindow={minimizeWindow}
        windows={windowState.windows}
        files={files}
        setInstalledApps={setInstalledApps}
      />
    );
    if (win.appId === 'notepad') return <Component setFiles={setFiles} {...appProps} />;
    if (win.appId === 'markdown') return <Component setFiles={setFiles} {...appProps} />;
    if (win.appId === 'paint') return <Component setFiles={setFiles} {...appProps} />;
    if (win.appId === 'settings') return <Component theme={theme} setTheme={setTheme} files={files} vaultItems={vaultItems} />;
    if (win.appId === 'integrations') return <Component addNotification={addNotification} />;
    return <Component {...appProps} />;
  }, [files, setFiles, windowState.windows, vaultItems, setVaultItems, theme, setTheme, openMedia, closeWindow, addNotification]);

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center overflow-hidden select-none font-sans"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop')" 
      }}
      onContextMenu={handleContextMenu}
      role="application"
      aria-label="Web O-S Desktop"
    >
      {isBooting && <BootScreen onComplete={() => { setIsBooting(false); setIsLocked(true); }} />}
      {isLocked && <LockScreen onLogin={() => setIsLocked(false)} />}

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      {/* Desktop Icons */}
      <div className="relative z-0 p-6 flex flex-col items-start h-[calc(100%-48px)] flex-wrap content-start gap-4">
        {Object.keys(APPS).filter(key => installedApps.includes(APPS[key].id)).map(key => {
          const app = APPS[key];
          return (
            <DesktopIcon 
              key={key}
              icon={app.icon} 
              label={app.title} 
              color={key === 'TERMINAL' ? 'text-slate-700' : 'text-blue-400'} 
              onClick={() => openApp(key)} 
            />
          );
        })}
      </div>

      {/* Windows */}
      {windowState.windows.map(win => (
        <WindowFrame 
          key={win.id} 
          app={win} 
          onClose={closeWindow} 
          onMinimize={minimizeWindow}
          isActive={windowState.activeId === win.id}
          onFocus={() => focusWindow(win.id)}
          onUpdatePosition={updatePosition}
          onUpdateSize={updateSize}
          onToggleMaximize={maximizeWindow}
        >
          {renderWindowContent(win)}
        </WindowFrame>
      ))}

      {/* Task View */}
      {isTaskViewOpen && (
        <TaskView 
          windows={windowState.windows}
          onClose={() => setIsTaskViewOpen(false)}
          onFocusWindow={focusWindow}
          onCloseWindow={closeWindow}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter 
        notifications={notifications}
        onRemove={removeNotification}
        onClearAll={clearNotifications}
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          items={contextMenuItems}
        />
      )}

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="absolute bottom-12 left-2 w-64 bg-slate-800 rounded-t-lg shadow-2xl border border-slate-700 overflow-hidden z-[60] animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
            <div>
              <div className="text-white font-medium">Guest User</div>
              <div className="text-xs text-slate-400">Local Session</div>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {Object.keys(APPS).filter(key => installedApps.includes(APPS[key].id)).map(key => {
              const AppIcon = APPS[key].icon;
              return (
                <button 
                  key={key} 
                  onClick={() => openApp(key)} 
                  className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded text-slate-200 text-sm transition-colors"
                >
                  <span className="p-1.5 bg-slate-700 rounded"><AppIcon size={14} /></span>
                  {APPS[key].title}
                </button>
              );
            })}
          </div>
          <div className="p-3 bg-slate-900 border-t border-slate-700 flex justify-between">
            <button 
              onClick={() => openApp('SETTINGS')}
              className="p-2 hover:bg-white/10 rounded text-slate-400 transition-colors"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 text-xs font-bold transition-colors"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 flex items-center px-2 z-[100] gap-2"
        role="toolbar"
        aria-label="Taskbar"
      >
        <button 
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${startMenuOpen ? 'bg-white/20' : ''}`}
          aria-label="Start menu"
          aria-expanded={startMenuOpen}
        >
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-sm"></div>
          </div>
        </button>

        <button 
          onClick={() => setIsTaskViewOpen(true)}
          className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors tracking-widest"
        >
          ACTIVITIES
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>

        <div className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar">
          {windowState.windows.map(win => (
            <TaskbarItem 
              key={win.id} 
              app={win} 
              onClick={() => {
                if (win.isMinimized || windowState.activeId !== win.id) {
                   if (win.isMinimized) minimizeWindow(win.id);
                   focusWindow(win.id);
                } else {
                   minimizeWindow(win.id);
                }
              }} 
            />
          ))}
        </div>

        <div 
          className="flex items-center gap-3 px-3 border-l border-slate-700 h-full cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
        >
          <div className="flex gap-2 text-slate-400">
            <div className="relative">
              <Bell size={16} className={notifications.length > 0 ? "text-blue-400" : ""} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900"></span>
              )}
            </div>
            <Wifi size={16} />
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-200 font-medium">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
