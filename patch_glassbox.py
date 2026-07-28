import re

def patch_glassbox():
    with open('src/pages/GlassBox.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add state for secretCounter and dailyHistory
    state_injection = """
  const [secretCounter, setSecretCounter] = useState(0);
  const [dailyHistory, setDailyHistory] = useState<number[]>([]);

  React.useEffect(() => {
    // Fetch secret counter
    const fetchAdminStats = async () => {
      try {
        const res = await fetch('/api/admin/secret-counter', {
          headers: {
            'x-admin-secret': 'DSPG_ADMIN_SUPER_SECRET_2026' // In a real app this would be prompted/stored securely
          }
        });
        if (res.ok) {
          const result = await res.json();
          setSecretCounter(result.data.secretCounter || result.data.totalProjects);
          setDailyHistory(result.data.dailyHistory || []);
        }
      } catch (e) {
        console.error('Failed to fetch admin stats', e);
      }
    };
    fetchAdminStats();
  }, []);
"""
    
    if "const [secretCounter, setSecretCounter]" not in content:
        content = content.replace(
            "const [showExclusionManager, setShowExclusionManager] = useState(false);",
            "const [showExclusionManager, setShowExclusionManager] = useState(false);\n" + state_injection
        )

    # Inject the Secret Counter Widget in the JSX
    widget_injection = """
      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">🔐 Secret Counter</div>
            <div className="text-3xl font-bold text-purple-400">{secretCounter}</div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            Total projects tracked since deployment
            {dailyHistory.length > 0 && (
              <div className="mt-1">
                Recent Daily: {dailyHistory.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
"""
    if "🔐 Secret Counter" not in content:
        content = content.replace(
            '<h1 className="text-2xl font-bold text-white mb-6">Glass Box Admin</h1>',
            '<h1 className="text-2xl font-bold text-white mb-6">Glass Box Admin</h1>\n' + widget_injection
        )

    with open('src/pages/GlassBox.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch_glassbox()
