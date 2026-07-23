import React, { useState } from 'react';
import { DesktopAppConfig } from '../types';
import { Monitor, Download, Copy, Check, Terminal, Shield, Mic, ExternalLink, Cpu, Play, CheckCircle2, AlertTriangle, Layers, FileCode } from 'lucide-react';

export const DesktopStudio: React.FC = () => {
  const [activeTier, setActiveTier] = useState<number>(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Default Desktop Configuration based on Tier 0 Interview
  const [config, setConfig] = useState<DesktopAppConfig>({
    agentName: 'Trillion',
    localUrl: 'http://localhost:3000/',
    port: 3000,
    os: 'macOS',
    serverFramework: 'FastAPI / Express',
    serverStartMethod: 'Supervisor / tsx / uvicorn',
    requiresMic: true,
    pythonVersion: 'Python 3.11 (Homebrew)',
    hasOAuth: true,
    bundleId: 'com.trillion.desktop',
    distributionType: 'local'
  });

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Tier 0 AGENT.md Spec Content
  const agentMdContent = `# AGENT.md - Native Desktop Agent Specification

## Identity & Config
- **Agent Name**: ${config.agentName}
- **Local URL**: ${config.localUrl}
- **Target OS**: ${config.os}
- **Server Framework**: ${config.serverFramework}
- **Requires Microphone**: ${config.requiresMic ? 'Yes (WKWebView Delegate Override Required)' : 'No (Text-only)'}
- **OAuth / External Links**: ${config.hasOAuth ? 'Yes (Route window.open to System Browser)' : 'No'}
- **Bundle ID**: ${config.bundleId}
- **Distribution**: ${config.distributionType === 'local' ? 'Local Only (Ad-hoc Code Signature)' : 'Distribution (Developer ID Notarized)'}

## Architecture Architecture
1. Local Server running on port ${config.port}
2. Chrome-less Native Window wrapper using pywebview
3. WKWebView permission delegate subclass for microphone grant
4. System browser fallback handler for OAuth popups
5. Auto-wake supervisor and polling splash loader
`;

  // Tier 1 & 2 & 3 Python Shell Script
  const pythonShellContent = `#!/usr/bin/env python3
import sys
import os
import time
import urllib.request
import webview
import subprocess

# Desktop App: ${config.agentName}
URL = "${config.localUrl}"
AGENT_NAME = "${config.agentName}"

# Tier 2 & 3: Custom WKWebView Delegate for macOS Mic Permissions & Window.Open Routing
if sys.platform == "darwin":
    try:
        from objc import super
        from Foundation import NSObject
        import WebKit

        # Override pywebview's Cocoa browser delegate
        from webview.platforms.cocoa import CocoaWKNavigationDelegate

        class CustomWebDelegate(CocoaWKNavigationDelegate):
            # Problem A Fix: Grant microphone permission automatically
            def webView_requestMediaCapturePermissionForOrigin_initiatedByFrame_type_decisionHandler_(
                self, webview, origin, frame, capture_type, handler
            ):
                # Grant WebKit media capture permission (WKMediaCaptureType)
                handler(WebKit.WKPermissionDecisionGrant)

            # Tier 3 Fix: Escaping OAuth window.open to system default browser
            def webView_createWebViewWithConfiguration_forNavigationAction_windowFeatures_(
                self, webview, config, action, features
            ):
                if action.request() and action.request().URL():
                    url_str = action.request().URL().absoluteString()
                    # Open in default macOS Browser (Safari/Chrome)
                    subprocess.Popen(["open", url_str])
                return None

        # Inject Delegate subclass before window creation
        import webview.platforms.cocoa as cocoa_mod
        cocoa_mod.CocoaWKNavigationDelegate = CustomWebDelegate
        print("Successfully injected macOS WKWebView Mic & OAuth Navigation Delegate")
    except Exception as e:
        print(f"Notice: Delegate subclass fallback - {e}")

# Tier 4: Server Health Check & Wake Loader
def check_server_up(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'TrillionDesktop'})
        with urllib.request.urlopen(req, timeout=1.5) as response:
            return response.status == 200
    except Exception:
        return False

def main():
    print(f"Launching {AGENT_NAME} Desktop Window...")
    
    # Check if server is up or needs wake polling
    if not check_server_up(URL):
        print(f"Server at {URL} is sleeping or starting... waiting for response...")
        for attempt in range(30):
            time.sleep(1)
            if check_server_up(URL):
                print(f"Server responded on attempt {attempt+1}!")
                break
    
    # Create Native Chrome-less Window
    window = webview.create_window(
        title=AGENT_NAME,
        url=URL,
        width=1280,
        height=800,
        min_size=(900, 600),
        resizable=True,
        text_select=True
    )
    
    webview.start(debug=False)

if __name__ == "__main__":
    main()
`;

  // Tier 5 macOS Build Script
  const buildAppScript = `#!/usr/bin/env bash
# Tier 5: Build Hand-Rolled macOS .app Bundle for ${config.agentName}
set -e

APP_NAME="${config.agentName}"
BUNDLE_ID="${config.bundleId}"
BUILD_DIR="build/\${APP_NAME}.app"

echo "Building \${APP_NAME}.app bundle..."

# Clean old build
rm -rf "\${BUILD_DIR}"
mkdir -p "\${BUILD_DIR}/Contents/MacOS"
mkdir -p "\${BUILD_DIR}/Contents/Resources"

# 1. Create Info.plist with Microphone Usage Description
cat <<EOF > "\${BUILD_DIR}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launch</string>
    <key>CFBundleIdentifier</key>
    <string>\${BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>\${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>\${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>\${APP_NAME} requires microphone access for voice conversations and open-mic assistant features.</string>
</dict>
</plist>
EOF

# 2. Tier 2 Problem B: Embed Python framework binary so OS attributes mic prompt to our App
PYTHON_BIN=\$(which python3)
cp "\${PYTHON_BIN}" "\${BUILD_DIR}/Contents/MacOS/\${APP_NAME}_bin"

# 3. Create Launcher Script
cat <<'EOF' > "\${BUILD_DIR}/Contents/MacOS/launch"
#!/usr/bin/env bash
DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
export PYTHONHOME=\$(python3 -c "import sys; print(sys.prefix)")
export PYTHONPATH="\${DIR}/../../"

exec "\${DIR}/${config.agentName}_bin" "\${DIR}/../../shell.py" "\$@"
EOF

chmod +x "\${BUILD_DIR}/Contents/MacOS/launch"
chmod +x "\${BUILD_DIR}/Contents/MacOS/${config.agentName}_bin"

# 4. Ad-hoc Code Sign for Stable TCC Identity
echo "Signing app bundle with stable ad-hoc identity..."
codesign --force --deep --sign - "\${BUILD_DIR}"

echo "Build complete! Your macOS App is ready at: \${BUILD_DIR}"
echo "Drag \${BUILD_DIR} to your Applications folder or Dock to launch!"
`;

  return (
    <div id="desktop-studio-view" className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Monitor className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white">Desktop Application Packaging Suite</h1>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              Turn your local AI agent into a native chrome-less desktop app with a dock icon, microphone permissions, OAuth window escaping, server wake polling, and ad-hoc signed bundle packaging.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-600 text-white shadow-sm">
              Reference Target: {config.os}
            </span>
            <span className="text-xs text-slate-400 px-2">pywebview / WKWebView</span>
          </div>
        </div>
      </div>

      {/* Tier Navigator Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 0, label: 'Tier 0: Interview & Spec', icon: FileCode },
          { id: 1, label: 'Tier 1: Chrome-less Window', icon: Monitor },
          { id: 2, label: 'Tier 2: macOS Mic Grant', icon: Mic },
          { id: 3, label: 'Tier 3: OAuth Link Escaping', icon: ExternalLink },
          { id: 4, label: 'Tier 4: Server Wake & Poll', icon: Play },
          { id: 5, label: 'Tier 5: .app Signed Bundle', icon: Layers },
        ].map((tier) => {
          const IconComp = tier.icon;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTier === tier.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tier.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tier Content Display */}
      {activeTier === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <span>Tier 0: Agent Specification & Preferences</span>
            </h2>
            <button
              onClick={() => handleCopy(agentMdContent, 'agentmd')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-semibold border border-slate-700 transition-colors"
            >
              {copiedSection === 'agentmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'agentmd' ? 'Copied AGENT.md!' : 'Copy AGENT.md'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="block text-slate-400 font-medium">Agent Name</label>
              <input
                type="text"
                value={config.agentName}
                onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />

              <label className="block text-slate-400 font-medium mt-3">Local App URL & Port</label>
              <input
                type="text"
                value={config.localUrl}
                onChange={(e) => setConfig({ ...config, localUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />

              <label className="block text-slate-400 font-medium mt-3">Bundle Identifier</label>
              <input
                type="text"
                value={config.bundleId}
                onChange={(e) => setConfig({ ...config, bundleId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300 font-semibold">Microphone Voice Feature</span>
                <input
                  type="checkbox"
                  checked={config.requiresMic}
                  onChange={(e) => setConfig({ ...config, requiresMic: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-300 font-semibold">OAuth / External Link Escaping</span>
                <input
                  type="checkbox"
                  checked={config.hasOAuth}
                  onChange={(e) => setConfig({ ...config, hasOAuth: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3">
                <span className="text-slate-400">Operating System:</span>
                <select
                  value={config.os}
                  onChange={(e) => setConfig({ ...config, os: e.target.value as any })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="macOS">macOS (pywebview + WKWebView)</option>
                  <option value="Windows">Windows (pywebview + Edge WebView2)</option>
                  <option value="Linux">Linux (pywebview + GTK WebKit)</option>
                </select>
              </div>
            </div>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800">
            {agentMdContent}
          </pre>
        </div>
      )}

      {/* Tier 1 & 2 & 3 Shell Display */}
      {(activeTier === 1 || activeTier === 2 || activeTier === 3 || activeTier === 4) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Python Desktop Wrapper Shell (`shell.py`)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTier === 1 && 'Tier 1: Chrome-less native web view window created at localhost:3000.'}
                {activeTier === 2 && 'Tier 2 Fix: Swapped Cocoa delegate class to auto-grant WKWebView microphone capture.'}
                {activeTier === 3 && 'Tier 3 Fix: Routed window.open JavaScript popups to system browser (Safari/Chrome).'}
                {activeTier === 4 && 'Tier 4: Server health check polling & auto-wake loader.'}
              </p>
            </div>

            <button
              onClick={() => handleCopy(pythonShellContent, 'shellpy')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold shadow-md"
            >
              {copiedSection === 'shellpy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'shellpy' ? 'Copied shell.py!' : 'Copy shell.py'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
            {pythonShellContent}
          </pre>
        </div>
      )}

      {/* Tier 5 Bundle Script Display */}
      {activeTier === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">macOS Bundle Assembler (`build_app.sh`)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates complete `.app` bundle structure with Info.plist, NSMicrophoneUsageDescription, embedded Python binary, launcher script, and ad-hoc codesign.
              </p>
            </div>

            <button
              onClick={() => handleCopy(buildAppScript, 'buildscript')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold shadow-md"
            >
              {copiedSection === 'buildscript' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'buildscript' ? 'Copied build_app.sh!' : 'Copy build_app.sh'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl text-cyan-300 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
            {buildAppScript}
          </pre>
        </div>
      )}

      {/* Troubleshooting Diagnostic Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-md font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Desktop Embedded WebView Troubleshooting Map</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-rose-400">Symptom: Mic prompt never appears</span>
            <p className="text-slate-400">
              Cause: Wrong main process bundle or missing NSMicrophoneUsageDescription in Info.plist.
            </p>
            <p className="text-emerald-400 font-mono text-[11px] pt-1">
              Fix: Run Tier 5 build script to copy Python binary inside .app bundle.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">Symptom: OAuth sign-in button does nothing</span>
            <p className="text-slate-400">
              Cause: Embedded WKWebView drops window.open calls silently.
            </p>
            <p className="text-emerald-400 font-mono text-[11px] pt-1">
              Fix: Implement webView_createWebViewWithConfiguration delegate method to launch default browser.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-blue-400">Symptom: Mic re-prompts after reboot</span>
            <p className="text-slate-400">
              Cause: macOS TCC privacy system loses un-signed process identity.
            </p>
            <p className="text-emerald-400 font-mono text-[11px] pt-1">
              Fix: Apply ad-hoc signature with codesign --force --deep --sign - build/Trillion.app.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400">Symptom: Blank window on launch</span>
            <p className="text-slate-400">
              Cause: Local server was sleeping or not running on port 3000.
            </p>
            <p className="text-emerald-400 font-mono text-[11px] pt-1">
              Fix: Enable Tier 4 health check polling loop before loading window.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
