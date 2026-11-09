'use client';

import { Check, Cpu } from 'lucide-react';
import { useStudio } from '../StudioContext';

export function AiConfigModal() {
  const {
    autoFallbackToLocal,
    configApiKeyInput,
    configCustomModelInput,
    configEndpointInput,
    configModalProviderId,
    handleSaveAiProviderConfig,
    providerStatus,
    savingAiConfig,
    setAutoFallbackToLocal,
    setConfigApiKeyInput,
    setConfigCustomModelInput,
    setConfigEndpointInput,
    setConfigModalProviderId,
    setShowAiConfigModal,
    showAiConfigModal,
  } = useStudio();

  return (
    <>
      {showAiConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Trung tâm Chuyển đổi & Cấu hình Đa AI (Multi-AI Engine Hub)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chuyển đổi linh hoạt giữa nhiều con AI (Google Imagen 3, OpenAI GPT-Image-1,
                    FLUX.1 Pro, Stability SD 3.5, Custom Endpoint & Studio Nội bộ) bất cứ lúc nào.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiConfigModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSaveAiProviderConfig}
              className="grid flex-1 min-h-0 grid-cols-1 md:grid-cols-12 overflow-y-auto"
            >
              {/* Left Column: 6 AI Provider Cards */}
              <div className="md:col-span-5 border-r border-slate-200 bg-slate-50/60 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Danh sách 6 Nền tảng AI Hỗ trợ
                </div>
                {(providerStatus?.availableProviders || []).map((prov) => {
                  const isCurrentTab = prov.providerId === configModalProviderId;
                  return (
                    <button
                      key={prov.providerId}
                      type="button"
                      data-testid={`multi-ai-card-${prov.providerId}`}
                      onClick={() => {
                        setConfigModalProviderId(prov.providerId);
                        setConfigEndpointInput(prov.apiEndpoint || '');
                        setConfigCustomModelInput(prov.activeModel || prov.models[0]?.id || '');
                        setConfigApiKeyInput('');
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isCurrentTab
                          ? 'border-[#2563EB] bg-white shadow-xs ring-2 ring-blue-500/15'
                          : 'border-slate-200/90 bg-white/80 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {prov.providerName}
                        </span>
                        {prov.isDefault && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A] border border-blue-200">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-600">
                          {prov.activeModel}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            prov.isConfigured ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              prov.isConfigured ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                          />
                          {prov.isConfigured ? 'Đã có Key' : 'Chế độ Studio'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Provider Details, Model Picker & API Key / Endpoint Config */}
              <div className="md:col-span-7 p-5 space-y-4 text-sm">
                {(() => {
                  const activeProv =
                    providerStatus?.availableProviders?.find(
                      (p) => p.providerId === configModalProviderId
                    ) || providerStatus?.availableProviders?.[0];

                  if (!activeProv) return null;

                  return (
                    <>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-slate-900">
                            {activeProv.providerName}
                          </h4>
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                            {activeProv.statusLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          {activeProv.notes}
                        </p>
                      </div>

                      {/* Select Model within this Provider */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          1. Chọn Model AI sử dụng cho {activeProv.shortName}
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {activeProv.models.map((m) => {
                            const isSelectedModel = configCustomModelInput === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={() => setConfigCustomModelInput(m.id)}
                                className={`cursor-pointer rounded-xl border p-3 transition ${
                                  isSelectedModel
                                    ? 'border-[#2563EB] bg-blue-50/40'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="activeModelRadio"
                                      checked={isSelectedModel}
                                      onChange={() => setConfigCustomModelInput(m.id)}
                                      className="h-3.5 w-3.5 text-[#1E3A8A]"
                                    />
                                    <span className="font-bold text-slate-900">{m.name}</span>
                                    <span className="rounded bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A]">
                                      {m.badge}
                                    </span>
                                  </div>
                                  <span className="font-mono text-xs font-semibold text-slate-600">
                                    ${m.costPerImageUsd.toFixed(3)} / ảnh
                                  </span>
                                </div>
                                <p className="mt-1 pl-5 text-xs text-slate-500">{m.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Model ID Override & API Key / Endpoint */}
                      {activeProv.providerId !== 'local_sandbox' && (
                        <div className="space-y-3 rounded-xl border border-slate-200 p-3.5">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            2. Cấu hình Kết nối API & Mở rộng Tương lai (Tùy chọn)
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Mã Model (Model ID — Có thể nhập bất kỳ model mới nào khi hãng nâng
                              cấp):
                            </label>
                            <input
                              type="text"
                              value={configCustomModelInput}
                              onChange={(e) => setConfigCustomModelInput(e.target.value)}
                              placeholder="VD: imagen-3.0-generate-002, gpt-image-1, flux-1.1-pro-ultra..."
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-[#2563EB] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              API Key (
                              {activeProv.maskedApiKey
                                ? `Đang lưu: ${activeProv.maskedApiKey}`
                                : 'Chưa nhập — Để trống nếu dùng chế độ Studio Sẵn sàng'}
                              ):
                            </label>
                            <input
                              type="password"
                              value={configApiKeyInput}
                              onChange={(e) => setConfigApiKeyInput(e.target.value)}
                              placeholder={
                                activeProv.maskedApiKey
                                  ? `Giữ nguyên (${activeProv.maskedApiKey}) hoặc nhập Key mới để thay đổi...`
                                  : 'Nhập API Key khi muốn gọi trực tiếp tới máy chủ AI đám mây...'
                              }
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-[#2563EB] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              API Endpoint URL (Hỗ trợ đổi qua OpenRouter / Proxy / Server riêng):
                            </label>
                            <input
                              type="text"
                              value={configEndpointInput}
                              onChange={(e) => setConfigEndpointInput(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700 focus:border-[#2563EB] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Auto-fallback safety switch */}
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 text-xs">
                        <input
                          type="checkbox"
                          checked={autoFallbackToLocal}
                          onChange={(e) => setAutoFallbackToLocal(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1E3A8A]"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            Đảm bảo hoạt động liên tục 100% (Auto-Fallback sang Toàn Trung Studio
                            Engine)
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            Khi bật, nếu con AI đám mây đang chọn chưa nhập API Key hoặc hết hạn
                            mức, hệ thống tự động kết xuất qua Engine Nội bộ Toàn Trung để quy trình
                            làm việc của Sales & Designer không bao giờ bị gián đoạn.
                          </div>
                        </div>
                      </label>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setShowAiConfigModal(false)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={savingAiConfig}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2563EB] disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            {savingAiConfig
                              ? 'Đang lưu & kích hoạt...'
                              : `Chọn "${activeProv.shortName}" làm AI đang dùng`}
                          </span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
