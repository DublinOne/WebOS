import { useState, useEffect } from 'react';
import { FileItem, VaultItem } from '../types';

export const useFileSystem = () => {
  // Load persisted data from localStorage
  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos_files');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos_vault');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: '1', title: 'AWS Production Key', value: 'AKIAIOSFODNN7EXAMPLE', type: 'key', date: '2023-10-01' },
      { id: '2', title: 'Master DB Password', value: 'sUp3r_s3cr3t_P4ssw0rd!', type: 'password', date: '2023-11-15' }
    ];
  });

  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem('webos_files', JSON.stringify(files));
  }, [files]);

  // Persist vault items to localStorage
  useEffect(() => {
    localStorage.setItem('webos_vault', JSON.stringify(vaultItems));
  }, [vaultItems]);

  return {
    files,
    setFiles,
    vaultItems,
    setVaultItems
  };
};
