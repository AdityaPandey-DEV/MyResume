
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
        linkedinUsername: '',
        linkedinCookie: '',
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
                        <label className="block text-sm font-medium mb-1">LinkedIn Username</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={settings.linkedinUsername}
                            onChange={(e) => setSettings({ ...settings, linkedinUsername: e.target.value })}
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">LinkedIn Cookie (li_at) for Sync</label>
                        {cookieConnected ? (
                            <div className="flex items-center gap-2 p-2 px-3 border border-green-200 bg-green-50 rounded text-green-700 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Connected via Extension
                                <button
                                    type="button"
                                    onClick={() => setCookieConnected(false)}
                                    className="ml-auto text-xs text-green-800 hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <input
                                type="password"
                                className="w-full p-2 border rounded"
                                placeholder="Enter li_at cookie value"
                                value={settings.linkedinCookie}
                                onChange={(e) => setSettings({ ...settings, linkedinCookie: e.target.value })}
                            />
                        )}
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

                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">LinkedIn Extension</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Tired of copying cookies? Install our local Chrome Extension to sync in one click.
                    </p>
                    <div className="space-y-4 text-sm">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Open Chrome Extensions (chrome://extensions)</li>
                            <li>Enable &quot;Developer Mode&quot; (top right)</li>
                            <li>Click &quot;Load Unpacked&quot;</li>
                            <li>Select the <code className="bg-gray-100 p-1">public/extension</code> folder</li>
                            <li>Click the &quot;L&quot; icon in your toolbar to Sync!</li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">LinkedIn Import</h2>
                    <p className="text-xs text-gray-500 mb-2">
                        Paste JSON data from LinkedIn export or compatible scraper.
                        (Education & Certifications will be overwritten)
                    </p>
                    <textarea
                        className="w-full h-32 p-2 border rounded mb-2 text-xs font-mono"
                        placeholder='{ "education": [...], "certifications": [...] }'
                        value={linkedinJson}
                        onChange={(e) => setLinkedinJson(e.target.value)}
                    />
                    <button onClick={handleLinkedinSync} disabled={loading} className="w-full px-4 py-2 bg-[#0077b5] text-white rounded hover:opacity-90 disabled:opacity-50">
                        Import from LinkedIn JSON
                    </button>
                </div>
            </div>
        </div>
    )
}
