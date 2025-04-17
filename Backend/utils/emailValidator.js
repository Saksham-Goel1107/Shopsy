import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

let disposableDomains = new Set();

const ADDITIONAL_DOMAINS = [
    'anlocc.com',
    'tmpmail.org',
    'temp-mail.org',
    'guerrillamail.com',
    'sharklasers.com',
    'mailinator.com',
    '10minutemail.com',
    'tempmail.com'
];

const SOURCES = {
    main: 'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
    alternate: 'https://raw.githubusercontent.com/7c/fakefilter/main/txt/data.txt',
    backup: 'https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blocklist.conf'
};

const LOCAL_DOMAINS_PATH = path.join(process.cwd(), 'data', 'disposable-domains.txt');

const DISPOSABLE_PATTERNS = [
    /^temp/i,
    /^dummy/i,
    /^fake/i,
    /^trash/i,
    /mail\.tm$/i,
    /tmpmail/i,
    /disposable/i,
    /mailinator/i,
    /guerrilla/i,
    /10minute/i,
    /temporary/i,
    /throwaway/i
];

async function fetchDomainsFromSource(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
        const text = await response.text();
        return text.split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(Boolean);
    } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        return [];
    }
}

async function updateDisposableDomainsList() {
    try {
        const [mainDomains, alternateDomains, backupDomains] = await Promise.all([
            fetchDomainsFromSource(SOURCES.main),
            fetchDomainsFromSource(SOURCES.alternate),
            fetchDomainsFromSource(SOURCES.backup)
        ]);

        const domains = new Set([
            ...mainDomains,
            ...alternateDomains,
            ...backupDomains,
            ...ADDITIONAL_DOMAINS
        ]);

        if (domains.size > ADDITIONAL_DOMAINS.length) {
            disposableDomains = domains;
            await fs.mkdir(path.dirname(LOCAL_DOMAINS_PATH), { recursive: true });
            await fs.writeFile(LOCAL_DOMAINS_PATH, Array.from(domains).join('\n'));
            console.log(`Updated disposable domains list: ${domains.size} domains`);
        } else {
            throw new Error('Failed to fetch sufficient domains from sources');
        }
    } catch (error) {
        console.error('Error updating domains:', error);
        try {
            const backup = await fs.readFile(LOCAL_DOMAINS_PATH, 'utf-8');
            disposableDomains = new Set([...backup.split('\n'), ...ADDITIONAL_DOMAINS]);
            console.log('Loaded domains from backup file');
        } catch (backupError) {
            console.error('Failed to load backup, using default list');
            disposableDomains = new Set(ADDITIONAL_DOMAINS);
        }
    }
}

export function isDisposableEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return false;
    
    if (disposableDomains.has(domain)) {
        console.log(`Domain ${domain} found in disposable list`);
        return true;
    }

    for (const pattern of DISPOSABLE_PATTERNS) {
        if (pattern.test(domain)) {
            console.log(`Domain ${domain} matched pattern ${pattern}`);
            return true;
        }
    }

    console.log(`Domain ${domain} appears to be legitimate`);
    return false;
}

updateDisposableDomainsList();

setInterval(updateDisposableDomainsList, 4 * 60 * 60 * 1000);