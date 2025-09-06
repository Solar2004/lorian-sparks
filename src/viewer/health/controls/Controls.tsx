import styles from '../../../style/controls.module.scss';
import ExportButton from '../../common/components/controls/ExportButton';
import ExportTxtButton from '../../common/components/controls/ExportTxtButton';
import { ExportCallback, ExportTxtCallback } from '../../common/logic/export';
import { HealthMetadata } from '../../proto/spark_pb';
import HealthTitle from '../HealthTitle';

export interface ControlsProps {
    metadata: HealthMetadata;
    exportCallback: ExportCallback;
    exportTxtCallback: ExportTxtCallback;
}

export default function Controls({ metadata, exportCallback, exportTxtCallback }: ControlsProps) {
    return (
        <div className={styles.controls}>
            <HealthTitle metadata={metadata} />
            <ExportButton exportCallback={exportCallback} />
            <ExportTxtButton exportTxtCallback={exportTxtCallback} />
        </div>
    );
}
