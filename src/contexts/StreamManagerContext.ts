import { StreamManager } from '@/stream';
import { createContext } from 'react';

export const StreamManagerContext = createContext<StreamManager>(new StreamManager());
