"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { deriveVaultKey, generateSalt } from "@/lib/crypto/vault-crypto";
import { validateVaultMasterPassword } from "@/lib/vault-password-policy";
import { syncRecipientReleaseWrap } from "@/lib/sync-recipient-release-wrap";
import {
  createPasswordVerifier,
  verifyVaultPassword,
  verifyVaultPasswordWithSample,
} from "@/lib/vault-unlock-verify";
import type {
  VaultBootstrapResponse,
  VaultFileRow,
  VaultNoteRow,
  VaultPasswordRow,
} from "@/lib/vault-types";

type VaultGate = "loading" | "create" | "unlock";

type VaultContextValue = {
  unlocked: boolean;
  vaultGate: VaultGate;
  loading: boolean;
  unlockError: string | null;
  lock: () => void;
  withKey: <T>(fn: (key: CryptoKey) => Promise<T>) => Promise<T>;
  handleUnlock: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCreateVault: (event: React.FormEvent<HTMLFormElement>) => void;
  masterPassword: string;
  setMasterPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showUnlockPassword: boolean;
  setShowUnlockPassword: (value: boolean | ((v: boolean) => boolean)) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean | ((v: boolean) => boolean)) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean | ((v: boolean) => boolean)) => void;
  refreshUnlocked: () => Promise<void>;
  /** Prepare bearer links for all recipients (requires unlocked vault). */
  syncRecipientAccess: () => Promise<{ updated: number }>;
  releaseAccessWarning: string | null;
  clearReleaseAccessWarning: () => void;
  /** Bumps when recipient vault links are saved (reload recipient list). */
  recipientLinksVersion: number;
  syncingRecipientLinks: boolean;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error("useVault must be used within VaultProvider");
  }
  return ctx;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const vaultKeyRef = useRef<CryptoKey | null>(null);
  const cryptoSaltRef = useRef<string | null>(null);
  const hasVaultSaltRef = useRef(false);

  const [vaultGate, setVaultGate] = useState<VaultGate>("loading");
  const [unlocked, setUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockVersion, setUnlockVersion] = useState(0);
  const [releaseAccessWarning, setReleaseAccessWarning] = useState<
    string | null
  >(null);
  const [recipientLinksVersion, setRecipientLinksVersion] = useState(0);
  const [syncingRecipientLinks, setSyncingRecipientLinks] = useState(false);

  const markRecipientLinksReady = useCallback(() => {
    setRecipientLinksVersion((v) => v + 1);
  }, []);

  const syncRecipientAccess = useCallback(async () => {
    const key = vaultKeyRef.current;
    if (!key) {
      throw new Error("Unlock your vault first to prepare recipient links.");
    }
    setSyncingRecipientLinks(true);
    try {
      const result = await syncRecipientReleaseWrap(key);
      setReleaseAccessWarning(null);
      markRecipientLinksReady();
      return { updated: result.updated };
    } finally {
      setSyncingRecipientLinks(false);
    }
  }, [markRecipientLinksReady]);

  const clearReleaseAccessWarning = useCallback(() => {
    setReleaseAccessWarning(null);
  }, []);

  useEffect(() => {
    async function loadGate() {
      try {
        const response = await fetch("/api/vault");
        if (!response.ok) {
          setVaultGate("unlock");
          return;
        }
        const data = (await response.json()) as VaultBootstrapResponse;
        hasVaultSaltRef.current = Boolean(data.crypto_salt);
        setVaultGate(data.crypto_salt ? "unlock" : "create");
      } catch {
        setVaultGate("unlock");
      }
    }
    loadGate();
  }, []);

  const ensureSalt = useCallback(async (existingSalt: string | null) => {
    if (existingSalt) {
      cryptoSaltRef.current = existingSalt;
      return existingSalt;
    }

    const newSalt = generateSalt();
    const response = await fetch("/api/vault/salt", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crypto_salt: newSalt }),
    });

    if (response.status === 409) {
      const vaultResponse = await fetch("/api/vault");
      if (!vaultResponse.ok) {
        throw new Error("Failed to load vault salt");
      }
      const vaultData = (await vaultResponse.json()) as VaultBootstrapResponse;
      if (!vaultData.crypto_salt) {
        throw new Error("Failed to load vault salt");
      }
      cryptoSaltRef.current = vaultData.crypto_salt;
      return vaultData.crypto_salt;
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Failed to save encryption salt");
    }

    cryptoSaltRef.current = newSalt;
    return newSalt;
  }, []);

  const saveVerifier = useCallback(async (key: CryptoKey) => {
    const verifier = await createPasswordVerifier(key);
    const response = await fetch("/api/vault/verifier", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ciphertext: verifier.ciphertext,
        iv: verifier.iv,
      }),
    });

    if (response.status === 409) {
      return;
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Failed to save password verifier");
    }
  }, []);

  const verifyKey = useCallback(
    async (key: CryptoKey, data: VaultBootstrapResponse) => {
      if (data.password_verifier) {
        await verifyVaultPassword(key, data.password_verifier);
        return;
      }

      const passwordsResponse = await fetch("/api/vault/passwords");
      if (passwordsResponse.ok) {
        const rows = (await passwordsResponse.json()) as VaultPasswordRow[];
        if (rows.length > 0) {
          await verifyVaultPasswordWithSample(key, {
            ciphertext: rows[0].encrypted_username,
            iv: rows[0].iv_username,
          });
          await saveVerifier(key);
          return;
        }
      }

      const notesResponse = await fetch("/api/vault/notes");
      if (notesResponse.ok) {
        const rows = (await notesResponse.json()) as VaultNoteRow[];
        if (rows.length > 0) {
          await verifyVaultPasswordWithSample(key, {
            ciphertext: rows[0].encrypted_title,
            iv: rows[0].iv_title,
          });
          await saveVerifier(key);
          return;
        }
      }

      const filesResponse = await fetch("/api/vault/files");
      if (filesResponse.ok) {
        const rows = (await filesResponse.json()) as VaultFileRow[];
        if (rows.length > 0) {
          await verifyVaultPasswordWithSample(key, {
            ciphertext: rows[0].encrypted_meta,
            iv: rows[0].iv_meta,
          });
          await saveVerifier(key);
          return;
        }
      }

      throw new Error(
        "Vault password verification is not configured. Create a new vault password from profile settings.",
      );
    },
    [saveVerifier],
  );

  const openVault = useCallback(
    async (password: string) => {
      const response = await fetch("/api/vault");
      if (!response.ok) {
        throw new Error("Failed to load vault");
      }
      const data = (await response.json()) as VaultBootstrapResponse;
      if (!data.crypto_salt) {
        throw new Error("Vault is not set up yet");
      }

      const key = await deriveVaultKey(password, data.crypto_salt);
      await verifyKey(key, data);
      vaultKeyRef.current = key;
      cryptoSaltRef.current = data.crypto_salt;
      hasVaultSaltRef.current = true;
      setUnlocked(true);
      setVaultGate("unlock");
      setUnlockVersion((v) => v + 1);
      setSyncingRecipientLinks(true);
      try {
        try {
          await syncRecipientReleaseWrap(key);
          setReleaseAccessWarning(null);
          markRecipientLinksReady();
        } catch (e) {
          setReleaseAccessWarning(
            e instanceof Error
              ? e.message
              : "Could not prepare recipient vault links.",
          );
        }
      } finally {
        setSyncingRecipientLinks(false);
      }
    },
    [verifyKey, markRecipientLinksReady],
  );

  const withKey = useCallback(async <T,>(fn: (key: CryptoKey) => Promise<T>) => {
    const key = vaultKeyRef.current;
    if (!key) {
      throw new Error("Vault is locked");
    }
    return fn(key);
  }, []);

  const lock = useCallback(() => {
    vaultKeyRef.current = null;
    cryptoSaltRef.current = null;
    setUnlocked(false);
    setMasterPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowUnlockPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setUnlockError(null);
    setVaultGate(hasVaultSaltRef.current ? "unlock" : "create");
  }, []);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnlockError(null);
    setLoading(true);
    try {
      await openVault(masterPassword);
      setMasterPassword("");
      setShowUnlockPassword(false);
    } catch (error) {
      const invalid =
        error instanceof DOMException ||
        (error instanceof Error && error.name === "OperationError");
      setUnlockError(
        invalid
          ? "Invalid master password."
          : error instanceof Error
            ? error.message
            : "Could not unlock vault.",
      );
      vaultKeyRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateVault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnlockError(null);

    if (newPassword !== confirmPassword) {
      setUnlockError("Passwords do not match.");
      return;
    }

    const passwordError = validateVaultMasterPassword(newPassword);
    if (passwordError) {
      setUnlockError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const salt = await ensureSalt(null);
      hasVaultSaltRef.current = true;
      const key = await deriveVaultKey(newPassword, salt);
      await saveVerifier(key);
      vaultKeyRef.current = key;
      setUnlocked(true);
      setVaultGate("unlock");
      setUnlockVersion((v) => v + 1);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setSyncingRecipientLinks(true);
      try {
        try {
          await syncRecipientReleaseWrap(key);
          setReleaseAccessWarning(null);
          markRecipientLinksReady();
        } catch (e) {
          setReleaseAccessWarning(
            e instanceof Error
              ? e.message
              : "Could not prepare recipient vault links.",
          );
        }
      } finally {
        setSyncingRecipientLinks(false);
      }
    } catch (error) {
      setUnlockError(
        error instanceof Error ? error.message : "Could not create vault.",
      );
      vaultKeyRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  const refreshUnlocked = useCallback(async () => {
    if (vaultKeyRef.current) {
      setSyncingRecipientLinks(true);
      try {
        try {
          await syncRecipientReleaseWrap(vaultKeyRef.current);
          setReleaseAccessWarning(null);
          markRecipientLinksReady();
        } catch (e) {
          setReleaseAccessWarning(
            e instanceof Error
              ? e.message
              : "Could not prepare recipient vault links.",
          );
        }
      } finally {
        setSyncingRecipientLinks(false);
      }
      setUnlockVersion((v) => v + 1);
    }
  }, [markRecipientLinksReady]);

  return (
    <VaultContext.Provider
      value={{
        unlocked,
        vaultGate,
        loading,
        unlockError,
        lock,
        withKey,
        handleUnlock,
        handleCreateVault,
        masterPassword,
        setMasterPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showUnlockPassword,
        setShowUnlockPassword,
        showNewPassword,
        setShowNewPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        refreshUnlocked,
        syncRecipientAccess,
        releaseAccessWarning,
        clearReleaseAccessWarning,
        recipientLinksVersion,
        syncingRecipientLinks,
      }}
    >
      {/* bump child data fetches when unlockVersion changes */}
      <div key={unlockVersion}>{children}</div>
    </VaultContext.Provider>
  );
}
