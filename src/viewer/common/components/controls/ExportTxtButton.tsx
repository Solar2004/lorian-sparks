import { faFileText } from '@fortawesome/free-solid-svg-icons';
import FaButton from '../../../../components/FaButton';
import { ExportTxtCallback } from '../../logic/export';

export interface ExportTxtButtonProps {
    exportTxtCallback: ExportTxtCallback;
}

export default function ExportTxtButton({ exportTxtCallback }: ExportTxtButtonProps) {
    if (!exportTxtCallback) {
        return null;
    }
    return (
        <FaButton
            icon={faFileText}
            onClick={exportTxtCallback}
            title="Export this profile data to a TXT file"
        />
    );
}
