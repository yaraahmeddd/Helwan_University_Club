import { useFormContext } from 'react-hook-form';
import { Step1Category } from './Step1_Category';
import { Step2BasicInfo } from './Step2_BasicInfo';
import { Step3Details } from './Step3_Details';
import { Step4Files } from './Step4_Files';
import type { RegisterFormValues } from '../schemas/validation';
import type { FileUploadMap } from '../utils/submissionFactory';

interface StaffRegisterWizardStepsProps {
    step: number;
    files: FileUploadMap;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => void;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    categoryHint?: string;
}

/**
 * Staff add-member wizard: Category → Basic → Details → Documents
 */
export function StaffRegisterWizardSteps({
    step,
    files,
    onFileChange,
    onNext,
    onPrev,
    onSubmit,
    isSubmitting,
    categoryHint,
}: StaffRegisterWizardStepsProps) {
    const { handleSubmit } = useFormContext<RegisterFormValues>();

    switch (step) {
        case 0:
            return (
                <>
                    <Step1Category onNext={onNext} />
                    {categoryHint && (
                        <p className="text-center text-sm text-muted-foreground mt-6">{categoryHint}</p>
                    )}
                </>
            );
        case 1:
            return <Step2BasicInfo onNext={onNext} onPrev={onPrev} />;
        case 2:
            return <Step3Details onNext={onNext} onPrev={onPrev} />;
        case 3:
            return (
                <Step4Files
                    files={files}
                    onFileChange={onFileChange}
                    onPrev={onPrev}
                    onSubmit={handleSubmit(onSubmit as unknown as () => void)}
                    isSubmitting={isSubmitting}
                />
            );
        default:
            return null;
    }
}
