import WidgetsAndMetadata from '../common/components/WidgetsAndMetadata';
import { useAlwaysOpenMetadataToggle } from '../common/hooks/useMetadataToggle';
import { ExportCallback, ExportTxtCallback } from '../common/logic/export';
import { HealthMetadata } from '../proto/spark_pb';
import Controls from './controls/Controls';

import 'react-virtualized/styles.css';
import HealthData from './HealthData';

export interface HealthProps {
    data: HealthData;
    metadata: HealthMetadata;
    exportCallback: ExportCallback;
    exportTxtCallback: ExportTxtCallback;
}

export default function Health({ metadata, exportCallback, exportTxtCallback }: HealthProps) {
    const metadataToggle = useAlwaysOpenMetadataToggle();
    return (
        <div>
            <Controls metadata={metadata} exportCallback={exportCallback} exportTxtCallback={exportTxtCallback} />
            <WidgetsAndMetadata
                metadata={metadata}
                metadataToggle={metadataToggle}
            />
        </div>
    );
}
