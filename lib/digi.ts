// lib/digi.ts — minimal Digi Storage (storage.rcs-rds.ro) upload helper.
// Used by scripts/fetch-city-images.ts to mirror the Wikimedia Commons city
// photos under <basePath>/cities/<slug>.jpg (Faza 8A).
//
// Auth/upload flow copied from mereya_star/src/lib/digi-storage.ts and
// simplified to a one-shot script flow:
//   1. login        POST {BASE_URL}/token {email,password}      → token
//   2. mount        GET  {API}/mounts?type=device                → mountId (cached, env-overridable)
//   3. ensure dirs  GET  {API}/mounts/{m}/files/info?path=…      → 404 ⇒ POST …/files/folder
//   4. upload link  GET  {API}/mounts/{m}/files/upload?path=…    → {link}
//   5. upload       POST {link}  multipart form field "file"     → 200
//   6. public URL   DIGI_STORAGE_PUBLIC_URL_KIND:
//        "direct"      → {BASE_URL}/{basePath}/{objectPath} (when the storage serves public paths)
//        "shared_link" → GET {API}/mounts/{m}/files/download?path=… → signed {link} (public, no auth)
//
// Server-only (scripts/Node). Env is read LAZILY inside functions so importing
// the module never throws at build time:
//   DIGI_STORAGE_BASE_URL, DIGI_STORAGE_API_URL, DIGI_STORAGE_EMAIL,
//   DIGI_STORAGE_PASSWORD, DIGI_STORAGE_MOUNT_ID, DIGI_STORAGE_BASE_PATH,
//   DIGI_STORAGE_PUBLIC_URL_KIND
let cachedToken: string | undefined;
let cachedMountId: string | undefined;

type DigiConfig = {
  baseUrl: string;
  apiUrl: string;
  basePath: string;
  email: string;
  password: string;
  mountId?: string;
  publicUrlKind: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

function getConfig(): DigiConfig {
  const baseUrl = (process.env.DIGI_STORAGE_BASE_URL || "https://storage.rcs-rds.ro").replace(
    /\/+$/g,
    ""
  );
  return {
    baseUrl,
    apiUrl: (process.env.DIGI_STORAGE_API_URL || `${baseUrl}/api/v2.1`).replace(/\/+$/g, ""),
    basePath: trimSlashes(process.env.DIGI_STORAGE_BASE_PATH ?? "midspot"),
    email: requiredEnv("DIGI_STORAGE_EMAIL"),
    password: requiredEnv("DIGI_STORAGE_PASSWORD"),
    mountId: process.env.DIGI_STORAGE_MOUNT_ID?.trim() || undefined,
    publicUrlKind: (process.env.DIGI_STORAGE_PUBLIC_URL_KIND || "shared_link").trim().toLowerCase(),
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing Digi Storage env var: ${name}`);
  return value;
}

async function login(): Promise<string> {
  const config = getConfig();
  const response = await fetch(`${config.baseUrl}/token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });
  const body = (await response.json().catch(() => ({}))) as { token?: string };
  if (!response.ok || !body.token) {
    throw new Error(`Digi Storage login failed (${response.status})`);
  }
  cachedToken = body.token;
  return body.token;
}

async function getToken(): Promise<string> {
  if (!cachedToken) await login();
  return cachedToken as string;
}

async function getMountId(): Promise<string> {
  const config = getConfig();
  if (config.mountId) return config.mountId;
  if (cachedMountId) return cachedMountId;
  const token = await getToken();
  const response = await apiFetch(`${config.apiUrl}/mounts?type=device`, token);
  const body = (await response.json()) as {
    mounts?: Array<{ id?: string | number; mount_id?: string | number }>;
  };
  const mount = body.mounts?.[0];
  const id = mount?.id ?? mount?.mount_id;
  if (!id) throw new Error("Digi Storage did not return a mount ID");
  cachedMountId = String(id);
  return cachedMountId;
}

/** Authenticated API call; on 401 re-login once and retry. */
async function apiFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      authorization: `Token token="${token}"`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (response.status === 401) {
    cachedToken = undefined;
    const fresh = await getToken();
    return fetch(url, {
      ...init,
      headers: {
        accept: "application/json",
        authorization: `Token token="${fresh}"`,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
    });
  }
  return response;
}

/** Remote path (from the mount root) for an object path relative to DIGI_STORAGE_BASE_PATH. */
export function remotePathFor(objectPath: string): string {
  const config = getConfig();
  return `/${[config.basePath, trimSlashes(objectPath)].filter(Boolean).join("/")}`;
}

async function folderExists(mountId: string, folderPath: string): Promise<boolean> {
  const config = getConfig();
  const token = await getToken();
  const response = await apiFetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(mountId)}/files/info?path=${encodeURIComponent(folderPath)}`,
    token
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Digi Storage folder lookup failed (${response.status})`);
  }
  return true;
}

async function createFolder(mountId: string, parentPath: string, name: string): Promise<void> {
  const config = getConfig();
  const token = await getToken();
  const response = await apiFetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(mountId)}/files/folder?path=${encodeURIComponent(parentPath)}`,
    token,
    { method: "POST", body: JSON.stringify({ name }) }
  );
  // 409 = already exists
  if (!response.ok && response.status !== 409) {
    throw new Error(`Digi Storage folder create failed (${response.status})`);
  }
}

async function ensureFolderPath(mountId: string, folderPath: string): Promise<void> {
  const parts = trimSlashes(folderPath).split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    const parent = current ? `/${current}` : "/";
    current = current ? `${current}/${part}` : part;
    const target = `/${current}`;
    if (!(await folderExists(mountId, target))) await createFolder(mountId, parent, part);
  }
}

export type UploadObjectInput = {
  /** object path relative to DIGI_STORAGE_BASE_PATH, e.g. "cities/krakow.jpg" */
  objectPath: string;
  /** file bytes */
  data: Uint8Array;
  contentType: string;
  /** file name sent in the multipart form (drives the stored name) */
  filename: string;
};

/**
 * Upload one file. Returns the remote path (from the mount root) of the stored object.
 */
export async function uploadObject({ objectPath, data, contentType, filename }: UploadObjectInput): Promise<string> {
  const config = getConfig();
  const mountId = await getMountId();
  const remotePath = remotePathFor(objectPath);
  const folderPath = remotePath.slice(0, remotePath.lastIndexOf("/") + 1) || "/";

  await ensureFolderPath(mountId, folderPath);

  const token = await getToken();
  const linkResponse = await apiFetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(mountId)}/files/upload?path=${encodeURIComponent(folderPath)}`,
    token
  );
  const linkBody = (await linkResponse.json()) as { link?: string };
  if (!linkResponse.ok || !linkBody.link) {
    throw new Error(`Digi Storage did not return an upload link (${linkResponse.status})`);
  }

  const form = new FormData();
  form.append("file", new Blob([data as BlobPart], { type: contentType }), filename);
  const uploadResponse = await fetch(linkBody.link, { method: "POST", body: form });
  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => "");
    throw new Error(`Digi Storage upload failed (${uploadResponse.status}): ${text.slice(0, 300)}`);
  }

  return remotePath;
}

/**
 * Public URL for an uploaded object, according to DIGI_STORAGE_PUBLIC_URL_KIND:
 * "direct" → {BASE_URL}/{basePath}/{objectPath}; anything else ("shared_link") →
 * a signed download link (public, no auth) from the files/download endpoint.
 */
export async function publicUrlFor(objectPath: string): Promise<string> {
  const config = getConfig();
  if (config.publicUrlKind === "direct") {
    return `${config.baseUrl}/${[config.basePath, trimSlashes(objectPath)].filter(Boolean).join("/")}`;
  }
  const mountId = await getMountId();
  const token = await getToken();
  const remotePath = remotePathFor(objectPath);
  const response = await apiFetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(mountId)}/files/download?path=${encodeURIComponent(remotePath)}`,
    token
  );
  const body = (await response.json()) as { link?: string };
  if (!response.ok || !body.link) {
    throw new Error(`Digi Storage did not return a download link (${response.status})`);
  }
  return body.link;
}

/** Convenience wrapper used by the city-photo pipeline: cities/<slug>.jpg. */
export async function uploadCityImage(
  slug: string,
  data: Uint8Array,
  contentType = "image/jpeg"
): Promise<{ objectPath: string; publicUrl: string }> {
  const objectPath = `cities/${slug}.jpg`;
  await uploadObject({ objectPath, data, contentType, filename: `${slug}.jpg` });
  const publicUrl = await publicUrlFor(objectPath);
  return { objectPath, publicUrl };
}
