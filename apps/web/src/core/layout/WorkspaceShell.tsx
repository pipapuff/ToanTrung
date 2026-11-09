'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCheck,
  Clock,
  Crosshair,
  FileSpreadsheet,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import {
  hasBaPermission,
  type BaPermissionKey,
  type NotificationDto,
} from '@toantrung/contracts';
import { apiRequest } from '../http/client';
import { useSession } from '../session/SessionContext';
import { PanelToggleButton } from '../layout/PanelToggleButton';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
  requiredPermission?: BaPermissionKey;
}

const ROUTE_REQUIRED_PERMISSION: Record<string, BaPermissionKey> = {
  '/dashboard': 'DASHBOARD_VIEW',
  '/leads': 'LEAD_VIEW_OWN',
  '/tracking': 'TRACKING_ADS_OPTIMIZE',
  '/ads': 'AI_MARKETING_SEO',
  '/reports': 'DASHBOARD_VIEW',
  '/design': 'AI_DESIGN',
  '/admin/users': 'SYSTEM_USER_ADMIN',
  '/settings': 'SYSTEM_USER_ADMIN',
};

const BREADCRUMB_LABELS: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/leads': 'Leads',
  '/tracking': 'Chiến dịch',
  '/ads': 'Từ khóa SEO',
  '/reports': 'Báo cáo',
  '/design': 'Thiết kế 3D',
  '/notifications': 'Thông báo',
  '/profile': 'Tài khoản',
  '/admin/users': 'Nhân sự',
  '/settings': 'Cài đặt',
};

/** Khớp theo tiền tố dài nhất để /leads/123 vẫn ra "Leads". */
function resolveLabel(pathname: string): string | undefined {
  if (BREADCRUMB_LABELS[pathname]) return BREADCRUMB_LABELS[pathname];
  const key = Object.keys(BREADCRUMB_LABELS)
    .filter((k) => pathname.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  return key ? BREADCRUMB_LABELS[key] : undefined;
}

const isDesignRoute = (p: string) => p === '/design' || p === '/ai-design';

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'TT';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/dashboard';
  const router = useRouter();
  const { user, loading, branding, unreadCount, setUnreadCountState, logout } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isDesignRoute(pathname));
  const [bellOpen, setBellOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationDto[]>([]);
  const [loadingBell, setLoadingBell] = useState(false);
  const [tip, setTip] = useState<{ label: string; top: number } | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

  // Tự thu gọn sidebar ở /design, tự mở ở các trang còn lại
  useEffect(() => {
    setSidebarCollapsed(isDesignRoute(pathname));
    setTip(null);
  }, [pathname]);

  useEffect(() => {
    const pageLabel = resolveLabel(pathname);
    document.title = pageLabel ? `${pageLabel} | Toàn Trung CRM` : 'Toàn Trung CRM';
  }, [pathname]);

  const fetchBellNotifications = useCallback(async () => {
    setLoadingBell(true);
    try {
      const res = await apiRequest<{ items: NotificationDto[]; unreadCount: number }>(
        '/api/v1/notifications',
      );
      setRecentNotifications((res.items || []).slice(0, 5));
      setUnreadCountState(res.unreadCount ?? 0);
    } catch {
      // ignore
    } finally {
      setLoadingBell(false);
    }
  }, [setUnreadCountState]);

  useEffect(() => {
    if (bellOpen) void fetchBellNotifications();
  }, [bellOpen, fetchBellNotifications]);

  // Đóng popover khi bấm ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!bellOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBellOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [bellOpen]);

  // Đóng drawer mobile bằng Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleMarkAllReadQuick = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const res = await apiRequest<{ items: NotificationDto[]; unreadCount: number }>(
        '/api/v1/notifications',
        {
          method: 'PATCH',
          csrfToken: user.csrfToken,
          body: { markAll: true },
        },
      );
      setRecentNotifications((res.items || []).slice(0, 5));
      setUnreadCountState(res.unreadCount ?? 0);
    } catch {
      // ignore
    }
  };

  const isFullBleed = pathname === '/design';

  const requiredPermForCurrentRoute = ROUTE_REQUIRED_PERMISSION[pathname];
  const isRouteUnauthorized = Boolean(
    user &&
      requiredPermForCurrentRoute &&
      !hasBaPermission(user.roleCode, requiredPermForCurrentRoute),
  );

  useEffect(() => {
    if (!loading && isRouteUnauthorized) router.replace('/dashboard');
  }, [loading, isRouteUnauthorized, router]);

  const workNav: NavItem[] = [
    { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid, requiredPermission: 'DASHBOARD_VIEW' },
    { href: '/leads', label: 'Leads', icon: FileSpreadsheet, requiredPermission: 'LEAD_VIEW_OWN' },
    { href: '/tracking', label: 'Chiến dịch', icon: Crosshair, requiredPermission: 'TRACKING_ADS_OPTIMIZE' },
    { href: '/ads', label: 'Từ khóa SEO', icon: Megaphone, requiredPermission: 'AI_MARKETING_SEO' },
    { href: '/reports', label: 'Báo cáo', icon: BarChart3, requiredPermission: 'DASHBOARD_VIEW' },
    { href: '/design', label: 'Thiết kế 3D', icon: Sparkles, requiredPermission: 'AI_DESIGN' },
  ];

  const personalNav: NavItem[] = [
    { href: '/notifications', label: 'Thông báo', icon: Bell, badge: unreadCount },
    { href: '/profile', label: 'Tài khoản', icon: UserCircle2 },
  ];

  const systemNav: NavItem[] = [
    { href: '/admin/users', label: 'Nhân sự', icon: Users, adminOnly: true, requiredPermission: 'SYSTEM_USER_ADMIN' },
    { href: '/settings', label: 'Cài đặt', icon: Settings, adminOnly: true, requiredPermission: 'SYSTEM_USER_ADMIN' },
  ];

  const currentBreadcrumb = resolveLabel(pathname) || 'Tổng quan';

  if (loading || !user || isRouteUnauthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl px-8 py-7 shadow-lg flex items-center gap-4">
          <div className="w-5 h-5 rounded-full border-2 border-[#1E3A8A] border-t-transparent animate-spin" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {loading ? 'Đang khởi tạo Toàn Trung CRM...' : 'Đang chuyển hướng...'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  const canSee = (item: NavItem) =>
    (!item.adminOnly || user.roleCode === 'ADMIN') &&
    (!item.requiredPermission || hasBaPermission(user.roleCode, item.requiredPermission));

  const visibleWorkNav = workNav.filter(canSee);
  const visibleSystemNav = systemNav.filter(canSee);

  // Ẩn nhãn chỉ ở lg+ khi thu gọn; drawer mobile luôn hiện đầy đủ
  const labelHidden = sidebarCollapsed ? 'lg:hidden' : '';

  const showTip = (e: React.SyntheticEvent<HTMLElement>, label: string) => {
    if (!sidebarCollapsed) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2 });
  };

  const renderNavList = (items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={(e) => showTip(e, item.label)}
              onFocus={(e) => showTip(e, item.label)}
              onMouseLeave={() => setTip(null)}
              onBlur={() => setTip(null)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`group relative flex items-center gap-3 h-10 rounded-xl px-3.5 text-sm transition-colors duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-400 ${
                sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
              } ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {/* Vạch nhấn bên trái cho mục đang chọn */}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400"
                />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className={`truncate flex-1 text-sm ${labelHidden}`}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold ${
                    sidebarCollapsed
                      ? 'lg:absolute lg:top-1 lg:right-1 lg:min-w-[16px] lg:h-4 lg:px-1 lg:text-[10px]'
                      : ''
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-dvh bg-slate-50/60 text-slate-800 flex w-full overflow-hidden">
      {/* Scrim cho drawer mobile / tablet */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng thanh điều hướng"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar trái. KHÔNG overflow-hidden để tay nắm ghim ở mép phải luôn nhìn thấy */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-dvh shrink-0 bg-[#0A1628] border-r border-slate-800/80 flex flex-col transition-[width,transform] duration-200 shadow-2xl w-[272px] ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Tay nắm ghim: luôn hiện (kể cả khi thu gọn), chỉ dùng từ lg trở lên */}
        <PanelToggleButton
          side="left"
          open={!sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          label="thanh điều hướng"
          align="start"
          className="hidden lg:grid"
        />

        {/* Header thương hiệu */}
        <div
          className={`h-16 shrink-0 flex items-center border-b border-slate-800/60 justify-between px-4 ${
            sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center min-w-0"
            title="Toàn Trung — Về trang tổng quan"
          >
            {sidebarCollapsed ? (
              <>
                <img
                  src="/brand/toantrung-app-icon.png"
                  alt="Logo Toàn Trung"
                  className="hidden lg:block w-9 h-9 rounded-xl object-contain"
                />
                <img
                  src="/brand/logo-toan-trung-white.png"
                  alt="Logo Toàn Trung"
                  className="lg:hidden h-7 w-auto max-w-[170px] object-contain"
                />
              </>
            ) : (
              <img
                src="/brand/logo-toan-trung-white.png"
                alt="Logo Toàn Trung"
                className="h-7 w-auto max-w-[170px] object-contain"
              />
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Điều hướng */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1.5">
          {renderNavList(visibleWorkNav)}
          <div className="border-t border-slate-800/60 my-2" />
          {renderNavList(personalNav)}
          {visibleSystemNav.length > 0 && (
            <>
              <div className="border-t border-slate-800/60 my-2" />
              {renderNavList(visibleSystemNav)}
            </>
          )}
        </nav>

        {/* Tóm tắt tài khoản */}
        <div className="p-3 shrink-0 border-t border-slate-800/70">
          <Link
            href="/profile"
            title={`${user.fullName} (${user.email})`}
            className={`flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-white/5 transition-colors ${
              sidebarCollapsed ? 'lg:justify-center' : ''
            }`}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs grid place-items-center shrink-0">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className={`min-w-0 flex-1 ${labelHidden}`}>
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.roleName}</p>
            </div>
          </Link>
        </div>

        {/* Tooltip khi thu gọn: định vị theo toạ độ nên không bị cắt bởi overflow của <nav> */}
        {tip && sidebarCollapsed && (
          <div
            role="tooltip"
            style={{ top: tip.top }}
            className="pointer-events-none fixed left-[72px] z-[60] hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg lg:block"
          >
            {tip.label}
          </div>
        )}
      </aside>

      {/* Vùng nội dung bên phải */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-dvh overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {pathname === '/design' && (
              <div id="studio-header-left-slot" className="hidden md:flex items-center gap-1.5" />
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu điều hướng"
              className="lg:hidden w-11 h-11 -ml-1 rounded-xl text-slate-600 hover:text-[#2563EB] hover:bg-slate-100 grid place-items-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/dashboard"
              className="lg:hidden h-8 px-2 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0"
              title="Toàn Trung"
            >
              <img src="/brand/logo-toan-trung.png" alt="Logo Toàn Trung" className="h-4 w-auto object-contain" />
            </Link>

            <nav aria-label="Breadcrumb" className="flex items-center min-w-0 space-x-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {branding.organizationName || 'Toàn Trung CRM'}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <strong className="text-slate-900 font-bold text-sm sm:text-base truncate">
                {currentBreadcrumb}
              </strong>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/*
              Slot cho các nút ẩn/hiện của trang Thiết kế 3D (AiDesignWorkspace đưa vào qua portal).
              Dùng <PanelToggleButton variant="header" /> để đồng bộ giao diện với tay nắm của sidebar.
            */}
            {pathname === '/design' && (
              <div id="studio-header-slot" className="flex items-center gap-1.5" />
            )}

            {/* Chuông thông báo */}
            <div ref={bellRef} className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((prev) => !prev)}
                aria-label="Thông báo"
                aria-haspopup="dialog"
                aria-expanded={bellOpen}
                className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-[#2563EB] grid place-items-center transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2563EB] text-white text-[11px] font-bold grid place-items-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div
                  role="dialog"
                  aria-label="Thông báo mới nhất"
                  className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-extrabold text-slate-900">Thông báo mới nhất</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A] text-[11px] font-bold">
                        {unreadCount} chưa đọc
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => void handleMarkAllReadQuick()}
                        className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {loadingBell ? (
                      <div className="p-6 text-center text-xs text-slate-500">Đang tải thông báo...</div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">Chưa có thông báo mới.</div>
                    ) : (
                      recentNotifications.map((item) => {
                        const isWarn =
                          item.category.toLowerCase().includes('cảnh báo') ||
                          item.category.toLowerCase().includes('dò giá');
                        return (
                          <Link
                            key={item.id}
                            href={item.actionUrl || '/notifications'}
                            onClick={() => setBellOpen(false)}
                            className={`block px-4 py-3 hover:bg-slate-50 transition ${
                              !item.isRead ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`mt-0.5 w-7 h-7 rounded-lg grid place-items-center shrink-0 ${
                                  isWarn ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#1E3A8A]'
                                }`}
                              >
                                {isWarn ? <AlertTriangle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                                  {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.summary}</p>
                                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setBellOpen(false)}
                      className="w-full py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#2563EB] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Xem tất cả thông báo</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + đăng xuất, tách bằng vạch ngăn để tránh bấm nhầm */}
            <div className="flex items-center gap-2 sm:gap-3 sm:pl-3 sm:ml-1 sm:border-l sm:border-slate-200">
              <Link
                href="/profile"
                title={`${user.fullName} (${user.email})`}
                className="hidden sm:flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:border-blue-300 transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[11px] grid place-items-center shrink-0">
                    {getInitials(user.fullName)}
                  </span>
                )}
                <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[130px] truncate">
                  {user.fullName}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => void logout()}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/*
          Vùng trang. Chuỗi flex này là thứ giữ cho cột phải / tab thông số không bị xén:
          mọi tầng đều có min-w-0 + min-h-0, nên khi sidebar hoặc cột phải đổi độ rộng,
          nội dung co giãn theo thay vì tràn rồi bị overflow-hidden cắt mất.
        */}
        <main
          className={
            isFullBleed
              ? 'flex-1 min-h-0 min-w-0 w-full overflow-hidden flex flex-col p-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 bg-slate-100/70'
              : 'flex-1 min-h-0 min-w-0 w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-5 overflow-y-auto bg-slate-100/60'
          }
        >
          {isFullBleed ? (
            <div className="flex-1 min-h-0 min-w-0 flex flex-col">{children}</div>
          ) : (
            children
          )}
        </main>

        {/* Thanh điều hướng đáy (mobile) */}
        <nav
          aria-label="Điều hướng di động"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] backdrop-blur-md bg-white/90 border-t border-slate-200/90 px-2 flex items-center justify-around shadow-lg"
        >
          {[
            { href: '/leads', label: 'Leads', icon: FileSpreadsheet },
            ...(hasBaPermission(user.roleCode, 'AI_DESIGN')
              ? [{ href: '/design', label: 'Thiết kế 3D', icon: Sparkles }]
              : []),
            { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
            { href: '/notifications', label: 'Thông báo', icon: Bell, badge: unreadCount },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative min-w-[60px] min-h-[44px] px-2 py-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  active ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold grid place-items-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="min-w-[60px] min-h-[44px] px-2 py-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
            <span>Thêm</span>
          </button>
        </nav>
      </div>
    </div>
  );
}