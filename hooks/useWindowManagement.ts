import { useReducer, useCallback, useEffect } from 'react';
import { WindowInstance, WindowAction, WindowManagerState, AppDefinition } from '../types';

const windowReducer = (state: WindowManagerState, action: WindowAction): WindowManagerState => {
  // ... (reducer logic remains the same)
  switch (action.type) {
    case 'OPEN': {
      const existing = state.windows.find(w => w.appId === action.app.id);
      if (existing) {
        return {
          ...state,
          windows: state.windows.map(w => 
            w.id === existing.id 
              ? { ...w, isMinimized: false, zIndex: state.nextZIndex } 
              : w
          ),
          activeId: existing.id,
          nextZIndex: state.nextZIndex + 1
        };
      }

      const offset = state.windows.length * 30;
      const newWindow: WindowInstance = {
        id: Date.now(),
        appId: action.app.id,
        title: action.app.title,
        icon: action.app.icon,
        component: action.app.component,
        props: action.props || {},
        isMinimized: false,
        isMaximized: false,
        isClosing: false,
        x: 50 + offset,
        y: 50 + offset,
        w: action.app.defaultWidth || 800,
        h: action.app.defaultHeight || 500,
        zIndex: state.nextZIndex
      };

      return {
        windows: [...state.windows, newWindow],
        activeId: newWindow.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'START_CLOSING': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isClosing: true } : w
        )
      };
    }

    case 'CLOSE': {
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.id),
        activeId: state.activeId === action.id ? null : state.activeId
      };
    }

    case 'MINIMIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isMinimized: !w.isMinimized } : w
        ),
        activeId: state.activeId === action.id ? null : state.activeId
      };
    }

    case 'MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isMaximized: !w.isMaximized, zIndex: state.nextZIndex } : w
        ),
        activeId: action.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'FOCUS': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        activeId: action.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'UPDATE_POSITION': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w
        )
      };
    }

    case 'UPDATE_SIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, w: action.w, h: action.h } : w
        )
      };
    }

    case 'CYCLE_WINDOWS': {
      if (state.windows.length === 0) return state;
      
      const visibleWindows = state.windows.filter(w => !w.isMinimized);
      if (visibleWindows.length === 0) return state;

      const currentIndex = visibleWindows.findIndex(w => w.id === state.activeId);
      const nextIndex = (currentIndex + 1) % visibleWindows.length;
      const nextWindow = visibleWindows[nextIndex];

      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === nextWindow.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        activeId: nextWindow.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    default:
      return state;
  }
};

export const useWindowManagement = (initialState?: WindowManagerState) => {
  const [state, dispatch] = useReducer(windowReducer, initialState || {
    windows: [],
    activeId: null,
    nextZIndex: 10
  });

  // Persist state to localStorage
  useEffect(() => {
    const serializableState = {
      ...state,
      windows: state.windows.map(({ icon, component, ...rest }) => ({
        ...rest,
        // icon and component are functions/components, can't be stringified
      }))
    };
    localStorage.setItem('webos_window_state', JSON.stringify(serializableState));
  }, [state]);

  const openApp = useCallback((app: AppDefinition, props?: any) => {
    dispatch({ type: 'OPEN', app, props });
  }, []);

  const closeWindow = useCallback((id: number) => {
    dispatch({ type: 'START_CLOSING', id });
    setTimeout(() => {
      dispatch({ type: 'CLOSE', id });
    }, 200);
  }, []);

  const minimizeWindow = useCallback((id: number) => {
    dispatch({ type: 'MINIMIZE', id });
  }, []);

  const maximizeWindow = useCallback((id: number) => {
    dispatch({ type: 'MAXIMIZE', id });
  }, []);

  const focusWindow = useCallback((id: number) => {
    dispatch({ type: 'FOCUS', id });
  }, []);

  const updatePosition = useCallback((id: number, x: number, y: number) => {
    dispatch({ type: 'UPDATE_POSITION', id, x, y });
  }, []);

  const updateSize = useCallback((id: number, w: number, h: number) => {
    dispatch({ type: 'UPDATE_SIZE', id, w, h });
  }, []);

  const cycleWindows = useCallback(() => {
    dispatch({ type: 'CYCLE_WINDOWS' });
  }, []);

  return {
    state,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
    cycleWindows
  };
};
