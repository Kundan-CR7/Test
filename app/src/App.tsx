import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import DateShiftCard from './components/DateShiftCard';
import BurmaCard from './components/BurmaCard';
import RepairCard from './components/RepairCard';
import NotesCard from './components/NotesCard';
import StickyActionBar from './components/StickyActionBar';
import { AddPersonModal } from './components/AddPersonModal';
import type { AddPersonSubmitResult } from './components/AddPersonModal';
import { DraftRolloverBanner } from './components/DraftRolloverBanner';
import { UpdateAvailableToast } from './components/UpdateAvailableToast';
import { CncSection } from './components/cnc/CncSection';
import type { ToastRequest } from './components/cnc/CncSection';
import { Toast } from './components/primitives/Toast';
import { SummaryModal } from './components/summary/SummaryModal';
import {
  ProductionEntryProvider,
  useProductionEntryBoot,
  useProductionEntryDispatch,
  useProductionEntryState,
} from './state/StateContext';
import {
  incompleteCncEntryCount,
  previewCtaState,
} from './state/selectors';
import type { BurmaField } from './state/types';
import { basePeople, createInitialState } from './state/reducer';
import {
  clearDraft,
  createDraftSaver,
  loadPreviewLimitState,
  recordPreviewOpen,
  saveCustomPeople,
  saveDraftNow,
} from './state/persistence';
import { useSentinelPassed } from './hooks/useSentinelPassed';
import {
  addCustomPerson,
  hasPerson,
  normalizePersonName,
} from './utils/people';
import { registerProductionEntryServiceWorker } from './pwa';

type ToastState = ToastRequest & {
  id: string;
};

type AddPersonTarget =
  | { type: 'cnc'; entryId: string }
  | { type: 'repair' }
  | { type: 'burma'; field: BurmaField };

function millisecondsUntilNextLocalDay(now = new Date()): number {
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 0);

  return Math.max(1000, nextDay.getTime() - now.getTime() + 1000);
}

function PreviewLimitLockScreen({ date }: { date: string }) {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-[480px] flex-col bg-bg-app px-4">
      <Header date={date} />
      <div className="flex flex-1 items-center justify-center py-10">
        <div
          role="alert"
          className="w-full rounded-[16px] border border-warning-600/20 bg-warning-50 px-4 py-5 text-center shadow-sm"
        >
          <h1 className="text-heading-lg text-text-primary">
            Preview limit reached
          </h1>
          <p className="mt-2 text-body-md font-semibold text-warning-600">
            Preview limit reached for today. The app will unlock tomorrow.
          </p>
        </div>
      </div>
    </main>
  );
}

function ProductionEntryApp() {
  const state = useProductionEntryState();
  const dispatch = useProductionEntryDispatch();
  const boot = useProductionEntryBoot();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [addPersonTarget, setAddPersonTarget] =
    useState<AddPersonTarget | null>(null);
  const [rolloverDraft, setRolloverDraft] = useState(() => boot.rolloverDraft);
  const [draftSaveEnabled, setDraftSaveEnabled] = useState(
    () => boot.draftSaveEnabled,
  );
  const [draftSaveFailed, setDraftSaveFailed] = useState(false);
  const [refreshUpdate, setRefreshUpdate] = useState<(() => void) | null>(null);
  const draftSaverRef = useRef<ReturnType<typeof createDraftSaver> | null>(
    null,
  );
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<Date | null>(
    null,
  );
  const [, setPreviewLimit] = useState(loadPreviewLimitState);
  const [pageTopSentinelRef, pageScrolled] =
    useSentinelPassed<HTMLDivElement>();

  if (draftSaverRef.current === null) {
    draftSaverRef.current = createDraftSaver({
      onError: () => setDraftSaveFailed(true),
      onSuccess: () => setDraftSaveFailed(false),
    });
  }

  useEffect(() => {
    registerProductionEntryServiceWorker({
      onNeedRefresh: (refresh) => setRefreshUpdate(() => refresh),
    });
  }, []);

  useEffect(() => {
    let resetTimeoutId: number | null = null;

    const refreshPreviewLimit = () => {
      setPreviewLimit(loadPreviewLimitState());
    };

    const scheduleNextDayRefresh = () => {
      if (resetTimeoutId !== null) {
        window.clearTimeout(resetTimeoutId);
      }

      resetTimeoutId = window.setTimeout(() => {
        refreshPreviewLimit();
        scheduleNextDayRefresh();
      }, millisecondsUntilNextLocalDay());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPreviewLimit();
      }
    };

    scheduleNextDayRefresh();
    window.addEventListener('focus', refreshPreviewLimit);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (resetTimeoutId !== null) {
        window.clearTimeout(resetTimeoutId);
      }
      window.removeEventListener('focus', refreshPreviewLimit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!draftSaveEnabled) return;
    draftSaverRef.current?.schedule(state);
  }, [draftSaveEnabled, state]);

  useEffect(() => {
    return () => {
      draftSaverRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      if (!draftSaveEnabled) return;
      draftSaverRef.current?.flush(state);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [draftSaveEnabled, state]);

  const showToast = useCallback((toastRequest: ToastRequest) => {
    setToast({ ...toastRequest, id: crypto.randomUUID() });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleEmptyPreviewTap = useCallback(() => {
    showToast({
      message: 'Add an entry first.',
      durationMs: 3000,
    });
  }, [showToast]);

  const handlePreview = useCallback(() => {
    // Do not block on incomplete CNC entries. Per the plans, incomplete
    // (non-blank) CNC entries are simply excluded from the summary, and
    // preview/summary is still allowed (CTA shows warning state).
    // Pure Burma (zero CNC or only blank CNCs) is also valid.
    // The "at least one CNC mandatory" enforcement was not intended.
    // We still turn on highlights so the summary can show the incomplete
    // warnings and exclusion message.
    //
    // The only hard block for preview is:
    // - zero previewable data (no valid/incomplete CNC + zero Burma) → handled
    //   by the disabled CTA calling handleEmptyPreviewTap ("Add an entry first.")
    // - daily preview limit reached.

    const currentPreviewLimit = loadPreviewLimitState();
    setPreviewLimit(currentPreviewLimit);

    if (currentPreviewLimit.locked) {
      showToast({
        message:
          'Preview limit reached for today. The app will unlock tomorrow.',
        durationMs: 4000,
      });
      return;
    }

    dispatch({ type: 'UI_INCOMPLETE_HIGHLIGHTS_SET', value: true });
    setPreviewLimit(recordPreviewOpen());
    setSummaryGeneratedAt(new Date());
    setIsSummaryOpen(true);
  }, [dispatch, showToast, state]);

  const handleSummaryClose = useCallback(() => {
    setIsSummaryOpen(false);
  }, []);

  const handleResumeRolloverDraft = useCallback(() => {
    if (rolloverDraft === null) return;

    dispatch({ type: 'STATE_REPLACE', state: rolloverDraft });
    setRolloverDraft(null);
    setDraftSaveEnabled(true);

    const result = saveDraftNow(rolloverDraft);
    setDraftSaveFailed(!result.ok);
  }, [dispatch, rolloverDraft]);

  const handleStartFresh = useCallback(() => {
    const now = new Date();
    const freshState = createInitialState(now, state.customPeople);

    clearDraft();
    dispatch({
      type: 'STATE_RESET_FRESH',
      now,
      customPeople: state.customPeople,
    });
    setRolloverDraft(null);
    setDraftSaveEnabled(true);

    const result = saveDraftNow(freshState);
    setDraftSaveFailed(!result.ok);
  }, [dispatch, state.customPeople]);

  const openAddPerson = useCallback((target: AddPersonTarget) => {
    setAddPersonTarget(target);
  }, []);

  const closeAddPerson = useCallback(() => {
    setAddPersonTarget(null);
  }, []);

  const handleAddPersonSubmit = useCallback(
    (rawName: string): AddPersonSubmitResult => {
      const name = normalizePersonName(rawName);

      if (name === '') {
        return { ok: false, reason: 'blank' };
      }

      if (hasPerson(state.people, name)) {
        return { ok: false, reason: 'duplicate' };
      }

      const nextCustomPeople = addCustomPerson(
        state.customPeople,
        name,
        basePeople,
      );

      if (nextCustomPeople.length === state.customPeople.length) {
        return { ok: false, reason: 'duplicate' };
      }

      if (!saveCustomPeople(nextCustomPeople)) {
        return { ok: false, reason: 'storage' };
      }

      const target = addPersonTarget;

      dispatch({ type: 'PERSON_ADD', name });

      if (target?.type === 'cnc') {
        dispatch({
          type: 'CNC_FIELD_SET',
          entryId: target.entryId,
          field: 'operator',
          value: name,
        });
      } else if (target?.type === 'repair') {
        dispatch({ type: 'REPAIR_SET', field: 'person', value: name });
      } else if (target?.type === 'burma') {
        dispatch({
          type: 'BURMA_OPERATOR_SET',
          field: target.field,
          value: name,
        });
      }

      setAddPersonTarget(null);
      showToast({
        message: `Added ${name}.`,
        durationMs: 3000,
      });

      return { ok: true, name };
    },
    [addPersonTarget, dispatch, showToast, state.customPeople, state.people],
  );

  return (
    <>
      {false ? (
        <PreviewLimitLockScreen date={state.date} />
      ) : (
        <>
          <main className="relative mx-auto min-h-[100dvh] max-w-[480px] bg-bg-app px-4 pb-[calc(128px+env(safe-area-inset-bottom))]">
            <div
              ref={pageTopSentinelRef}
              aria-hidden="true"
              className="absolute left-0 top-0 h-px w-px"
            />
            <Header date={state.date} />
            <div className="space-y-6 pt-5">
              {rolloverDraft !== null && (
                <DraftRolloverBanner
                  draftDate={rolloverDraft.date}
                  onResume={handleResumeRolloverDraft}
                  onStartFresh={handleStartFresh}
                />
              )}
              {draftSaveFailed && (
                <div
                  className="rounded-[14px] border border-warning-600/20 bg-warning-50 px-3 py-3 text-body-sm font-semibold text-warning-600 shadow-sm"
                  role="status"
                >
                  Couldn't save draft. Finish and share before closing.
                </div>
              )}
              <DateShiftCard />
              <CncSection
                showToast={showToast}
                onAddPerson={(entryId) =>
                  openAddPerson({ type: 'cnc', entryId })
                }
              />
              <BurmaCard
                onAddPerson={(field) => openAddPerson({ type: 'burma', field })}
              />
              <RepairCard
                onAddPerson={() => openAddPerson({ type: 'repair' })}
              />
              <NotesCard />
            </div>
          </main>

          <StickyActionBar
            ctaState={previewCtaState(state)}
            elevated={pageScrolled}
            onPreview={handlePreview}
            onEmptyTap={handleEmptyPreviewTap}
          />
        </>
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          durationMs={toast.durationMs}
          onDismiss={dismissToast}
        />
      )}

      <SummaryModal
        open={isSummaryOpen}
        state={state}
        generatedAt={summaryGeneratedAt ?? new Date()}
        incompleteCount={incompleteCncEntryCount(state)}
        onClose={handleSummaryClose}
        showToast={showToast}
      />

      <AddPersonModal
        open={addPersonTarget !== null}
        people={state.people}
        onCancel={closeAddPerson}
        onSubmit={handleAddPersonSubmit}
      />

      {refreshUpdate !== null && (
        <UpdateAvailableToast
          onRefresh={refreshUpdate}
          onDismiss={() => setRefreshUpdate(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ProductionEntryProvider>
      <ProductionEntryApp />
    </ProductionEntryProvider>
  );
}
