'use client';

import { Cpu, KeyRound } from 'lucide-react';
import { type AiProviderId } from '@toantrung/contracts';
import { useStudio } from '../StudioContext';

export function AiEngineSelector() {
  const {
    providerStatus,
    selectedModelId,
    selectedProviderId,
    setConfigCustomModelInput,
    setConfigEndpointInput,
    setConfigModalProviderId,
    setSelectedModelId,
    setSelectedProviderId,
    setShowAiConfigModal,
  } = useStudio();

  return (
    <div className="mb-3 rounded-xl border border-blue-200/80 bg-blue-50/40 p-2.5 text-xs space-y-2 shrink-0">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#1E3A8A]">
          <Cpu className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Chọn Con AI & Model thực thi</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setConfigModalProviderId(selectedProviderId);
            const cat = providerStatus?.availableProviders?.find(
              (p) => p.providerId === selectedProviderId
            );
            if (cat) {
              setConfigEndpointInput(cat.apiEndpoint || '');
              setConfigCustomModelInput(cat.activeModel || selectedModelId || '');
            }
            setShowAiConfigModal(true);
          }}
          className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-[#2563EB] border border-blue-200 hover:bg-blue-50"
        >
          <KeyRound className="h-3 w-3" />
          <span>Cấu hình Đa AI</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
            Nền tảng AI (Provider)
          </label>
          <select
            data-testid="ai-provider-select"
            value={selectedProviderId}
            onChange={(e) => {
              const nextPid = e.target.value as AiProviderId;
              setSelectedProviderId(nextPid);
              const cat = providerStatus?.availableProviders?.find((p) => p.providerId === nextPid);
              if (cat && cat.models.length > 0) {
                setSelectedModelId(cat.activeModel || cat.models[0].id);
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#2563EB] focus:outline-none"
          >
            {(providerStatus?.availableProviders || []).map((prov) => (
              <option key={prov.providerId} value={prov.providerId}>
                {prov.shortName} {prov.isConfigured ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
            Mô hình (Model)
          </label>
          <select
            data-testid="ai-model-select"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#2563EB] focus:outline-none"
          >
            {(
              providerStatus?.availableProviders?.find((p) => p.providerId === selectedProviderId)
                ?.models || [
                {
                  id: 'imagen-3.0-generate-002',
                  name: 'Google Imagen 3 Pro',
                },
              ]
            ).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
