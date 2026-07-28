import re

def patch_checker():
    with open('src/components/PlagiarismChecker.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Import PublicCounter
    if "import { PublicCounter }" not in content:
        content = content.replace(
            "import { ErrorBoundary } from './ErrorBoundary';",
            "import { ErrorBoundary } from './ErrorBoundary';\nimport { PublicCounter } from './PublicCounter';"
        )

    # Insert PublicCounter in the Header
    # Finding the banner
    target = """<div className="flex flex-wrap gap-2 mt-2">"""
    replacement = """<div className="mt-4"><PublicCounter /></div>\n                  <div className="flex flex-wrap gap-2 mt-2">"""
    
    if "<PublicCounter />" not in content:
        content = content.replace(target, replacement)

    # Insert counter display in the AI Verdict section (the user asked for ResultsDisplay.tsx, this is the equivalent here)
    verdict_target = """<h3 className="text-lg font-semibold mb-3">🤖 AI Analysis</h3>"""
    verdict_replacement = """<h3 className="text-lg font-semibold mb-3">🤖 AI Analysis</h3>
                      
                      {state.normalizedDoc.counter && (
                        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">📊 Total Projects Analyzed</span>
                            <span className="font-bold text-green-600">{state.normalizedDoc.counter.total?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-500">Today's Checks</span>
                            <span className="font-bold text-blue-600">{state.normalizedDoc.counter.today}</span>
                          </div>
                        </div>
                      )}
"""
    if "state.normalizedDoc.counter &&" not in content:
        content = content.replace(verdict_target, verdict_replacement)

    with open('src/components/PlagiarismChecker.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch_checker()
