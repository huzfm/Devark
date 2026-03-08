"use client";

import { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface SubmitState {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
}

export default function SuggestionForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitState({ status: "submitting", message: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("access_key", "6a608ecc-53a2-4ecf-9528-bfa5890a7563");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Server error. Please try again.");
      }

      const data = await response.json();

      if (data.success) {
        setSubmitState({
          status: "success",
          message: " Form Submitted Successfully!",
        });
        resetForm();
      } else {
        throw new Error(data.message || "Something went wrong.");
      }
    } catch (error) {
      setSubmitState({
        status: "error",
        message: ` ${
          error instanceof Error ? error.message : "Something went wrong"
        }`,
      });
    }
  };

  const isSubmitting = submitState.status === "submitting";

  return (
    <section
      id="suggestions"
      className="relative py-20 px-4 bg-black flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:35px_35px]" />

      <div className="relative z-10 w-full max-w-lg bg-black/60 rounded-2xl shadow-lg shadow-black/50 backdrop-blur-md p-6">
        <h3 className="text-white text-xl font-semibold mb-4 text-center">
          💡 Got a Suggestion?
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Your Name"
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg bg-black/40 text-white border ${
                errors.name ? "border-red-500" : "border-white/20"
              } focus:border-white/40 outline-none placeholder-white/40 disabled:opacity-50`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Your Email"
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg bg-black/40 text-white border ${
                errors.email ? "border-red-500" : "border-white/20"
              } focus:border-white/40 outline-none placeholder-white/40 disabled:opacity-50`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Your Suggestion"
              rows={4}
              disabled={isSubmitting}
              className={`w-full p-3 rounded-lg bg-black/40 text-white border ${
                errors.message ? "border-red-500" : "border-white/20"
              } focus:border-white/40 outline-none placeholder-white/40 disabled:opacity-50`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg shadow-lg shadow-black/40 hover:bg-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>

        {submitState.message && (
          <p
            className={`text-center text-sm mt-3 ${
              submitState.status === "success"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {submitState.message}
          </p>
        )}
      </div>
    </section>
  );
}
