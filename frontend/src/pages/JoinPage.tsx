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
        setError('Unable to load membership court categories. Please refresh.');
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
    { num: 1, title: 'Identity', icon: User },
    { num: 2, title: 'Contact', icon: Phone },
    { num: 3, title: 'Vocation', icon: Briefcase },
    { num: 4, title: 'Court Tier', icon: Layers },
    { num: 5, title: 'Portrait', icon: Camera },
    { num: 6, title: 'Affirmation', icon: ShieldCheck },
  ];

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('Please provide your complete legal name.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.phone.trim() || !formData.current_location.trim()) {
        setError('Please provide email, telephone, and current city of residence.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.occupation.trim() || !formData.workplace.trim()) {
        setError('Please state your primary vocation and affiliated institution/venture.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.membership_category_id) {
        setError('Please select a prospective court category.');
        return false;
      }
    } else if (step === 5) {
      if (!photoFile && !photoPreview) {
        setError('Please upload a passport-style portrait photograph or select a demo sample.');
        return false;
      }
    } else if (step === 6) {
      if (!formData.consent_agreed) {
        setError('You must affirm the covenant before submitting your application.');
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
      setError(err?.message || 'Submission failed. Please check required fields.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-white border border-[#eae7df] rounded-[4px] p-8 shadow-[0_2px_4px_rgba(24,24,27,0.04),0_12px_28px_-6px_rgba(24,24,27,0.08)] text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-800 mb-5">
            <CheckCircle className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            APPLICATION SUBMITTED
          </h2>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1 font-semibold">
              Official Reference Number
            </span>
            <span className="font-mono text-xl font-bold text-indigo-600 tracking-wider">
              {submittedApp.application_number}
            </span>
          </div>

          <div className="mt-6 text-xs text-slate-600 leading-relaxed space-y-2.5 text-left bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <p>
              Your membership application has been successfully submitted to Watered.
            </p>
            <p>
              The administration team will review your application and notify you directly via your registered email once your profile and credentials have been verified.
            </p>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
              * Note: You will receive your official Member ID and Digital Pass upon approval.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs bg-[#18181b] hover:bg-[#27272a] text-white px-6 py-2.5 rounded-[2px] transition-colors font-medium shadow-2xs"
            >
              <span>Return to Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white border border-[#eae7df] rounded-[4px] p-6 sm:p-10 shadow-[0_2px_4px_rgba(24,24,27,0.04),0_12px_28px_-6px_rgba(24,24,27,0.08)]">
        <div className="mb-8">
          <div className="text-center mb-6">
            <span className="text-[10px] tracking-widest text-[#966922] uppercase font-sans font-semibold">
              Admittance Petition
            </span>
            <h1 className="font-serif text-2xl font-semibold tracking-wider text-stone-900 mt-1">
              PETITION FOR ADMISSION
            </h1>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-stone-200 -z-0" />
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = s.num === currentStep;
              const isDone = s.num < currentStep;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center bg-white px-1">
                  <div
                    className={`w-7 h-7 rounded-[2px] flex items-center justify-center text-xs font-sans font-medium transition-all ${
                      isActive
                        ? 'bg-[#18181b] text-white shadow-2xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#f7f6f2] text-stone-400 border border-stone-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:block text-[9px] uppercase tracking-wider text-stone-500 mt-1 font-sans">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-[2px] text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Personal Particulars
                </h3>
                <p className="text-xs text-stone-500 font-sans">Your authentic individual identity</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Kofi"
                />
                <Input
                  label="Last Name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Mensah"
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
                  label="Place of Birth / Heritage Ancestry"
                  value={formData.place_of_birth}
                  onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                  placeholder="Accra, Ghana"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Contact Coordinates
                </h3>
                <p className="text-xs text-stone-500 font-sans">Direct, confidential communication channels</p>
              </div>

              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="kofi.mensah@domain.com"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telephone / Signal Number"
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

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Professional Discipline & Calling
                </h3>
                <p className="text-xs text-stone-500 font-sans">Your craft, stewardship, and enterprise</p>
              </div>

              <Input
                label="Occupation / Discipline"
                required
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Architectural Designer / Urbanist"
              />

              <Input
                label="Workplace / Institution / Venture"
                required
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                placeholder="Mensah & Atelier Partners"
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-sans font-medium text-stone-700">
                  Personal Statement / Reason for Petition
                </label>
                <textarea
                  rows={3}
                  value={formData.personal_statement}
                  onChange={(e) => setFormData({ ...formData, personal_statement: e.target.value })}
                  placeholder="Briefly state your commitment and purpose within the fellowship..."
                  className="w-full bg-white border border-[#dcd7cb] focus:border-[#966922] focus:ring-1 focus:ring-[#966922]/15 rounded-[3px] px-3.5 py-2 text-xs md:text-sm text-stone-900 placeholder-stone-400 transition-colors focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Prospective Court Category
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Indicate the institutional branch most aligned with your service
                </p>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = formData.membership_category_id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, membership_category_id: cat.id })}
                      className={`p-3.5 rounded-[3px] border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#faf7f0] border-[#966922] shadow-2xs'
                          : 'bg-white border-[#eae7df] hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full inline-block bg-[#966922]" />
                          <h4 className="text-xs md:text-sm font-semibold text-stone-900 font-serif">
                            {cat.name}
                          </h4>
                        </div>
                        <span className="text-[10px] uppercase font-mono text-stone-400">
                          Tier #{cat.rank}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Official Credential Photograph
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Required for your digital membership card and physical register
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-[#faf8f4] rounded-[3px] border border-[#eae3d5]">
                <div className="w-24 h-28 rounded-[2px] border border-[#dcd4c3] overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-2xs p-0.5">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-stone-400 p-2">
                      <Camera className="w-7 h-7 mx-auto mb-1 text-stone-400" />
                      <span className="text-[9px] uppercase tracking-wider">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                      Upload Passport-Style Photograph
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-[2px] file:border file:border-[#dcd7cb] file:text-xs file:font-medium file:bg-white file:text-stone-800 hover:file:bg-[#f6f5f1] file:cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1.5 font-sans">
                      Or select sample portrait for demonstration:
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSamplePhoto(
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
                          )
                        }
                        className="text-[11px] bg-white hover:bg-[#f8f7f4] text-stone-700 px-2.5 py-1 rounded-[2px] border border-[#dcd7cb] shadow-2xs cursor-pointer"
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
                        className="text-[11px] bg-white hover:bg-[#f8f7f4] text-stone-700 px-2.5 py-1 rounded-[2px] border border-[#dcd7cb] shadow-2xs cursor-pointer"
                      >
                        Sample Portrait 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="border-b border-[#eae7df] pb-2">
                <h3 className="font-serif text-sm font-semibold text-stone-900">
                  Affirmation & Covenant
                </h3>
                <p className="text-xs text-stone-500 font-sans">Final confirmation before register submission</p>
              </div>

              <div className="bg-[#faf8f4] p-4 rounded-[3px] border border-[#eae3d5] text-xs space-y-2 font-sans">
                <div className="flex justify-between">
                  <span className="text-stone-500">Full Legal Name:</span>
                  <span className="font-medium text-stone-900">
                    {formData.first_name} {formData.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contact Coordinates:</span>
                  <span className="font-medium text-stone-900">
                    {formData.email} &bull; {formData.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Vocation & Organization:</span>
                  <span className="font-medium text-stone-900">
                    {formData.occupation} at {formData.workplace}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Court Tier:</span>
                  <span className="font-medium text-[#8a5d1b]">
                    {categories.find((c) => c.id === formData.membership_category_id)?.name}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#faf6ed] border border-[#e2d5bd] rounded-[3px]">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent_agreed}
                    onChange={(e) =>
                      setFormData({ ...formData, consent_agreed: e.target.checked })
                    }
                    className="mt-0.5 rounded-[2px] border-[#dcd7cb] text-[#966922] focus:ring-0"
                  />
                  <span className="text-xs text-stone-700 leading-relaxed font-sans">
                    I solemnly affirm that the personal and professional particulars provided herein
                    are authentic and accurate. I understand that submission does not confer automatic
                    access until reviewed and ratified by the High Council Administration.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#eae7df] flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={prevStep}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
            ) : (
              <Link to="/" className="text-xs text-stone-500 hover:text-stone-800 font-sans">
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
