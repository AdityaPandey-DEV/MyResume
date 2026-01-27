
'use client'


import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function SyncManager() {
    const [loading, setLoading] = useState(false)
    const [cookieConnected, setCookieConnected] = useState(false)
    const [settings, setSettings] = useState({
        leetcodeUsername: '',
        codeforcesUsername: '',
        githubUsername: '',
        githubToken: '',
        linkedinUsername: '',
    })
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({
                        ...prev,
                        leetcodeUsername: data.leetcodeUsername || '',
                        codeforcesUsername: data.codeforcesUsername || '',
                        githubUsername: data.githubUsername || '',
                        githubToken: data.githubToken || '',
                        linkedinUsername: data.linkedinUsername || '',
                    }));
                    if (data.linkedinCookieConfigured) {
                        setCookieConnected(true);
                    }
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        };
        fetchSettings();
    }, []);

    const [linkedinJson, setLinkedinJson] = useState('')

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Settings saved')
        } catch {
            toast.error('Error saving')
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (platform: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/sync/${platform}`, { method: 'POST' })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Failed to sync ${platform}`);
            }
            toast.success(`Synced ${platform} successfully`)
        } catch (e: any) {
            console.error(e)
            toast.error(e.message || `Error syncing ${platform}`)
        } finally {
            setLoading(false)
        }
    }

    const handleLinkedinSync = async () => {
        setLoading(true)
        try {
            let parsed;
            try {
                parsed = JSON.parse(linkedinJson);
            } catch {
                throw new Error("Invalid JSON");
            }

            const res = await fetch('/api/sync/linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedinData: parsed })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(errData.error || `Server responded with ${res.status}`);
            }

            toast.success('LinkedIn data synced!');
            setLinkedinJson('');
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Error syncing LinkedIn');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Sync Configuration</h2>
                <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">LeetCode Username</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={settings.leetcodeUsername}
                            onChange={(e) => setSettings({ ...settings, leetcodeUsername: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Codeforces Username</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={settings.codeforcesUsername}
                            onChange={(e) => setSettings({ ...settings, codeforcesUsername: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">GitHub Username (for bulk sync)</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={settings.githubUsername}
                            onChange={(e) => setSettings({ ...settings, githubUsername: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            GitHub Personal Access Token
                            <span className="ml-2 text-xs text-gray-400 font-normal">(Required for Deep Search)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                className="flex-1 p-2 border rounded"
                                placeholder={settings.githubToken ? '••••••••' : 'ghp_...'}
                                value={settings.githubToken}
                                onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                            />
                            <a
                                href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=Portfolio+Sync+Agent"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm flex items-center whitespace-nowrap"
                                title="Get Token from GitHub"
                            >
                                Get Token 🔑
                            </a>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                            We need this to scan your repositories (Deep Search). We cannot use your password as GitHub deprecated it in 2021.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">LinkedIn Username</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={settings.linkedinUsername}
                            onChange={(e) => setSettings({ ...settings, linkedinUsername: e.target.value })}
                        />
                    </div>



                    <button disabled={loading} className="md:col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        Save Settings
                    </button>
                </form>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">One-Click Sync</h2>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => handleSync('leetcode')} disabled={loading} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50">
                            Sync LeetCode
                        </button>
                        <button onClick={() => handleSync('codeforces')} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                            Sync Codeforces
                        </button>
                        <button onClick={() => handleSync('github/all')} disabled={loading} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
                            Sync All GitHub Projects
                        </button>
                        <button onClick={() => toast('Please use the Chrome Extension (Blue "L" icon) to sync LinkedIn.', { icon: 'ℹ️' })} className="px-4 py-2 bg-[#0077b5] text-white rounded hover:opacity-90 opacity-80 cursor-not-allowed">
                            Sync LinkedIn Profile (Use Extension)
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-blue-900">LinkedIn Synchronization</h2>
                                {cookieConnected && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Connected via Extension
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 mb-6">
                                The easiest way to keep your portfolio up-to-date. Sync your experience, education, and skills in seconds using our official Chrome extension.
                            </p>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">How to use:</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                                        <span>Install the <b>LinkedIn Sync</b> extension from the Web Store.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                                        <span>Navigate to your LinkedIn profile page.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                                        <span>Click the extension icon and hit <b>&quot;Sync to Portfolio&quot;</b>.</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="https://chromewebstore.google.com/detail/your-extension-id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0077b5] text-white font-bold rounded-xl hover:bg-[#006396] transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81L5.12 9.91l4.91-.42L12 5l1.97 4.49 4.91.42-3.77 3.28 1.12 4.81z" />
                                </svg>
                                Install from Chrome Web Store
                            </a>
                        </div>

                        <div className="w-full md:w-72 p-6 bg-white rounded-xl border border-blue-100 shadow-inner">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Advanced Import</h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Use this as a fallback if you prefer manual JSON data entry.
                            </p>
                            <textarea
                                className="w-full h-24 p-2 border rounded mb-3 text-[10px] font-mono bg-gray-50 focus:bg-white transition-colors"
                                placeholder='{ "linkedinData": { ... } }'
                                value={linkedinJson}
                                onChange={(e) => setLinkedinJson(e.target.value)}
                            />
                            <button
                                onClick={handleLinkedinSync}
                                disabled={loading || !linkedinJson}
                                className="w-full px-4 py-2 text-sm border-2 border-[#0077b5] text-[#0077b5] font-bold rounded-lg hover:bg-[#0077b5] hover:text-white transition-all disabled:opacity-30"
                            >
                                Import JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
