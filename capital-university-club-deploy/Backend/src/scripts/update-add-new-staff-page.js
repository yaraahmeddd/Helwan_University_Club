const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../../../Frontend/src/pages/AddNewStaffPage.tsx');
let content = fs.readFileSync(srcPath, 'utf8');

// 1. Add required imports
content = content.replace(
  /import \{ Save, Check, Copy, UploadCloud, X, AlertTriangle \} from "lucide-react";/,
  'import { Save, Check, Copy, UploadCloud, X, AlertTriangle, User, IdCard, Phone, MapPin, Calendar, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";'
);
content = content.replace(/import \{ Card, CardContent, CardHeader, CardTitle \} from "\.\.\/components\/StaffPagesComponents\/ui\/card";\n/, '');

// 2. Insert InputGroup and inputClasses
const componentsToInsert = `
interface InputGroupProps {
  label: string | React.ReactNode;
  error?: any;
  children: React.ReactNode;
  className?: string;
}

const InputGroup = ({ label, error, children, className = "" }: InputGroupProps) => (
  <div className={\`flex flex-col gap-1.5 \${className}\`}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      <AnimatePresence>
          {error && (
              <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1 font-medium"
              >
                  <AlertTriangle size={12} /> {error.message}
              </motion.span>
          )}
      </AnimatePresence>
  </div>
);
`;

content = content.replace('export default function AddNewStaffPage() {', componentsToInsert + '\nexport default function AddNewStaffPage() {');

content = content.replace(
  'const staffTypeId = watch("staff_type_id");',
  'const staffTypeId = watch("staff_type_id");\n  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none placeholder:text-gray-400 text-gray-800";'
);

// 3. Replace the main container and stepper
const renderStartIdx = content.indexOf('return (\n    <div className="min-h-screen');
if (renderStartIdx !== -1) {
  // We will manually split and replace from here
}

// Since regex can be error-prone, let's use string manipulation based on known markers.

const block1Start = content.indexOf('<div className="min-h-screen');
const block1End = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">', block1Start);

const newBlock1 = `<div className={\`min-h-screen bg-slate-50 py-12 font-sans \${i18n.language === 'ar' ? 'text-right' : 'text-left'}\`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("pageDescription")}</p>
      </motion.div>

      <div className="w-full max-w-3xl mx-auto mb-12 relative z-0 mt-8">
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 -z-10 rounded-full" />
        <motion.div
            className={\`absolute top-1/2 \${i18n.language === 'ar' ? 'right-0' : 'left-0'} h-2 bg-indigo-600 -z-10 rounded-full\`}
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "0%" : "100%" }}
            transition={{ duration: 0.5, ease: "circOut" }}
        />
        <div className="flex justify-between items-center px-12">
          <div className="flex flex-col items-center bg-transparent">
              <motion.div
                  className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 bg-white
                      \${step >= 1 ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}\`}
                  animate={{ scale: step === 1 ? 1.2 : 1, borderColor: step >= 1 ? '#4f46e5' : '#d1d5db' }}
              >
                  {step > 1 ? <Check size={24} strokeWidth={3} /> : "1"}
              </motion.div>
              <span className={\`mt-3 text-sm font-bold transition-colors \${step >= 1 ? 'text-indigo-900' : 'text-gray-400'}\`}>
                  {t("stepper.step1")}
              </span>
          </div>

          <div className="flex flex-col items-center bg-transparent">
              <motion.div
                  className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 bg-white
                      \${step >= 2 ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}\`}
                  animate={{ scale: step === 2 ? 1.2 : 1, borderColor: step >= 2 ? '#4f46e5' : '#d1d5db' }}
              >
                  2
              </motion.div>
              <span className={\`mt-3 text-sm font-bold transition-colors \${step >= 2 ? 'text-indigo-900' : 'text-gray-400'}\`}>
                  {t("stepper.step2")}
              </span>
          </div>
        </div>
      </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step1" className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-white/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg"><IdCard className="text-indigo-600" /></div>
                  {t("stepper.step1")}
                </h3>
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n`;

content = content.substring(0, block1Start) + newBlock1 + content.substring(block1End + '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">'.length);

// 4. Replace Step 1 fields
const fieldsStart = content.indexOf('<div>\n                <Label>{t("form.firstNameEn")}</Label>');
const fieldsEnd = content.indexOf('</div>\n              </div>\n\n            {/* Package Selection Section */}');

const newFields = `
                  <InputGroup label={t("form.firstNameEn")} error={errors.first_name_en}>
                    <input {...register("first_name_en")} dir="ltr" className={\`\${inputClasses} text-left\`} maxLength={20} />
                  </InputGroup>

                  <InputGroup label={t("form.firstNameAr")} error={errors.first_name_ar}>
                    <input {...register("first_name_ar")} className={inputClasses} maxLength={20} />
                  </InputGroup>

                  <InputGroup label={t("form.lastNameEn")} error={errors.last_name_en}>
                    <input {...register("last_name_en")} dir="ltr" className={\`\${inputClasses} text-left\`} maxLength={20} />
                  </InputGroup>

                  <InputGroup label={t("form.lastNameAr")} error={errors.last_name_ar}>
                    <input {...register("last_name_ar")} className={inputClasses} maxLength={20} />
                  </InputGroup>
                  
                  <div className="md:col-span-2 h-px bg-gray-100 my-2" />

                  <InputGroup label={t("form.nationalId")} className="md:col-span-2" error={errors.national_id}>
                    <input {...register("national_id")} type="text" dir="ltr" className={\`\${inputClasses} font-mono tracking-widest text-lg text-left\`} maxLength={14} inputMode="numeric" />
                  </InputGroup>

                  <InputGroup label={t("form.gender")}>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClasses}>
                      <option value="ذكر">{t("form.male")}</option>
                      <option value="أنثى">{t("form.female")}</option>
                    </select>
                  </InputGroup>

                  <InputGroup label={t("form.phone")} error={errors.phone}>
                    <input {...register("phone")} type="tel" dir="ltr" className={\`\${inputClasses} text-left font-mono\`} maxLength={11} inputMode="numeric" />
                  </InputGroup>

                  <div className="md:col-span-2 h-px bg-gray-100 my-2" />

                  <InputGroup label={t("form.address")} className="md:col-span-2" error={errors.address}>
                    <input {...register("address")} className={inputClasses} maxLength={100} />
                  </InputGroup>

                  <InputGroup label={t("form.staffType")} error={errors.staff_type_id}>
                    <select {...register("staff_type_id")} className={inputClasses} required>
                      <option value="" disabled>{t("form.staffTypeSelect")}</option>
                      {staffTypeOptions.map((type) => (
                        <option key={type.id} value={String(type.id)}>{type.label}</option>
                      ))}
                    </select>
                    {staffTypesError && !staffTypesFromApi && (
                        <div className="flex items-center justify-between mt-1 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <span>{t("dialogs.staffTypesError")}</span>
                          <button type="button" onClick={() => void loadStaffTypes()} className={\`underline font-medium \${i18n.language === 'ar' ? 'mr-2' : 'ml-2'}\`}>{t("packages.retry")}</button>
                        </div>
                    )}
                  </InputGroup>

                  <InputGroup label={t("form.employmentDate")} error={errors.employment_start_date}>
                    <input type="date" {...register("employment_start_date")} dir="ltr" className={\`\${inputClasses} text-left\`} />
                  </InputGroup>
                </div>
`;
content = content.substring(0, fieldsStart) + newFields + content.substring(fieldsEnd + '</div>\n              </div>\n'.length);

// 5. Replace Next/Prev buttons in Step 1
const buttons1Start = content.indexOf('<div className="flex items-center justify-end gap-3 pt-4">');
const buttons1End = content.indexOf('</motion.div>\n            )}\n\n            {step === 2');

const newButtons1 = `<div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => navigate("/staff/dashboard/admin/staff/list")} className="px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center gap-2">
                    {i18n.language === 'ar' ? <ChevronRight size={20} /> : null}
                    {t("actions.cancel")}
                    {i18n.language !== 'ar' ? <ChevronLeft size={20} /> : null}
                  </button>
                  <button type="button" onClick={handleNextStep} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                    {i18n.language === 'ar' ? 'التالي' : 'Next'}
                    {i18n.language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
              `;
content = content.substring(0, buttons1Start) + newButtons1 + content.substring(buttons1End);

// 6. Update step 2 motion.div wrapper to have white background
const step2MotionStart = content.indexOf('className="space-y-6"\n                >');
if (step2MotionStart !== -1) {
    content = content.substring(0, step2MotionStart) + 'className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-white/50 backdrop-blur-sm space-y-6"\n                >' + content.substring(step2MotionStart + 'className="space-y-6"\n                >'.length);
}

// 7. Update Next/Prev buttons in Step 2
const buttons2Start = content.indexOf('<div className="flex items-center justify-between pt-6 mt-4 border-t border-border">');
const buttons2End = content.indexOf('</motion.div>\n              );\n            })()}\n            </AnimatePresence>\n          </form>\n        </CardContent>\n      </Card>');

const newButtons2 = `<div className="flex flex-col-reverse md:flex-row justify-between mt-12 pt-6 border-t border-gray-100 gap-4">
                    <button type="button" onClick={() => setStep(1)} className="px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center justify-center gap-2">
                      {i18n.language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                      {i18n.language === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                    <button type="submit" disabled={isSubmitting || isManualSubmitting} className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3">
                      {isSubmitting || isManualSubmitting ? <span className="animate-spin text-xl">⏳</span> : <Check size={24} />}
                      {isSubmitting || isManualSubmitting ? t("actions.saving") : t("actions.save")}
                    </button>
                  </div>
                `;
content = content.substring(0, buttons2Start) + newButtons2 + content.substring(buttons2End);

// 8. Update end of file to close tags properly
const endTagsStart = content.lastIndexOf('</Dialog>\n    </div>\n  );\n}');
if (endTagsStart !== -1) {
    content = content.substring(0, endTagsStart) + '</Dialog>\n      </div>\n    </div>\n  );\n}';
}

// 9. Update DocumentUploadCard styling
const docCardStart = content.indexOf('function DocumentUploadCard');
const docCardReturnStart = content.indexOf('return (\n    <div\n      id={`doc-card-${id}`}');
const docCardReturnEnd = content.indexOf('</div>\n  );\n}', docCardReturnStart);

if (docCardReturnStart !== -1 && docCardReturnEnd !== -1) {
    const newDocCardReturn = `return (
    <div
        id={\`doc-card-\${id}\`}
        onClick={() => !file && fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={\`
            relative border-2 border-dashed p-6 rounded-2xl cursor-pointer transition-all duration-300 group
            flex flex-col items-center justify-center text-center h-full
            \${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-white'}
            \${(error || localError) ? "border-red-400 bg-red-50/50" : ""}
            \${ringClass}
        \`}
    >
        <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.webp,.bmp,.heic"
            onChange={handleChange}
        />
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className={\`text-[10px] px-2 py-0.5 rounded border font-medium \${badgeColors[badgeType]}\`}>
                {finalBadgeText}
            </span>
            {file && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 h-6 w-6 rounded-full"
                onClick={(e) => { e.stopPropagation(); onFileChange(id, null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
        </div>

        <div className={\`w-14 h-14 rounded-full flex items-center justify-center mb-4 mt-6 transition-colors
             \${file ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}\`}>
            {file ? <Check size={28} /> : <UploadCloud size={28} />}
        </div>

        <p className={\`font-bold text-base \${file ? 'text-indigo-900' : 'text-gray-600'}\`}>{label}</p>

        <p className="text-sm text-gray-400 mt-2 max-w-[200px] truncate" dir="ltr">
            {file ? file.name : t("documents.uploadPrompt")}
        </p>

        {warningText && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 mt-3 rounded text-[10px] border border-amber-200">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <p>{warningText}</p>
            </div>
        )}
        
        {(error || localError) && (
            <p className="text-xs text-red-500 font-medium mt-2">{error || localError}</p>
        )}
    `;
    
    content = content.substring(0, docCardReturnStart) + newDocCardReturn + content.substring(docCardReturnEnd);
}

fs.writeFileSync(srcPath, content, 'utf8');
console.log("SUCCESS");
