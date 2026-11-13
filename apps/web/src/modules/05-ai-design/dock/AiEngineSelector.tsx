'use client';

import { Check, KeyRound } from 'lucide-react';
import { type AiProviderId } from '@toantrung/contracts';
import { useStudio } from '../StudioContext';
import { MENU_BODY, MENU_FOOTER, MENU_SURFACE, MENU_TITLE } from './menuStyles';

const QUALITY_OPTIONS: Array<{ value: 'draft' | 'high_quality'; label: string }> = [
  { value: 'draft', label: 'Nháp nhanh' },
  { value: 'high_quality', label: 'Độ nét cao' },
];

/** Nhãn ngắn trên nút chọn AI: "Tên model · Chế độ". */
export function useAiEngineLabel() {
  const { chatQuality, providerStatus, selectedModelId, selectedProviderId } = useStudio();
  const modelName =
    providerStatus?.availableProviders
      ?.find((p) => p.providerId === selectedProviderId)
      ?.models.find((m) => m.id === selectedModelId)?.name || selectedModelId;
  return {
    modelName,
    label: `${modelName} · ${chatQuality === 'draft' ? 'Nháp' : 'Nét cao'}`,
  };
}

/** Menu của nhãn model: nền tảng (dạng chip), mô hình, chất lượng và lối vào Cấu hình Đa AI. */
export function AiEngineMenu({ onClose }: { onClose: () => void }) {
  const {
    chatQuality,
    providerStatus,
    selectedModelId,
    selectedProviderId,
    setChatQuality,
    setConfigCustomModelInput,
    setConfigEndpointInput,
    setConfigModalProviderId,
    setSelectedModelId,
    setSelectedProviderId,
    setShowAiConfigModal,
  } = useStudio();

  const providers = providerStatus?.availableProviders || [];
  const models = providers.find((p) => p.providerId === selectedProviderId)?.models || [
    { id: 'imagen-3.0-generate-002', name: 'Google Imagen 3 Pro' },
  ];

  const pickProvider = (nextPid: AiProviderId) => {
    setSelectedProviderId(nextPid);
    const cat = providers.find((p) => p.providerId === nextPid);
    if (cat && cat.models.length > 0) {
      setSelectedModelId(cat.activeModel || cat.models[0].id);
    }
  };

  const openConfig = () => {
    setConfigModalProviderId(selectedProviderId);
    const cat = providers.find((p) => p.providerId === selectedProviderId);
    if (cat) {
      setConfigEndpointInput(cat.apiEndpoint || '');
      setConfigCustomModelInput(cat.activeModel || selectedModelId || '');
    }
    setShowAiConfigModal(true);
    onClose();
  };

  return (
    <div role="menu" aria-label="Chọn AI và chế độ" className={MENU_SURFACE}>
      <div className={MENU_BODY}>
        <div className={MENU_TITLE}>Nền tảng AI</div>
        <div className="flex flex-wrap gap-1 px-1 pb-1.5">
          {providers.map((prov) => {
            const active = prov.providerId === selectedProviderId;
            return (
              <button
                key={prov.providerId}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                data-testid={`ai-provider-option-${prov.providerId}`}
                title={prov.isConfigured ? `${prov.shortName} — đã cấu hình` : prov.shortName}
                onClick={() => pickProvider(prov.providerId)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                  active
                    ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                    : 'border-blue-100 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <span>{prov.shortName}</span>
                {prov.isConfigured && (
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className={MENU_TITLE}>Mô hình</div>
        {models.map((m) => {
          const active = m.id === selectedModelId;
          return (
            <button
              key={m.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              data-testid={`ai-model-option-${m.id}`}
              onClick={() => setSelectedModelId(m.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${
                active
                  ? 'bg-white text-[#1E3A8A] shadow-2xs'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              <span className="min-w-0 flex-1 truncate font-semibold">{m.name}</span>
              {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />}
            </button>
          );
        })}
      </div>

      {/* Chân menu ghim: chất lượng + cấu hình luôn thấy, không phải cuộn */}
      <div className={`${MENU_FOOTER} flex items-center gap-1.5`}>
        <div
          role="group"
          aria-label="Chất lượng"
          className="flex min-w-0 flex-1 rounded-lg bg-white p-0.5"
        >
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q.value}
              type="button"
              aria-pressed={chatQuality === q.value}
              onClick={() => setChatQuality(q.value)}
              className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                chatQuality === q.value
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          role="menuitem"
          onClick={openConfig}
          title="Cấu hình Đa AI"
          aria-label="Cấu hình Đa AI"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-[#2563EB] transition hover:bg-blue-50"
        >
          <KeyRound className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
