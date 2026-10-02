import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Save,
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Code2,
} from 'lucide-react';
import { templateService } from '../../services/templateService';
import type { EmailTemplate } from '../../types';

export const AdminEmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateService.getTemplates();
      setTemplates(res.templates || []);
      if (res.templates && res.templates.length > 0) {
        selectTemplate(res.templates[0]);
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to load email templates.' });
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (tmpl: EmailTemplate) => {
    setSelectedTemplate(tmpl);
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    setIsActive(tmpl.is_active);
    loadPreview(tmpl.id, tmpl.subject, tmpl.body);
  };

  const loadPreview = async (templateId: number, currentSubject: string, currentBody: string) => {
    try {
      setPreviewLoading(true);
      const res = await templateService.previewTemplate(templateId, {
        subject: currentSubject,
        body: currentBody,
      });
      setPreviewHtml(res.html || '');
    } catch {
      // Graceful fallback
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInsertVariable = (variable: string) => {
    const placeholder = `{{${variable}}}`;
    setBody((prev) => prev + ' ' + placeholder);
    if (selectedTemplate) {
      loadPreview(selectedTemplate.id, subject, body + ' ' + placeholder);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const res = await templateService.updateTemplate(selectedTemplate.id, {
        subject,
        body,
        is_active: isActive,
      });
      setNotification({ type: 'success', message: 'Template successfully updated.' });
      setTemplates((prev) =>
        prev.map((t) => (t.id === selectedTemplate.id ? res.template : t))
      );
      setSelectedTemplate(res.template);
      loadPreview(res.template.id, res.template.subject, res.template.body);
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to update template.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Outbound Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Email Templates Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize notification subjects, dynamic placeholders, branding headers, and visual previews
          </p>
        </div>

        <button
          onClick={fetchTemplates}
          className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition self-start shadow-xs"
          title="Reload templates"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold underline opacity-70 hover:opacity-100 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Template List + Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Template List Selector */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            System Templates ({templates.length})
          </p>
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => selectTemplate(tmpl)}
                  className={`w-full text-left p-4 transition flex flex-col space-y-1 ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {tmpl.name}
                    </span>
                    {tmpl.is_active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono truncate">
                    {tmpl.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          {selectedTemplate ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedTemplate.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    Code: {selectedTemplate.code}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active_template"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="is_active_template" className="text-xs text-slate-700 font-medium">
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    loadPreview(selectedTemplate.id, e.target.value, body);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Message Body
                  </label>
                  <span className="text-[11px] text-slate-400">Plain text / HTML</span>
                </div>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    loadPreview(selectedTemplate.id, subject, e.target.value);
                  }}
                  className="w-full p-3 text-xs font-mono border border-slate-200 rounded-xl leading-relaxed focus:outline-none focus:border-blue-600 text-slate-800"
                  required
                />
              </div>

              {/* Dynamic Variables Pill Bar */}
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold flex items-center space-x-1">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dynamic Placeholders:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Click to insert</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.variables.map((variable) => (
                      <button
                        type="button"
                        key={variable}
                        onClick={() => handleInsertVariable(variable)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-[11px] font-mono text-slate-700 hover:text-blue-700 transition shadow-2xs cursor-pointer"
                        title={`Insert {{${variable}}}`}
                      >
                        {`{{${variable}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => loadPreview(selectedTemplate.id, subject, body)}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Refresh Preview</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a template to begin editing.
            </div>
          )}
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Email Rendering
              </h3>
            </div>
            {previewLoading && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Simulated client inbox view including Watered logo header, placeholder values, and official footer.
          </p>

          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[440px]">
            {previewHtml ? (
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-full min-h-[440px] border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Preview loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
