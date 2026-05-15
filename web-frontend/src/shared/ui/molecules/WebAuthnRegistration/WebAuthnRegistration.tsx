import React, { useState } from 'react';
import { useAppSelector } from '@/foundation/store/hooks';

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
}

const WebAuthnRegistration: React.FC = () => {
    const [webAuthnLoading, setWebAuthnLoading] = useState(false);
    const { user } = useAppSelector((state) => state.auth);

    const startWebAuthnRegistration = async () => {
        if (!user) {
            alert('You must be logged in to register a security key.');
            return;
        }

        setWebAuthnLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/identity/api/webauthn/registration/options`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: (user as any).username || user.email,
                    displayName: user.name || (user as any).username || user.email
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();
            const options = apiResponse.data || apiResponse;

            const publicKeyCredentialCreationOptions = {
                challenge: base64UrlToArrayBuffer(options.challenge),
                rp: options.rp,
                user: {
                    id: base64UrlToArrayBuffer(options.user.id),
                    name: options.user.name,
                    displayName: options.user.displayName
                },
                pubKeyCredParams: options.pubKeyCredParams,
                authenticatorSelection: {
                    authenticatorAttachment: 'platform' as AuthenticatorAttachment,
                    residentKey: 'required' as ResidentKeyRequirement,
                    requireResidentKey: true,
                    userVerification: 'required' as UserVerificationRequirement
                },
                attestation: options.attestation,
                timeout: options.timeout
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            }) as PublicKeyCredential;

            const rawIdB64u = arrayBufferToBase64Url(credential.rawId);
            const credentialJSON = {
                id: rawIdB64u,
                rawId: rawIdB64u,
                type: credential.type,
                response: {
                    clientDataJSON: arrayBufferToBase64Url((credential.response as any).clientDataJSON),
                    attestationObject: arrayBufferToBase64Url((credential.response as any).attestationObject),
                },
                clientExtensionResults: (credential as any).getClientExtensionResults ? (credential as any).getClientExtensionResults() : {}
            };

            const regUsername = (user as any).username || user.email;
            const response2 = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/identity/api/webauthn/registration/result/${regUsername}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentialJSON)
            });

            if (!response2.ok) {
                const msg = await response2.text();
                throw new Error(`Finish registration failed ${response2.status}: ${msg}`);
            }

            const result = await response2.json();

            if (result.success) {
                alert('Security key registered successfully!');
            } else {
                alert('WebAuthn registration failed: ' + result.message);
            }

        } catch (error: any) {
            console.error('WebAuthn registration error:', error);
            alert('An error occurred during WebAuthn registration: ' + error.message);
        } finally {
            setWebAuthnLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
                type="button"
                onClick={startWebAuthnRegistration}
                disabled={webAuthnLoading}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: webAuthnLoading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    cursor: webAuthnLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {webAuthnLoading ? 'Đang đăng ký...' : 'Đăng ký khoá bảo mật'}
            </button>
            <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
                Thêm một khoá bảo mật để đăng nhập không cần mật khẩu.
            </p>
        </div>
    );
};

export default WebAuthnRegistration;
