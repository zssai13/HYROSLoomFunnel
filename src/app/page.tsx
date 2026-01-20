'use client';

import React, { useState } from 'react';
import { LeadFormData, REVENUE_OPTIONS, AD_SPEND_OPTIONS, DISQUALIFYING_REVENUE, DISQUALIFYING_AD_SPEND } from '@/lib/types';

export default function VIPSignupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    email: '',
    monthlyRevenue: '',
    adSpend: '',
    websiteUrl: '',
    phoneNumber: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [countryCode, setCountryCode] = useState('+1');
  const [showCountrySelect, setShowCountrySelect] = useState(false);

  // Common country codes
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+55', country: 'BR', flag: '🇧🇷' },
    { code: '+52', country: 'MX', flag: '🇲🇽' },
  ];

  // Exact HYROS color tokens
  const colors = {
    primary: '#000000',
    primaryText: '#000000',
    subtitle: '#7f7f7f',
    error: '#fe4a23',
    border: '#e9e9e9',
    inputBorder: '#cecece',
    background: '#f9f9f9',
    cards: '#ffffff',
    locked: '#a0a0a0',
    buttonText: '#ffffff',
    green: '#4da744',
    greenLight: '#e3fae2',
    greenBright: '#15d095',
    blue: '#146ecb',
  };

  const inputStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    width: '100%',
    height: '100%',
    padding: '0 16px',
    fontSize: 14,
    fontFamily: 'Archivo, sans-serif',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Handle Enter key to submit current step
  const handleKeyDown = (e: React.KeyboardEvent, submitFn: () => void, isValid: boolean) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      submitFn();
    }
  };

  const handleEmailSubmit = () => {
    if (isValidEmail(formData.email)) setStep(2);
  };

  // Check if lead is disqualified based on revenue or ad spend
  const isDisqualified = () => {
    return DISQUALIFYING_REVENUE.includes(formData.monthlyRevenue) ||
           DISQUALIFYING_AD_SPEND.includes(formData.adSpend);
  };

  const handleBusinessInfoSubmit = () => {
    if (formData.monthlyRevenue && formData.adSpend && formData.websiteUrl) {
      // If disqualified, go to disqualified thank you (step 5)
      // Otherwise, go to VIP qualification (step 3)
      setStep(isDisqualified() ? 5 : 3);
    }
  };

  // Format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters except +
    const cleaned = phone.replace(/[^\d]/g, '');
    // Combine country code with cleaned number
    return `${countryCode}${cleaned}`;
  };

  // Route 1: SMS contact - submits and goes to thank you
  const handleRoute1Submit = async () => {
    if (!formData.phoneNumber) return;

    setIsSubmitting(true);

    try {
      // Submit to API with formatted phone number
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, phoneNumber: formattedPhone, route: 'sms' }),
      });

      // Move to thank you step
      setStep(4);
    } catch (error) {
      console.error('Submission error:', error);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Route 2: Schedule call - submits and opens Calendly
  const handleRoute2Submit = async () => {
    if (!formData.phoneNumber) return;

    setIsSubmitting(true);

    try {
      // Submit to API with formatted phone number
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, phoneNumber: formattedPhone, route: 'schedule' }),
      });

      // Open Calendly in new tab
      window.open('https://hyros.com/book-a-call', '_blank');
    } catch (error) {
      console.error('Submission error:', error);
      // Still open Calendly even on error
      window.open('https://hyros.com/book-a-call', '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = isValidEmail(formData.email);
  const isStep2Valid = formData.monthlyRevenue && formData.adSpend && formData.websiteUrl;
  const isStep3Valid = formData.phoneNumber.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.cards,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Archivo, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          width: '100%',
          height: '10%',
          minHeight: 64,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* HYROS Logo Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="14.5965" y="12.0702" width="2.80702" height="7.85965" fill="black" />
              <rect y="17.6842" width="2.80702" height="7.85965" fill="black" />
              <path
                d="M12.3506 26.9473H5.05273V5.05273H12.3506V26.9473ZM7.29785 14.877V22.7373H10.1045V14.877H7.29785Z"
                fill="black"
              />
              <path
                d="M26.9473 26.9473H19.6494V5.05273H26.9473V26.9473ZM21.8945 9.26367V17.123H24.7012V9.26367H21.8945Z"
                fill="black"
              />
              <rect x="29.193" y="6.45615" width="2.80702" height="7.85965" fill="black" />
            </svg>
          </div>
          {/* HYROS Letters */}
          <svg
            width="65"
            height="14"
            viewBox="0 0 65 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.2667 6.30393L15.7809 0.90625H13.2031L18.146 8.2884V13.0947H20.3519V8.2363L25.2955 0.90625H22.7878L19.2667 6.30393Z"
              fill="black"
            />
            <path
              d="M51.3915 2.54305C50.8222 1.97409 50.1405 1.52464 49.3467 1.1935C48.5525 0.862636 47.6749 0.697266 46.7147 0.697266C45.7545 0.697266 44.8767 0.86562 44.0827 1.2021C43.2881 1.5391 42.6005 1.99439 42.0194 2.56908C41.4384 3.14377 40.9882 3.81121 40.668 4.57119C40.3478 5.33199 40.1875 6.14121 40.1875 7.00048V7.03524C40.1875 7.89484 40.3478 8.70407 40.668 9.46405C40.9882 10.224 41.4325 10.8886 42.0016 11.4575C42.571 12.0265 43.2524 12.4767 44.0473 12.8074C44.8413 13.1384 45.7189 13.3033 46.6791 13.3033C47.6397 13.3033 48.5164 13.1355 49.311 12.7988C50.105 12.4623 50.7926 12.0062 51.3737 11.4315C51.9548 10.8568 52.4049 10.1894 52.7251 9.42938C53.0451 8.6694 53.2056 7.85936 53.2056 7.00051V6.96584C53.2056 6.10657 53.0451 5.29692 52.7251 4.53655C52.4049 3.77646 51.9607 3.112 51.3915 2.54305ZM50.9116 7.03526C50.9116 7.6269 50.8075 8.18436 50.6005 8.70695C50.3926 9.22953 50.1051 9.68482 49.7377 10.0736C49.3702 10.4631 48.9289 10.7698 48.4129 10.9965C47.8966 11.223 47.3312 11.3359 46.7147 11.3359C46.0982 11.3359 45.529 11.2202 45.0068 10.9877C44.4857 10.7554 44.0376 10.4456 43.6642 10.0562C43.291 9.66759 43.0003 9.20921 42.7935 8.68089C42.5856 8.15257 42.4821 7.59223 42.4821 7.00051V6.96584C42.4821 6.37369 42.5856 5.81665 42.7935 5.29396C43.0004 4.77178 43.2881 4.31609 43.6554 3.92706C44.0228 3.53836 44.4649 3.23068 44.9802 3.00449C45.4964 2.77798 46.0626 2.66503 46.6791 2.66503C47.2956 2.66503 47.8643 2.78086 48.3861 3.01321C48.9075 3.24516 49.3555 3.55569 49.7287 3.94482C50.1021 4.33353 50.3926 4.79199 50.6005 5.32043C50.8075 5.84825 50.9116 6.40838 50.9116 7.00053V7.03526Z"
              fill="black"
            />
            <path
              d="M8.75181 5.97279H2.81253V0.90625H0.625V13.0947H2.81253V7.95827H8.75181V13.0947H10.9394V0.90625H8.75181V5.97279Z"
              fill="black"
            />
            <path
              d="M64.7403 8.28034C64.5686 7.90384 64.3166 7.57228 63.9846 7.28852C63.6527 7.00373 63.235 6.76266 62.7308 6.56548C62.2273 6.3683 61.6493 6.18795 60.9972 6.02585C60.4044 5.88654 59.9157 5.75297 59.5297 5.62515C59.1445 5.49743 58.8421 5.36128 58.6234 5.21583C58.4038 5.07107 58.2523 4.90858 58.1695 4.72865C58.0867 4.5488 58.0452 4.3425 58.0452 4.11055V4.07546C58.0452 3.66932 58.2227 3.32698 58.5783 3.04834C58.9339 2.7696 59.4321 2.63031 60.0725 2.63031C60.6416 2.63031 61.2049 2.73781 61.7617 2.95243C62.3191 3.16735 62.8824 3.4779 63.4509 3.88394L64.6248 2.26479C63.9846 1.7657 63.3 1.38571 62.5712 1.12401C61.8415 0.863021 61.0209 0.732422 60.1079 0.732422C59.4914 0.732422 58.9228 0.819614 58.4009 0.993724C57.8789 1.16784 57.4317 1.40848 57.0584 1.71605C56.6842 2.02372 56.3914 2.39539 56.1779 2.83078C55.9642 3.26586 55.8577 3.74506 55.8577 4.26722V4.302C55.8577 4.85935 55.9495 5.33527 56.1335 5.72982C56.3168 6.12437 56.5838 6.45799 56.9333 6.73087C57.2831 7.00375 57.7162 7.23643 58.2315 7.42765C58.7477 7.61867 59.3376 7.7902 60.0014 7.94162C60.5817 8.06883 61.0534 8.19624 61.4148 8.32366C61.7763 8.45191 62.0611 8.59163 62.2688 8.74202C62.4758 8.89262 62.6185 9.05265 62.6952 9.22132C62.7721 9.38915 62.8107 9.58326 62.8107 9.80465V9.83952C62.8107 10.3034 62.6125 10.6748 62.2156 10.9534C61.8178 11.2321 61.2818 11.3712 60.6062 11.3712C59.8233 11.3712 59.1238 11.235 58.5073 10.9621C57.8908 10.6892 57.2801 10.2977 56.6754 9.7866L55.3594 11.3191C56.1069 11.9805 56.9187 12.4713 57.7961 12.7906C58.6737 13.1096 59.5919 13.269 60.5521 13.269C61.2049 13.269 61.803 13.188 62.3487 13.0257C62.8941 12.863 63.3623 12.6248 63.7533 12.3121C64.1443 11.998 64.4505 11.6149 64.6693 11.1627C64.8889 10.7095 64.9983 10.1984 64.9983 9.62961V9.59474C64.9982 9.09612 64.9125 8.65808 64.7403 8.28034Z"
              fill="black"
            />
            <path
              d="M35.9504 7.98432C36.3119 7.7693 36.6231 7.50811 36.8833 7.20054C37.1442 6.89278 37.349 6.53885 37.4969 6.13854C37.6455 5.73784 37.7195 5.28799 37.7195 4.7889V4.75412C37.7195 4.21994 37.6306 3.73244 37.4525 3.29132C37.2744 2.8505 37.02 2.46138 36.688 2.12479C36.2844 1.74153 35.7811 1.443 35.1763 1.22838C34.5715 1.01336 33.8781 0.90625 33.0961 0.90625H27.5469V13.0947H29.7352V8.84565H32.4381H32.4735L35.5319 13.0947H38.1105L34.7496 8.48022C35.188 8.36368 35.5881 8.19873 35.9504 7.98432ZM29.7352 6.94817V2.85624H32.9177C33.7363 2.85624 34.3706 3.02745 34.8207 3.36979C35.2717 3.71223 35.4965 4.21419 35.4965 4.87579V4.91088C35.4965 5.5378 35.2649 6.03391 34.8029 6.39953C34.341 6.76496 33.7184 6.94817 32.9356 6.94817H29.7352Z"
              fill="black"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          marginTop: '-5vh',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Step 1: Email */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <h1
                  style={{
                    color: colors.primaryText,
                    fontSize: 40,
                    fontWeight: 500,
                    margin: '0 0 12px 0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Get Started
                </h1>
                <p
                  style={{
                    color: colors.subtitle,
                    fontSize: 16,
                    fontWeight: 400,
                    margin: '0 0 12px 0',
                  }}
                >
                  Enter the email you will use for your account
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: '100%', position: 'relative' }}>
                  <div
                    style={{
                      borderRadius: 8,
                      height: 50,
                      border: `1px solid ${
                        touched.email && !formData.email ? colors.error : colors.border
                      }`,
                      backgroundColor: colors.cards,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, handleEmailSubmit, isStep1Valid)}
                      placeholder="Email*"
                      autoComplete="off"
                      style={inputStyle}
                    />
                  </div>
                  {touched.email && !isValidEmail(formData.email) && (
                    <span
                      style={{
                        color: colors.error,
                        fontWeight: 400,
                        fontSize: 12,
                        marginTop: 4,
                        display: 'block',
                      }}
                    >
                      Enter a valid email address
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 10,
                    width: '100%',
                  }}
                >
                  <button
                    onClick={handleEmailSubmit}
                    disabled={!isStep1Valid}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      color: colors.buttonText,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                      opacity: isStep1Valid ? 1 : 0.298,
                      fontFamily: 'Archivo, sans-serif',
                    }}
                  >
                    Continue
                  </button>
                  <p
                    style={{
                      color: colors.subtitle,
                      fontSize: 12,
                      fontWeight: 400,
                      textAlign: 'center',
                      marginTop: 12,
                    }}
                  >
                    *No Credit Card Required At This Time
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <h1
                  style={{
                    color: colors.primaryText,
                    fontSize: 40,
                    fontWeight: 500,
                    margin: '0 0 12px 0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Business Details
                </h1>
                <p
                  style={{
                    color: colors.subtitle,
                    fontSize: 16,
                    fontWeight: 400,
                    margin: '0 0 12px 0',
                  }}
                >
                  We will optimize your ad settings for your spend and business model
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Monthly Revenue */}
                <div style={{ width: '100%', position: 'relative' }}>
                  <div
                    style={{
                      borderRadius: 8,
                      height: 50,
                      border: `1px solid ${
                        touched.monthlyRevenue && !formData.monthlyRevenue
                          ? colors.error
                          : colors.border
                      }`,
                      backgroundColor: colors.cards,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      name="monthlyRevenue"
                      value={formData.monthlyRevenue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        ...selectStyle,
                        color: formData.monthlyRevenue ? colors.primaryText : colors.locked,
                      }}
                    >
                      <option value="" disabled>
                        Rough Monthly Revenue*
                      </option>
                      {REVENUE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {touched.monthlyRevenue && !formData.monthlyRevenue && (
                    <span
                      style={{
                        color: colors.error,
                        fontWeight: 400,
                        fontSize: 12,
                        marginTop: 4,
                        display: 'block',
                      }}
                    >
                      Select your monthly revenue
                    </span>
                  )}
                </div>

                {/* Ad Spend */}
                <div style={{ width: '100%', position: 'relative' }}>
                  <div
                    style={{
                      borderRadius: 8,
                      height: 50,
                      border: `1px solid ${
                        touched.adSpend && !formData.adSpend ? colors.error : colors.border
                      }`,
                      backgroundColor: colors.cards,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      name="adSpend"
                      value={formData.adSpend}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        ...selectStyle,
                        color: formData.adSpend ? colors.primaryText : colors.locked,
                      }}
                    >
                      <option value="" disabled>
                        Monthly Ad Spend*
                      </option>
                      {AD_SPEND_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {touched.adSpend && !formData.adSpend && (
                    <span
                      style={{
                        color: colors.error,
                        fontWeight: 400,
                        fontSize: 12,
                        marginTop: 4,
                        display: 'block',
                      }}
                    >
                      Select your ad spend
                    </span>
                  )}
                </div>

                {/* Website URL */}
                <div style={{ width: '100%', position: 'relative' }}>
                  <div
                    style={{
                      borderRadius: 8,
                      height: 50,
                      border: `1px solid ${
                        touched.websiteUrl && !formData.websiteUrl ? colors.error : colors.border
                      }`,
                      backgroundColor: colors.cards,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, handleBusinessInfoSubmit, !!isStep2Valid)}
                      placeholder="Website URL*"
                      autoComplete="off"
                      style={inputStyle}
                    />
                  </div>
                  {touched.websiteUrl && !formData.websiteUrl && (
                    <span
                      style={{
                        color: colors.error,
                        fontWeight: 400,
                        fontSize: 12,
                        marginTop: 4,
                        display: 'block',
                      }}
                    >
                      Enter your website URL
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 10,
                    width: '100%',
                  }}
                >
                  <button
                    onClick={handleBusinessInfoSubmit}
                    disabled={!isStep2Valid}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      color: colors.buttonText,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: isStep2Valid ? 'pointer' : 'not-allowed',
                      opacity: isStep2Valid ? 1 : 0.298,
                      fontFamily: 'Archivo, sans-serif',
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: VIP Qualification + Phone */}
          {step === 3 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: colors.greenLight,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.green}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h1
                  style={{
                    color: colors.primaryText,
                    fontSize: 32,
                    fontWeight: 500,
                    margin: '0 0 12px 0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  You Qualify for VIP Setup!
                </h1>
              </div>

              <div
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    color: colors.primaryText,
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                  }}
                >
                  Due to your spend you qualify for{' '}
                  <span style={{ color: colors.blue, fontWeight: 600 }}>
                    VIP DFY set up and support
                  </span>
                  . Our team is reviewing your tech stack to confirm you can fully plug in.
                </p>
                <p
                  style={{
                    color: colors.primaryText,
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                  }}
                >
                  We will reach out in a few minutes with a demo and your account activation links,
                  please enter your best phone number below and we will text you in 3-5 minutes.
                </p>
                <p style={{ color: colors.green, fontSize: 14, fontWeight: 500, margin: 0 }}>
                  (This will not be AI)
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: '100%', position: 'relative' }}>
                  <div
                    style={{
                      borderRadius: 8,
                      height: 50,
                      border: `1px solid ${
                        touched.phoneNumber && !formData.phoneNumber ? colors.error : colors.border
                      }`,
                      backgroundColor: colors.cards,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* Country code prefix */}
                    <div
                      style={{
                        padding: '0 12px',
                        borderRight: `1px solid ${colors.border}`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        fontSize: 14,
                        fontFamily: 'Archivo, sans-serif',
                        color: colors.primaryText,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowCountrySelect(!showCountrySelect)}
                    >
                      {countryCodes.find(c => c.code === countryCode)?.flag} {countryCode} ▾
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, handleRoute1Submit, isStep3Valid && !isSubmitting)}
                      placeholder="Phone Number*"
                      autoComplete="off"
                      style={{ ...inputStyle, paddingLeft: 12 }}
                    />
                  </div>

                  {/* Country code dropdown */}
                  {showCountrySelect && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 54,
                        left: 0,
                        backgroundColor: colors.cards,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        maxHeight: 200,
                        overflowY: 'auto',
                        width: 160,
                      }}
                    >
                      {countryCodes.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCountrySelect(false);
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontFamily: 'Archivo, sans-serif',
                            backgroundColor: c.code === countryCode ? colors.background : 'transparent',
                            display: 'flex',
                            gap: 8,
                          }}
                        >
                          <span>{c.flag}</span>
                          <span>{c.code}</span>
                          <span style={{ color: colors.subtitle }}>{c.country}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {touched.phoneNumber && !formData.phoneNumber && (
                    <span
                      style={{
                        color: colors.error,
                        fontWeight: 400,
                        fontSize: 12,
                        marginTop: 4,
                        display: 'block',
                      }}
                    >
                      Enter your phone number
                    </span>
                  )}
                </div>

                {/* Route 1: FASTEST - SMS Contact */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <button
                    onClick={handleRoute1Submit}
                    disabled={!isStep3Valid || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      color: colors.buttonText,
                      border: 'none',
                      cursor: isStep3Valid && !isSubmitting ? 'pointer' : 'not-allowed',
                      opacity: isStep3Valid && !isSubmitting ? 1 : 0.298,
                      fontFamily: 'Archivo, sans-serif',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        marginBottom: 10,
                      }}
                    >
                      FASTEST
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Contact me with video demo + activation links now via SMS'}
                    </span>
                  </button>
                </div>

                {/* Route 2: Schedule Call */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 10,
                    width: '100%',
                  }}
                >
                  <button
                    onClick={handleRoute2Submit}
                    disabled={!isStep3Valid || isSubmitting}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: 'transparent',
                      color: colors.blue,
                      border: `1px solid ${colors.border}`,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: isStep3Valid && !isSubmitting ? 'pointer' : 'not-allowed',
                      opacity: isStep3Valid && !isSubmitting ? 1 : 0.5,
                      fontFamily: 'Archivo, sans-serif',
                      textDecoration: 'underline',
                    }}
                  >
                    Schedule a demo call at a later time
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Thank You (Qualified) */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#e5fcf3',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.greenBright}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h1
                style={{
                  color: colors.primaryText,
                  fontSize: 40,
                  fontWeight: 500,
                  margin: '0 0 12px 0',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Thank You!
              </h1>
              <p
                style={{
                  color: colors.subtitle,
                  fontSize: 16,
                  fontWeight: 400,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Watch your phone — you'll receive a text from our team shortly.
              </p>
            </div>
          )}

          {/* Step 5: Thank You (Disqualified - Not Spending Enough) */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#fff3e6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h1
                style={{
                  color: colors.primaryText,
                  fontSize: 32,
                  fontWeight: 500,
                  margin: '0 0 16px 0',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                We're Sorry
              </h1>
              <p
                style={{
                  color: colors.subtitle,
                  fontSize: 16,
                  fontWeight: 400,
                  margin: 0,
                  lineHeight: 1.6,
                  maxWidth: 360,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                HYROS is for businesses spending at least $10k+ a month on ads. It would be a bad fit for you at this time. We will have a free trial here soon for your business! Thank you!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
