import { Link, usePage } from '@inertiajs/react';
import { 
    AlertTriangle,
    Building2, 
    ClipboardList,
    CircleDot, 
    LayoutGrid, 
    MapPin, 
    Network, 
    Rows3, 
    Tag, 
    Users, 
    Zap,
    ChevronDown,
    Bell,
    Search,
    GitBranch,
    X
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { toUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SidebarCounts {
    billCollectors: number;
    consumers: number;
    categories: number;
    circles: number;
    divisions: number;
    subdivisions: number;
    sections: number;
    villages: number;
    feeders: number;
    dtrs: number;
}

interface PageProps {
    sidebarCounts?: SidebarCounts;
    [key: string]: unknown;
}

export function AppSidebar() {
    const [mounted, setMounted] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ main: true, hierarchy: true });
    const [searchQuery, setSearchQuery] = useState('');
    const { open, toggleSidebar } = useSidebar();
    const { url, props } = usePage<PageProps>();
    const counts = props.sidebarCounts;

    useEffect(() => { setMounted(true); }, []);

    const mainNavItems: NavItem[] = useMemo(() => [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, badge: null },
        { title: 'Bill Collectors', href: '/admin/billcollectors', icon: Users, badge: { count: counts?.billCollectors ?? 0, variant: 'default' } },
        { title: 'Consumers', href: '/admin/consumers', icon: Zap, badge: { count: counts?.consumers ?? 0, variant: 'secondary' } },
        { title: 'Categories', href: '/admin/categories', icon: Tag, badge: { count: counts?.categories ?? 0, variant: 'outline' } },
        { title: 'Visit Management', href: '/admin/visit-management', icon: ClipboardList, badge: null },
        { title: 'Defaulters', href: '/admin/defaulters', icon: AlertTriangle, badge: null },
    ], [counts]);

    const hierarchyNavItems: NavItem[] = useMemo(() => [
        { title: 'Circles', href: '/admin/circles', icon: CircleDot, badge: { count: counts?.circles ?? 0, variant: 'default' } },
        { title: 'Divisions', href: '/admin/divisions', icon: GitBranch, badge: { count: counts?.divisions ?? 0, variant: 'default' } },
        { title: 'Subdivisions', href: '/admin/subdivisions', icon: Network, badge: { count: counts?.subdivisions ?? 0, variant: 'default' } },
        { title: 'Sections', href: '/admin/sections', icon: Rows3, badge: { count: counts?.sections ?? 0, variant: 'default' } },
        { title: 'Villages', href: '/admin/villages', icon: MapPin, badge: { count: counts?.villages ?? 0, variant: 'default' } },
        { title: 'Feeders', href: '/admin/feeders', icon: Building2, badge: { count: counts?.feeders ?? 0, variant: 'default' } },
        { title: 'DTRs', href: '/admin/dtrs', icon: Building2, badge: { count: counts?.dtrs ?? 0, variant: 'default' } },
    ], [counts]);

    const filteredMainItems = useMemo(() => {
        if (!searchQuery.trim()) return mainNavItems;
        return mainNavItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mainNavItems, searchQuery]);

    const filteredHierarchyItems = useMemo(() => {
        if (!searchQuery.trim()) return hierarchyNavItems;
        return hierarchyNavItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [hierarchyNavItems, searchQuery]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isActiveRoute = (href: NonNullable<NavItem['href']>) => {
        const path = toUrl(href);
        return path === '/dashboard' ? url === '/dashboard' : url.startsWith(path);
    };

    const clearSearch = () => setSearchQuery('');

    if (!mounted) return null;

    const hasResults = filteredMainItems.length > 0 || filteredHierarchyItems.length > 0;

    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset"
            className="group/sidebar border-r border-slate-200 dark:border-gray-800"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-900/30 backdrop-blur-xl pointer-events-none" />
            
            <SidebarHeader className="relative z-10 border-b border-slate-200 dark:border-gray-800 pb-4">
                <div className="flex items-center justify-between px-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-all">
                                <Link href={dashboard()} prefetch className="group/logo">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {open && (
                        <button className="relative p-2 text-slate-500 hover:text-blue-600 rounded-lg transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                        </button>
                    )}
                </div>

                {open && (
                    <div className="mt-4 px-2">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Quick search..."
                                className="w-full h-9 pl-9 pr-8 bg-slate-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            {searchQuery ? (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border"></kbd>
                            )}
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="relative z-10 py-2">
                {!hasResults && searchQuery && (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No results for "{searchQuery}"</p>
                        <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            Clear search
                        </button>
                    </div>
                )}

                {filteredMainItems.length > 0 && (
                    <SidebarGroup>
                        {open && (
                            <div className="flex items-center justify-between px-2 mb-2 cursor-pointer" onClick={() => toggleSection('main')}>
                                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Menu</SidebarGroupLabel>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expandedSections.main ? '' : '-rotate-90'}`} />
                            </div>
                        )}
                        <SidebarGroupContent>
                            <div className={`space-y-1 overflow-hidden transition-all ${expandedSections.main || !open ? 'opacity-100' : 'h-0 opacity-0'}`}>
                                {filteredMainItems.map((item) => (
                                    <SidebarMenuItem key={item.title} className="list-none">
                                        <SidebarMenuButton asChild isActive={isActiveRoute(item.href)} className={`w-full transition-all duration-200 ${isActiveRoute(item.href) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-gray-800'}`}>
                                            <Link href={item.href} className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.badge && open && (
                                                    <Badge 
                                                        variant={(item.badge.variant as 'default' | 'secondary' | 'outline') ?? 'default'} 
                                                        className={isActiveRoute(item.href) ? 'bg-white/20 text-white border-0' : ''}
                                                    >
                                                        {item.badge.count}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {filteredMainItems.length > 0 && filteredHierarchyItems.length > 0 && (
                    <SidebarSeparator className="mx-4 my-2 opacity-50" />
                )}

                {filteredHierarchyItems.length > 0 && (
                    <SidebarGroup>
                        {open && (
                            <div className="flex items-center justify-between px-2 mb-2 cursor-pointer" onClick={() => toggleSection('hierarchy')}>
                                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hierarchy</SidebarGroupLabel>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expandedSections.hierarchy ? '' : '-rotate-90'}`} />
                            </div>
                        )}
                        <SidebarGroupContent>
                            <div className={`space-y-1 overflow-hidden transition-all ${expandedSections.hierarchy || !open ? 'opacity-100' : 'h-0 opacity-0'}`}>
                                {filteredHierarchyItems.map((item) => (
                                    <SidebarMenuItem key={item.title} className="list-none">
                                        <SidebarMenuButton asChild isActive={isActiveRoute(item.href)} className={`w-full ${isActiveRoute(item.href) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-gray-800'}`}>
                                            <Link href={item.href} className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.badge && open && (
                                                    <Badge className={isActiveRoute(item.href) ? 'bg-white/20 text-white border-0' : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300'}>
                                                        {item.badge.count}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="relative z-10 border-t border-slate-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                <NavFooter items={[]} />
                <div className="px-2 pb-4">
                    <NavUser />
                </div>
            </SidebarFooter>

            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-10 z-20 flex items-center justify-center w-6 h-6 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-full shadow-sm hover:scale-110 transition-all"
            >
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-90' : '-rotate-90'}`} />
            </button>
        </Sidebar>
    );
}
