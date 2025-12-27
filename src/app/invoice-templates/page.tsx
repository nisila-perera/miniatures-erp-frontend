'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { InvoiceTemplate } from '@/types/invoice';
import { 
  fetchInvoiceTemplates, 
  deleteInvoiceTemplate,
  createDefaultInvoiceTemplate 
} from '@/services/invoices';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Delete confirmation modal
interface DeleteModalProps {
  template: InvoiceTemplate;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ template, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Invoice Template</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the template &quot;{template.name}&quot;? This action cannot be undone.
        </p>
        {template.is_default && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded mb-4 text-sm">
            Warning: This is the default template. You should set another template as default before deleting this one.
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Template row component
interface TemplateRowProps {
  template: InvoiceTemplate;
  onDelete: (template: InvoiceTemplate) => void;
}

function TemplateRow({ template, onDelete }: TemplateRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{template.name}</span>
          {template.is_default && (
            <Badge variant="success" className="flex items-center gap-1">
              <StarIcon />
              Default
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600 text-sm">{template.subject}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(template.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(template.updated_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/invoice-templates/${template.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(template)}
          >
            <TrashIcon />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Empty state component
function EmptyState({ onCreateDefault }: { onCreateDefault: () => void }) {
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: BRAND_COLORS.secondary }}
      >
        <DocumentIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No invoice templates yet</h3>
      <p className="text-gray-500 mb-4">Get started by creating a template or using the default one.</p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onCreateDefault}>
          Create Default Template
        </Button>
        <Link href="/invoice-templates/new">
          <Button variant="primary" className="flex items-center gap-2">
            <PlusIcon />
            Create Custom Template
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function InvoiceTemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvoiceTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deleteInvoiceTemplate(deleteTarget.id);
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateDefault = async () => {
    try {
      setIsCreatingDefault(true);
      setError(null);
      const newTemplate = await createDefaultInvoiceTemplate();
      setTemplates(prev => [...prev, newTemplate]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create default template');
    } finally {
      setIsCreatingDefault(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Invoice Templates
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your invoice email templates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleCreateDefault}
              disabled={isCreatingDefault}
            >
              {isCreatingDefault ? 'Creating...' : 'Create Default Template'}
            </Button>
            <Link href="/invoice-templates/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusIcon />
                New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Content */}
        <Card>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <EmptyState onCreateDefault={handleCreateDefault} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(template => (
                    <TemplateRow 
                      key={template.id} 
                      template={template} 
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <DeleteModal
            template={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
