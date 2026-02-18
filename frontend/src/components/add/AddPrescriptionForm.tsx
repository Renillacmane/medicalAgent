"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { uploadDocument } from "@/services/patients.service";
import LoadingPulse from "@/components/design/loading/LoadingPulse";

type Props = { onSuccess?: () => void; onBack?: () => void };

const inputClass =
  "mt-1 block w-full rounded-lg border border-light-green-subtle/80 bg-white px-3 py-2 text-light-green-dark shadow-sm transition-colors focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30";

export default function AddPrescriptionForm({ onSuccess, onBack }: Props) {
  const router = useRouter();
  const basePath = useBasePath();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "prescription");

      await uploadDocument(formData);

      setSuccess(true);
      setFile(null);
      onSuccess?.();

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/add")}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-light-green-dark">
          Prescription PDF
        </label>
        <input
          id="file"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={loading}
          className={inputClass}
          required
        />
        <p className="mt-1 text-xs text-light-green-dark-grey">
          Upload a prescription PDF. Maximum file size: 10MB.
        </p>
      </div>

      {loading && (
        <div className="py-6">
          <LoadingPulse message="Uploading file" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-600">Prescription uploaded successfully! Processing...</p>
        </div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 rounded-lg border border-light-green-subtle/80 bg-white px-4 py-2 text-sm font-medium text-light-green-dark transition-colors hover:bg-light-green-subtle/40 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !file}
          className="flex-1 rounded-lg bg-light-green-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-light-green-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload Prescription"}
        </button>
      </div>
    </form>
  );
}
