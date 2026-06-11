import { useCallback, useState } from "react";
import { MemberCardPrintDialog } from '@/components/StaffPagesComponents/shared/MemberCardPrintDialog';
import type { MemberCardPrintInput } from '@/services/memberCardPrintService';

export function useMemberCardPrint() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<MemberCardPrintInput | null>(null);

    const openMemberCardPrint = useCallback((data: MemberCardPrintInput) => {
        setInput(data);
        setOpen(true);
    }, []);

    const memberCardPrintDialog = (
        <MemberCardPrintDialog
            open={open}
            onOpenChange={setOpen}
            input={input}
        />
    );

    return { openMemberCardPrint, memberCardPrintDialog };
}
