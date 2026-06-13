import { useCallback, useState } from 'react';
import {
    MembershipFormPrintDialog,
    type MembershipFormPrintDialogInput,
} from '@/components/StaffPagesComponents/shared/MembershipFormPrintDialog';

export function useMembershipFormPrint() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<MembershipFormPrintDialogInput | null>(null);

    const openMembershipFormPrint = useCallback((data: MembershipFormPrintDialogInput) => {
        setInput(data);
        setOpen(true);
    }, []);

    const membershipFormPrintDialog = (
        <MembershipFormPrintDialog
            open={open}
            onOpenChange={setOpen}
            input={input}
        />
    );

    return { openMembershipFormPrint, membershipFormPrintDialog };
}
