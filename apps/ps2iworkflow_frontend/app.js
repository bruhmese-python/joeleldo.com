/* app.js */
// If running on port 5001 (proxy), use relative path. Otherwise (e.g. VSCode Live Server), try direct backend (will fail CORS if not configured).
const JOB_API_URL = 'https://sangi30.pythonanywhere.com';
//window.location.port === '5001' ? '' : 'http://127.0.0.1:5000';

// --- UI Logic from index.html ---

// SPA Navigation with Fade Transitions
function switchToView(viewName) {
    // Remove active class from all views (triggers fade out)
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Add active class to target view after a brief moment (allows fade out to complete)
    const targetView = document.getElementById(viewName + '-view');
    if (targetView) {
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                targetView.classList.add('active');
            });
        });
    }

    // Update sidebar active state
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    sidebarIcons.forEach((icon, index) => {
        icon.classList.remove('active');
    });

    // Highlight corresponding sidebar icon
    if (viewName === 'home') {
        sidebarIcons[0].classList.add('active');
    } else if (viewName === 'editor') {
        sidebarIcons[1].classList.add('active');
    }

    // Re-render Feather icons after DOM changes
    if (window.feather) feather.replace();
}

// Output Tab Switching
function switchOutputTab(tabName) {
    // Update tab headers (find all tab-items, easier to query globally or scope to tabs-header)
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find the clicked tab (event.currentTarget might not work if called manually, but works for onclick)
    // We can rely on text content matching or better yet, passed in element. 
    // For simplicity, let's find the one that calls this. 
    // Actually, the inline onclick passes the tab name. We need to find the element.
    // The easiest way for now is to just rely on the click event if available, or just update by index?
    // Let's iterate and check text.
    // Or actually, just update the one that triggered the event if we can access it.
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Fallback or initialization
        if (tabName === 'code') tabItems[0].classList.add('active');
        if (tabName === 'logs') tabItems[1].classList.add('active');
    }

    // Toggle content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
    
    if (window.feather) feather.replace();
}

// Initialize CodeMirror Editor
function initCodeMirror() {
    const editorContainer = document.getElementById('code-editor');
    if (!editorContainer) return;

    // Check if already initialized to clean up if needed
    // But usually we just init once.
    if (window.codeMirrorEditor) return;

    window.codeMirrorEditor = CodeMirror(editorContainer, {
        mode: 'powershell',
        theme: 'solarized dark',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        value: ''
    });
}

// Helper to get CodeMirror content
function getEditorContent() {
    return window.codeMirrorEditor ? window.codeMirrorEditor.getValue() : '';
}

// Helper to set CodeMirror content
function setEditorContent(content) {
    if (window.codeMirrorEditor) {
        window.codeMirrorEditor.setValue(content);
    }
}

// Expose functions to global scope for inline onclick handlers
window.switchToView = switchToView;
window.switchOutputTab = switchOutputTab;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;

// --- End UI Logic ---

function getEditorContentSafe() {
    if (typeof getEditorContent === 'function') {
        return getEditorContent();
    }
    return '';
}

/**
 * Highlight code using hilite.me API
 * @param {string} code - The code to highlight
 * @returns {Promise<string>} - The HTML string of highlighted code
 */
async function highlightCode(code) {
    // We use 'java' as a proxy for iWorkflow/Groovy if 'groovy' isn't better supported
    // hilite.me supports 'java', 'groovy' might be available too. Let's try 'groovy' first, fallback to 'java' if needed? 
    // Actually hilite.me list includes 'groovy'.
    const lexer = 'groovy'; 
    const style = 'colorful'; // solarized-dark might fit better but colorful is standard
    
    // hilite.me accepts x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('lexer', lexer);
    params.append('style', style);
    
    const response = await fetch('http://hilite.me/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Highlighting API failed: ${response.statusText}`);
    }

    return await response.text();
}

// Escaping function from control_flow reference.html
const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Generate the flow table HTML based on CSV input.
 * Copied and adapted from control_flow reference.html
 */
function generateFlowTable(csvText) {
    if (!csvText) return '';
    
    // Parse CSV into [{value: number, name: string}, ...]
    const rows = csvText
        .trim()
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(','); 
            const v = parts[0].trim();
            const name = parts.slice(1).join(',').trim(); 
            const value = Number(v);
            return { value, name: name || '' };
        })
        .filter(r => [1, 2, 3].includes(r.value));

    // Build table rows
    const rowHtml = rows.map(({ value, name }) => {
        if (value === 1) {
            return `
      <tr>
        <td class="flow-td">
          <div class="flow-pill">Workitem submitted</div>
        </td>
        <td class="flow-td flow-active">&nbsp;</td>
        <td class="flow-td">
        <strong>${esc(name || 'Stepname')}</strong>
        <br>
        <small>Trigger point
        <span class="step-status">SUCCESS</span>
        </small>
        </td>
        <td class="flow-td">&nbsp;</td>
        <td class="flow-td">&nbsp;</td>
      </tr>`;
        } else if (value === 2) {
            return `
      <tr>
        <td class="flow-td">&nbsp;</td>
        <td class="flow-td">&nbsp;</td>
        <td class="flow-td flow-active">&nbsp;</td>
        <td class="flow-td">
        <strong>${esc(name || 'Stepname')}</strong>
        <br>
        <small>Step
        <span class="step-status">SUCCESS</span>
        </small></td>
        <td class="flow-td">&nbsp;</td>
      </tr>`;
        } else {
            return `
      <tr>
        <td class="flow-td">&nbsp;</td>
        <td class="flow-td">&nbsp;</td>
        <td class="flow-td-omit-right flow-active">&nbsp;</td>
        <td class="flow-td-omit-left flow-active">&nbsp;</td>
        <td class="flow-td">
        <strong>${esc(name || 'subjectStepname')}</strong>
        <br>
        <small>Ext. atomic fn.
        <span class="step-status">SUCCESS</span>
        </small>
        </td>
      </tr>`;
        }
    });

    const successRow = `
    <tr>
      <td class="flow-td">
        <div class="flow-pill-success">Successfully executed</div>
      </td>
      <td class=" flow-active">&nbsp;</td>
      <td class=" flow-active">&nbsp;</td>
      <td class=" flow-active">&nbsp;</td>
      <td class="flow-td-omit-left flow-active">&nbsp;</td>
    </tr>`;

    return `
  <table class="flow-table">
    <tbody>
      ${rowHtml.join('\n')}
      ${successRow}
    </tbody>
  </table>`;
}

function renderFlowTable(csvText, containerSelector = '.logs-div') {
    const el = document.querySelector(containerSelector);
    if (!el) {
        console.warn('Flow container not found:', containerSelector);
        return;
    }
    el.innerHTML = generateFlowTable(csvText);
}

// UI State Management
function setConversionState(isConverting, message = '') {
    const btn = document.querySelector('.convert-btn');
    const statusDiv = document.getElementById('status-logs-container');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (isConverting) {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i data-feather="loader" class="spin"></i> Converting...`;
            feather.replace();
        }
        if (statusDot) {
            statusDot.className = 'status-dot online'; // Use online as generic active
            statusText.innerText = "Online"
        }
        
        // Show converting message in logs
        if (statusDiv) statusDiv.innerHTML = `<div class="log-entry">${message || 'Generating code...'}</div>`;
        
    } else {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i data-feather="play"></i> Convert`;
            feather.replace();
        }
    }
}

async function convert() {
    const code = getEditorContentSafe();
    if (!code.trim()) {
        alert("Please enter some PowerShell code first.");
        return;
    }

    setConversionState(true, 'Initializing job...');

    const statusDiv = document.getElementById('status-logs-container');
    const flowDiv = document.getElementById('flow-visualization');
    const outputContent = document.querySelector('.output-content');
    
    // Clear previous output
    outputContent.textContent = ''; 
    if (flowDiv) flowDiv.innerHTML = ''; // Clear previous flow

    try {
        const uuid = 'client-' + Date.now();
        console.log('Creating job...', uuid);
        
        const createRes = await fetch(`${JOB_API_URL}/transpile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, code })
        });

        if (!createRes.ok) {
            throw new Error(`Failed to create job: ${createRes.statusText}`);
        }

        const { job_id } = await createRes.json();
        console.log(`Job created: ${job_id}`);
        
        if (statusDiv) statusDiv.innerHTML = `<div class="log-entry">Job created: ${job_id}. Processing...</div>`;

        let status = 'queued';
        while (status !== 'done' && status !== 'failed') {
            await new Promise(r => setTimeout(r, 1000));

            const jobRes = await fetch(`${JOB_API_URL}/jobs/${job_id}`);
            if (!jobRes.ok) {
                 throw new Error(`Failed to check job: ${jobRes.statusText}`);
            }
            
            const jobData = await jobRes.json();
            status = jobData.status; 
            
            if (status === 'done') {
                console.log('Job completed!');
                setConversionState(false);
                if (statusDiv) statusDiv.innerHTML = `<div class="log-entry success">Conversion completed successfully.</div>`;
                
                // Populate output
                let iworkflowText = '';
                if (jobData.iworkflow && typeof jobData.iworkflow === 'object' && jobData.iworkflow.iworkflow) {
                     // Handle case where iworkflow is nested object { iworkflow: "string", csv: "..." }
                     iworkflowText = jobData.iworkflow.iworkflow;
                } else if (jobData.iworkflow) {
                     iworkflowText = jobData.iworkflow;
                }
                
                if (typeof iworkflowText === 'object') {
                    iworkflowText = JSON.stringify(iworkflowText, null, 2);
                }
                
                outputContent.textContent = iworkflowText || '// No output generated';
                
                // Attempt Syntax Highlighting
                if (iworkflowText && statusDiv) {
                    // Don't await this blocking the flow logic, but we should show status
                    // Actually, we want to run this asynchronously but maybe track it?
                    // Let's run it and update UI when done.
                    (async () => {
                        try {
                            statusDiv.innerHTML += `<div class="log-entry">Highlighting code...</div>`;
                            const highlightedHtml = await highlightCode(iworkflowText);
                            // Verify outputContent is still there and we haven't started a new job? 
                            // (Simplification: assuming user doesn't spam convert)
                            outputContent.innerHTML = highlightedHtml;
                            statusDiv.innerHTML += `<div class="log-entry success">Highlighting successful.</div>`;
                        } catch (hlErr) {
                            console.error('Highlighting failed:', hlErr);
                            statusDiv.innerHTML += `<div class="log-entry warning">Highlighting failed: ${esc(hlErr.message)} (Showing raw output)</div>`;
                        }
                    })();
                }
                
                // Populate flow table
                // Try top level csv, then nested
                let csvText = jobData.csv;
                if (!csvText && jobData.iworkflow && jobData.iworkflow.csv) {
                     csvText = jobData.iworkflow.csv;
                }
                 
                if (csvText) {
                    renderFlowTable(csvText, '#flow-visualization');
                } else {
                    if (statusDiv) statusDiv.innerHTML += `<div class="log-entry warning">No control flow data returned.</div>`;
                }

            } else if (status === 'failed') {
                console.log('Job failed!');
                setConversionState(false);
                if (statusDiv) {
                    statusDiv.innerHTML = `<div class="log-entry error">Job failed!</div>`;
                    if (jobData.error) {
                        statusDiv.innerHTML += `<div class="log-entry error">${esc(jobData.error)}</div>`;
                    }
                }
            } else {
                 if (statusDiv) statusDiv.innerHTML = `<div class="log-entry">Status: ${status}...</div>`;
            }
        }

    } catch (err) {
        console.error('Error:', err);
        setConversionState(false);
        const statusDiv = document.getElementById('status-logs-container');
        if (statusDiv) statusDiv.innerHTML = `<div class="log-entry error">Error: ${esc(err.message)}</div>`;
        alert('An error occurred during conversion. Check console/logs.');
    }
}

// Copy to Clipboard Functionality
function setupCopyButton() {
    const copyBtn = document.querySelector('.adjust-btn[title="Copy Code"]');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        const outputContent = document.querySelector('.output-content');
        if (!outputContent || !outputContent.textContent.trim()) return;

        try {
            await navigator.clipboard.writeText(outputContent.textContent);
            
            // Visual Feedback
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i data-feather="check"></i>`;
            copyBtn.classList.add('success');
            feather.replace();

            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                copyBtn.classList.remove('success');
                feather.replace();
            }, 2000);

        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers if needed, or just alert
            alert('Failed to copy to clipboard');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.convert-btn');
    if (btn) {
        btn.addEventListener('click', convert);
    }
    
    setupCopyButton();

    if (window.feather) feather.replace();
    initCodeMirror();
});
