'use client';

import { useSession } from '@/core/session/SessionContext';
import {
  hasBaPermission,
  type AiProviderId,
  type CreateDesignRequestDto,
  type DesignRequestItemDto,
  type QuadCoordinatesDto,
} from '@toantrung/contracts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type LeadOpt,
  type Live3dTheme,
  type ProductOpt,
  type ProjectParameterFormState,
  type ProviderStatusInfo,
} from '../types';
import {
  STORAGE_SELECTED_PROJECT_KEY,
  parseAspectRatioValue,
  resolveAssetUrl,
} from '../lib/design-utils';
import { apiRequest } from '@/core/http/client';
import { estimateQuadSpecs, computeLedSpecs } from '../lib/led-specs';
import { readFileAsBase64 } from '../lib/read-file';
import { renderLiveCompositeBase64 } from '../lib/render-live-composite';

export function useAiDesignStudio() {
  const { user } = useSession();

  const canUseAiDesign = Boolean(user && hasBaPermission(user.roleCode, 'AI_DESIGN'));

  const canExport = Boolean(user && hasBaPermission(user.roleCode, 'EXPORT_DATA'));
  // Data states

  const [requests, setRequests] = useState<DesignRequestItemDto[]>([]);

  const [leadOptions, setLeadOptions] = useState<LeadOpt[]>([]);

  const [productOptions, setProductOptions] = useState<ProductOpt[]>([]);

  const [providerStatus, setProviderStatus] = useState<ProviderStatusInfo | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  // UI state

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [savingParams, setSavingParams] = useState(false);

  const [savingFinal, setSavingFinal] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [uploadingFinalFile, setUploadingFinalFile] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);
  // Three Prominent Workspace Areas: 'perspective' (Phối cảnh) | 'assistant' (Trợ lý AI) | 'specs' (Thông số)

  const [activeWorkspaceArea, setActiveWorkspaceArea] = useState<
    'perspective' | 'assistant' | 'specs'
  >('perspective');
  // Side dock tab when viewing Phối cảnh on wide desktop

  const [sideDockTab, setSideDockTab] = useState<'assistant' | 'specs'>('assistant');
  // Canvas View Mode: 'original' (Ảnh gốc) | 'result' (Kết quả AI) | 'live_3d' (Ghép 3D Thực tế) | 'compare' (So sánh)

  const [viewMode, setViewMode] = useState<'original' | 'result' | 'live_3d' | 'compare'>('result');

  const [live3dTheme, setLive3dTheme] = useState<Live3dTheme>('conference_navy');

  const [savingComposite, setSavingComposite] = useState(false);
  // Multi-AI Provider & Model Switcher States

  const [selectedProviderId, setSelectedProviderId] = useState<AiProviderId>('google_imagen');

  const [selectedModelId, setSelectedModelId] = useState<string>('imagen-3.0-generate-002');

  const [showAiConfigModal, setShowAiConfigModal] = useState(false);

  const [configModalProviderId, setConfigModalProviderId] = useState<AiProviderId>('google_imagen');

  const [configApiKeyInput, setConfigApiKeyInput] = useState('');

  const [configEndpointInput, setConfigEndpointInput] = useState('');

  const [configCustomModelInput, setConfigCustomModelInput] = useState('');

  const [autoFallbackToLocal, setAutoFallbackToLocal] = useState(true);

  const [savingAiConfig, setSavingAiConfig] = useState(false);
  // Left Sidebar: Project Search, Archive toggle, Secondary menu (`...`), and Kho ảnh dự án folder

  const [searchProject, setSearchProject] = useState('');

  const [showArchivedProjects, setShowArchivedProjects] = useState(false);

  const [openMenuProjectId, setOpenMenuProjectId] = useState<number | null>(null);

  const [assetFolder, setAssetFolder] = useState<'technical' | 'designs'>('technical');

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  // Responsive Mobile Switcher

  const [mobilePane, setMobilePane] = useState<'projects' | 'canvas' | 'assistant'>('canvas');
  // Thu gọn bố cục: ẩn/hiện riêng cột Dự án (left), cột Trợ lý AI (right), thanh công cụ trên (top)

  const [hiddenPanels, setHiddenPanels] = useState<{ left: boolean; right: boolean; top: boolean }>({
    left: false,
    right: false,
    top: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('m05.panels');
      if (raw) {
        const p = JSON.parse(raw);
        setHiddenPanels({ left: !!p.left, right: !!p.right, top: !!p.top });
      } else if (window.localStorage.getItem('m05.focusCanvas') === '1') {
        // tương thích khóa cũ
        setHiddenPanels({ left: true, right: true, top: false });
      }
    } catch {
      /* bỏ qua: dùng mặc định */
    }
  }, []);

  const updatePanels = (fn: (p: { left: boolean; right: boolean; top: boolean }) => {
    left: boolean;
    right: boolean;
    top: boolean;
  }) => {
    setHiddenPanels((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem('m05.panels', JSON.stringify(next));
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  };

  const togglePanel = (name: 'left' | 'right' | 'top') =>
    updatePanels((p) => ({ ...p, [name]: !p[name] }));

  // Giữ nút "Mở rộng ảnh" cũ: ẩn/hiện 2 cột bên
  const focusCanvas = hiddenPanels.left && hiddenPanels.right;
  const toggleFocusCanvas = () =>
    updatePanels((p) => {
      const v = !(p.left && p.right);
      return { ...p, left: v, right: v };
    });

  // Chế độ tập trung: ẩn/hiện cả 3 vùng
  const allPanelsHidden = hiddenPanels.left && hiddenPanels.right && hiddenPanels.top;
  const toggleZenMode = () =>
    updatePanels(() => {
      const v = !allPanelsHidden;
      return { left: v, right: v, top: v };
    });

  // Zoom & Canvas Tools

  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [showHandles, setShowHandles] = useState(true);

  const [compareSplit, setCompareSplit] = useState<number>(50);
  // AI Assistant Composer

  const [chatPrompt, setChatPrompt] = useState('');

  const [chatQuality, setChatQuality] = useState<'draft' | 'high_quality'>('draft');

  const [piiAlert, setPiiAlert] = useState<string | null>(null);
  // Interactive 4-Corner Placement Handles

  const [quad, setQuad] = useState<QuadCoordinatesDto>({
    topLeft: { x: 64.2, y: 44.5 },
    topRight: { x: 93.8, y: 45.2 },
    bottomRight: { x: 94.5, y: 72.8 },
    bottomLeft: { x: 64.5, y: 70.1 },
  });

  const [unmeasuredMode, setUnmeasuredMode] = useState<boolean>(false);

  const [draggingHandle, setDraggingHandle] = useState<keyof QuadCoordinatesDto | null>(null);

  const [draggingCompare, setDraggingCompare] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  // Controlled Form State for "Thông số" (isolated per project so switching/reloading never mixes state)

  const [paramForm, setParamForm] = useState<ProjectParameterFormState>({
    projectName: 'Showroom LED',
    designType: 'perspective_3d',
    leadId: '',
    contactName: '',
    installationInfo: 'Tường bên phải showroom, cách sàn 1.2m',
    notes: '',
    productId: 1,
    pixelPitch: 'P2.5',
    screenStyle: 'flat',
    screenWidthM: 4.8,
    screenHeightM: 2.7,
    aspectRatio: '16:9',
    aspectLocked: true,
    bannerWidthPx: 1920,
    bannerHeightPx: 1080,
  });

  const [paramValidationError, setParamValidationError] = useState<string | null>(null);
  // Modal: Create New Project

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newProjectName, setNewProjectName] = useState('Showroom LED');

  const [newProjectType, setNewProjectType] = useState<'perspective_3d' | 'banner'>(
    'perspective_3d'
  );

  const [newLeadId, setNewLeadId] = useState<string>('');

  const [newContactName, setNewContactName] = useState('');

  const [newNotes, setNewNotes] = useState('');

  const [newPrompt, setNewPrompt] = useState(
    'Đặt màn hình ở tường bên phải, hiển thị sóng biển xanh và giữ nguyên nội thất.'
  );
  // Modal: Quick Edit / Rename Project

  const [editingName, setEditingName] = useState(false);

  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);

  const [renameValue, setRenameValue] = useState('');

  const [quickEditDesignType, setQuickEditDesignType] = useState<'perspective_3d' | 'banner'>(
    'perspective_3d'
  );

  const [quickEditLeadId, setQuickEditLeadId] = useState<string>('');

  const [quickEditContactName, setQuickEditContactName] = useState('');

  const [quickEditInstallInfo, setQuickEditInstallInfo] = useState('');

  const [quickEditWidthM, setQuickEditWidthM] = useState<number>(4.8);

  const [quickEditHeightM, setQuickEditHeightM] = useState<number>(2.7);

  const [quickEditPitch, setQuickEditPitch] = useState<string>('P2.5');

  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  // Multi-select Projects for Bulk Delete

  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  // Custom Aesthetic Web Confirm & Input Modals (replaces native window.confirm / window.prompt)

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    subtitle?: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [confirmBusy, setConfirmBusy] = useState(false);

  const [promptModal, setPromptModal] = useState<{
    title: string;
    label: string;
    value: string;
    placeholder?: string;
    onConfirm: (val: string) => Promise<void> | void;
  } | null>(null);

  const [promptBusy, setPromptBusy] = useState(false);
  // Auto-dismiss successToast after 3.8s so it never clutters the screen

  useEffect(() => {
    if (!successToast) return;
    const timer = window.setTimeout(() => {
      setSuccessToast(null);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  const syncProjectSelection = useCallback((project: DesignRequestItemDto) => {
    setSelectedId(project.id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_SELECTED_PROJECT_KEY, String(project.id));
      const url = new URL(window.location.href);
      url.searchParams.set('projectId', String(project.id));
      window.history.replaceState({}, '', url.toString());
    }
    if (project.placementQuad) {
      setQuad(project.placementQuad);
    }
    if (project.assetVersions.length > 0) {
      const approved = project.assetVersions.find((v) => v.isApprovedFinal);
      const latest = project.assetVersions[project.assetVersions.length - 1];
      setSelectedVersionId((approved || latest).id);
    } else {
      setSelectedVersionId(null);
    }
    setSelectedAssetIds([]);
    setParamValidationError(null);
    setParamForm({
      projectName: project.projectName || 'Dự án LED',
      designType: project.designType || 'perspective_3d',
      leadId: project.leadId ? String(project.leadId) : '',
      contactName:
        project.contactName && project.contactName !== 'Chưa cập nhật' ? project.contactName : '',
      installationInfo: project.installationInfo || 'Tường bên phải showroom, cách sàn 1.2m',
      notes: project.notes || '',
      productId: project.productId || project.productSpec?.productId || 1,
      pixelPitch: project.productSpec?.pixelPitch || 'P2.5',
      screenStyle: project.productSpec?.screenStyle || 'flat',
      screenWidthM: project.screenWidthM || 4.8,
      screenHeightM: project.screenHeightM || 2.7,
      aspectRatio: project.aspectRatio || '16:9',
      aspectLocked: project.aspectLocked ?? true,
      bannerWidthPx: project.bannerWidthPx || project.productSpec?.resolutionWidthPx || 1920,
      bannerHeightPx: project.bannerHeightPx || project.productSpec?.resolutionHeightPx || 1080,
    });
  }, []);
  // Load Data from API

  const loadData = useCallback(
    async (preferredProjectId?: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<{
          requests: DesignRequestItemDto[];
          leadOptions: LeadOpt[];
          productOptions: ProductOpt[];
          providerStatus: ProviderStatusInfo;
        }>('/api/v1/design');
        const list: DesignRequestItemDto[] = data.requests || [];
        setRequests(list);
        setLeadOptions(data.leadOptions || []);
        setProductOptions(data.productOptions || []);
        setProviderStatus(data.providerStatus || null);
        if (data.providerStatus) {
          const defPid =
            data.providerStatus.defaultProviderId ||
            data.providerStatus.provider ||
            'google_imagen';
          setSelectedProviderId(defPid);
          setConfigModalProviderId(defPid);
          setSelectedModelId(
            data.providerStatus.defaultModelId ||
              data.providerStatus.activeModel ||
              'imagen-3.0-generate-002'
          );
          setAutoFallbackToLocal(data.providerStatus.autoFallbackToLocal ?? true);
          const activeCat = data.providerStatus.availableProviders?.find(
            (p) => p.providerId === defPid
          );
          if (activeCat) {
            setConfigEndpointInput(activeCat.apiEndpoint || '');
            setConfigCustomModelInput(activeCat.activeModel || '');
          }
        }

        if (list.length > 0) {
          let targetId = preferredProjectId ?? selectedId;
          if (!targetId && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const fromUrl = Number(urlParams.get('projectId'));
            const fromStorage = Number(window.localStorage.getItem(STORAGE_SELECTED_PROJECT_KEY));
            if (Number.isInteger(fromUrl) && fromUrl > 0) {
              targetId = fromUrl;
            } else if (Number.isInteger(fromStorage) && fromStorage > 0) {
              targetId = fromStorage;
            }
          }
          const currentReq = (targetId ? list.find((r) => r.id === targetId) : null) || list[0];
          syncProjectSelection(currentReq);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu Studio thiết kế.');
      } finally {
        setLoading(false);
      }
    },
    [selectedId, syncProjectSelection]
  );

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Auto-select or prefill project when navigated with ?leadId=<id> from LeadsWorkspace

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    const params = new URLSearchParams(window.location.search);
    const leadIdParam = Number(params.get('leadId'));
    if (Number.isInteger(leadIdParam) && leadIdParam > 0) {
      const existingReq = requests.find((r) => r.leadId === leadIdParam);
      if (existingReq) {
        syncProjectSelection(existingReq);
      } else {
        const opt = leadOptions.find((l) => l.id === leadIdParam);
        setNewLeadId(String(leadIdParam));
        if (opt) {
          setNewProjectName(`Phối cảnh ${opt.leadCode}`);
        }
        setShowCreateModal(true);
      }
    }
  }, [loading, requests, leadOptions, syncProjectSelection]);

  const currentProject = useMemo(
    () => requests.find((r) => r.id === selectedId) || requests[0] || null,
    [requests, selectedId]
  );

  const currentVersion = useMemo(
    () =>
      currentProject?.assetVersions.find((v) => v.id === selectedVersionId) ||
      currentProject?.assetVersions[currentProject.assetVersions.length - 1] ||
      null,
    [currentProject, selectedVersionId]
  );

  const selectedPhoto = useMemo(
    () => currentProject?.photos.find((p) => p.selected) || currentProject?.photos[0] || null,
    [currentProject]
  );
  // Resolve distinct URLs for Original input photo vs Output design version

  const sitePhotoUrl = resolveAssetUrl(selectedPhoto?.url || currentProject?.sitePhotoDownloadUrl);

  const versionImageUrl = currentVersion
    ? `/api/v1/design/asset/${currentVersion.id}`
    : resolveAssetUrl(currentProject?.aiDraftDownloadUrl || sitePhotoUrl);
  // Auto-estimated LED Cabinet dimensions directly from the 4 blue corner dots (when customer has no measurements yet)

  const quadEstimatedSpecs = useMemo(() => estimateQuadSpecs(quad), [quad]);
  // Live computed LED hardware specs from paramForm (or quadEstimatedSpecs when in unmeasuredMode)

  const computedLiveSpecs = useMemo(
    () =>
      computeLedSpecs({
        unmeasuredMode,
        estWidthM: quadEstimatedSpecs.estWidthM,
        estHeightM: quadEstimatedSpecs.estHeightM,
        screenWidthM: paramForm.screenWidthM,
        screenHeightM: paramForm.screenHeightM,
        pixelPitch: paramForm.pixelPitch,
      }),
    [
      unmeasuredMode,
      quadEstimatedSpecs,
      paramForm.screenWidthM,
      paramForm.screenHeightM,
      paramForm.pixelPitch,
    ]
  );
  // Dragging logic for 4-corner placement & split comparison

  const handleMouseDownHandle = (corner: keyof QuadCoordinatesDto) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Automatically switch to live_3d perspective warping when dragging any of the 4 blue corner dots
    // so the LED screen immediately stretches with the 4 dots instead of staying frozen
    if (viewMode === 'result' || viewMode === 'original') {
      setViewMode('live_3d');
    }
    setDraggingHandle(corner);
  };

  const handleMouseMoveCanvas = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      if (draggingCompare) {
        setCompareSplit(Number(x.toFixed(1)));
        return;
      }

      if (!draggingHandle) return;
      setQuad((prev) => {
        const nextQuad = {
          ...prev,
          [draggingHandle]: { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) },
        };
        if (unmeasuredMode) {
          const est = estimateQuadSpecs(nextQuad);
          setParamForm((pf) => ({
            ...pf,
            screenWidthM: est.estWidthM,
            screenHeightM: est.estHeightM,
          }));
        }
        return nextQuad;
      });
    },
    [draggingHandle, draggingCompare, unmeasuredMode]
  );

  const handleMouseUpCanvas = useCallback(() => {
    setDraggingHandle(null);
    setDraggingCompare(false);
  }, []);
  // Check PII on prompt typing

  const handlePromptChange = (val: string) => {
    setChatPrompt(val);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const vnPhoneRegex = /(?:\+84|0)(?:3|5|7|8|9)(?:[\s.-]*\d){8}\b/;
    if (emailRegex.test(val) || vnPhoneRegex.test(val)) {
      setPiiAlert(
        'Phát hiện SĐT/Email trong nội dung. Theo quy định bảo mật dữ liệu (UC06), tuyệt đối không gửi thông tin liên hệ khách hàng sang AI.'
      );
    } else {
      setPiiAlert(null);
    }
  };
  // Save Parameters ("Thông số") to Backend

  const handleSaveParameters = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentProject || savingParams) return;

    if (!paramForm.projectName.trim() || paramForm.projectName.trim().length < 2) {
      setParamValidationError('Tên dự án phải có tối thiểu 2 ký tự.');
      return;
    }
    if (paramForm.designType === 'perspective_3d') {
      if (paramForm.screenWidthM <= 0 || paramForm.screenHeightM <= 0) {
        setParamValidationError('Chiều ngang và chiều cao màn hình LED (m) phải lớn hơn 0.');
        return;
      }
    } else {
      if (paramForm.bannerWidthPx < 128 || paramForm.bannerHeightPx < 64) {
        setParamValidationError('Độ phân giải đầu ra tối thiểu là 128×64 px.');
        return;
      }
    }

    setParamValidationError(null);
    setSavingParams(true);
    setError(null);
    try {
      const selectedProduct = productOptions.find((p) => p.id === paramForm.productId);
      const ledModuleSpec = selectedProduct
        ? `${selectedProduct.name} (${paramForm.pixelPitch})`
        : `Màn hình LED ${paramForm.pixelPitch}`;

      await apiRequest(`/api/v1/design/${currentProject.id}`, {
        method: 'PATCH',
        csrfToken: user?.csrfToken,
        body: {
          action: 'update_project',
          projectName: paramForm.projectName.trim(),
          designType: paramForm.designType,
          leadId: paramForm.leadId ? Number(paramForm.leadId) : null,
          contactName: paramForm.contactName.trim() || null,
          installationInfo: paramForm.installationInfo.trim() || null,
          notes: paramForm.notes.trim() || null,
          productId: paramForm.productId,
          ledModuleSpec,
          pixelPitch: paramForm.pixelPitch,
          screenStyle: paramForm.screenStyle,
          screenWidthM: Number(paramForm.screenWidthM),
          screenHeightM: Number(paramForm.screenHeightM),
          bannerWidthPx: Math.round(Number(paramForm.bannerWidthPx)),
          bannerHeightPx: Math.round(Number(paramForm.bannerHeightPx)),
          aspectRatio: paramForm.aspectRatio,
          aspectLocked: paramForm.aspectLocked,
          placementQuad: quad,
        },
      });

      setSuccessToast(`Đã lưu thông số dự án "${paramForm.projectName.trim()}" vào cơ sở dữ liệu.`);
      await loadData(currentProject.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thông số dự án.');
    } finally {
      setSavingParams(false);
    }
  };
  // Chat Edit Submit (creates new version vN without overwriting original)

  const handleSendChatEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !chatPrompt.trim() || submitting || piiAlert) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        action: 'chat_edit',
        expectedVersion: currentProject.version,
        prompt: chatPrompt.trim(),
        quality: chatQuality,
        providerId: selectedProviderId,
        modelId: selectedModelId,
        placementQuad: quad,
        productId: paramForm.productId,
        screenWidthM: paramForm.screenWidthM,
        screenHeightM: paramForm.screenHeightM,
        bannerWidthPx: paramForm.bannerWidthPx,
        bannerHeightPx: paramForm.bannerHeightPx,
        aspectRatio: paramForm.aspectRatio,
        selectedPhotoUrl: sitePhotoUrl,
        idempotencyKey: `chat-design-${currentProject.id}-v${currentProject.assetVersions.length + 1}-${Date.now()}`,
      };

      const data = await apiRequest<{ versionNumber: number; versionId?: number }>(
        `/api/v1/design/${currentProject.id}`,
        {
          method: 'PATCH',
          csrfToken: user?.csrfToken,
          body: payload,
        }
      );

      setChatPrompt('');
      setViewMode('result');
      setSuccessToast(`Đã tạo phiên bản thiết kế mới (v${data.versionNumber}) trong Bản thiết kế.`);
      await loadData(currentProject.id);
      if (data.versionId) {
        setSelectedVersionId(data.versionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi gửi yêu cầu dựng thiết kế AI.');
    } finally {
      setSubmitting(false);
    }
  };
  // Approve & Save Finished Version

  const handleSaveFinished = async () => {
    if (!currentProject || !currentVersion || savingFinal) return;
    setSavingFinal(true);
    setError(null);
    try {
      await apiRequest(`/api/v1/design/${currentProject.id}`, {
        method: 'PATCH',
        csrfToken: user?.csrfToken,
        body: {
          action: 'save_finished',
          expectedVersion: currentProject.version,
          versionId: currentVersion.id,
          note: `Phê duyệt bản thiết kế v${currentVersion.versionNumber} bàn giao chính thức`,
        },
      });

      setSuccessToast(
        `Đã chốt duyệt phiên bản v${currentVersion.versionNumber} và đồng bộ sang hồ sơ Lead / NVKD.`
      );
      await loadData(currentProject.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi phê duyệt bản hoàn thiện.');
    } finally {
      setSavingFinal(false);
    }
  };
  // Multi-file Upload for "Ảnh kỹ thuật"

  const handleUploadTechnicalPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject) return;

    setUploadingPhoto(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const b64 = await readFileAsBase64(file, 'Không thể đọc tệp ảnh.');
        await apiRequest(`/api/v1/design/${currentProject.id}`, {
          method: 'POST',
          csrfToken: user?.csrfToken,
          body: {
            action: 'add_photo',
            photoName: file.name,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
            base64Data: b64,
          },
        });
      }
      setSuccessToast(`Đã tải ${files.length} ảnh kỹ thuật vào Kho ảnh dự án.`);
      await loadData(currentProject.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải ảnh kỹ thuật.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };
  // Upload Designer Final Output into "Bản thiết kế"

  const handleUploadDesignerFinal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProject) return;

    setUploadingFinalFile(true);
    setError(null);
    try {
      const b64 = await readFileAsBase64(file, 'Không thể đọc tệp thiết kế.');
      await apiRequest(`/api/v1/design/${currentProject.id}`, {
        method: 'POST',
        csrfToken: user?.csrfToken,
        body: {
          action: 'upload_final',
          fileName: file.name,
          mimeType: file.type || 'image/png',
          base64Data: b64,
          note: `Bản thiết kế hoàn thiện tải lên: ${file.name}`,
        },
      });
      setSuccessToast(`Đã tải bản thiết kế hoàn thiện "${file.name}" vào thư mục Bản thiết kế.`);
      await loadData(currentProject.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải bản thiết kế hoàn thiện.');
    } finally {
      setUploadingFinalFile(false);
      e.target.value = '';
    }
  };
  // Import attachments from linked Lead into "Ảnh kỹ thuật"

  const handleImportLeadPhotos = async () => {
    if (!currentProject || !currentProject.leadId) return;
    try {
      await apiRequest(`/api/v1/design/${currentProject.id}`, {
        method: 'PATCH',
        csrfToken: user?.csrfToken,
        body: {
          action: 'update_project',
          importLeadAttachments: true,
        },
      });
      setSuccessToast('Đã đồng bộ ảnh hiện trạng từ hồ sơ Lead vào thư mục Ảnh kỹ thuật.');
      await loadData(currentProject.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhập ảnh từ Lead.');
    }
  };
  // Download ZIP of selected or all items in Kho ảnh dự án

  const handleDownloadProjectZip = (folderScope: 'all' | 'technical' | 'designs' = 'all') => {
    if (!currentProject) return;
    const params = new URLSearchParams();
    params.set('folder', folderScope);
    if (selectedAssetIds.length > 0) {
      params.set('ids', selectedAssetIds.join(','));
    }
    window.open(`/api/v1/design/${currentProject.id}/download-zip?${params.toString()}`, '_blank');
  };
  // Create New Project Submit

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateDesignRequestDto =
        newProjectType === 'perspective_3d'
          ? {
              designType: 'perspective_3d',
              projectName: newProjectName.trim(),
              contactName: newContactName.trim() || null,
              notes: newNotes.trim() || null,
              leadId: newLeadId ? Number(newLeadId) : null,
              productId: 1,
              ledModuleSpec: 'P2.5 Indoor',
              screenWidthM: 4.8,
              screenHeightM: 2.7,
              placementQuad: quad,
              aiPrompt: newPrompt.trim(),
              quality: 'draft',
              providerId: selectedProviderId,
              modelId: selectedModelId,
            }
          : {
              designType: 'banner',
              projectName: newProjectName.trim(),
              contactName: newContactName.trim() || null,
              notes: newNotes.trim() || null,
              leadId: newLeadId ? Number(newLeadId) : null,
              bannerWidthPx: 1920,
              bannerHeightPx: 1080,
              aspectRatio: '16:9',
              aiPrompt: newPrompt.trim(),
              quality: 'draft',
              providerId: selectedProviderId,
              modelId: selectedModelId,
            };

      const data = await apiRequest<{ id: number }>('/api/v1/design', {
        method: 'POST',
        csrfToken: user?.csrfToken,
        body: payload,
      });

      setShowCreateModal(false);
      setSuccessToast(`Đã tạo dự án "${newProjectName.trim()}" (#${data.id}) thành công.`);
      await loadData(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo dự án mới.');
    } finally {
      setSubmitting(false);
    }
  };
  // Save Multi-AI Provider Configuration & Switch Default AI Engine

  const handleSaveAiProviderConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAiConfig(true);
    setError(null);
    try {
      const targetCat = providerStatus?.availableProviders?.find(
        (p) => p.providerId === configModalProviderId
      );
      const effectiveModel =
        configCustomModelInput.trim() ||
        targetCat?.activeModel ||
        targetCat?.models[0]?.id ||
        'imagen-3.0-generate-002';

      const res = await apiRequest<{ ok: boolean; providerStatus: ProviderStatusInfo }>(
        '/api/v1/design',
        {
          method: 'POST',
          csrfToken: user?.csrfToken,
          body: {
            action: 'configure_ai_providers',
            defaultProviderId: configModalProviderId,
            defaultModelId: effectiveModel,
            autoFallbackToLocal,
            providerConfig: {
              providerId: configModalProviderId,
              apiKey: configApiKeyInput.trim() ? configApiKeyInput.trim() : undefined,
              apiEndpoint: configEndpointInput.trim() ? configEndpointInput.trim() : undefined,
              activeModel: effectiveModel,
            },
          },
        }
      );

      if (res.providerStatus) {
        setProviderStatus(res.providerStatus);
        setSelectedProviderId(configModalProviderId);
        setSelectedModelId(effectiveModel);
      }
      setConfigApiKeyInput('');
      setShowAiConfigModal(false);
      setSuccessToast(
        `Đã chuyển đổi & lưu cấu hình AI Engine sang "${targetCat?.providerName || configModalProviderId}" (${effectiveModel}).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình Đa AI.');
    } finally {
      setSavingAiConfig(false);
    }
  };
  // Render & Save Real-Photo 4-Corner Perspective Composite as a New Version vN

  const handleSaveLiveCompositeToVersion = async () => {
    if (!currentProject || savingComposite) return;
    setSavingComposite(true);
    setError(null);
    try {
      const b64 = await renderLiveCompositeBase64({
        sitePhotoUrl,
        versionImageUrl,
        quad,
        live3dTheme,
        pixelPitch: paramForm.pixelPitch,
        screenWidthM: paramForm.screenWidthM,
        screenHeightM: paramForm.screenHeightM,
        resW: computedLiveSpecs.resW,
        resH: computedLiveSpecs.resH,
      });

      const saved = await apiRequest<{ versionId: number; versionNumber: number }>(
        `/api/v1/design/${currentProject.id}`,
        {
          method: 'POST',
          csrfToken: user?.csrfToken,
          body: {
            action: 'save_composited_version',
            fileName: `phoi-canh-3d-thuc-te-req-${currentProject.id}.png`,
            mimeType: 'image/png',
            base64Data: b64,
            note: `Ghép phối cảnh 3D thực tế (${paramForm.pixelPitch} · ${paramForm.screenWidthM}×${paramForm.screenHeightM}m) trên ảnh hiện trạng`,
            placementQuad: quad,
          },
        }
      );

      setViewMode('result');
      setSuccessToast(
        `Đã lưu bản ghép phối cảnh 3D thực tế thành phiên bản v${saved.versionNumber} trong Bản thiết kế!`
      );
      await loadData(currentProject.id);
      if (saved.versionId) {
        setSelectedVersionId(saved.versionId);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể xuất & lưu bản ghép phối cảnh 3D thực tế.'
      );
    } finally {
      setSavingComposite(false);
    }
  };
  // Open Quick Edit Modal for any project

  const openQuickEditProject = (proj: DesignRequestItemDto) => {
    setRenameTargetId(proj.id);
    setRenameValue(proj.projectName || 'Dự án thiết kế');
    setQuickEditDesignType(proj.designType || 'perspective_3d');
    setQuickEditLeadId(proj.leadId ? String(proj.leadId) : '');
    setQuickEditContactName(
      proj.contactName && proj.contactName !== 'Chưa cập nhật' ? proj.contactName : ''
    );
    setQuickEditInstallInfo(proj.installationInfo || '');
    setQuickEditWidthM(proj.screenWidthM || 4.8);
    setQuickEditHeightM(proj.screenHeightM || 2.7);
    setQuickEditPitch(proj.productSpec?.pixelPitch || 'P2.5');
    setOpenMenuProjectId(null);
    setEditingName(true);
  };
  // Quick Edit / Rename Project Submit

  const handleRenameProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetId = renameTargetId || currentProject?.id;
    if (!targetId || !renameValue.trim()) return;
    setSavingQuickEdit(true);
    try {
      await apiRequest(`/api/v1/design/${targetId}`, {
        method: 'PATCH',
        csrfToken: user?.csrfToken,
        body: {
          action: 'update_project',
          projectName: renameValue.trim(),
          designType: quickEditDesignType,
          leadId: quickEditLeadId ? Number(quickEditLeadId) : null,
          contactName: quickEditContactName.trim() || 'Chưa cập nhật',
          installationInfo: quickEditInstallInfo.trim() || 'Tường bên phải showroom',
          screenWidthM: Number(quickEditWidthM) || 4.8,
          screenHeightM: Number(quickEditHeightM) || 2.7,
          pixelPitch: quickEditPitch,
        },
      });
      setEditingName(false);
      setRenameTargetId(null);
      setSuccessToast(`Đã cập nhật thông tin dự án "${renameValue.trim()}".`);
      await loadData(targetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật dự án.');
    } finally {
      setSavingQuickEdit(false);
    }
  };
  // Request Single Project Delete with Sleek Custom Confirm Modal

  const requestDeleteProject = (proj: DesignRequestItemDto) => {
    setOpenMenuProjectId(null);
    setConfirmModal({
      title: 'Xác nhận xóa dự án thiết kế',
      subtitle: `Mã dự án: DA-${String(proj.id).padStart(4, '0')}${proj.leadCode ? ` · Lead: ${proj.leadCode}` : ''}`,
      message: `Bạn có chắc chắn muốn xóa dự án "${proj.projectName}"? Toàn bộ phiên bản hình ảnh AI và ảnh kỹ thuật thuộc dự án này sẽ được xóa khỏi danh sách.`,
      confirmLabel: 'Xóa dự án này',
      onConfirm: async () => {
        await apiRequest(`/api/v1/design/${proj.id}`, {
          method: 'DELETE',
          csrfToken: user?.csrfToken,
        });
        setSelectedProjectIds((prev) => prev.filter((id) => id !== proj.id));
        setSuccessToast(`Đã xóa dự án "${proj.projectName}".`);
        const remaining = requests.filter((r) => r.id !== proj.id);
        await loadData(remaining[0]?.id);
      },
    });
  };
  // Request Bulk Delete Selected Projects

  const requestBulkDeleteProjects = () => {
    if (selectedProjectIds.length === 0) return;
    const count = selectedProjectIds.length;
    setConfirmModal({
      title: `Xóa ${count} dự án đã chọn`,
      subtitle: 'Thao tác dọn dẹp nhanh danh sách dự án',
      message: `Bạn có chắc chắn muốn xóa ${count} dự án đang đánh dấu? Thao tác này giúp làm gọn danh sách dự án ngay lập tức.`,
      confirmLabel: `Xóa ${count} dự án`,
      onConfirm: async () => {
        const res = await apiRequest<{ ok: boolean; deletedCount: number }>('/api/v1/design', {
          method: 'POST',
          csrfToken: user?.csrfToken,
          body: {
            action: 'bulk_delete_projects',
            projectIds: selectedProjectIds,
          },
        });
        const deleted = res.deletedCount || count;
        const deletedSet = new Set(selectedProjectIds);
        setSelectedProjectIds([]);
        setBulkSelectMode(false);
        setSuccessToast(`Đã xóa thành công ${deleted} dự án thiết kế.`);
        const remaining = requests.filter((r) => !deletedSet.has(r.id));
        await loadData(remaining[0]?.id);
      },
    });
  };

  const toggleSelectProjectId = (id: number) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // Toggle Archive Project

  const handleToggleArchiveProject = async (proj: DesignRequestItemDto) => {
    try {
      const nextArchived = !proj.isArchived;
      await apiRequest(`/api/v1/design/${proj.id}`, {
        method: 'PATCH',
        csrfToken: user?.csrfToken,
        body: {
          action: 'update_project',
          isArchived: nextArchived,
        },
      });
      setOpenMenuProjectId(null);
      setSuccessToast(
        nextArchived
          ? `Đã lưu trữ dự án "${proj.projectName}".`
          : `Đã khôi phục dự án "${proj.projectName}".`
      );
      await loadData(proj.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu trữ dự án.');
    }
  };
  // Filter projects by search term & archive toggle

  const filteredProjects = useMemo(() => {
    return requests.filter((r) => {
      if (!showArchivedProjects && r.isArchived) return false;
      const q = searchProject.trim().toLowerCase();
      if (!q) return true;
      return (
        r.projectName.toLowerCase().includes(q) ||
        (r.leadCode && r.leadCode.toLowerCase().includes(q)) ||
        (r.leadProjectLabel && r.leadProjectLabel.toLowerCase().includes(q))
      );
    });
  }, [requests, searchProject, showArchivedProjects]);

  const isBannerProject = currentProject?.designType === 'banner';

  const toggleAssetSelection = (assetKey: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetKey) ? prev.filter((k) => k !== assetKey) : [...prev, assetKey]
    );
  };
  // Helper to update aspect ratio and auto-calculate dimensions when aspectLocked is true

  const handleAspectRatioChange = (nextRatio: string) => {
    const ratioNum = parseAspectRatioValue(nextRatio);
    setParamForm((prev) => {
      let nextW = prev.screenWidthM;
      let nextH = prev.screenHeightM;
      let nextPxW = prev.bannerWidthPx;
      let nextPxH = prev.bannerHeightPx;
      if (ratioNum && prev.aspectLocked) {
        nextH = Number((nextW / ratioNum).toFixed(2));
        nextPxH = Math.max(64, Math.round(nextPxW / ratioNum));
      }
      return {
        ...prev,
        aspectRatio: nextRatio,
        screenHeightM: nextH,
        bannerHeightPx: nextPxH,
      };
    });
  };

  const canvasRatio = (() => {
    const [w, h] = String(currentProject?.aspectRatio || '16:9')
      .split(':')
      .map(Number);
    return w > 0 && h > 0 ? w / h : 16 / 9;
  })();

  const aiConnected = Boolean(providerStatus?.isConfigured);

  return {
    user,
    canUseAiDesign,
    canExport,
    requests,
    setRequests,
    leadOptions,
    setLeadOptions,
    productOptions,
    setProductOptions,
    providerStatus,
    setProviderStatus,
    selectedId,
    setSelectedId,
    selectedVersionId,
    setSelectedVersionId,
    loading,
    setLoading,
    submitting,
    setSubmitting,
    savingParams,
    setSavingParams,
    savingFinal,
    setSavingFinal,
    uploadingPhoto,
    setUploadingPhoto,
    uploadingFinalFile,
    setUploadingFinalFile,
    error,
    setError,
    successToast,
    setSuccessToast,
    activeWorkspaceArea,
    setActiveWorkspaceArea,
    sideDockTab,
    setSideDockTab,
    viewMode,
    setViewMode,
    live3dTheme,
    setLive3dTheme,
    savingComposite,
    setSavingComposite,
    selectedProviderId,
    setSelectedProviderId,
    selectedModelId,
    setSelectedModelId,
    showAiConfigModal,
    setShowAiConfigModal,
    configModalProviderId,
    setConfigModalProviderId,
    configApiKeyInput,
    setConfigApiKeyInput,
    configEndpointInput,
    setConfigEndpointInput,
    configCustomModelInput,
    setConfigCustomModelInput,
    autoFallbackToLocal,
    setAutoFallbackToLocal,
    savingAiConfig,
    setSavingAiConfig,
    searchProject,
    setSearchProject,
    showArchivedProjects,
    setShowArchivedProjects,
    openMenuProjectId,
    setOpenMenuProjectId,
    assetFolder,
    setAssetFolder,
    selectedAssetIds,
    setSelectedAssetIds,
    mobilePane,
    setMobilePane,
    focusCanvas,
    hiddenPanels,
    togglePanel,
    allPanelsHidden,
    toggleZenMode,
    toggleFocusCanvas,
    zoomLevel,
    setZoomLevel,
    showHandles,
    setShowHandles,
    compareSplit,
    setCompareSplit,
    chatPrompt,
    setChatPrompt,
    chatQuality,
    setChatQuality,
    piiAlert,
    setPiiAlert,
    quad,
    setQuad,
    unmeasuredMode,
    setUnmeasuredMode,
    draggingHandle,
    setDraggingHandle,
    draggingCompare,
    setDraggingCompare,
    canvasContainerRef,
    paramForm,
    setParamForm,
    paramValidationError,
    setParamValidationError,
    showCreateModal,
    setShowCreateModal,
    newProjectName,
    setNewProjectName,
    newProjectType,
    setNewProjectType,
    newLeadId,
    setNewLeadId,
    newContactName,
    setNewContactName,
    newNotes,
    setNewNotes,
    newPrompt,
    setNewPrompt,
    editingName,
    setEditingName,
    renameTargetId,
    setRenameTargetId,
    renameValue,
    setRenameValue,
    quickEditDesignType,
    setQuickEditDesignType,
    quickEditLeadId,
    setQuickEditLeadId,
    quickEditContactName,
    setQuickEditContactName,
    quickEditInstallInfo,
    setQuickEditInstallInfo,
    quickEditWidthM,
    setQuickEditWidthM,
    quickEditHeightM,
    setQuickEditHeightM,
    quickEditPitch,
    setQuickEditPitch,
    savingQuickEdit,
    setSavingQuickEdit,
    selectedProjectIds,
    setSelectedProjectIds,
    bulkSelectMode,
    setBulkSelectMode,
    confirmModal,
    setConfirmModal,
    confirmBusy,
    setConfirmBusy,
    promptModal,
    setPromptModal,
    promptBusy,
    setPromptBusy,
    syncProjectSelection,
    loadData,
    currentProject,
    currentVersion,
    selectedPhoto,
    sitePhotoUrl,
    versionImageUrl,
    quadEstimatedSpecs,
    computedLiveSpecs,
    handleMouseDownHandle,
    handleMouseMoveCanvas,
    handleMouseUpCanvas,
    handlePromptChange,
    handleSaveParameters,
    handleSendChatEdit,
    handleSaveFinished,
    handleUploadTechnicalPhotos,
    handleUploadDesignerFinal,
    handleImportLeadPhotos,
    handleDownloadProjectZip,
    handleCreateProject,
    handleSaveAiProviderConfig,
    handleSaveLiveCompositeToVersion,
    openQuickEditProject,
    handleRenameProject,
    requestDeleteProject,
    requestBulkDeleteProjects,
    toggleSelectProjectId,
    handleToggleArchiveProject,
    filteredProjects,
    isBannerProject,
    toggleAssetSelection,
    handleAspectRatioChange,
    canvasRatio,
    aiConnected,
  };
}

export type StudioController = ReturnType<typeof useAiDesignStudio>;
