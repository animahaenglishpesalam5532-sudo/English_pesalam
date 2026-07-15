'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, LogOut, Menu, X, Users, Settings, QrCode, Presentation, Video, BarChart3, HelpCircle, Sparkles, Info, PhoneCall, Receipt, UserCog, ChevronDown } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import ThemeProvider from './ThemeProvider'
import ThemeToggle from './ThemeToggle'

type Role = 'admin' | 'staff'

type NavLink = { name: string; href: string; icon: React.ElementType }
type NavGroup = { title: string; links: NavLink[] }

const adminGroups: NavGroup[] = [
  {
    title: 'General',
    links: [{ name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Sales',
    links: [
      { name: 'Sales Entry', href: '/admin/sales-entry', icon: PhoneCall },
      { name: 'Sales Register', href: '/admin/sales-register', icon: Receipt },
      { name: 'Records', href: '/admin/records', icon: FileText },
      { name: 'Team', href: '/admin/team', icon: UserCog },
    ],
  },
  {
    title: 'Content',
    links: [
      { name: 'Blogs', href: '/admin/blogs', icon: FileText },
      { name: 'PDF Manager', href: '/admin/pdfs', icon: FileText },
      { name: 'PPT Manager', href: '/admin/ppts', icon: Presentation },
      { name: 'Video Courses', href: '/admin/video-courses', icon: Video },
      { name: 'Authors', href: '/admin/authors', icon: Users },
      { name: 'Quiz', href: '/admin/quiz', icon: HelpCircle },
    ],
  },
  {
    title: 'Site',
    links: [
      { name: 'Hero Settings', href: '/admin/hero-settings', icon: Sparkles },
      { name: 'About Settings', href: '/admin/about-settings', icon: Info },
      { name: 'QR Manager', href: '/admin/qr-manager', icon: QrCode },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Settings',
    links: [{ name: 'Settings', href: '/admin/settings', icon: Settings }],
  },
]

const staffGroups: NavGroup[] = [
  {
    title: 'Sales',
    links: [
      { name: 'Sales Entry', href: '/admin/sales-entry', icon: PhoneCall },
      { name: 'Records', href: '/admin/my-records', icon: Receipt },
    ],
  },
]

export default function AdminLayout({
  children,
  role = 'admin',
  userName,
}: {
  children: React.ReactNode
  role?: Role
  userName?: string
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const groups = role === 'admin' ? adminGroups : staffGroups
  const avatarInitial = (userName || role).charAt(0).toUpperCase()

  const toggleGroup = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))

  return (
    <ThemeProvider>
    <div className="admin-scope flex h-screen bg-gray-50 text-gray-900">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-14 shrink-0 border-b border-gray-200">
          <Link
            href="/admin/dashboard"
            className="text-xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tight"
          >
            English Pesalam
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {groups.map((group) => {
            const isCollapsed = collapsed[group.title]
            return (
              <div key={group.title}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-2 mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.links.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mr-2.5 shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 p-3 border-t border-gray-200">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center w-full px-2.5 py-2 text-[13px] text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:justify-end">
          <button
            className="p-2 text-gray-500 rounded-md focus:outline-none lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex flex-col items-end leading-tight">
              {userName && <span className="text-sm font-medium text-gray-900">{userName}</span>}
              <span className="text-xs text-gray-500 capitalize">{role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {avatarInitial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 rounded-full mb-4">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Sign Out</h3>
              
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to log out of the admin panel?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1 inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsLogoutModalOpen(false);
                      logout();
                    }}
                    className="flex-1 inline-flex justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  )
}

