import fetch from 'node-fetch';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import path from 'path';
import fs from 'fs/promises';

const ABSTRACT_API_KEY = process.env.ABSTRACT_PHONE_API_KEY;

const FAKE_PATTERNS = [
    /^(\+?\d)?(\d)\2{9}$/,
    /^(\+91)?(1234567890|0000000000|9999999999)$/,
    /^(\+?\d{1,3})?555\d{7}$/,
    /^(\+?\d{1,3})?(123|321|111|000|999)\d{7}$/
];

const BLOCKED_CARRIERS = [
    'textnow', 'google voice', 'twilio', 'bandwidth',
    'skype', 'plivo', 'nexmo', 'voip', 'burner',
    'ping', 'unassigned', 'unknown'
];

let disposableNumbersCache = null;
let disposablePatternsCache = null;

async function loadDisposableNumbers() {
    if (disposableNumbersCache && disposablePatternsCache) {
        return {
            prefixes: disposableNumbersCache.prefixes,
            fullNumbers: disposableNumbersCache.fullNumbers,
            patterns: disposablePatternsCache
        };
    }
    
    try {
        const dataPath = path.join(process.cwd(), 'data', 'disposableNumbers.json');
        const data = await fs.readFile(dataPath, 'utf8');
        const jsonData = JSON.parse(data);
        
        disposableNumbersCache = {
            prefixes: jsonData.prefixes || [],
            fullNumbers: jsonData.fullNumbers || [],
        };
        
        disposablePatternsCache = (jsonData.patterns || [])
            .map(pattern => {
                try {
                    return new RegExp(pattern);
                } catch (e) {
                    console.error(`Invalid pattern in disposableNumbers.json: ${pattern}`);
                    return null;
                }
            })
            .filter(Boolean);

        return {
            ...disposableNumbersCache,
            patterns: disposablePatternsCache
        };
    } catch (error) {
        console.error('Error loading disposable numbers data:', error);
        return { prefixes: [], fullNumbers: [], patterns: [] };
    }
}

export async function isDisposablePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') return true;

    const normalized = phoneNumber.replace(/\s|-/g, '');
    if (FAKE_PATTERNS.some(p => p.test(normalized))) {
        console.log(`Pattern match: ${phoneNumber}`);
        return true;
    }

    try {
        const phoneObj = parsePhoneNumberWithError(normalized);
        
        if (!phoneObj.isValid()) {
            console.log('Invalid phone number format');
            return true;
        }

        if (!phoneObj.nationalNumber || String(phoneObj.nationalNumber).length < 8) {
            console.log('Invalid number length');
            return true;
        }

        const disposableData = await loadDisposableNumbers();
        
        if (disposableData.prefixes.some(prefix => normalized.startsWith(prefix))) {
            console.log('Matched with disposable prefix');
            return true;
        }

        if (disposableData.fullNumbers.includes(normalized)) {
            console.log('Matched with known disposable number');
            return true;
        }

        if (disposableData.patterns.some(pattern => pattern.test(normalized))) {
            console.log('Matched with disposable pattern');
            return true;
        }

        try {
            const apiUrl = `https://phonevalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${encodeURIComponent(normalized)}`;
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data || data.valid === false) {
                console.log(`Abstract API: Invalid number`);
                return true;
            }

            const carrier = (data.carrier || '').toLowerCase();
            const lineType = (data.line_type || '').toLowerCase();

            if (
                BLOCKED_CARRIERS.some(b => carrier.includes(b)) ||
                lineType === 'voip' ||
                lineType === 'premium_rate'
            ) {
                console.log(`Blocked carrier or VOIP: ${carrier}, ${lineType}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Abstract API validation failed:', error);
            return false;
        }
    } catch (error) {
        console.log('Phone number parsing failed:', error);
        return true;
    }
}

export async function validatePhoneNumber(phoneNumber) {
    try {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return {
                isValid: false,
                reason: "Phone number is required"
            };
        }

        const normalized = phoneNumber.replace(/\s|-/g, '');

        try {
            const phoneObj = parsePhoneNumberWithError(normalized);
            
            if (!phoneObj.isValid()) {
                return {
                    isValid: false,
                    reason: "Invalid phone number format"
                };
            }

            if (!phoneObj.nationalNumber || String(phoneObj.nationalNumber).length < 8) {
                return {
                    isValid: false,
                    reason: "Phone number too short"
                };
            }

            return {
                isValid: true,
                phoneNumber: phoneObj.format('E.164')
            };
        } catch (error) {
            return {
                isValid: false,
                reason: "Invalid phone number format"
            };
        }
    } catch (error) {
        return {
            isValid: false,
            reason: "Phone number validation failed"
        };
    }
}