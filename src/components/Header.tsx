import Link from 'next/link';
import SparkLogo from '../assets/spark-logo.svg';

import styles from '../style/header.module.scss';

export interface HeaderProps {
    title?: string;
}

export default function Header({ title = 'lorian sparks' }: HeaderProps) {
    return (
        <header className={styles.header}>
            <Link href="/" className="logo">
                <SparkLogo width="2.5em" height="2.5em" />
                <h1>{title}</h1>
            </Link>
        </header>
    );
}

export function HomepageHeader() {
    return (
        <div className={styles['homepage-header']}>
            <div>
                <SparkLogo />
                <div>
                    <h1>lorian sparks</h1>
                    <div>
                        A modified version of Spark profiler for Minecraft
                        <br />
                        clients, servers, and proxies.
                    </div>
                </div>
            </div>
        </div>
    );
}
