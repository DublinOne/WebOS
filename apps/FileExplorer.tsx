import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  Folder, 
  ImageIcon, 
  Music, 
  Video, 
  StickyNote, 
  FileText, 
  Upload, 
  FolderPlus, 
  Loader2, 
  Sparkles, 
  Search, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { FileItem } from '../types';
import { callAI } from '../utils/ai';

interface FileExplorerProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  openMedia: (file: FileItem) => void;
  addNotification?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const FileExplorer = ({ 
  files, 
  setFiles, 
  openMedia,
  addNotification
}: FileExplorerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const currentFiles = useMemo(() => {
    return files.filter(f => f.parentId === currentFolder);
  }, [files, currentFolder]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []).map(file => {
      const size = file.size < 1024 ? `${file.size} B` :
                     file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(2)} KB` :
                     `${(file.size / 1024 / 1024).toFixed(2)} MB`;
                     
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file' as const,
        mimeType: file.type || 'application/octet-stream',
        size,
        url: URL.createObjectURL(file),
        date: new Date().toLocaleDateString(),
        parentId: currentFolder
      };
    });
    setFiles(prev => [...prev, ...uploadedFiles]);
    
    if (addNotification && uploadedFiles.length > 0) {
      addNotification('Upload Complete', `Successfully uploaded ${uploadedFiles.length} file(s)`, 'success');
    }
    
    if (e.target) e.target.value = '';
  }, [currentFolder, setFiles, addNotification]);

  const createFolder = useCallback(() => {
    const name = prompt('Folder name:');
    if (!name) return;
    
    setFiles(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'folder',
      size: '-',
      date: new Date().toLocaleDateString(),
      parentId: currentFolder
    }]);
    
    if (addNotification) addNotification('System', `Created folder: ${name}`, 'info');
  }, [currentFolder, setFiles, addNotification]);

  const deleteFile = useCallback((id: string, isFolder: boolean) => {
    if (isFolder) {
      const deleteRecursive = (folderId: string) => {
        const children = files.filter(f => f.parentId === folderId);
        children.forEach(child => {
          if (child.type === 'folder') deleteRecursive(child.id);
        });
        setFiles(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
      };
      if (confirm('Delete this folder and all its contents?')) {
        deleteRecursive(id);
        if (addNotification) addNotification('System', `Deleted folder and contents`, 'warning');
      }
    } else {
      setFiles(prev => prev.filter(f => f.id !== id));
      if (addNotification) addNotification('System', `Deleted file`, 'warning');
    }
  }, [files, setFiles, addNotification]);

  const startRename = useCallback((file: FileItem) => {
    setRenamingId(file.id);
    setNewName(file.name);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId && newName.trim()) {
      setFiles(prev => prev.map(f => f.id === renamingId ? { ...f, name: newName.trim() } : f));
    }
    setRenamingId(null);
    setNewName('');
  }, [renamingId, newName, setFiles]);

  const analyzeStorage = useCallback(async () => {
    if (files.length === 0) {
      if (addNotification) addNotification('Storage', 'No files to analyze', 'warning');
      return;
    }
    setAnalyzing(true);
    const fileList = files.filter(f => f.type === 'file').map(f => `${f.name} (${f.mimeType})`).join(', ');
    const promptText = `I have the following files: ${fileList}. Give a 1-sentence summary and 2 suggestions.`;
    
    const analysis = await callAI(promptText);
    if (addNotification) addNotification('AI Analysis', analysis, 'info');
    setAnalyzing(false);
  }, [files, addNotification]);

  const getIcon = (file: FileItem) => {
    if (file.type === 'folder') return Folder;
    if (file.mimeType?.startsWith('image')) return ImageIcon;
    if (file.mimeType?.startsWith('audio')) return Music;
    if (file.mimeType?.startsWith('video')) return Video;
    if (file.mimeType?.startsWith('text')) return StickyNote;
    return FileText;
  };

  const breadcrumb = useMemo(() => {
    const path: FileItem[] = [];
    let current = currentFolder;
    while (current) {
      const folder = files.find(f => f.id === current);
      if (folder) {
        path.unshift(folder);
        current = folder.parentId;
      } else break;
    }
    return path;
  }, [currentFolder, files]);

  return (
    <div className="p-4 h-full text-slate-200 flex flex-col">
      <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button 
            onClick={() => setCurrentFolder(undefined)}
            className="hover:text-slate-200 transition-colors"
          >
            Home
          </button>
          {breadcrumb.map((folder) => (
            <React.Fragment key={folder.id}>
              <span>/</span>
              <button 
                onClick={() => setCurrentFolder(folder.id)}
                className="hover:text-slate-200 transition-colors"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
          <Upload size={16} /> Upload Files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          multiple 
          accept="image/*,video/*,audio/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.json,.xml,.csv,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.md"
          title="Supported: Images, Videos, Audio, Documents, Code files"
        />
            
            <button 
              onClick={createFolder}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FolderPlus size={16} /> New Folder
            </button>
            
            <button 
              onClick={analyzeStorage} 
              disabled={analyzing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
              Analyze
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 rounded-md px-3 py-2 border border-slate-700">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:outline-none text-sm w-32 md:w-48 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {currentFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
          <Folder size={64} className="mb-4 opacity-20" />
          <p>No files or folders. Upload or create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-auto">
          {currentFiles.map(file => {
            const Icon = getIcon(file);
            const isRenaming = renamingId === file.id;
            
            return (
              <div 
                key={file.id} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/webos-file', JSON.stringify(file));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="group relative bg-slate-800/50 hover:bg-slate-800 p-4 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all flex flex-col items-center text-center cursor-pointer"
                onDoubleClick={() => {
                  if (file.type === 'folder') {
                    setCurrentFolder(file.id);
                  } else {
                    openMedia(file);
                  }
                }}
              >
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                
                {isRenaming ? (
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRename();
                      if (e.key === 'Escape') { setRenamingId(null); setNewName(''); }
                    }}
                    className="text-sm font-medium w-full bg-slate-900 border border-blue-500 rounded px-1 text-center"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium truncate w-full mb-1">{file.name}</span>
                )}
                
                <span className="text-xs text-slate-500">{file.size}</span>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); startRename(file); }}
                    className="p-1.5 bg-slate-900 rounded-full text-slate-400 hover:text-blue-400"
                    aria-label="Rename"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id, file.type === 'folder'); }}
                    className="p-1.5 bg-slate-900 rounded-full text-slate-400 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
