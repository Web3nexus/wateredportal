import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/publicService';
import { MembershipCategory } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  User,
  Phone,
  Briefcase,
  Layers,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Upload,
  Check,
  Sparkles,
} from 'lucide-react';

export const JoinPage: React.FC = () => {
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<{
    application_number: string;
    submitted_at: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    place_of_birth: '',
    email: '',
    phone: '',
    current_location: '',
    occupation: '',
    workplace: '',
    membership_category_id: 0,
    photograph_url: '',
    personal_statement: '',
    consent_agreed: false,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    publicService
      .getCategories()
      .then((res) => {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setFormData((prev) => ({
            ...prev,
            membership_category_id: res.categories[0].id,
          }));
        }
      })
      .catch(() => {
        setError('Unable to load membership categories. Please refresh the page.');
      });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setSamplePhoto = (url: string) => {
    setPhotoPreview(url);
    setFormData((prev) => ({ ...prev, photograph_url: url }));
    setPhotoFile(null);
  };

  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Contact', icon: Phone },
    { num: 3, title: 'Career', icon: Briefcase },
    { num: 4, title: 'Tier', icon: Layers },
    { num: 5, title: 'Photo', icon: Camera },
    { num: 6, title: 'Review', icon: ShieldCheck },
  ];

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('Please provide both your first and last name.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.phone.trim() || !formData.current_location.trim()) {
        setError('Please provide your email, phone number, and current city of residence.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.occupation.trim() || !formData.workplace.trim()) {
        setError('Please specify your current occupation and organization or venture.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.membership_category_id) {
        setError('Please select a membership tier.');
        return false;
      }
    } else if (step === 5) {
      if (!photoFile && !photoPreview) {
        setError('Please upload a portrait photo or choose a sample image to proceed.');
        return false;
      }
    } else if (step === 6) {
      if (!formData.consent_agreed) {
        setError('Please agree to the membership terms and conditions to submit.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('current_location', formData.current_location);
      data.append('occupation', formData.occupation);
      data.append('workplace', formData.workplace);
      data.append('membership_category_id', formData.membership_category_id.toString());

      if (formData.date_of_birth) data.append('date_of_birth', formData.date_of_birth);
      if (formData.place_of_birth) data.append('place_of_birth', formData.place_of_birth);
      if (formData.personal_statement) data.append('personal_statement', formData.personal_statement);

      if (photoFile) {
        data.append('photograph', photoFile);
      } else if (photoPreview) {
        data.append('photograph_url', photoPreview);
      }

      const res = await publicService.apply(data);
      setSubmittedApp({
        application_number: res.application.application_number,
        submitted_at: res.application.submitted_at || new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err?.message || 'Submission failed. Please verify required fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
          {/* Top Accent Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Submitted
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thank you for applying for membership with Watered
          </p>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1 font-semibold">
              Official Reference Number
            </span>
            <span className="font-mono text-xl font-bold text-indigo-600 tracking-wider">
              {submittedApp.application_number}
            </span>
          </div>

          <div className="mt-6 text-xs text-slate-600 leading-relaxed space-y-2.5 text-left bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <p className="font-medium text-slate-800">Next Steps:</p>
            <p>
              Your membership application has been received and logged into our verification queue.
            </p>
            <p>
              Our administration team will review your credentials. Once approved, you will receive an email notification containing your official Member ID and access instructions.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center space-x-2 text-xs md:text-sm font-medium bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-indigo-600 to-indigo-800" />

        {/* Header */}
        <div className="mb-8 pt-2">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 items-center justify-center text-white font-bold text-xl mb-3 shadow-md ring-1 ring-white/10">
              W
            </div>
            <div className="block">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 mb-1.5">
                Watered Membership
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Membership Application
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit your credentials to obtain your official Watered digital pass
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="relative px-2 pt-2">
            <div className="hidden sm:block absolute left-8 right-8 top-5 h-[2px] bg-slate-200 -z-0" />
            <div className="grid grid-cols-6 gap-1 relative z-10">
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = s.num === currentStep;
                const isDone = s.num < currentStep;
                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDone) setCurrentStep(s.num);
                      }}
                      disabled={!isDone && s.num !== currentStep}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm ring-4 ring-indigo-50'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </button>
                    <span
                      className={`text-[10px] mt-1.5 font-medium tracking-tight truncate max-w-full ${
                        isActive
                          ? 'text-slate-900 font-semibold'
                          : isDone
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your legal name and personal background
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g. Alexander"
                />
                <Input
                  label="Last Name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="e.g. Bennett"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
                <Input
                  label="Place of Birth / Heritage"
                  value={formData.place_of_birth}
                  onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                  placeholder="e.g. London, United Kingdom"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Contact Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct communication channels for member notifications
                </p>
              </div>

              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alexander.bennett@domain.com"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone / Mobile Number"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 7700 900123"
                />
                <Input
                  label="Current City & Country"
                  required
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  placeholder="London, United Kingdom"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Career / Vocation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Professional Background
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your craft, industry experience, and enterprise
                </p>
              </div>

              <Input
                label="Occupation / Title"
                required
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Architectural Director, Executive, Engineer"
              />

              <Input
                label="Workplace / Institution / Venture"
                required
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                placeholder="e.g. Bennett Architectural Partners"
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-slate-700">
                  Personal Statement / Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.personal_statement}
                  onChange={(e) => setFormData({ ...formData, personal_statement: e.target.value })}
                  placeholder="Share a brief statement about your background and interest in joining Watered..."
                  className="w-full bg-white border border-slate-200/90 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Tier Selection */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Membership Tier
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the membership category that best corresponds with your profile
                </p>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = formData.membership_category_id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, membership_category_id: cat.id })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/50 border-indigo-600 shadow-sm ring-1 ring-indigo-600/30'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <h4 className="text-xs md:text-sm font-semibold text-slate-900">
                            {cat.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Tier #{cat.rank}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-slate-600 mt-1.5 pl-6 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Portrait Photo */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Passport-Style Portrait
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Required for your verified digital membership pass
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="w-28 h-32 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm p-1">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-2">
                      <Camera className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                      <span className="text-[9px] uppercase tracking-wider font-medium">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Upload Passport-Style Photograph
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-medium file:bg-white file:text-slate-800 hover:file:bg-slate-50 file:cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5 font-medium">
                      Or select sample portrait for demonstration:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
                          )
                        }
                        className="text-[11px] font-medium bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-2xs cursor-pointer transition-colors"
                      >
                        Sample Portrait 1
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                          )
                        }
                        className="text-[11px] font-medium bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-2xs cursor-pointer transition-colors"
                      >
                        Sample Portrait 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Affirmation */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Review & Submit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your details before final submission
                </p>
              </div>

              <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Legal Name:</span>
                  <span className="font-semibold text-slate-900">
                    {formData.first_name} {formData.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Details:</span>
                  <span className="font-medium text-slate-900">
                    {formData.email} &bull; {formData.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-900">
                    {formData.current_location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Professional Background:</span>
                  <span className="font-medium text-slate-900">
                    {formData.occupation} at {formData.workplace}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Tier:</span>
                  <span className="font-semibold text-indigo-700">
                    {categories.find((c) => c.id === formData.membership_category_id)?.name}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent_agreed}
                    onChange={(e) =>
                      setFormData({ ...formData, consent_agreed: e.target.checked })
                    }
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I confirm that the personal and professional information provided is accurate and authentic. I understand that application submission is subject to administrative review before digital pass activation.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={prevStep}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
            ) : (
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                Cancel
              </Link>
            )}

            {currentStep < 6 ? (
              <Button type="button" variant="primary" onClick={nextStep}>
                Continue
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!formData.consent_agreed}
              >
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
