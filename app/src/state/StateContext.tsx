import { createContext, useContext, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { ProductionEntryState } from './types';
import { ProductionEntryAction, productionEntryReducer } from './reducer';
import { createDraftBootState } from './bootstrap';
import type { DraftBootState } from './bootstrap';

type StateContextType = {
  state: ProductionEntryState;
  dispatch: Dispatch<ProductionEntryAction>;
  boot: DraftBootState;
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export function ProductionEntryProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(createDraftBootState);
  const [state, dispatch] = useReducer(
    productionEntryReducer,
    boot.initialState,
  );

  return (
    <StateContext.Provider value={{ state, dispatch, boot }}>
      {children}
    </StateContext.Provider>
  );
}

export function useProductionEntryState(): ProductionEntryState {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      'useProductionEntryState must be used within a ProductionEntryProvider',
    );
  }
  return context.state;
}

export function useProductionEntryDispatch(): Dispatch<ProductionEntryAction> {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      'useProductionEntryDispatch must be used within a ProductionEntryProvider',
    );
  }
  return context.dispatch;
}

export function useProductionEntryBoot(): DraftBootState {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      'useProductionEntryBoot must be used within a ProductionEntryProvider',
    );
  }
  return context.boot;
}

export function useProductionEntry() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      'useProductionEntry must be used within a ProductionEntryProvider',
    );
  }
  return context;
}
